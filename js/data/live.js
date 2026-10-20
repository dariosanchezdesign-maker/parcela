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

  function loadProject() {
    try { return JSON.parse(sessionStorage.getItem(PROJECT_KEY)) || null; } catch (e) { return null; }
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
      environmental: null,
      infrastructure: [],
      development: [],
      legends: {
        zoning: [...codes.slice(0, 5).map((c) => ({ label: c, color: colorOf(c) })), parcelRow],
        flood: floodZones.length
          ? [...floodZones.map((z) => ({ label: I.tv(floodLegendLabel(z.zone, z.subtype)), color: floodColor(z.zone, z.subtype).replace(/[\d.]+\)$/, "0.9)") })), parcelRow]
          : noData,
        environmental: noData,
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
    P.feasibility = data.feasibility;
    P.findings = data.findings;
    P.findingCategories = ["favorable", "investigate", "constraint", "unknown"].map((key) => ({
      key,
      findings: data.findings.filter((f) => f.category === key),
    }));
    P.unknowns = data.unknowns;
    P.nextActions = data.nextActions;
    P.findingById = (id) => data.findings.find((f) => f.id === id) || null;
    P.sourceById = (id) => (id && data.sources[id]) || null;

    const z = data.zoning;
    const notCovered = { es: "Por confirmar — Parcela aún no cubre este dato", en: "To confirm — not covered by Parcela yet" };
    P.regulatory = {
      landUse: { value: z ? `${z.code}${z.description ? ` · ${z.description}` : ""}` : notCovered, status: z ? "investigate" : "unknown", sourceId: z ? "src-zoning" : null },
      proposedUse: { value: projectTypeLabel(project.type), status: "neutral" },
      applicableRegulation: {
        value: z && z.resolution ? `Resolución ${z.resolution}${z.effective ? ` (${z.effective})` : ""}` : notCovered,
        status: "neutral",
        sourceId: z ? "src-zoning" : null,
      },
      density: { value: notCovered, status: "unknown" },
      height: { value: notCovered, status: "unknown" },
      parking: { value: notCovered, status: "unknown" },
      // Every regulatory "Why?" points at the zoning finding — the only
      // evidence these rows have today.
      whyIds: { landUse: "zoning", density: "zoning", height: "zoning", parking: "zoning" },
      noSummarize: true,
    };
    P.map = buildMap(data);
    return P;
  }

  return { parcelParam, lookup, apply, saveProject, loadProject, displayAddress };
})();
