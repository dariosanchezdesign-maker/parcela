/**
 * Mock zoning reference used by the analysis engine.
 * Loosely modeled on Puerto Rico's Reglamento Conjunto zoning families
 * (R-, C-, A-, SU) but simplified and NOT legal text — every citation
 * surfaced in the UI is labeled "mock reference" and points back here.
 * Swap this file for a real Junta de Planificación / municipal dataset
 * later; callers only depend on the shape below.
 */
window.PARCELA_ZONING = {
  "R-1": {
    code: "R-1",
    name: "Residencial Baja Densidad",
    category: "residential",
    maxUnitsPerLot: 1,
    aduAllowed: true,
    minLotM2: 450,
    notes: "Predominantly single-family. One accessory dwelling unit is generally permitted alongside the principal residence, subject to lot coverage limits.",
    source: "Mock reference — Reglamento Conjunto family R-1"
  },
  "R-2": {
    code: "R-2",
    name: "Residencial Densidad Moderada",
    category: "residential",
    maxUnitsPerLot: 2,
    aduAllowed: true,
    minLotM2: 350,
    notes: "Single-family or two-unit development. ADUs generally permitted.",
    source: "Mock reference — Reglamento Conjunto family R-2"
  },
  "R-3": {
    code: "R-3",
    name: "Residencial Alta Densidad",
    category: "residential",
    maxUnitsPerLot: 4,
    aduAllowed: true,
    minLotM2: 250,
    notes: "Multi-unit residential up to a moderate unit count, subject to parking and setback review.",
    source: "Mock reference — Reglamento Conjunto family R-3"
  },
  "R-4": {
    code: "R-4",
    name: "Residencial Alta Densidad Multifamiliar",
    category: "residential",
    maxUnitsPerLot: 12,
    aduAllowed: true,
    minLotM2: 250,
    notes: "Purpose-built multifamily density. Typically the most direct path to small apartment-style development.",
    source: "Mock reference — Reglamento Conjunto family R-4"
  },
  "C-1": {
    code: "C-1",
    name: "Comercial Liviana",
    category: "commercial",
    maxUnitsPerLot: 6,
    aduAllowed: false,
    minLotM2: 300,
    notes: "Neighborhood-scale commercial and mixed use. Ground-floor business with residential above is common but needs a use-variance review.",
    source: "Mock reference — Reglamento Conjunto family C-1"
  },
  "C-2": {
    code: "C-2",
    name: "Comercial General",
    category: "commercial",
    maxUnitsPerLot: null,
    aduAllowed: false,
    minLotM2: 400,
    notes: "General commercial corridor use. Broader business categories permitted; residential conversion needs a formal use change.",
    source: "Mock reference — Reglamento Conjunto family C-2"
  },
  "RT": {
    code: "RT",
    name: "Residencial Turístico",
    category: "tourism",
    maxUnitsPerLot: 8,
    aduAllowed: false,
    minLotM2: 500,
    notes: "Short-term/vacation rental use is generally contemplated, but coastal parcels in this zone are frequently also inside DRNA maritime-zone jurisdiction — that review runs in parallel.",
    source: "Mock reference — Reglamento Conjunto family RT"
  },
  "A-P": {
    code: "A-P",
    name: "Agrícola Productivo",
    category: "agricultural",
    maxUnitsPerLot: 1,
    aduAllowed: true,
    minLotM2: 3930,
    notes: "Zoned to preserve agricultural production. Non-agricultural construction (including most residential subdivision) requires a special use permit from the Junta de Planificación.",
    source: "Mock reference — Reglamento Conjunto family A-P"
  },
  "SU": {
    code: "SU",
    name: "Suelo Urbano General",
    category: "residential",
    maxUnitsPerLot: 3,
    aduAllowed: true,
    minLotM2: 300,
    notes: "General urban land without a specialized district. Use is typically inferred from surrounding development pattern — worth an early consulta de ubicación.",
    source: "Mock reference — Reglamento Conjunto family SU"
  }
};

window.PARCELA_FLOOD_ZONES = {
  "X":  { label: "Zone X", risk: "minimal", description: "Minimal flood hazard on current FEMA mapping." },
  "AE": { label: "Zone AE", risk: "high", description: "1%-annual-chance (100-year) flood zone with a mapped base flood elevation. Triggers elevation/floodproofing requirements." },
  "VE": { label: "Zone VE", risk: "high", description: "Coastal high-hazard zone subject to wave action. The strictest construction standard, and often overlaps DRNA maritime-terrestrial zone review." }
};
