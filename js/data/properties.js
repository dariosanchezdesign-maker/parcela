/**
 * Seed property dataset — MOCK DATA for demo purposes.
 * Six archetypes chosen to cover different feasibility stories. Structure
 * mirrors what a real cadastral/GIS + zoning + FEMA feed would return, so
 * a live provider can replace this file without touching the engine or UI.
 */
window.PARCELA_PROPERTIES = [
  {
    id: "santurce-loiza",
    address: "Calle Loíza 1420",
    barrio: "Santurce",
    municipio: "San Juan",
    coords: { lat: 18.4515, lng: -66.0664 },
    lotSizeM2: 452,
    frontageM: 12,
    zoningCode: "C-1",
    catastro: "060-000-011-23",
    existingStructure: { type: "vacant lot", yearBuilt: null, areaM2: 0, condition: "cleared, old foundation remnants" },
    floodZone: "X",
    coastalProximityM: 950,
    utilities: { water: "available at lot line", sewer: "available (AAA main on Loíza)", electric: "available" },
    historicDistrict: false,
    topography: "flat, urban infill",
    blurb: "A cleared infill lot on a busy commercial corridor, one block off Ashford. Ground floors nearby run bakeries, studios and small offices."
  },
  {
    id: "condado-mckinley",
    address: "Calle McKinley 87",
    barrio: "Condado",
    municipio: "San Juan",
    coords: { lat: 18.4571, lng: -66.0755 },
    lotSizeM2: 318,
    frontageM: 10,
    zoningCode: "R-3",
    catastro: "062-000-004-09",
    existingStructure: { type: "single-family residence", yearBuilt: 1958, areaM2: 145, condition: "original, well maintained" },
    floodZone: "X",
    coastalProximityM: 420,
    utilities: { water: "connected", sewer: "connected", electric: "connected" },
    historicDistrict: false,
    topography: "flat",
    blurb: "A 1950s single-family home a short walk from the Condado strip, on a street that has quietly densified with small multi-unit buildings."
  },
  {
    id: "rincon-costa",
    address: "Carr. 413 Km 4.1, Sector Steps",
    barrio: "Puntas",
    municipio: "Rincón",
    coords: { lat: 18.3403, lng: -67.2685 },
    lotSizeM2: 910,
    frontageM: 28,
    zoningCode: "RT",
    catastro: "108-011-002-14",
    existingStructure: { type: "single-family residence", yearBuilt: 1994, areaM2: 168, condition: "renovated 2019" },
    floodZone: "AE",
    coastalProximityM: 55,
    utilities: { water: "connected", sewer: "septic (cesspool, unpermitted upgrade unknown)", electric: "connected" },
    historicDistrict: false,
    topography: "gently sloped toward coast",
    blurb: "A near-beachfront home close to a well-known surf break, currently owner-occupied. Neighboring lots operate as short-term rentals."
  },
  {
    id: "caguas-turabo",
    address: "Calle 9 SE 240",
    barrio: "Turabo Gardens",
    municipio: "Caguas",
    coords: { lat: 18.2308, lng: -66.0357 },
    lotSizeM2: 712,
    frontageM: 18,
    zoningCode: "R-1",
    catastro: "025-004-018-33",
    existingStructure: { type: "single-family residence", yearBuilt: 1976, areaM2: 132, condition: "dated, structurally sound" },
    floodZone: "X",
    coastalProximityM: null,
    utilities: { water: "connected", sewer: "connected", electric: "connected" },
    historicDistrict: false,
    topography: "flat, suburban grid",
    blurb: "A classic suburban urbanización lot with generous side setbacks, in a stable residential neighborhood outside San Juan."
  },
  {
    id: "fajardo-quebrada",
    address: "Carr. 195 Km 2.3, Bo. Quebrada Fajardo",
    barrio: "Quebrada Fajardo",
    municipio: "Fajardo",
    coords: { lat: 18.3081, lng: -65.6803 },
    lotSizeM2: 7860,
    frontageM: 60,
    zoningCode: "A-P",
    catastro: "233-000-001-02",
    existingStructure: { type: "none", yearBuilt: null, areaM2: 0, condition: "undeveloped, partially wooded" },
    floodZone: "AE",
    coastalProximityM: 2400,
    utilities: { water: "not connected — nearest AAA main ~400m", sewer: "not available (would require septic)", electric: "nearest pole ~150m" },
    historicDistrict: false,
    topography: "gently sloped, a seasonal creek crosses the northeast corner",
    blurb: "A two-cuerda parcel that's been in agricultural use historically, with mixed pasture and tree cover. No structures on site."
  },
  {
    id: "guaynabo-rio",
    address: "Ave. Las Cumbres 615",
    barrio: "Río Piedras (limítrofe con Guaynabo)",
    municipio: "Guaynabo",
    coords: { lat: 18.3958, lng: -66.0819 },
    lotSizeM2: 1105,
    frontageM: 22,
    zoningCode: "R-4",
    catastro: "047-002-009-11",
    existingStructure: { type: "two-unit residence", yearBuilt: 1988, areaM2: 210, condition: "good, minor deferred maintenance" },
    floodZone: "X",
    coastalProximityM: null,
    utilities: { water: "connected", sewer: "connected", electric: "connected" },
    historicDistrict: false,
    topography: "gently sloped",
    blurb: "An existing duplex on a corner lot zoned for multifamily density, on a block that's transitioning toward small apartment buildings."
  }
];

window.PARCELA_GOALS = [
  { id: "build-home", label: "Build a home", icon: "home" },
  { id: "adu", label: "Add an ADU / second unit", icon: "adu" },
  { id: "multifamily", label: "Build multifamily", icon: "multifamily" },
  { id: "renovate", label: "Renovate", icon: "renovate" },
  { id: "business", label: "Open a business", icon: "business" },
  { id: "str", label: "Short-term rental", icon: "str" },
  { id: "agricultural", label: "Agricultural use", icon: "agricultural" },
  { id: "unknown", label: "I don't know — show me my options", icon: "unknown" }
];
