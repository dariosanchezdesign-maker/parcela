/* What a San Juan zoning district allows, per the Reglamento Conjunto 2023.

   Every value here was read from the page images of the Planning Board's
   official PDF (the "searchable" text layer has OCR errors) and carries its
   printed page number. Nothing is inferred: districts or rules the document
   doesn't settle come back as unknown.

   Chain: the lot's district in San Juan's Plan de Ordenación Territorial
   (zoning rows with regla 133) → Tabla 6.14 equivalence → current district →
   that district's uses table and design parameters. Lots governed by other
   plans (special-area plans, other regla codes) aren't covered. */

window.ParcelaZoning = (function () {
  const SOURCE = {
    name: "Reglamento Conjunto 2023 (de emergencia)",
    agency: "Junta de Planificación de Puerto Rico",
    date: "2023-06-16",
    document: "https://docs.pr.gov/files/JP-Junta%20de%20Planificacion/Reglamentos%20de%20Planificaci%C3%B3n/Reglamento-Conjunto-de-Emergencia-searchable.pdf",
  };

  // Zoning rows whose `regla` is San Juan's Plan de Ordenación Territorial.
  // Its district list matches Tabla 6.14 code for code.
  const SAN_JUAN_POT_REGLA = 133;

  // Tabla 6.14 (pp. 332–334). null = the table leaves the cell blank.
  const SAN_JUAN_EQUIV = {
    "R-0": "R-B", "R-1": "R-B", "R-2": "R-I", "R-3": "R-I", "R-4": "R-U", "R-5": null, "R-6": null,
    "CO-1": "C-L", "C-L": "C-L", "C-1": "C-L", "C-6": "C-L", "CO-2": "C-I", "C-2": "C-I", "C-3": "C-C", "C-4": "C-C",
    "C-5": "RC-E", "RT-3": "RT-I", "RT-4": "RT-I", "RT-5": "RT-A", "CT-1": "C-T", "CT-2": "C-T", "CT-3": "C-T",
    "I-1": "I-L", "IL-1": null, "I-2": "I-P", "IL-2": "I-P", "SRP": "ARD",
    "D": "D-G", "DA": "D-G", "DE": "D-G", "DS": "D-G", "DT": "D-G", "DD": "D-A", "B-1": "A-B", "CPN": "CR", "M": "M",
  };
  // Mapped to more than one current district depending on the case.
  const SAN_JUAN_AMBIGUOUS = {
    DV: { es: "D-A (parques, plazas) o P-P (playas públicas)", en: "D-A (parks, plazas) or P-P (public beaches)" },
    "CR-H": { es: "S-H (sitio histórico) o C-H (conservación histórica)", en: "S-H (historic site) or C-H (historic conservation)" },
  };

  const DISTRICT_NAMES = {
    "D-A": { es: "Dotacional Áreas Abiertas", en: "Open Areas (public)" },
    "A-B": { es: "Área de Bosques", en: "Forest Area" },
    CR: { es: "Conservación de Recursos", en: "Resource Conservation" },
    "P-P": { es: "Playa Pública", en: "Public Beach" },
    "S-H": { es: "Sitio Histórico", en: "Historic Site" },
    "C-H": { es: "Conservación Histórica", en: "Historic Conservation" },
    M: { es: "A Mejorarse", en: "To Be Improved" },
  };

  // Project types from setup.html. Fit statuses:
  //   allowed     — listed in the district's permitted-uses table
  //   conditional — permitted only partly or under conditions noted
  //   exception   — only via "uso vía excepción" (adjudicated, often a hearing)
  //   consulta    — every project goes through a consulta (case-by-case)
  //   not_listed  — not among permitted uses or exceptions
  //   prohibited  — excluded by the district's text
  const D = {
    "R-B": {
      name: { es: "Residencial de Baja Densidad", en: "Low-Density Residential" },
      rule: "Regla 6.1.2, Tablas 6.29–6.31, pp. 357–361",
      fit: {
        Multifamily: ["allowed", { es: "Casa de apartamentos está permitida.", en: "Apartment buildings are permitted." }],
        Residential: ["allowed", { es: "Unifamiliares, casas en hilera y casa patio permitidas.", en: "Single-family, row and patio houses permitted." }],
        Hospitality: ["exception", { es: "Solo hospedería de hasta 25 unidades vía excepción, con certificación de Turismo y solar de 900 m² o más.", en: "Only an inn (hospedería) of up to 25 units by exception, with Tourism certification and a lot of 900 m²+." }],
        Commercial: ["not_listed", { es: "Comercio no está entre los usos permitidos.", en: "Commercial uses aren't among the permitted uses." }],
        "Mixed-use": ["exception", { es: "Comercio liviano solo vía excepción dentro de proyectos de 100+ apartamentos.", en: "Light commercial only by exception inside projects of 100+ apartments." }],
        Industrial: ["not_listed", null],
      },
      minLot: 900, minWidth: 20, occupancy: "50%", floorArea: [150],
      density: { es: "Solar < 900 m²: 1 vivienda; ≥ 900 m²: 1–2 viviendas; apartamentos según Tabla 8.3.", en: "Lot < 900 m²: 1 dwelling; ≥ 900 m²: 1–2 dwellings; apartments per Table 8.3." },
      apartments: "R",
    },
    "R-I": {
      name: { es: "Residencial Intermedio", en: "Intermediate Residential" },
      rule: "Regla 6.1.3, Tablas 6.32–6.34, pp. 362–365",
      fit: {
        Multifamily: ["allowed", { es: "Casa de apartamentos está permitida.", en: "Apartment buildings are permitted." }],
        Residential: ["allowed", { es: "Unifamiliares, casas en hilera y casa patio permitidas.", en: "Single-family, row and patio houses permitted." }],
        Hospitality: ["exception", { es: "Hospedería de hasta 15 unidades vía excepción; hotel solo dentro de una zona histórica, vía excepción.", en: "Inn of up to 15 units by exception; a hotel only inside a historic zone, by exception." }],
        Commercial: ["not_listed", { es: "Comercio no está entre los usos permitidos.", en: "Commercial uses aren't among the permitted uses." }],
        "Mixed-use": ["exception", { es: "Comercio liviano solo vía excepción dentro de proyectos de 100+ apartamentos.", en: "Light commercial only by exception inside projects of 100+ apartments." }],
        Industrial: ["not_listed", null],
      },
      minLot: 275, minWidth: 11, occupancy: "60%", floorArea: [180], m2PerUnit: 150,
      density: { es: "Solar < 275 m²: 1 vivienda; ≥ 275 m²: 1 UBV por cada 150 m²; apartamentos también según Tabla 8.3.", en: "Lot < 275 m²: 1 dwelling; ≥ 275 m²: 1 basic unit per 150 m²; apartments also per Table 8.3." },
      apartments: "R",
    },
    "R-U": {
      name: { es: "Residencial Urbano", en: "Urban Residential" },
      rule: "Regla 6.1.4, Tablas 6.35–6.37, pp. 366–371",
      fit: {
        Multifamily: ["allowed", { es: "Multifamiliares y casas de apartamentos permitidos.", en: "Multifamily and apartment buildings permitted." }],
        Residential: ["allowed", null],
        Hospitality: ["exception", { es: "Hospedería vía excepción; hotel solo dentro de una zona histórica, vía excepción.", en: "Inn by exception; a hotel only inside a historic zone, by exception." }],
        Commercial: ["not_listed", { es: "Comercio no está entre los usos permitidos.", en: "Commercial uses aren't among the permitted uses." }],
        "Mixed-use": ["not_listed", null],
        Industrial: ["not_listed", null],
      },
      minLot: 400, minWidth: 15, occupancy: "50%", floorArea: [250], m2PerUnitRange: [50, 70],
      density: { es: "Multifamiliar: 1 UBV por cada 50–70 m² según el ancho de la vía (10 m → 70; 11–13 → 60; 14–15 → 55; 17+ → 50). Zona histórica: 1 UBV por 50 m², área bruta 420%.", en: "Multifamily: 1 basic unit per 50–70 m² depending on street width (10 m → 70; 11–13 → 60; 14–15 → 55; 17+ → 50). Historic zone: 1 per 50 m², floor area 420%." },
      apartments: "R",
    },
    "C-L": {
      name: { es: "Comercial Liviano", en: "Light Commercial" },
      rule: "Regla 6.1.6, Tablas 6.43–6.44, pp. 378–383",
      fit: {
        Multifamily: ["allowed", { es: "Vivienda está permitida, con acceso y estacionamiento separados del comercio.", en: "Housing is permitted, with access and parking separate from the commercial use." }],
        Residential: ["allowed", null],
        Hospitality: ["conditional", { es: "Hospederías y hospedajes permitidos; hoteles no aparecen en la tabla.", en: "Inns (hospederías) are permitted; hotels aren't listed." }],
        Commercial: ["allowed", { es: "Comercio al detal, oficinas, restaurantes y servicios permitidos; barras y negocios de bebidas prohibidos.", en: "Retail, offices, restaurants and services permitted; bars and alcohol-focused businesses prohibited." }],
        "Mixed-use": ["allowed", null],
        Industrial: ["exception", { es: "Solo industria pequeña (hasta 15 empleados) vía excepción.", en: "Only small industry (up to 15 employees) by exception." }],
      },
      minLot: 300, minWidth: 12, occupancy: "70%", floorArea: [300], m2PerUnit: 100,
      density: { es: "1 UBV por cada 100 m² de solar.", en: "1 basic unit per 100 m² of lot." },
      heightBase: 12,
    },
    "C-I": {
      name: { es: "Comercial Intermedio", en: "Intermediate Commercial" },
      rule: "Regla 6.1.7, Tablas 6.45–6.48, pp. 383–387",
      fit: {
        Multifamily: ["allowed", { es: "Vivienda está permitida, con estacionamiento independiente.", en: "Housing is permitted, with separate parking." }],
        Residential: ["allowed", null],
        Hospitality: ["conditional", { es: "Hospederías permitidas (usos de C-L); hoteles no aparecen en la tabla.", en: "Inns permitted (C-L uses); hotels aren't listed." }],
        Commercial: ["allowed", null],
        "Mixed-use": ["allowed", null],
        Industrial: ["conditional", { es: "Industria liviana sin humo, ruido ni gases (lavandería, panadería, costura, artesanía).", en: "Light industry without smoke, noise or fumes (laundry, bakery, garment, crafts)." }],
      },
      minLot: 450, minWidth: 15, occupancy: { es: "75% interior · 85% esquina · 95% 2–3 esquinas · 100% manzana", en: "75% interior · 85% corner · 95% 2–3 corners · 100% full block" }, floorArea: [375, 425, 475, 500], m2PerUnit: 70,
      density: { es: "1 UBV por cada 70 m² de solar.", en: "1 basic unit per 70 m² of lot." },
      heightBase: 12,
    },
    "C-C": {
      name: { es: "Comercial Central", en: "Central Commercial" },
      rule: "Regla 6.1.8, Tablas 6.49–6.52, pp. 388–393",
      fit: {
        Multifamily: ["allowed", { es: "Vivienda está permitida.", en: "Housing is permitted." }],
        Residential: ["allowed", null],
        Hospitality: ["conditional", { es: "Hospederías permitidas (usos de C-L); hoteles no aparecen en la tabla.", en: "Inns permitted (C-L uses); hotels aren't listed." }],
        Commercial: ["allowed", { es: "Centros comerciales de más de 250,000 p² requieren consulta de ubicación y solar de 8,000 m²+.", en: "Shopping centers over 250,000 sq ft need a consulta de ubicación and an 8,000 m²+ lot." }],
        "Mixed-use": ["allowed", null],
        Industrial: ["conditional", { es: "Industria liviana y talleres de autos permitidos, sin molestias a vecinos.", en: "Light industry and auto shops permitted, without nuisance to neighbors." }],
      },
      minLot: 500, minWidth: 15, occupancy: { es: "75% interior · 85% esquina · 95% 2–3 esquinas · 100% manzana", en: "75% interior · 85% corner · 95% 2–3 corners · 100% full block" }, floorArea: [450, 510, 570, 600], m2PerUnit: 60,
      density: { es: "1 UBV por cada 60 m² de solar.", en: "1 basic unit per 60 m² of lot." },
    },
    "RC-E": {
      name: { es: "Recreación Comercial Extensa", en: "Extensive Commercial Recreation" },
      rule: "Regla 6.1.9, pp. 393–394",
      fit: {
        Multifamily: ["not_listed", null],
        Residential: ["not_listed", null],
        Hospitality: ["consulta", { es: "Hotel es uno de los usos del distrito; todo proyecto pasa por consulta de construcción.", en: "Hotel is one of the district's uses; every project goes through a consulta de construcción." }],
        Commercial: ["consulta", { es: "Recreación comercial (estadios, parques, cines al aire libre) vía consulta de construcción.", en: "Commercial recreation (stadiums, parks, drive-ins) via consulta de construcción." }],
        "Mixed-use": ["consulta", null],
        Industrial: ["not_listed", null],
      },
      density: { es: "Hotel: 1 habitación = 0.4 UBV; parámetros se fijan en la consulta.", en: "Hotel: 1 room = 0.4 basic unit; parameters set in the consulta." },
    },
    "RT-I": {
      name: { es: "Residencial Turístico Intermedio", en: "Intermediate Tourist Residential" },
      rule: "Regla 6.1.10, Tablas 6.53–6.54, pp. 395–399",
      fit: {
        Multifamily: ["allowed", { es: "Casa de apartamentos permitida.", en: "Apartment buildings permitted." }],
        Residential: ["allowed", null],
        Hospitality: ["allowed", { es: "Hotel, condohotel, hostal, villa turística y centro vacacional permitidos.", en: "Hotel, condo-hotel, hostel, tourist villa and vacation center permitted." }],
        Commercial: ["conditional", { es: "Solo restaurantes y renta de autos en solares frente a vía principal, más venta de artículos de primera necesidad y souvenirs.", en: "Only restaurants and car rental on lots fronting a main road, plus convenience and souvenir sales." }],
        "Mixed-use": ["conditional", null],
        Industrial: ["not_listed", null],
      },
      variants: [
        { label: { es: "Densidad intermedia", en: "Intermediate density" }, minLot: 300, minWidth: 15, occupancy: "60%", floorArea: [180] },
        { label: { es: "Densidad baja", en: "Low density" }, minLot: 2000, minWidth: 35, occupancy: "15%", floorArea: [30] },
      ],
      density: { es: "Apartamentos y hospederías según Tabla 8.3 (densidad intermedia); densidad baja: 1 vivienda por 2,000 m².", en: "Apartments and inns per Table 8.3 (intermediate density); low density: 1 dwelling per 2,000 m²." },
      apartments: "RT",
    },
    "RT-A": {
      name: { es: "Residencial Turístico de Alta Densidad", en: "High-Density Tourist Residential" },
      rule: "Regla 6.1.11, Tablas 6.55–6.56, pp. 400–403",
      fit: {
        Multifamily: ["allowed", null],
        Residential: ["allowed", null],
        Hospitality: ["allowed", { es: "Hotel, condohotel, villa turística y centro vacacional permitidos.", en: "Hotel, condo-hotel, tourist villa and vacation center permitted." }],
        Commercial: ["conditional", { es: "Comercio y servicios solo en los dos primeros niveles.", en: "Commercial and services only on the first two levels." }],
        "Mixed-use": ["conditional", { es: "Comercio en los dos primeros niveles, residencial u hotel arriba.", en: "Commercial on the first two levels, residential or hotel above." }],
        Industrial: ["not_listed", null],
      },
      minLot: 1000, minWidth: 20, occupancy: "50%", floorArea: [350], m2PerUnit: 80,
      density: { es: "1 vivienda por cada 80 m² de solar; apartamentos y hospederías según Tabla 8.3.", en: "1 dwelling per 80 m² of lot; apartments and inns per Table 8.3." },
      apartments: "RT",
    },
    "C-T": {
      name: { es: "Comercial Turístico", en: "Tourist Commercial" },
      rule: "Regla 6.1.12, Tablas 6.57–6.58, pp. 404–409",
      fit: {
        Multifamily: ["conditional", { es: "Residencial permitido desde el segundo nivel en adelante.", en: "Residential permitted from the second level up." }],
        Residential: ["conditional", { es: "Residencial permitido desde el segundo nivel en adelante.", en: "Residential permitted from the second level up." }],
        Hospitality: ["allowed", { es: "Hotel, condohotel, hostal y villas turísticas permitidos (sobre el segundo nivel).", en: "Hotel, condo-hotel, hostel and tourist villas permitted (above the second level)." }],
        Commercial: ["allowed", { es: "Comercio y servicios en los dos primeros niveles.", en: "Commercial and services on the first two levels." }],
        "Mixed-use": ["allowed", { es: "Es el diseño del distrito: comercio abajo, residencial u hotel arriba.", en: "It's the district's design: commercial below, residential or hotel above." }],
        Industrial: ["not_listed", null],
      },
      variants: [
        { label: { es: "C-T Liviano", en: "Light C-T" }, minLot: 450, minWidth: 15, occupancy: "75%", floorArea: [300, 340], m2PerUnit: 100 },
        { label: { es: "C-T Intermedio", en: "Intermediate C-T" }, minLot: 1000, minWidth: 20, occupancy: { es: "75% interior · 85% esquina", en: "75% interior · 85% corner" }, floorArea: [500, 560], m2PerUnit: 70 },
      ],
      variantNote: { es: "La Tabla 6.14 convierte CT-1, CT-2 y CT-3 en C-T sin decir cuál de sus dos intensidades aplica.", en: "Table 6.14 converts CT-1, CT-2 and CT-3 to C-T without saying which of its two intensities applies." },
      density: { es: "Liviano: 1 UBV por 100 m²; Intermedio: 1 UBV por 70 m². Apartamentos y hospederías según Sección 6.1.1.6.", en: "Light: 1 basic unit per 100 m²; Intermediate: 1 per 70 m². Apartments and inns per Section 6.1.1.6." },
    },
    "I-L": {
      name: { es: "Industrial Liviano", en: "Light Industrial" },
      rule: "Regla 6.1.15, Tablas 6.63–6.64, pp. 413–417",
      fit: {
        Multifamily: ["not_listed", null],
        Residential: ["not_listed", null],
        Hospitality: ["not_listed", null],
        Commercial: ["allowed", { es: "Comercio y servicios permitidos, con los parámetros de C-I.", en: "Commercial and services permitted, under C-I design parameters." }],
        "Mixed-use": ["conditional", { es: "Industrial y comercial combinados; vivienda no aparece en la tabla.", en: "Industrial plus commercial; housing isn't listed." }],
        Industrial: ["allowed", { es: "Industria liviana, almacenes, talleres de autos y procesamiento permitidos.", en: "Light industry, warehouses, auto shops and processing permitted." }],
      },
      minLot: 800, minWidth: 20, occupancy: "75%", floorArea: [450],
    },
    "I-P": {
      name: { es: "Industrial Pesado", en: "Heavy Industrial" },
      rule: "Regla 6.1.16, Tablas 6.65–6.66, pp. 417–419",
      fit: {
        Multifamily: ["prohibited", { es: "El distrito excluye los usos residenciales.", en: "The district excludes residential uses." }],
        Residential: ["prohibited", { es: "El distrito excluye los usos residenciales.", en: "The district excludes residential uses." }],
        Hospitality: ["not_listed", null],
        Commercial: ["conditional", { es: "Solo comercio de apoyo a la industria pesada.", en: "Only commercial that supports heavy industry." }],
        "Mixed-use": ["not_listed", null],
        Industrial: ["allowed", null],
      },
      minLot: 4000, minWidth: 40, occupancy: "50%", floorArea: [300],
    },
    ARD: {
      name: { es: "Área Rural Desarrollada", en: "Developed Rural Area" },
      rule: "Regla 6.1.16 [ARD], Tablas 6.67–6.68, pp. 420–422",
      fit: {
        Multifamily: ["not_listed", { es: "Densidad limitada a vivienda de una o dos familias, o según consulta de ubicación.", en: "Density limited to one- or two-family dwellings, or per consulta de ubicación." }],
        Residential: ["allowed", { es: "Vivienda de una o dos familias por finca.", en: "One- or two-family dwelling per property." }],
        Hospitality: ["allowed", { es: "Condohotel, villas turísticas, casas de huéspedes y eco-hospedería permitidos.", en: "Condo-hotel, tourist villas, guest houses and eco-lodges permitted." }],
        Commercial: ["allowed", { es: "Comercio al detal, restaurantes, oficinas y gasolineras permitidos.", en: "Retail, restaurants, offices and gas stations permitted." }],
        "Mixed-use": ["conditional", null],
        Industrial: ["exception", { es: "Proyectos industriales livianos de hasta 15,000 p² vía excepción.", en: "Light industrial projects up to 15,000 sq ft by exception." }],
      },
      minLot: 2000, minWidth: 25, occupancy: "35%", floorArea: [75],
      density: { es: "Vivienda de una o dos familias, o según consulta de ubicación.", en: "One- or two-family dwelling, or per consulta de ubicación." },
      lowRise: true,
    },
    "D-G": {
      name: { es: "Dotacional General", en: "General Public Facilities" },
      rule: "Regla 6.1.20, Tablas 6.76–6.77, pp. 441–443",
      fit: {
        Multifamily: ["consulta", { es: "Uso «a considerar»; parámetros según la consulta de construcción.", en: "A use \"to consider\"; parameters set in a consulta de construcción." }],
        Residential: ["consulta", null],
        Hospitality: ["consulta", null],
        Commercial: ["consulta", null],
        "Mixed-use": ["consulta", null],
        Industrial: ["not_listed", null],
      },
      density: { es: "Según la naturaleza del uso, con los parámetros del distrito equivalente (Tabla 6.77).", en: "Set by the nature of the use, borrowing the equivalent district's parameters (Table 6.77)." },
      publicNote: true,
    },
  };

  // Tabla 8.3 / Sección 8.1.4.3 (p. 545): m² of lot per basic unit, by lot
  // size; [fewest units, most units].
  const APARTMENT_DENSITY = {
    R: [[2000, 220, 125], [3800, 190, 100], [5400, 175, 95], [Infinity, 160, 90]],
    RT: [[2000, 265, 150], [3800, 250, 125], [5400, 190, 100], [Infinity, 175, 95]],
  };

  // Regla 8.5.3 (pp. 566–568).
  const PARKING = {
    Multifamily: { es: "Por unidad: estudio 1.00 · 1 hab. 1.25 · 2 hab. 1.50 · 3 hab. 2.00 (+1 por habitación adicional), más 10% para visitantes.", en: "Per unit: studio 1.00 · 1 BR 1.25 · 2 BR 1.50 · 3 BR 2.00 (+1 per extra bedroom), plus 10% for visitors." },
    Residential: { es: "1 espacio por vivienda de una o dos familias.", en: "1 space per one- or two-family dwelling." },
    Hospitality: { es: "Hotel: 1 por cada 3 habitaciones, más lo que requieran restaurantes, tiendas y salones. Hospedería: 1 para el dueño + 1 por cada 3 habitaciones.", en: "Hotel: 1 per 3 rooms, plus what restaurants, shops and halls require. Inn: 1 for the owner + 1 per 3 rooms." },
    Commercial: { es: "Comercio: 1 por cada 15 m² de área de venta + 1 por 70 m² de almacén + 1 por cada 3 empleados. Oficinas: 1 por cada 25 m².", en: "Retail: 1 per 15 m² of sales floor + 1 per 70 m² of storage + 1 per 3 employees. Offices: 1 per 25 m²." },
    "Mixed-use": { es: "Se calcula por separado para cada uso.", en: "Computed separately for each use." },
    Industrial: { es: "1 por cada 70 m² de área bruta o 1 por cada 2 empleados del turno mayor, lo que sea más.", en: "1 per 70 m² of gross floor area or 1 per 2 employees on the largest shift, whichever is more." },
  };

  const STATUS_CATEGORY = {
    allowed: "favorable",
    conditional: "investigate",
    exception: "investigate",
    consulta: "investigate",
    not_listed: "constraint",
    prohibited: "constraint",
  };

  const STATUS_LABEL = {
    allowed: { es: "permitido", en: "permitted" },
    conditional: { es: "permitido con condiciones", en: "permitted with conditions" },
    exception: { es: "solo vía excepción", en: "only by exception" },
    consulta: { es: "caso a caso (consulta)", en: "case by case (consulta)" },
    not_listed: { es: "no aparece entre los usos permitidos", en: "not among the permitted uses" },
    prohibited: { es: "excluido", en: "excluded" },
  };

  const TYPE_LABEL = {
    Multifamily: { es: "Multifamiliar", en: "Multifamily" },
    Commercial: { es: "Comercial", en: "Commercial" },
    Hospitality: { es: "Hotelero", en: "Hospitality" },
    Industrial: { es: "Industrial", en: "Industrial" },
    "Mixed-use": { es: "Uso mixto", en: "Mixed-use" },
    Residential: { es: "Residencial", en: "Residential" },
    Other: { es: "Otro", en: "Other" },
  };

  function bi(es, en) { return { es, en }; }
  function pct(n) { return `${n}%`; }
  function fmt(n) { return Math.round(n).toLocaleString("en-US"); }

  // Resolves a zoning row to a current district. Returns
  // { status: "mapped" | "no_equivalent" | "ambiguous" | "other_plan" | "named", ... }
  function resolve(zoning) {
    if (!zoning || !zoning.code) return { status: "other_plan" };
    if (zoning.regla !== SAN_JUAN_POT_REGLA) return { status: "other_plan", regla: zoning.regla };
    const code = zoning.code.trim();
    if (SAN_JUAN_AMBIGUOUS[code]) return { status: "ambiguous", from: code, options: SAN_JUAN_AMBIGUOUS[code] };
    if (!(code in SAN_JUAN_EQUIV)) return { status: "other_plan", regla: zoning.regla };
    const to = SAN_JUAN_EQUIV[code];
    if (!to) return { status: "no_equivalent", from: code };
    if (D[to]) return { status: "mapped", from: code, to, district: D[to] };
    return { status: "named", from: code, to, name: DISTRICT_NAMES[to] };
  }

  // Rough capacity from the district's single-number density, clearly
  // labeled as an estimate in the UI.
  function capacity(district, lotSqm) {
    const out = {};
    const v = district.variants;
    const floorAreas = v ? v.map((x) => x.floorArea) : district.floorArea ? [district.floorArea] : [];
    if (floorAreas.length) {
      const all = floorAreas.flat();
      out.floorArea = [Math.min(...all), Math.max(...all)].map((p) => (lotSqm * p) / 100);
    }
    const per = v ? v.map((x) => x.m2PerUnit).filter(Boolean) : district.m2PerUnit ? [district.m2PerUnit] : district.m2PerUnitRange || [];
    if (per.length) out.units = [Math.floor(lotSqm / Math.max(...per)), Math.floor(lotSqm / Math.min(...per))];
    if (district.apartments) {
      const row = APARTMENT_DENSITY[district.apartments].find((r) => lotSqm <= r[0]);
      out.apartmentUnits = [Math.floor(lotSqm / row[1]), Math.floor(lotSqm / row[2])];
    }
    return out;
  }

  function range(a) {
    return a[0] === a[1] ? fmt(a[0]) : `${fmt(a[0])}–${fmt(a[1])}`;
  }

  // Builds findings, regulatory rows and a source for one lot.
  //   zoning: lookup's zoning object; projectType: setup's type id;
  //   lotSqm: parcel area.
  function assess(zoning, projectType, lotSqm) {
    const r = resolve(zoning);
    const findings = [];
    const sourceSection = (extra) => ["Tabla 6.14 (pp. 332–334)", extra].filter(Boolean).join(" · ");
    const source = { ...SOURCE, section: sourceSection(r.district && r.district.rule) };
    const statusNote = bi(
      "Adoptado por emergencia el 16 de junio de 2023; en abril de 2025 un tribunal ordenó a la Junta completar el proceso ordinario de reglamentación. La Junta lo mantiene vigente mientras tanto.",
      "Adopted by emergency on June 16, 2023; in April 2025 a court ordered the Planning Board to complete the ordinary rulemaking process. The Board keeps it in force meanwhile."
    );

    if (r.status !== "mapped") {
      let title, found;
      if (r.status === "other_plan") {
        title = bi("Reglas del distrito no cubiertas", "District rules not covered");
        found = bi(
          `Este solar se rige por otro plan o reglamento (código ${r.regla ?? "—"} en el mapa de calificación), no por el Plan Territorial de San Juan que Parcela traduce con la Tabla 6.14.`,
          `This lot is governed by another plan or regulation (code ${r.regla ?? "—"} on the zoning map), not the San Juan Territorial Plan that Parcela translates through Table 6.14.`
        );
      } else if (r.status === "no_equivalent") {
        title = bi(`Sin equivalencia oficial para ${r.from}`, `No official equivalent for ${r.from}`);
        found = bi(`La Tabla 6.14 deja en blanco el distrito actual para ${r.from}.`, `Table 6.14 leaves the current district blank for ${r.from}.`);
      } else if (r.status === "ambiguous") {
        title = bi(`${r.from} puede equivaler a más de un distrito`, `${r.from} can map to more than one district`);
        found = bi(`La Tabla 6.14 convierte ${r.from} en ${r.options.es}.`, `Table 6.14 converts ${r.from} to ${r.options.en}.`);
      } else {
        title = bi(`Equivale a ${r.to} — ${r.name.es}`, `Equivalent to ${r.to} — ${r.name.en}`);
        found = bi(`La Tabla 6.14 convierte ${r.from} en ${r.to} (${r.name.es}), un distrito público o de conservación que Parcela aún no resume.`, `Table 6.14 converts ${r.from} to ${r.to} (${r.name.en}), a public or conservation district Parcela doesn't summarize yet.`);
      }
      findings.push({
        id: "district-rules",
        category: "unknown",
        title,
        summary: bi("Parcela no puede decir qué permite este distrito todavía.", "Parcela can't say yet what this district allows."),
        confidence: "none",
        sourceId: "src-rc2023",
        why: {
          found,
          matters: bi("Sin las reglas del distrito no se pueden confirmar usos, densidad ni altura.", "Without the district's rules, uses, density and height can't be confirmed."),
          verification: "Required",
        },
      });
      return { resolved: r, findings, regulatory: null, source };
    }

    const d = r.district;
    const type = projectType && d.fit[projectType] ? projectType : null;
    const cap = capacity(d, lotSqm);

    // ---- project fit ----
    if (type) {
      const [status, note] = d.fit[type];
      findings.push({
        id: "project-fit",
        category: STATUS_CATEGORY[status],
        title: bi(`${TYPE_LABEL[type].es}: ${STATUS_LABEL[status].es} en ${r.to}`, `${TYPE_LABEL[type].en}: ${STATUS_LABEL[status].en} in ${r.to}`),
        summary: note || bi(`Según la tabla de usos del distrito ${r.to}.`, `Per the ${r.to} district's uses table.`),
        confidence: "medium",
        sourceId: "src-rc2023",
        why: {
          found: bi(
            `El distrito ${r.from} del Plan Territorial de San Juan equivale a ${r.to} (${d.name.es}) según la Tabla 6.14. En ${d.rule}, un proyecto ${TYPE_LABEL[type].es.toLowerCase()} aparece como: ${STATUS_LABEL[status].es}.`,
            `San Juan Territorial Plan district ${r.from} is equivalent to ${r.to} (${d.name.en}) per Table 6.14. In ${d.rule}, a ${TYPE_LABEL[type].en.toLowerCase()} project shows as: ${STATUS_LABEL[status].en}.`
          ),
          matters: bi(
            `Define si el proyecto procede por derecho o necesita excepción, consulta o cambio de calificación. ${statusNote.es}`,
            `It decides whether the project proceeds by right or needs an exception, consulta or rezoning. ${statusNote.en}`
          ),
          verification: "Required",
        },
      });
    }

    // ---- capacity ----
    const variantNames = d.variants ? d.variants.map((v) => v.label) : null;
    const minLots = d.variants ? d.variants.map((v) => v.minLot) : d.minLot ? [d.minLot] : [];
    const belowMin = minLots.length && lotSqm < Math.min(...minLots);
    const capParts = [];
    if (cap.floorArea) capParts.push(bi(`área bruta de piso de hasta ${range(cap.floorArea)} m²`, `up to ${range(cap.floorArea)} m² of gross floor area`));
    if (cap.units) capParts.push(bi(`${range(cap.units)} unidades básicas de vivienda`, `${range(cap.units)} basic housing units`));
    if (cap.apartmentUnits) capParts.push(bi(`${range(cap.apartmentUnits)} UBV si es un proyecto de apartamentos (Tabla 8.3)`, `${range(cap.apartmentUnits)} basic units as an apartment project (Table 8.3)`));
    if (capParts.length || belowMin) {
      findings.push({
        id: "capacity",
        category: belowMin ? "constraint" : "investigate",
        title: belowMin
          ? bi(`Solar menor que el mínimo del distrito (${fmt(Math.min(...minLots))} m²)`, `Lot below the district minimum (${fmt(Math.min(...minLots))} m²)`)
          : bi("Capacidad estimada del solar", "Estimated lot capacity"),
        summary: capParts.length
          ? bi(`Con ${fmt(lotSqm)} m²: ${capParts.map((p) => p.es).join("; ")}. Estimado — no incluye patios, estacionamiento ni altura.`, `At ${fmt(lotSqm)} m²: ${capParts.map((p) => p.en).join("; ")}. Estimate — excludes yards, parking and height limits.`)
          : bi("El solar no cumple la cabida mínima del distrito.", "The lot doesn't meet the district's minimum size."),
        confidence: "low",
        sourceId: "src-rc2023",
        why: {
          found: bi(
            `${d.rule}. Área bruta de piso máxima: ${(d.variants ? d.variants.map((v) => `${v.label.es} ${v.floorArea.map(pct).join("/")}`) : [(d.floorArea || []).map(pct).join("/")]).join("; ")}. Densidad: ${d.density ? d.density.es : "—"}${d.variantNote ? ` ${d.variantNote.es}` : ""}`,
            `${d.rule}. Maximum gross floor area: ${(d.variants ? d.variants.map((v) => `${v.label.en} ${v.floorArea.map(pct).join("/")}`) : [(d.floorArea || []).map(pct).join("/")]).join("; ")}. Density: ${d.density ? d.density.en : "—"}${d.variantNote ? ` ${d.variantNote.en}` : ""}`
          ),
          matters: belowMin
            ? bi("Un solar bajo la cabida mínima puede requerir variación; para uso residencial aplica la Sección 6.1.1.7 (Tabla 6.26).", "A lot under the minimum may need a variance; for residential use, Section 6.1.1.7 (Table 6.26) applies.")
            : bi("Da el orden de magnitud del proyecto antes de pagar un diseño. El número real depende de patios, estacionamiento, altura y la consulta.", "It gives the project's order of magnitude before paying for design. The real number depends on yards, parking, height and the consulta."),
          verification: "Required",
        },
      });
    }

    // ---- regulatory rows ----
    const both = (fn) => bi(fn("es"), fn("en"));
    const occupancy = both((l) => (d.variants
      ? d.variants.map((v) => `${v.label[l]}: ${typeof v.occupancy === "object" ? v.occupancy[l] : v.occupancy}`).join(" · ")
      : typeof d.occupancy === "object" ? d.occupancy[l] : d.occupancy || "—"));
    const height = d.lowRise
      ? bi("Vivienda: 2 plantas, máx. 9 m (Sec. 6.1.1.11)", "Housing: 2 floors, max 9 m (Sec. 6.1.1.11)")
      : bi(
        `Base ${d.heightBase || 9} m; hasta 2× el ancho de la vía, más si cumple área de piso y patios (Sec. 6.1.1.11)`,
        `Base ${d.heightBase || 9} m; up to 2× the street width, more if floor area and yards comply (Sec. 6.1.1.11)`
      );
    const regulatory = {
      district: bi(`${r.to} · ${d.name.es} (antes ${r.from})`, `${r.to} · ${d.name.en} (formerly ${r.from})`),
      minLot: d.variants
        ? both((l) => d.variants.map((v) => `${v.label[l]}: ${fmt(v.minLot)} m²`).join(" · "))
        : d.minLot ? `${fmt(d.minLot)} m²` : bi("Según consulta", "Per consulta"),
      occupancy,
      density: d.density || bi("Según consulta", "Per consulta"),
      height,
      parking: (type && PARKING[type]) || bi("Según el uso (Regla 8.5.3)", "By use (Rule 8.5.3)"),
      variants: variantNames,
    };
    return { resolved: r, findings, regulatory, source, statusNote };
  }

  return { assess, resolve, SOURCE };
})();
