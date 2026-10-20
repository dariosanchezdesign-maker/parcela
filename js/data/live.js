/* Real property data. Runs ParcelaLookup (CRIM parcels, Planning Board
   zoning, FEMA flood zones — see lookup.js) and reshapes its result into
   the same window.PARCELA shape the prototype pages already render, so the
   UI modules don't need to know whether data is live or demo.

   A page is in live mode when its URL carries ?parcel=<cadastral number>;
   without it, pages keep showing the labeled demo property. */

window.ParcelaLive = (function () {
  const CACHE_PREFIX = "parcela-lookup:";
  const PROJECT_KEY = "parcela-project";

  function parcelParam() {
    return new URLSearchParams(location.search).get("parcel");
  }

  function cacheGet(cadastral) {
    try {
      const raw = sessionStorage.getItem(CACHE_PREFIX + cadastral);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function cacheSet(data) {
    try {
      sessionStorage.setItem(CACHE_PREFIX + data.property.cadastral, JSON.stringify(data));
    } catch (e) {}
  }

  // Resolves to the lookup payload, or rejects with an Error whose `code` is
  // the lookup's error code (not_found, outside_coverage, ...).
  async function lookup(q) {
    const cached = cacheGet(q);
    if (cached) return cached;
    let res;
    try {
      res = await window.ParcelaLookup.run(q);
    } catch (e) {
      throw Object.assign(new Error("lookup failed"), { code: "source_unavailable" });
    }
    const data = res.body;
    if (res.status !== 200) throw Object.assign(new Error(data.error), { code: data.error, detail: data });
    // A cadastral-number lookup has no address; keep one from an earlier
    // address search of the same parcel.
    const prior = cacheGet(data.property.cadastral);
    if (!data.property.address && prior && prior.property.address) data.property.address = prior.property.address;
    cacheSet(data);
    return data;
  }

  function saveProject(project) {
    try { sessionStorage.setItem(PROJECT_KEY, JSON.stringify(project)); } catch (e) {}
  }

  // A ?type= in the URL (shared report links) wins over this tab's setup.
  function loadProject() {
    const urlType = new URLSearchParams(location.search).get("type");
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(PROJECT_KEY)) || null; } catch (e) {}
    if (urlType && PROJECT_TYPE_KEYS[urlType]) {
      return saved && saved.type === urlType ? saved : { type: urlType, units: "", investment: "" };
    }
    return saved;
  }

  // ---------- map projection ----------
  // Equirectangular projection of the lookup's context envelope into the
  // prototype map's 640×520 SVG viewBox. At parcel scale (a few hundred
  // meters) the distortion is negligible.

  const VIEW_W = 640;
  const VIEW_H = 520;

  function projector(env) {
    const [minX, minY, maxX, maxY] = env;
    const k = Math.cos(((minY + maxY) / 2) * Math.PI / 180);
    const w = (maxX - minX) * k;
    const h = maxY - minY;
    const scale = Math.min(VIEW_W / w, VIEW_H / h);
    const offX = (VIEW_W - w * scale) / 2;
    const offY = (VIEW_H - h * scale) / 2;
    return ([x, y]) => [offX + (x - minX) * k * scale, offY + (maxY - y) * scale];
  }

  function pathD(rings, project) {
    return rings
      .map((ring) => "M" + ring.map((pt) => project(pt).map((n) => n.toFixed(1)).join(",")).join("L") + "Z")
      .join("");
  }

  const ZONING_COLORS = ["#3f8557", "#b07a2a", "#7a5caa", "#2f7f8f", "#a5493f", "#6b7a2f"];
  const STREET_CODES = ["VIAL"];

  const LIQ_COLORS = {
    "Licuación Muy Bajo": "rgba(170,170,160,0.10)",
    "Licuación Bajo": "rgba(214,184,96,0.22)",
    "Licuación Moderado": "rgba(214,150,64,0.30)",
    "Licuación Alto": "rgba(196,98,52,0.34)",
    "Licuación Muy Alto": "rgba(160,52,40,0.40)",
  };
  const LIQ_LABELS = {
    "Licuación Muy Bajo": { es: "Licuación muy baja", en: "Liquefaction very low" },
    "Licuación Bajo": { es: "Licuación baja", en: "Liquefaction low" },
    "Licuación Moderado": { es: "Licuación moderada", en: "Liquefaction moderate" },
    "Licuación Alto": { es: "Licuación alta", en: "Liquefaction high" },
    "Licuación Muy Alto": { es: "Licuación muy alta", en: "Liquefaction very high" },
  };
  const HISTORIC_OUTLINE = "#7a5caa";

  function floodColor(zone, subtype) {
    const z = (zone || "").toUpperCase();
    if (z.startsWith("V")) return "rgba(47,75,143,0.42)";
    if (z.startsWith("A")) return "rgba(59,92,170,0.32)";
    if (z === "X" && (subtype || "").includes("0.2")) return "rgba(143,167,214,0.30)";
    return "rgba(143,167,214,0.08)";
  }

  function buildMap(data) {
    const I = window.ParcelaI18N;
    const project = projector(data.map.envelope);
    const subjectCode = data.zoning ? data.zoning.code : null;

    const codes = [];
    data.map.zoning.forEach((z) => {
      if (!STREET_CODES.includes(z.code) && !codes.includes(z.code)) codes.push(z.code);
    });
    codes.sort((a, b) => (a === subjectCode ? -1 : b === subjectCode ? 1 : 0));
    const colorOf = (code) => ZONING_COLORS[codes.indexOf(code) % ZONING_COLORS.length];

    const floodZones = [];
    data.map.flood.forEach((f) => {
      const key = `${f.zone}|${f.subtype || ""}`;
      if (!floodZones.some((z) => z.key === key)) floodZones.push({ key, zone: f.zone, subtype: f.subtype });
    });

    const parcelRow = { labelKey: "map_subjectParcel", color: "var(--map-selected)" };
    const noData = [{ labelKey: "live_mapNoData", color: "var(--line-strong)" }];

    const liqLevels = [...new Set((data.map.liquefaction || []).map((l) => l.level))]
      .filter((lvl) => LIQ_COLORS[lvl])
      .sort((a, b) => Object.keys(LIQ_COLORS).indexOf(b) - Object.keys(LIQ_COLORS).indexOf(a));
    const envLegend = [
      ...liqLevels.map((lvl) => ({ label: I.tv(LIQ_LABELS[lvl]), color: LIQ_COLORS[lvl].replace(/[\d.]+\)$/, "0.9)") })),
      ...[...new Set((data.map.historicZones || []).map((h) => h.name))].map((name) => ({ label: name, color: HISTORIC_OUTLINE })),
    ];

    return {
      live: true,
      viewBox: `0 0 ${VIEW_W} ${VIEW_H}`,
      roads: [],
      context: data.map.context.map((rings) => ({ d: pathD(rings, project) })),
      streets: data.map.zoning.filter((z) => STREET_CODES.includes(z.code)).map((z) => ({ d: pathD(z.rings, project) })),
      parcel: { d: pathD(data.map.parcel, project) },
      zoning: data.map.zoning
        .filter((z) => !STREET_CODES.includes(z.code))
        .map((z) => ({ d: pathD(z.rings, project), color: colorOf(z.code) })),
      flood: data.map.flood.map((f) => ({ d: pathD(f.rings, project), color: floodColor(f.zone, f.subtype) })),
      // Liquefaction fills, historic-zone boundaries drawn on top.
      environmental: [
        ...(data.map.liquefaction || []).map((l) => ({ d: pathD(l.rings, project), color: LIQ_COLORS[l.level] || "rgba(0,0,0,0.05)" })),
        ...(data.map.historicZones || []).map((h) => ({ d: pathD(h.rings, project), outline: HISTORIC_OUTLINE })),
      ],
      infrastructure: [],
      development: [],
      legends: {
        zoning: [...codes.slice(0, 5).map((c) => ({ label: c, color: colorOf(c) })), parcelRow],
        flood: floodZones.length
          ? [...floodZones.map((z) => ({ label: I.tv(floodLegendLabel(z.zone, z.subtype)), color: floodColor(z.zone, z.subtype).replace(/[\d.]+\)$/, "0.9)") })), parcelRow]
          : noData,
        environmental: envLegend.length ? [...envLegend, parcelRow] : noData,
        infrastructure: noData,
        development: noData,
      },
    };
  }

  function floodLegendLabel(zone, subtype) {
    const z = (zone || "").toUpperCase();
    if (z === "X" && (subtype || "").includes("0.2")) return { es: "Zona X sombreada (0.2%)", en: "Shaded Zone X (0.2%)" };
    if (z === "X") return { es: "Zona X (riesgo mínimo)", en: "Zone X (minimal)" };
    return { es: `Zona ${z}`, en: `Zone ${z}` };
  }

  // ---------- reshape into window.PARCELA ----------

  function displayAddress(data) {
    const p = data.property;
    if (p.address) return p.address.split(",")[0];
    return `${window.ParcelaI18N.t("live_parcel")} ${p.cadastral}`;
  }

  const PROJECT_TYPE_KEYS = {
    Multifamily: "setup_multifamily", Commercial: "setup_commercial", Hospitality: "setup_hospitality",
    Industrial: "setup_industrial", "Mixed-use": "setup_mixedUse", Residential: "setup_residential", Other: "setup_other",
  };

  // Setup stores the English type id; show it in the page's language.
  function projectTypeLabel(type) {
    const key = PROJECT_TYPE_KEYS[type];
    return key ? window.ParcelaI18N.STRINGS[key] : type;
  }

  function apply(P, data) {
    const I = window.ParcelaI18N;
    const p = data.property;
    const project = loadProject() || { type: "Multifamily", units: "", investment: "" };

    P.live = true;
    P.liveData = data;
    P.property = {
      id: p.cadastral,
      address: displayAddress(data),
      municipality: [p.barrio, p.municipality, "Puerto Rico"].filter(Boolean).join(", "),
      cadastral: p.cadastral,
      parcelAreaSqm: p.areaSqm,
      parcelAreaAcres: null,
      parcelAreaCuerdas: p.areaCuerdas,
      lastAnalyzed: new Date(data.generatedAt).toLocaleDateString(I.lang === "es" ? "es-PR" : "en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    P.project = { name: displayAddress(data), type: projectTypeLabel(project.type), unitsLabel: project.units || "—", investmentLabel: project.investment || "—" };
    // District rules (Reglamento Conjunto 2023) depend on the project type,
    // which setup collects after the lookup, so they're assessed here rather
    // than in lookup.js.
    const rules = window.ParcelaZoning.assess(data.zoning, project.type, p.areaSqm);
    const findings = [...data.findings, ...rules.findings];
    const sources = { ...data.sources, "src-rc2023": rules.source };
    const unknowns = data.unknowns.slice();
    if (rules.regulatory) {
      // The rules answer uses/density; what's left open is narrower.
      unknowns[0] = {
        title: { es: "Patios, estacionamiento y altura final", en: "Yards, parking, and final height" },
        whyItMatters: { es: "Reducen lo que cabe de verdad frente al estimado del distrito.", en: "They cut what actually fits compared with the district estimate." },
        nextStep: { es: "Anteproyecto con arquitecto y consulta con la Junta de Planificación u OGPe.", en: "Schematic design with an architect and a consultation with the Planning Board or OGPe." },
        relatedFindingId: "capacity",
      };
      if (rules.resolved.district.variantNote) {
        unknowns.unshift({
          title: { es: "Qué intensidad de C-T aplica", en: "Which C-T intensity applies" },
          whyItMatters: rules.resolved.district.variantNote,
          nextStep: { es: "Confirmar con la Junta de Planificación u OGPe.", en: "Confirm with the Planning Board or OGPe." },
          relatedFindingId: "capacity",
        });
      }
    }

    const hasConstraint = findings.some((f) => f.category === "constraint");
    P.feasibility = {
      status: hasConstraint
        ? { es: "Preliminar — con restricciones", en: "Preliminary — constraints found" }
        : data.feasibility.status,
      summary: data.feasibility.summary,
    };
    P.findings = findings;
    P.findingCategories = ["favorable", "investigate", "constraint", "unknown"].map((key) => ({
      key,
      findings: findings.filter((f) => f.category === key),
    }));
    P.unknowns = unknowns;
    P.nextActions = data.nextActions;
    P.findingById = (id) => findings.find((f) => f.id === id) || null;
    P.sourceById = (id) => (id && sources[id]) || null;

    const z = data.zoning;
    const reg = rules.regulatory;
    const notCovered = { es: "Por confirmar — Parcela aún no cubre este dato", en: "To confirm — not covered by Parcela yet" };
    const rulesWhy = reg ? (findings.some((f) => f.id === "capacity") ? "capacity" : "project-fit") : "district-rules";
    P.regulatory = {
      rows: [
        { label: { es: "Calificación (mapa)", en: "Zoning (map)" }, value: z ? `${z.code}${z.description ? ` · ${z.description}` : ""}` : notCovered, whyId: "zoning" },
        { label: { es: "Distrito actual (RC 2023)", en: "Current district (RC 2023)" }, value: reg ? reg.district : notCovered, whyId: findings.some((f) => f.id === "project-fit") ? "project-fit" : rulesWhy },
        { label: { es: "Uso propuesto", en: "Proposed use" }, value: projectTypeLabel(project.type) },
        { label: { es: "Cabida mínima", en: "Minimum lot" }, value: reg ? reg.minLot : notCovered, whyId: rulesWhy },
        { label: { es: "Área de ocupación", en: "Lot coverage" }, value: reg ? reg.occupancy : notCovered, whyId: rulesWhy },
        { label: { es: "Densidad", en: "Density" }, value: reg ? reg.density : notCovered, whyId: rulesWhy },
        { label: { es: "Altura", en: "Height" }, value: reg ? reg.height : notCovered, whyId: rulesWhy },
        { label: { es: "Estacionamiento", en: "Parking" }, value: reg ? reg.parking : notCovered, whyId: rulesWhy },
      ],
    };
    P.map = buildMap(data);
    return P;
  }

  // The facts /api/explain may use: everything the page shows, in the
  // page's language, and nothing else.
  function aiContext(P) {
    const I = window.ParcelaI18N;
    const t = (v) => (v == null ? null : I.tv(v));
    const source = (id) => {
      const src = P.sourceById(id);
      return src ? [src.name, src.section, src.date].filter(Boolean).join(" · ") : null;
    };
    const project = loadProject() || {};
    return {
      property: {
        address: P.property.address,
        cadastral: P.property.cadastral,
        municipality: P.property.municipality,
        areaSqm: P.property.parcelAreaSqm,
        areaCuerdas: P.property.parcelAreaCuerdas,
      },
      project: { type: project.type || null, units: project.units || null, investment: project.investment || null },
      feasibility: { status: t(P.feasibility.status), summary: t(P.feasibility.summary) },
      findings: P.findings.map((f) => ({
        category: f.category,
        confidence: f.confidence,
        title: t(f.title),
        summary: t(f.summary),
        evidence: t(f.why.found),
        whyItMatters: t(f.why.matters),
        source: source(f.sourceId),
      })),
      regulatory: P.regulatory.rows.map((r) => ({ [t(r.label)]: t(r.value) })),
      unknowns: P.unknowns.map((u) => ({ title: t(u.title), whyItMatters: t(u.whyItMatters), nextStep: t(u.nextStep) })),
      nextActions: P.nextActions.map((a) => ({ order: a.order, title: t(a.title), whyItMatters: t(a.whyItMatters), professional: t(a.professional) })),
    };
  }

  return { parcelParam, lookup, apply, saveProject, loadProject, displayAddress, aiContext };
})();
