/* Property lookup: address or cadastral number -> real San Juan parcel,
   zoning, and flood findings with their evidence:
     - CRIM parcels (feb 2025), served by the Planning Board's SIGE server
     - Planning Board current zoning (calificación vigente)
     - FEMA National Flood Hazard Layer
   Addresses are located with Esri's World Geocoder; only the point is used
   to find the CRIM parcel, and no geocoder result is stored.

   Runs in the visitor's browser. The Planning Board's server doesn't answer
   requests from cloud data centers (it timed out from Netlify Functions),
   but it — like FEMA and Esri — allows cross-origin browser requests.

   Anything these sources don't cover is returned as an explicit unknown —
   never filled in. */

window.ParcelaLookup = (function () {
  const SIGE = "https://sigejp.pr.gov/server/rest/services";
  const PARCELS = `${SIGE}/crim/crim_feb_2025/MapServer/0`;
  const ZONING = `${SIGE}/calificacion/cali_vige/MapServer/0`;
  const NFHL = "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer";
  const FLOOD_ZONES = `${NFHL}/28`;
  const FIRM_PANELS = `${NFHL}/3`;
  const GEOCODER = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates";
  // Hazard and historic layers on the Planning Board's SIGE server. Its
  // landslide layer (Deslizamiento_por_lluvia) is 4 island-wide polygons and
  // every spatial query times out, so landslides are listed as unknown.
  const LIQUEFACTION = `${SIGE}/Licuaci%C3%B3n/MapServer/36`;
  const TSUNAMI = `${SIGE}/Tsunami_flood_zones/MapServer/42`;
  const ADVISORY_FLOOD = `${SIGE}/ABFE_02pct/MapServer/1`;
  const HISTORIC_SITES = `${SIGE}/JP_Reglamentario/Sitios_Historicos_JP/MapServer/0`;
  const HISTORIC_ZONES = `${SIGE}/JP_Reglamentario/Sitios_Historicos_JP/MapServer/1`;
  const LIQUEFACTION_LEVELS = ["Licuación Muy Bajo", "Licuación Bajo", "Licuación Moderado", "Licuación Alto", "Licuación Muy Alto"];

  const COVERED_MUNICIPALITIES = ["San Juan"];
  const CADASTRAL_RE = /^\d{3}-\d{3}-\d{3}-\d{2}$/;
  const SQM_PER_CUERDA = 3930.395;

  // ---------- http ----------

  // Every upstream call in one lookup shares a time budget, so a slow server
  // fails fast with its hostname instead of leaving the page spinning.
  const BUDGET_MS = 24000;
  let deadline = 0;

  async function getJson(url, params, { retries = 2, timeoutMs = 8000 } = {}) {
    const qs = new URLSearchParams({ f: "json", ...params });
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
      const remaining = deadline - Date.now();
      if (remaining < 500) {
        lastErr = lastErr || new Error("time budget exhausted");
        break;
      }
      try {
        const res = await fetch(`${url}?${qs}`, { signal: AbortSignal.timeout(Math.min(timeoutMs, remaining)) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error.message || "ArcGIS error");
        return data;
      } catch (err) {
        lastErr = err;
        console.warn(`upstream ${new URL(url).hostname} attempt ${attempt + 1}: ${err.message}`);
        if (attempt < retries) await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
    throw new Error(`${new URL(url).hostname}: ${lastErr.message}`);
  }

  function query(layer, params) {
    return getJson(`${layer}/query`, { outSR: "4326", geometryPrecision: "6", ...params });
  }

  function pointQuery(layer, lon, lat, params) {
    return query(layer, {
      geometry: `${lon},${lat}`,
      geometryType: "esriGeometryPoint",
      inSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
      ...params,
    });
  }

  function envelopeQuery(layer, env, params) {
    return query(layer, {
      geometry: env.join(","),
      geometryType: "esriGeometryEnvelope",
      inSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
      ...params,
    });
  }

  // ---------- geometry ----------

  function bbox(rings) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    rings.forEach((ring) => ring.forEach(([x, y]) => {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }));
    return [minX, minY, maxX, maxY];
  }

  // Parcel bbox padded on every side, at least ~180 m across, for map context.
  function contextEnvelope(rings) {
    const [minX, minY, maxX, maxY] = bbox(rings);
    const minSpan = 0.0017;
    const padX = Math.max((maxX - minX) * 0.8, (minSpan - (maxX - minX)) / 2, 0);
    const padY = Math.max((maxY - minY) * 0.8, (minSpan - (maxY - minY)) / 2, 0);
    return [minX - padX, minY - padY, maxX + padX, maxY + padY];
  }

  // ---------- formatting ----------

  function bi(es, en) { return { es, en }; }

  function fmtDate(ms) {
    return ms ? new Date(ms).toISOString().slice(0, 10) : null;
  }

  function clean(v) {
    return typeof v === "string" && v.trim() ? v.trim() : null;
  }

  // ---------- resolve the parcel ----------

  async function geocode(address) {
    const data = await getJson(GEOCODER, {
      SingleLine: address,
      sourceCountry: "PRI",
      maxLocations: "1",
      outFields: "Addr_type,City,Subregion",
    });
    const c = data.candidates && data.candidates[0];
    if (!c || c.score < 85) return null;
    return { lon: c.location.x, lat: c.location.y, matched: c.address, type: c.attributes.Addr_type };
  }

  async function findParcel(q) {
    const outFields = "NUM_CATASTRO,INSIDE_X,INSIDE_Y,Shape.STArea()";
    if (CADASTRAL_RE.test(q)) {
      const d = await query(PARCELS, { where: `NUM_CATASTRO='${q}'`, outFields, returnGeometry: "true" });
      return d.features && d.features[0] ? { feature: d.features[0], geocode: null } : null;
    }
    const g = await geocode(q);
    if (!g) return null;
    const d = await pointQuery(PARCELS, g.lon, g.lat, { outFields, returnGeometry: "true" });
    return d.features && d.features[0] ? { feature: d.features[0], geocode: g } : { feature: null, geocode: g };
  }

  // ---------- flood ----------

  const FLOOD_RANK = { constraint: 3, investigate: 2, unknown: 1, favorable: 0 };

  function classifyFlood(zone, subtype) {
    const z = (zone || "").toUpperCase();
    const s = (subtype || "").toUpperCase();
    if (z.startsWith("V")) return "constraint";
    if (z.startsWith("A")) return "constraint";
    if (s.includes("FLOODWAY")) return "constraint";
    if (z === "X" && s.includes("0.2")) return "investigate";
    if (z === "X") return "favorable";
    return "unknown";
  }

  function floodLabel(zone, subtype) {
    const z = (zone || "").toUpperCase();
    const s = (subtype || "").toUpperCase();
    if (z.startsWith("V")) return bi(`Zona ${z} — riesgo costero alto (marejada)`, `Zone ${z} — high-risk coastal (wave action)`);
    if (z.startsWith("A")) return bi(`Zona ${z} — área especial de riesgo de inundación (1% anual)`, `Zone ${z} — special flood hazard area (1% annual chance)`);
    if (z === "X" && s.includes("0.2")) return bi("Zona X sombreada — riesgo moderado (0.2% anual)", "Shaded Zone X — moderate risk (0.2% annual chance)");
    if (z === "X") return bi("Zona X — riesgo mínimo de inundación", "Zone X — minimal flood hazard");
    if (z === "D") return bi("Zona D — riesgo no determinado", "Zone D — undetermined risk");
    return bi(`Zona ${z || "?"}`, `Zone ${z || "?"}`);
  }

  // ---------- lookup ----------

  // Resolves to { status, body }: status 200 with the lookup, or an HTTP-like
  // error status with body.error set to a code the pages translate.
  async function run(input) {
    deadline = Date.now() + BUDGET_MS;
    const q = (input || "").trim();
    if (!q) return json({ error: "missing_query" }, 400);
    if (q.length > 200) return json({ error: "query_too_long" }, 400);

    let resolved;
    try {
      resolved = await findParcel(q);
    } catch (err) {
      return json({ error: "source_unavailable", detail: err.message }, 502);
    }
    if (!resolved) return json({ error: "not_found" }, 404);
    if (!resolved.feature) return json({ error: "no_parcel_at_location", geocode: resolved.geocode }, 404);

    const parcel = resolved.feature;
    const cadastral = parcel.attributes.NUM_CATASTRO;
    const rings = parcel.geometry.rings;
    const env = contextEnvelope(rings);
    const lon = parcel.attributes.INSIDE_X;
    const lat = parcel.attributes.INSIDE_Y;

    // Zoning is keyed by cadastral number; fall back to the parcel's interior
    // point when the zoning layer has no row for this number.
    let zoningRow = null;
    let zoningMatch = "cadastral";
    try {
      const z = await query(ZONING, { where: `num_catast='${cadastral}'`, outFields: "*", returnGeometry: "false" });
      zoningRow = z.features && z.features[0] ? z.features[0].attributes : null;
      if (!zoningRow) {
        const zp = await pointQuery(ZONING, lon, lat, { outFields: "*", returnGeometry: "false" });
        zoningRow = zp.features && zp.features[0] ? zp.features[0].attributes : null;
        zoningMatch = "location";
      }
    } catch (err) {
      return json({ error: "source_unavailable", detail: err.message }, 502);
    }

    const municipality = (zoningRow && clean(zoningRow.municipio)) || null;
    if (municipality && !COVERED_MUNICIPALITIES.includes(municipality)) {
      return json({ error: "outside_coverage", municipality, cadastral }, 422);
    }

    // Flood zones touching the parcel, its FIRM panel, and map context — in
    // parallel. FEMA is the flakiest of the three servers, so its failures
    // degrade to an "unknown" finding instead of failing the whole lookup.
    const parcelGeom = JSON.stringify({ rings, spatialReference: { wkid: 4326 } });
    const parcelHit = (layer, outFields, extra) => query(layer, {
      geometry: parcelGeom, geometryType: "esriGeometryPolygon", inSR: "4326",
      spatialRel: "esriSpatialRelIntersects", outFields, returnGeometry: "false", ...extra,
    }).catch(() => null);
    const [
      floodHits, panel, ctxParcels, ctxZoning, ctxFlood,
      liqHits, tsunamiHits, advisoryHits, histZoneHits, histSiteHits, ctxLiq, ctxHistZone,
    ] = await Promise.all([
      query(FLOOD_ZONES, {
        geometry: parcelGeom, geometryType: "esriGeometryPolygon", inSR: "4326",
        spatialRel: "esriSpatialRelIntersects", outFields: "FLD_ZONE,ZONE_SUBTY,SFHA_TF,STATIC_BFE", returnGeometry: "false",
      }).catch(() => null),
      pointQuery(FIRM_PANELS, lon, lat, { outFields: "FIRM_PAN,EFF_DATE", returnGeometry: "false" }).catch(() => null),
      envelopeQuery(PARCELS, env, { outFields: "NUM_CATASTRO", returnGeometry: "true", resultRecordCount: "400" }).catch(() => null),
      envelopeQuery(ZONING, env, { outFields: "cali", returnGeometry: "true", resultRecordCount: "200", maxAllowableOffset: "0.000005" }).catch(() => null),
      envelopeQuery(FLOOD_ZONES, env, { outFields: "FLD_ZONE,ZONE_SUBTY", returnGeometry: "true", maxAllowableOffset: "0.00002" }).catch(() => null),
      parcelHit(LIQUEFACTION, "Licuacion"),
      parcelHit(TSUNAMI, "OBJECTID"),
      parcelHit(ADVISORY_FLOOD, "FLD_ZONE,ST_BFE_m,V_DATUM"),
      parcelHit(HISTORIC_ZONES, "ZONA,Resolucion"),
      parcelHit(HISTORIC_SITES, "SITIO,resolucion,vigencia", { distance: "100", units: "esriSRUnit_Meter" }),
      // No tsunami shapes for the map: one lot's envelope returns ~1.2 MB.
      envelopeQuery(LIQUEFACTION, env, { outFields: "Licuacion", returnGeometry: "true", maxAllowableOffset: "0.00002" }).catch(() => null),
      envelopeQuery(HISTORIC_ZONES, env, { outFields: "ZONA", returnGeometry: "true", maxAllowableOffset: "0.00002" }).catch(() => null),
    ]);

    const retrieved = new Date().toISOString().slice(0, 10);
    const areaSqm = Math.round(parcel.attributes["Shape.STArea()"]);
    const sources = {};
    const findings = [];
    const unknowns = [];
    const nextActions = [];

    // ---- parcel source ----
    sources["src-crim"] = {
      name: "Parcelario CRIM (feb. 2025)",
      agency: "Centro de Recaudación de Ingresos Municipales (CRIM) · vía Junta de Planificación (SIGE)",
      date: "2025-02",
      section: `Parcela ${cadastral}`,
      document: `${PARCELS}`,
      retrieved,
    };

    // ---- zoning ----
    let zoning = null;
    if (zoningRow) {
      const code = clean(zoningRow.cali);
      const desc = clean(zoningRow.descrip);
      const resolution = clean(zoningRow.resolucion);
      const effective = clean(zoningRow.vigencia);
      zoning = {
        code, description: desc,
        classification: clean(zoningRow.clasi), classificationDescription: clean(zoningRow.descrip1),
        resolution, effective, barrio: clean(zoningRow.barrio),
        regla: zoningRow.regla,
      };
      sources["src-zoning"] = {
        name: "Mapa de Calificación vigente",
        agency: "Junta de Planificación de Puerto Rico",
        date: effective || "—",
        section: [code && `Distrito ${code}`, resolution && `Resolución ${resolution}`].filter(Boolean).join(" · "),
        document: ZONING,
        retrieved,
      };
      const conf = zoningMatch === "cadastral" ? "high" : "medium";
      findings.push({
        id: "zoning",
        category: "investigate",
        title: bi(`Calificación ${code}${desc ? ` — ${desc}` : ""}`, `Zoned ${code}${desc ? ` — ${desc}` : ""}`),
        summary: bi(
          "Distrito de calificación vigente según la Junta de Planificación.",
          "Current zoning district per the Planning Board."
        ),
        confidence: conf,
        sourceId: "src-zoning",
        why: {
          found: bi(
            `El Mapa de Calificación vigente asigna ${code}${desc ? ` (${desc})` : ""} a ${zoningMatch === "cadastral" ? `la parcela ${cadastral}` : "la ubicación de esta parcela"}${resolution ? `, bajo la resolución ${resolution}` : ""}${effective ? `, vigente desde ${effective}` : ""}.`,
            `The current zoning map assigns ${code}${desc ? ` (${desc})` : ""} to ${zoningMatch === "cadastral" ? `parcel ${cadastral}` : "this parcel's location"}${resolution ? `, under resolution ${resolution}` : ""}${effective ? `, effective ${effective}` : ""}.`
          ),
          matters: bi(
            "El distrito determina qué usos se permiten por derecho y qué requiere variación o consulta. Es el primer filtro de viabilidad.",
            "The district determines which uses are allowed by right and which need a variance or consultation. It's the first feasibility filter."
          ),
          verification: "Required",
        },
      });

      // Overlay districts and secondary zoning recorded on the same row.
      const overlays = [
        ["cali_sobre", "des_sobre", "r_sobre", "v_sobre"],
        ["cali_sobre2", "des_sobre2", "r_sobre2", "v_sobre2"],
      ];
      overlays.forEach(([c, d, r, v], i) => {
        const oc = clean(zoningRow[c]);
        if (!oc) return;
        const od = clean(zoningRow[d]) || oc;
        const or = clean(zoningRow[r]);
        const ov = clean(zoningRow[v]);
        const sid = `src-overlay-${i}`;
        sources[sid] = {
          name: "Mapa de Calificación vigente — distrito sobrepuesto",
          agency: "Junta de Planificación de Puerto Rico",
          date: ov || "—",
          section: [oc, or && `Resolución ${or}`].filter(Boolean).join(" · "),
          document: ZONING,
          retrieved,
        };
        findings.push({
          id: `overlay-${i}`,
          category: "investigate",
          title: bi(`Distrito sobrepuesto: ${od}`, `Overlay district: ${od}`),
          summary: bi(
            `La parcela está dentro de un distrito sobrepuesto (${oc}) que puede añadir requisitos a la calificación base.`,
            `The parcel falls inside an overlay district (${oc}) that can add requirements on top of the base zoning.`
          ),
          confidence: "high",
          sourceId: sid,
          why: {
            found: bi(
              `El registro de calificación incluye ${oc} (${od})${or ? `, resolución ${or}` : ""}${ov ? `, vigente desde ${ov}` : ""}.`,
              `The zoning record includes ${oc} (${od})${or ? `, resolution ${or}` : ""}${ov ? `, effective ${ov}` : ""}.`
            ),
            matters: bi(
              "Los distritos sobrepuestos suelen imponer revisiones o restricciones adicionales (ambientales, históricas, costeras) que afectan el diseño y la permisología.",
              "Overlay districts often add reviews or restrictions (environmental, historic, coastal) that affect design and permitting."
            ),
            verification: "Recommended",
          },
        });
      });

      const extra = ["cali2", "cali3", "cali4"].map((k) => clean(zoningRow[k])).filter(Boolean);
      if (extra.length) {
        findings.push({
          id: "split-zoning",
          category: "investigate",
          title: bi("Más de un distrito de calificación", "More than one zoning district"),
          summary: bi(
            `Además de ${code}, el registro lista: ${extra.join(", ")}.`,
            `Besides ${code}, the record lists: ${extra.join(", ")}.`
          ),
          confidence: "high",
          sourceId: "src-zoning",
          why: {
            found: bi(`El registro de calificación incluye distritos adicionales: ${extra.join(", ")}.`, `The zoning record includes additional districts: ${extra.join(", ")}.`),
            matters: bi("Partes de la parcela pueden regirse por reglas distintas.", "Parts of the parcel may be governed by different rules."),
            verification: "Required",
          },
        });
      }
    } else {
      findings.push({
        id: "zoning",
        category: "unknown",
        title: bi("Calificación no encontrada", "Zoning not found"),
        summary: bi("El Mapa de Calificación no tiene un registro para esta parcela.", "The zoning map has no record for this parcel."),
        confidence: "none",
        sourceId: null,
        why: {
          found: bi("No se encontró un distrito de calificación por número de catastro ni por ubicación.", "No zoning district was found by cadastral number or by location."),
          matters: bi("Sin la calificación no se puede evaluar qué usos se permiten.", "Without zoning there's no way to assess which uses are allowed."),
          verification: "Required",
        },
      });
    }

    // ---- flood ----
    let flood = null;
    if (floodHits) {
      const zones = [];
      (floodHits.features || []).forEach((f) => {
        const a = f.attributes;
        if (!zones.some((z) => z.zone === a.FLD_ZONE && z.subtype === a.ZONE_SUBTY)) {
          zones.push({ zone: a.FLD_ZONE, subtype: a.ZONE_SUBTY, sfha: a.SFHA_TF === "T", bfe: a.STATIC_BFE > -9000 ? a.STATIC_BFE : null });
        }
      });
      zones.forEach((z) => { z.category = classifyFlood(z.zone, z.subtype); z.label = floodLabel(z.zone, z.subtype); });
      zones.sort((a, b) => FLOOD_RANK[b.category] - FLOOD_RANK[a.category]);
      const panelAttrs = panel && panel.features && panel.features[0] ? panel.features[0].attributes : null;
      flood = { zones, panel: panelAttrs ? panelAttrs.FIRM_PAN : null, panelEffective: panelAttrs ? fmtDate(panelAttrs.EFF_DATE) : null };
      sources["src-fema"] = {
        name: "National Flood Hazard Layer (NFHL)",
        agency: "FEMA",
        date: flood.panelEffective || "—",
        section: flood.panel ? `FIRM panel ${flood.panel}` : "NFHL",
        document: "https://msc.fema.gov/portal/search",
        retrieved,
      };

      if (!zones.length) {
        findings.push({
          id: "flood",
          category: "unknown",
          title: bi("Zona de inundación no cartografiada", "Flood zone not mapped"),
          summary: bi("FEMA no tiene una zona de inundación digital para esta parcela.", "FEMA has no digital flood zone for this parcel."),
          confidence: "none",
          sourceId: "src-fema",
          why: {
            found: bi("La capa NFHL no devolvió zonas que toquen esta parcela.", "The NFHL returned no zones touching this parcel."),
            matters: bi("La zona de inundación afecta seguro, financiamiento y diseño.", "Flood zone affects insurance, financing, and design."),
            verification: "Required",
          },
        });
      } else {
        const worst = zones[0];
        const multiple = zones.length > 1;
        const bfeNote = worst.bfe != null ? bi(` Elevación de inundación base: ${worst.bfe} pies.`, ` Base flood elevation: ${worst.bfe} ft.`) : bi("", "");
        findings.push({
          id: "flood",
          category: worst.category,
          title: worst.label,
          summary: multiple
            ? bi(`La parcela toca ${zones.length} zonas: ${zones.map((z) => z.label.es).join("; ")}.`, `The parcel touches ${zones.length} zones: ${zones.map((z) => z.label.en).join("; ")}.`)
            : worst.category === "favorable"
              ? bi("Toda la parcela está fuera de las áreas especiales de riesgo de FEMA.", "The whole parcel is outside FEMA's special flood hazard areas.")
              : bi(`Toda la parcela está en esta zona.${bfeNote.es}`, `The whole parcel is in this zone.${bfeNote.en}`),
          confidence: "high",
          sourceId: "src-fema",
          why: {
            found: bi(
              `El NFHL de FEMA${flood.panel ? ` (panel ${flood.panel}${flood.panelEffective ? `, vigente ${flood.panelEffective}` : ""})` : ""} muestra: ${zones.map((z) => z.label.es).join("; ")}.`,
              `FEMA's NFHL${flood.panel ? ` (panel ${flood.panel}${flood.panelEffective ? `, effective ${flood.panelEffective}` : ""})` : ""} shows: ${zones.map((z) => z.label.en).join("; ")}.`
            ),
            matters: worst.category === "favorable"
              ? bi("Fuera de un área especial de riesgo, el seguro de inundación no es obligatorio para préstamos federales y hay menos requisitos de diseño.", "Outside a special flood hazard area, flood insurance isn't mandatory for federally backed loans and design requirements are lighter.")
              : bi("En áreas de riesgo, el seguro es obligatorio para préstamos federales y el diseño debe cumplir con la elevación de inundación base.", "In hazard areas, insurance is mandatory for federally backed loans and the design must meet base flood elevation."),
            verification: worst.category === "favorable" ? "Optional" : "Required",
          },
        });
        if (worst.category === "constraint" || worst.category === "investigate") {
          nextActions.push({
            title: bi("Obtener un certificado de elevación", "Get an elevation certificate"),
            whyItMatters: bi("Confirma la elevación del terreno frente a la elevación de inundación base; determina seguro y diseño.", "Confirms ground elevation against base flood elevation; drives insurance and design."),
            professional: bi("Agrimensor o ingeniero licenciado", "Licensed surveyor or engineer"),
            evidenceRef: "flood",
            sourceId: "src-fema",
          });
        }
      }
    } else {
      findings.push({
        id: "flood",
        category: "unknown",
        title: bi("Zona de inundación no disponible", "Flood zone unavailable"),
        summary: bi("No se pudo consultar a FEMA en este momento. Inténtalo de nuevo.", "FEMA couldn't be reached right now. Try again."),
        confidence: "none",
        sourceId: null,
        why: {
          found: bi("El servicio NFHL de FEMA no respondió.", "FEMA's NFHL service didn't respond."),
          matters: bi("La zona de inundación afecta seguro, financiamiento y diseño.", "Flood zone affects insurance, financing, and design."),
          verification: "Required",
        },
      });
    }

    // ---- hazards & historic designation ----
    const riskSource = (name, section, document) => ({
      name,
      agency: "Junta de Planificación de Puerto Rico (SIGE, capas de riesgo); autor original no documentado en el servicio",
      date: "—",
      section,
      document,
      retrieved,
    });

    if (liqHits && liqHits.features.length) {
      const levels = liqHits.features.map((f) => f.attributes.Licuacion).filter(Boolean);
      const worst = levels.sort((a, b) => LIQUEFACTION_LEVELS.indexOf(b) - LIQUEFACTION_LEVELS.indexOf(a))[0];
      const rank = LIQUEFACTION_LEVELS.indexOf(worst);
      const label = worst.replace("Licuación ", "");
      const EN = { "Muy Bajo": "very low", Bajo: "low", Moderado: "moderate", Alto: "high", "Muy Alto": "very high" };
      sources["src-liq"] = riskSource("Susceptibilidad a licuación", worst, LIQUEFACTION);
      findings.push({
        id: "liquefaction",
        category: rank >= 3 ? "constraint" : rank === 2 ? "investigate" : "favorable",
        title: bi(`Susceptibilidad a licuación: ${label.toLowerCase()}`, `Liquefaction susceptibility: ${EN[label] || label}`),
        summary: rank >= 2
          ? bi("En un terremoto, el suelo puede perder capacidad de soporte. Afecta el diseño de cimientos.", "In an earthquake the soil can lose bearing capacity. It affects foundation design.")
          : bi("La capa de riesgo no muestra susceptibilidad importante a licuación.", "The hazard layer shows no significant liquefaction susceptibility."),
        confidence: "medium",
        sourceId: "src-liq",
        why: {
          found: bi(`La capa de licuación de la Junta de Planificación clasifica la parcela como «${worst}».`, `The Planning Board's liquefaction layer rates the parcel "${worst}".`),
          matters: bi("Suelos susceptibles requieren estudio geotécnico y pueden encarecer los cimientos.", "Susceptible soils need a geotechnical study and can raise foundation costs."),
          verification: rank >= 2 ? "Required" : "Optional",
        },
      });
      if (rank >= 2) {
        nextActions.push({
          title: bi("Estudio geotécnico", "Geotechnical study"),
          whyItMatters: bi("Confirma la licuación y el tipo de cimiento antes de diseñar.", "Confirms liquefaction and the foundation type before design."),
          professional: bi("Ingeniero geotécnico", "Geotechnical engineer"),
          evidenceRef: "liquefaction",
          sourceId: "src-liq",
        });
      }
    }

    if (tsunamiHits && tsunamiHits.features.length) {
      sources["src-tsunami"] = riskSource("Zonas de inundación por tsunami", "Zona de inundación por tsunami", TSUNAMI);
      findings.push({
        id: "tsunami",
        category: "investigate",
        title: bi("Dentro de la zona de inundación por tsunami", "Inside the tsunami flood zone"),
        summary: bi("La parcela toca la zona que podría inundarse en un tsunami.", "The parcel touches the area that could flood in a tsunami."),
        confidence: "medium",
        sourceId: "src-tsunami",
        why: {
          found: bi("La capa de zonas de inundación por tsunami de la Junta de Planificación intersecta la parcela.", "The Planning Board's tsunami flood-zone layer intersects the parcel."),
          matters: bi("Influye en planes de desalojo, diseño de plantas bajas y en cómo bancos y aseguradoras ven el riesgo.", "It bears on evacuation planning, ground-floor design, and how lenders and insurers see the risk."),
          verification: "Recommended",
        },
      });
    }

    if (advisoryHits && advisoryHits.features.length) {
      const zones = [...new Set(advisoryHits.features.map((f) => f.attributes.FLD_ZONE).filter(Boolean))];
      const bfes = advisoryHits.features.map((f) => f.attributes.ST_BFE_m).filter((v) => v != null && v > -9000);
      const withDatum = advisoryHits.features.find((f) => f.attributes.V_DATUM);
      const datum = withDatum ? withDatum.attributes.V_DATUM : null;
      const maxBfe = bfes.length ? Math.max(...bfes) : null;
      sources["src-abfe"] = {
        name: "Advisory Base Flood Elevations (ABFE) 0.2%",
        agency: "FEMA · vía Junta de Planificación (SIGE)",
        date: "—",
        section: `${zones.join(", ")}${maxBfe != null ? ` · BFE ${maxBfe} m${datum ? ` ${datum}` : ""}` : ""}`,
        document: ADVISORY_FLOOD,
        retrieved,
      };
      const bfeText = maxBfe != null
        ? bi(` con elevación de hasta ${maxBfe} m${datum ? ` (${datum})` : ""}`, ` with elevations up to ${maxBfe} m${datum ? ` (${datum})` : ""}`)
        : bi("", "");
      findings.push({
        id: "advisory-flood",
        category: "investigate",
        title: bi(`Mapa asesor de FEMA: ${zones.join(", ")}`, `FEMA advisory map: ${zones.join(", ")}`),
        summary: bi(`Las zonas asesoras de FEMA para la inundación de 0.2% anual tocan la parcela${bfeText.es}.`, `FEMA's advisory zones for the 0.2% annual-chance flood touch the parcel${bfeText.en}.`),
        confidence: "medium",
        sourceId: "src-abfe",
        why: {
          found: bi(
            `La capa ABFE 0.2% de FEMA (incluye marejada y oleaje) muestra ${zones.join(", ")} en la parcela${bfeText.es}.`,
            `FEMA's ABFE 0.2% layer (storm surge and waves included) shows ${zones.join(", ")} on the parcel${bfeText.en}.`
          ),
          matters: bi(
            "Los mapas asesores pueden ser más exigentes que el mapa oficial (FIRM). Conviene confirmar cuál usa la agencia de permisos para la elevación de diseño.",
            "Advisory maps can be stricter than the official map (FIRM). Confirm which one the permitting agency uses for design elevation."
          ),
          verification: "Recommended",
        },
      });
    }

    if (histZoneHits && histZoneHits.features.length) {
      const z = histZoneHits.features[0].attributes;
      sources["src-hist"] = {
        name: "Sitios y Zonas Históricas",
        agency: "Junta de Planificación de Puerto Rico (Reglamento de Planificación Núm. 5)",
        date: "—",
        section: [z.ZONA, z.Resolucion && `Resolución ${z.Resolucion}`].filter(Boolean).join(" · "),
        document: HISTORIC_ZONES,
        retrieved,
      };
      findings.push({
        id: "historic-zone",
        category: "investigate",
        title: bi(`Dentro de ${z.ZONA}`, `Inside ${z.ZONA}`),
        summary: bi("Zona histórica designada: obras y demoliciones requieren revisión adicional.", "Designated historic zone: construction and demolition get additional review."),
        confidence: "high",
        sourceId: "src-hist",
        why: {
          found: bi(`La parcela está dentro de ${z.ZONA}${z.Resolucion ? ` (Resolución ${z.Resolucion})` : ""}.`, `The parcel is inside ${z.ZONA}${z.Resolucion ? ` (Resolution ${z.Resolucion})` : ""}.`),
          matters: bi(
            "En zonas históricas el Reglamento Conjunto pide la recomendación del Instituto de Cultura Puertorriqueña y aplica reglas de altura y diseño según el contexto.",
            "In historic zones the Reglamento Conjunto requires the Institute of Puerto Rican Culture's recommendation and applies context-based height and design rules."
          ),
          verification: "Required",
        },
      });
    }

    if (histSiteHits && histSiteHits.features.length) {
      const names = [...new Set(histSiteHits.features.map((f) => f.attributes.SITIO).filter(Boolean))].slice(0, 3);
      sources["src-hist-sites"] = {
        name: "Sitios y Zonas Históricas",
        agency: "Junta de Planificación de Puerto Rico (Reglamento de Planificación Núm. 5)",
        date: "—",
        section: names.join("; "),
        document: HISTORIC_SITES,
        retrieved,
      };
      findings.push({
        id: "historic-sites",
        category: "investigate",
        title: bi(`Sitio histórico a menos de 100 m: ${names[0]}`, `Historic site within 100 m: ${names[0]}`),
        summary: names.length > 1
          ? bi(`También: ${names.slice(1).join("; ")}.`, `Also: ${names.slice(1).join("; ")}.`)
          : bi("Puede afectar el diseño, la altura o las visuales del proyecto.", "It can affect the project's design, height, or sightlines."),
        confidence: "medium",
        sourceId: "src-hist-sites",
        why: {
          found: bi(`La capa de sitios históricos registra ${names.join("; ")} a 100 m o menos de la parcela.`, `The historic-sites layer records ${names.join("; ")} within 100 m of the parcel.`),
          matters: bi("La cercanía a un sitio histórico puede traer condiciones de la Junta o del ICP.", "Proximity to a historic site can bring conditions from the Planning Board or the ICP."),
          verification: "Recommended",
        },
      });
    }

    // ---- what this data can't answer ----
    unknowns.push(
      {
        title: bi("Usos permitidos, densidad, altura y estacionamiento", "Allowed uses, density, height, and parking"),
        whyItMatters: bi("Determinan cuántas unidades o pies cuadrados caben y si tu proyecto es permitido por derecho.", "They set how many units or square feet fit and whether your project is allowed by right."),
        nextStep: bi("Confirmar con la Junta de Planificación u OGPe para el distrito de esta parcela.", "Confirm with the Planning Board or OGPe for this parcel's district."),
        relatedFindingId: "zoning",
      },
      {
        title: bi("Capacidad de agua, alcantarillado y electricidad", "Water, sewer, and power capacity"),
        whyItMatters: bi("Un proyecto grande puede requerir mejoras costosas si no hay capacidad.", "A large project can require costly upgrades if capacity isn't there."),
        nextStep: bi("Solicitar endosos de disponibilidad a AAA y LUMA.", "Request availability letters from AAA and LUMA."),
        relatedFindingId: null,
      },
      {
        title: bi("Titularidad, gravámenes y servidumbres", "Ownership, liens, and easements"),
        whyItMatters: bi("Pueden bloquear o encarecer una compra.", "They can block or add cost to an acquisition."),
        nextStep: bi("Estudio de título en el Registro de la Propiedad.", "Title search at the Registro de la Propiedad."),
        relatedFindingId: null,
      },
      {
        title: bi("Condiciones ambientales e historial de permisos", "Environmental conditions and permit history"),
        whyItMatters: bi("Contaminación previa, suelos o permisos existentes cambian el riesgo y el calendario.", "Prior contamination, soils, or existing permits change risk and timeline."),
        nextStep: bi("Parcela aún no cubre estos datos; evaluación ambiental Fase I y búsqueda de permisos en OGPe.", "Parcela doesn't cover this data yet; Phase I environmental assessment and permit search at OGPe."),
        relatedFindingId: null,
      },
      {
        title: bi("Susceptibilidad a deslizamientos", "Landslide susceptibility"),
        whyItMatters: bi("Pendientes inestables cambian el diseño, los muros y el costo de la obra.", "Unstable slopes change the design, retaining walls, and construction cost."),
        nextStep: bi("La capa pública de deslizamientos no responde a consultas; evaluarlo en el estudio geotécnico.", "The public landslide layer doesn't answer queries; assess it in the geotechnical study."),
        relatedFindingId: null,
      }
    );

    nextActions.unshift({
      title: bi("Confirmar calificación y usos permitidos", "Confirm zoning and allowed uses"),
      whyItMatters: bi("Es el primer filtro: define si el proyecto procede por derecho.", "It's the first filter: it decides whether the project proceeds by right."),
      professional: bi("Planificador o abogado de uso de suelo", "Land-use planner or attorney"),
      evidenceRef: "zoning",
      sourceId: zoningRow ? "src-zoning" : null,
    });
    nextActions.push(
      {
        title: bi("Estudio de título", "Title search"),
        whyItMatters: bi("Confirma dueño, gravámenes y servidumbres antes de comprometer capital.", "Confirms owner, liens, and easements before committing capital."),
        professional: bi("Abogado-notario", "Attorney-notary"),
        evidenceRef: null,
        sourceId: "src-crim",
      },
      {
        title: bi("Endosos de infraestructura", "Utility availability letters"),
        whyItMatters: bi("La capacidad de servicios puede limitar la densidad real.", "Utility capacity can cap the real density."),
        professional: bi("Ingeniero civil", "Civil engineer"),
        evidenceRef: null,
        sourceId: null,
      }
    );
    nextActions.forEach((a, i) => { a.order = i + 1; });

    // ---- feasibility headline ----
    const floodFinding = findings.find((f) => f.id === "flood");
    const hasConstraint = findings.some((f) => f.category === "constraint");
    // Some district names carry their own parentheses ("… (Solar Mínimo 300 mts
    // cuadrados)"); flatten them so the headline doesn't nest brackets.
    const zoningDesc = zoning && zoning.description ? ` (${zoning.description.replace(/\s*\(([^)]*)\)/g, ", $1")})` : "";
    const zoningText = zoning ? bi(`calificada ${zoning.code}${zoningDesc}`, `zoned ${zoning.code}${zoningDesc}`) : bi("sin calificación encontrada", "with no zoning found");
    const floodKnown = floodFinding.category !== "unknown";
    const floodText = floodKnown
      ? bi(` y en ${floodFinding.title.es.split(" — ")[0]} de FEMA`, ` and in FEMA ${floodFinding.title.en.split(" — ")[0]}`)
      : bi("; la zona de inundación no se pudo determinar", "; its flood zone couldn't be determined");
    const feasibility = {
      status: hasConstraint ? bi("Preliminar — con restricciones", "Preliminary — constraints found") : bi("Preliminar — por confirmar", "Preliminary — items to confirm"),
      summary: bi(
        `La parcela ${cadastral} (${areaSqm.toLocaleString("en-US")} m²) está ${zoningText.es}${floodText.es}. Falta confirmar usos permitidos y densidad para tu proyecto.`,
        `Parcel ${cadastral} (${areaSqm.toLocaleString("en-US")} m²) is ${zoningText.en}${floodText.en}. Allowed uses and density for your project still need confirmation.`
      ),
    };

    return json(
      {
        property: {
          cadastral,
          address: resolved.geocode ? resolved.geocode.matched : null,
          municipality: municipality || "San Juan",
          barrio: zoning ? zoning.barrio : null,
          areaSqm,
          areaCuerdas: Math.round((areaSqm / SQM_PER_CUERDA) * 100) / 100,
          center: [lon, lat],
        },
        zoning,
        flood,
        feasibility,
        findings,
        unknowns,
        nextActions,
        sources,
        map: {
          envelope: env,
          parcel: rings,
          context: ctxParcels ? ctxParcels.features.filter((f) => f.attributes.NUM_CATASTRO !== cadastral).map((f) => f.geometry.rings) : [],
          zoning: ctxZoning ? ctxZoning.features.map((f) => ({ code: f.attributes.cali, rings: f.geometry.rings })) : [],
          flood: ctxFlood ? ctxFlood.features.map((f) => ({ zone: f.attributes.FLD_ZONE, subtype: f.attributes.ZONE_SUBTY, rings: f.geometry.rings })) : [],
          liquefaction: ctxLiq ? ctxLiq.features.map((f) => ({ level: f.attributes.Licuacion, rings: f.geometry.rings })) : [],
          historicZones: ctxHistZone ? ctxHistZone.features.map((f) => ({ name: f.attributes.ZONA, rings: f.geometry.rings })) : [],
        },
        generatedAt: new Date().toISOString(),
      },
      200
    );
  }

  function json(body, status) {
    return { status, body };
  }

  return { run };
})();
