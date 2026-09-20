/* Parcela V3 — mock dataset for the demo property + project.
   All findings, sources, and dates are fictional prototype data — clearly
   labeled as such in the UI. Structured so a real cadastral/zoning/GIS
   backend can fill the same shape later.

   Bilingual fields (Parcela's own analysis prose) are {es, en} objects —
   read them with window.ParcelaI18N.tv(value). Official Spanish-language
   institution/regulation/document names (agencies, "Reglamento Conjunto",
   source titles) are treated as proper nouns and stay a single string in
   both languages, same as a legal citation would in an English brief.
   Dates are left as a single formatted string in both languages to keep
   scope sane for a prototype. */

window.PARCELA = (function () {
  const property = {
    id: "example-ave-123",
    address: "123 Example Avenue",
    municipality: "San Juan, Puerto Rico",
    cadastral: "115-042-018-09-901",
    parcelAreaSqm: 4180,
    parcelAreaAcres: 1.03,
    lastAnalyzed: "Sep 18, 2026",
  };

  const project = {
    name: "Condado Multifamily",
    type: { es: "Multifamiliar", en: "Multifamily" },
    unitsLabel: { es: "60–80 unidades", en: "60–80 units" },
    investmentLabel: "$10M–$15M",
  };

  const feasibility = {
    status: { es: "Vale la pena investigar", en: "Worth investigating" },
    summary: {
      es: "El uso multifamiliar propuesto parece potencialmente compatible con la información regulatoria disponible. Varios factores requieren verificación adicional antes de una debida diligencia significativa.",
      en: "The proposed multifamily use appears potentially compatible with the available regulatory information. Several factors require additional verification before significant due diligence.",
    },
  };

  // ---- sources (referenced by id from findings / regulatory / infra / history) ----
  // Names/agencies/documents are official titles — kept as a single string
  // in both languages, same as any citation would be.
  const sources = [
    { id: "src-fema", name: "FEMA Flood Insurance Rate Map", agency: "FEMA / Puerto Rico GIS", document: "FIRM Panel 72000C0245J", date: "Mar 2024", section: "Zone AE delineation" },
    { id: "src-rc2023", name: "Reglamento Conjunto 2023", agency: "Junta de Planificación de Puerto Rico", document: "Reglamento Conjunto para la Evaluación y Expedición de Permisos", date: "2023 ed.", section: "Art. 5.2 — Multifamily density standards" },
    { id: "src-calificacion", name: "Mapa de Calificación", agency: "Junta de Planificación de Puerto Rico", document: "Land Use Classification Map, San Juan", date: "Jan 2022", section: "Parcel 115-042-018" },
    { id: "src-prasa", name: "PRASA Service Territory Data", agency: "Puerto Rico Aqueduct and Sewer Authority", document: "Service availability layer", date: "2021 (last public update)", section: "San Juan metro" },
    { id: "src-luma", name: "LUMA Grid Infrastructure", agency: "LUMA Energy", document: "Distribution capacity disclosure", date: "Not publicly available", section: "—" },
    { id: "src-dtop", name: "DTOP Road Classification", agency: "Departamento de Transportación y Obras Públicas", document: "PR-1 corridor classification", date: "2020", section: "San Juan segment" },
    { id: "src-permits", name: "Permit Activity Records", agency: "OGPe (Oficina de Gerencia de Permisos)", document: "Public permit search export", date: "2022–2025", section: "Parcel 115-042-018" },
    { id: "src-usgs", name: "USGS Topographic Data", agency: "U.S. Geological Survey", document: "3DEP elevation dataset", date: "2023", section: "San Juan quad" },
    { id: "src-junta-amb", name: "Junta de Calidad Ambiental — screening layer", agency: "Junta de Calidad Ambiental", document: "Environmental sensitivity screening", date: "2021", section: "Coastal buffer overlay" },
  ];
  const srcById = Object.fromEntries(sources.map((s) => [s.id, s]));

  // ---- findings ----
  const findings = [
    {
      id: "f-zoning-compat",
      category: "favorable",
      title: { es: "La zonificación permite uso multifamiliar", en: "Zoning permits multifamily use" },
      summary: { es: "La clasificación de uso de suelo de la parcela generalmente permite el desarrollo residencial multifamiliar.", en: "The parcel's land-use classification generally permits multifamily residential development." },
      confidence: "high",
      sourceId: "src-calificacion",
      why: {
        found: { es: "Clasificación: R-3 (Residencial General) — multifamiliar permitido por derecho hasta los límites de densidad aplicables.", en: "Classification: R-3 (Residencial General) — multifamily permitted by right up to applicable density limits." },
        matters: { es: "Un uso permitido por derecho reduce considerablemente el riesgo de titularidad y el tiempo del proceso, comparado con un uso que requiere variación o consulta.", en: "A permitted-by-right use materially reduces entitlement risk and timeline compared to a use requiring a variance or consultation." },
        verification: "Recommended",
      },
    },
    {
      id: "f-road-access",
      category: "favorable",
      title: { es: "Frente directo sobre una vía arterial clasificada", en: "Direct frontage on a classified arterial" },
      summary: { es: "La parcela tiene frente a una arteria secundaria clasificada por DTOP con acceso de encintado existente.", en: "The parcel fronts a DTOP-classified secondary arterial with existing curb access." },
      confidence: "high",
      sourceId: "src-dtop",
      why: {
        found: { es: "La vía de frente está clasificada como arteria secundaria (segmento del corredor PR-1) con un corte de encintado existente que sirve a la parcela.", en: "Frontage road is classified as a secondary arterial (PR-1 corridor segment) with an existing curb cut serving the parcel." },
        matters: { es: "Un acceso arterial establecido simplifica el diseño de entrada/salida del sitio y el alcance del estudio de tránsito.", en: "Established arterial access simplifies site ingress/egress design and traffic study scoping." },
        verification: "Optional",
      },
    },
    {
      id: "f-no-recent-denials",
      category: "favorable",
      title: { es: "Sin historial de permisos adversos en récord", en: "No adverse permit history on record" },
      summary: { es: "Los récords públicos de permisos no muestran denegaciones ni acciones de cumplimiento vinculadas a esta parcela.", en: "Public permit records show no denials or enforcement actions tied to this parcel." },
      confidence: "medium",
      sourceId: "src-permits",
      why: {
        found: { es: "La búsqueda de permisos muestra una consulta de planificación inactiva (2023) y ningún récord de denegación, revocación o cumplimiento.", en: "Permit search returns one inactive planning consultation (2023) and no denial, revocation, or enforcement record." },
        matters: { es: "La ausencia de historial adverso es una señal levemente positiva, pero un récord limpio no confirma la viabilidad por sí solo.", en: "Absence of adverse history is a mild positive signal, but a clean record does not itself confirm feasibility." },
        verification: "Recommended",
      },
    },
    {
      id: "f-flood-exposure",
      category: "constraint",
      title: { es: "Exposición a inundación", en: "Flood exposure" },
      summary: { es: "La parcela interseca áreas mapeadas de riesgo de inundación.", en: "The parcel intersects mapped flood-risk areas." },
      confidence: "high",
      sourceId: "src-fema",
      why: {
        found: { es: "Zona de inundación: AE. Aproximadamente el 40% del límite sur de la parcela cae dentro de la zona AE mapeada.", en: "Flood zone: AE. Approximately 40% of the parcel's southern boundary falls within the mapped AE zone." },
        matters: { es: "Los requisitos de inundación pueden afectar el diseño del sitio, el proceso de permisos, los requisitos de construcción y la economía del desarrollo.", en: "Flood requirements may affect site design, permitting, construction requirements, and development economics." },
        verification: "Recommended",
      },
    },
    {
      id: "f-density-tbd",
      category: "investigate",
      title: { es: "Techo de densidad aún no establecido", en: "Density ceiling not yet established" },
      summary: { es: "El estándar de densidad aplicable a esta clasificación depende de hallazgos de infraestructura aún no confirmados.", en: "The applicable density standard for this classification depends on infrastructure findings not yet confirmed." },
      confidence: "medium",
      sourceId: "src-rc2023",
      why: {
        found: { es: "El Reglamento Conjunto 2023 vincula los bonos de densidad de R-3 a la capacidad de infraestructura confirmada, la cual no se ha establecido para esta parcela.", en: "Reglamento Conjunto 2023 ties R-3 density bonuses to confirmed infrastructure capacity, which has not been established for this parcel." },
        matters: { es: "La meta de 60–80 unidades podría exceder, alcanzar o quedar por debajo del techo permitido por derecho, dependiendo de esa confirmación.", en: "The 60–80 unit target may exceed, meet, or fall under the as-of-right ceiling depending on that confirmation." },
        verification: "Recommended",
      },
    },
    {
      id: "f-height-overlay",
      category: "investigate",
      title: { es: "Posible sobreposición de altura cerca del corredor", en: "Possible height overlay near corridor" },
      summary: { es: "La parcela está cerca de un corredor que podría tener una restricción de altura adicional.", en: "The parcel sits close to a corridor that may carry an additional height restriction." },
      confidence: "low",
      sourceId: "src-calificacion",
      why: {
        found: { es: "El mapa de calificación muestra un límite de sobreposición cercano; no está claro en los datos disponibles si se extiende hasta esta parcela.", en: "The classification map shows a nearby overlay boundary; it is unclear from available data whether it extends onto this parcel." },
        matters: { es: "Una sobreposición de altura podría limitar el número de unidades o requerir cambios en el diseño de la masa edificada si aplica.", en: "A height overlay could constrain unit count or require design massing changes if it applies." },
        verification: "Recommended",
      },
    },
    {
      id: "f-parking-standard",
      category: "investigate",
      title: { es: "Razón de estacionamiento requiere confirmación", en: "Parking ratio needs confirmation" },
      summary: { es: "La razón de estacionamiento aplicable depende de una determinación de proximidad a transporte colectivo no disponible en los datos actuales.", en: "Applicable parking ratio depends on a transit-proximity determination not available in current data." },
      confidence: "low",
      sourceId: "src-rc2023",
      why: {
        found: { es: "El Reglamento Conjunto permite una razón de estacionamiento reducida cerca de corredores de transporte colectivo que califiquen; la calificación de esta parcela no está determinada aquí.", en: "Reglamento Conjunto allows a reduced parking ratio near qualifying transit corridors; qualification for this parcel is undetermined here." },
        matters: { es: "La razón de estacionamiento afecta significativamente la eficiencia del plano de sitio y el número de unidades alcanzable en una parcela de 1.03 cuerdas.", en: "Parking ratio materially affects site plan efficiency and achievable unit count on a 1.03-acre parcel." },
        verification: "Recommended",
      },
    },
    {
      id: "f-consultation-history",
      category: "investigate",
      title: { es: "Consulta de planificación previa en expediente", en: "Prior planning consultation on file" },
      summary: { es: "Existe una consulta de planificación de 2023 para esta parcela sin resumen de resolución público.", en: "A 2023 planning consultation exists for this parcel with no public resolution summary." },
      confidence: "medium",
      sourceId: "src-permits",
      why: {
        found: { es: "El récord muestra una consulta de planificación abierta en 2023; el resultado o resolución no se detalla en la exportación pública.", en: "Record shows a planning consultation opened in 2023; outcome/resolution is not detailed in the public export." },
        matters: { es: "Las consultas previas a veces revelan limitaciones que no son visibles en los datos de clasificación o SIG.", en: "Prior consultations sometimes surface constraints not otherwise visible in classification or GIS data." },
        verification: "Recommended",
      },
    },
    {
      id: "f-utility-capacity",
      category: "unknown",
      title: { es: "Capacidad de servicios públicos", en: "Utility capacity" },
      summary: { es: "La capacidad de agua y electricidad para una carga de 60–80 unidades no se puede establecer con datos públicos.", en: "Water and electrical capacity for a 60–80 unit load cannot be established from public data." },
      confidence: "none",
      sourceId: "src-prasa",
      why: {
        found: { es: "PRASA y LUMA no publican datos de capacidad a nivel de parcela; solo hay cobertura general de territorio de servicio disponible.", en: "PRASA and LUMA do not publish parcel-level capacity data; only general service-territory coverage is available." },
        matters: { es: "Las limitaciones de capacidad pueden requerir mejoras costosas de infraestructura fuera del predio que afecten la economía del proyecto.", en: "Capacity constraints can require costly off-site utility upgrades that affect project economics." },
        verification: "Required",
      },
    },
    {
      id: "f-soil-geology",
      category: "unknown",
      title: { es: "Condiciones de suelo y geotécnicas", en: "Soil and geotechnical conditions" },
      summary: { es: "No hay datos geotécnicos disponibles para esta parcela en fuentes públicas.", en: "No geotechnical data is available for this parcel in public sources." },
      confidence: "none",
      sourceId: "src-usgs",
      why: {
        found: { es: "Los datos de USGS proveen solo topografía regional; no hay sondeo de suelo ni informe geotécnico específico del sitio en expediente.", en: "USGS data provides regional topography only; no site-specific soil boring or geotechnical report is on file." },
        matters: { es: "Las condiciones del suelo afectan directamente el tipo de fundación y el costo, especialmente para una estructura multifamiliar.", en: "Soil conditions directly affect foundation type and cost, especially for a multifamily structure." },
        verification: "Required",
      },
    },
    {
      id: "f-envt-sensitivity",
      category: "unknown",
      title: { es: "Limitaciones ambientales específicas del sitio", en: "Site-specific environmental constraints" },
      summary: { es: "Existe una zona de amortiguamiento costero cercana; su aplicabilidad específica al sitio no está confirmada.", en: "A coastal buffer overlay exists nearby; site-specific applicability is unconfirmed." },
      confidence: "low",
      sourceId: "src-junta-amb",
      why: {
        found: { es: "El análisis regional muestra una sobreposición de sensibilidad de amortiguamiento costero en el área circundante; la aplicabilidad a nivel de parcela no está confirmada.", en: "Regional screening shows a coastal-buffer sensitivity overlay in the surrounding area; parcel-level applicability is not confirmed." },
        matters: { es: "Si aplica, un amortiguamiento ambiental podría limitar el área edificable o requerir una evaluación ambiental.", en: "If applicable, an environmental buffer could constrain buildable area or require an environmental assessment." },
        verification: "Required",
      },
    },
  ];

  const findingCategories = [
    { key: "favorable" },
    { key: "investigate" },
    { key: "constraint" },
    { key: "unknown" },
  ].map((c) => ({ ...c, findings: findings.filter((f) => f.category === c.key) }));

  // ---- regulatory analysis ----
  const regulatory = {
    landUse: { value: { es: "Potencialmente compatible", en: "Potentially compatible" }, status: "investigate", sourceId: "src-calificacion" },
    proposedUse: { value: project.type, status: "neutral" },
    applicableRegulation: { value: "Reglamento Conjunto 2023", status: "neutral", sourceId: "src-rc2023" },
    density: { value: { es: "Requiere investigación", en: "Needs investigation" }, status: "investigate", sourceId: "src-rc2023" },
    height: { value: { es: "Requiere investigación", en: "Needs investigation" }, status: "investigate", sourceId: "src-calificacion" },
    parking: { value: { es: "Requiere investigación", en: "Needs investigation" }, status: "investigate", sourceId: "src-rc2023" },
  };

  // ---- physical constraints ----
  const physical = {
    flood: {
      known: { es: "La zona de inundación AE interseca ~40% de la parcela según datos de FEMA FIRM.", en: "Flood zone AE intersects ~40% of the parcel per FEMA FIRM data." },
      needsVerification: { es: "Elevación base de inundación exacta y el área edificable fuera de la zona de inundación.", en: "Exact base flood elevation and buildable envelope outside the flood zone." },
      sourceId: "src-fema",
    },
    topography: {
      known: { es: "Los datos regionales de elevación muestran una pendiente suave hacia el lado costero de la parcela.", en: "Regional elevation data shows a gentle grade toward the coastal side of the parcel." },
      needsVerification: { es: "Levantamiento topográfico específico del sitio y requisitos de movimiento de tierra.", en: "Site-specific topographic survey and grading requirements." },
      sourceId: "src-usgs",
    },
    environmental: {
      known: { es: "Existe una sobreposición de sensibilidad de amortiguamiento costero en el área circundante.", en: "A coastal-buffer sensitivity overlay exists in the surrounding area." },
      needsVerification: { es: "Si la sobreposición aplica a esta parcela específica, y si se requiere una evaluación ambiental.", en: "Whether the overlay applies to this specific parcel, and if an environmental assessment is required." },
      sourceId: "src-junta-amb",
    },
    soil: {
      known: { es: "No existen datos geotécnicos públicos para esta parcela.", en: "No public geotechnical data exists for this parcel." },
      needsVerification: { es: "Capacidad portante del suelo, profundidad del manto freático e implicaciones para la fundación.", en: "Soil bearing capacity, water table depth, and foundation implications." },
      sourceId: null,
    },
  };

  // ---- infrastructure ----
  const infrastructure = {
    roads: {
      available: { es: "Frente directo sobre una arteria secundaria clasificada por DTOP con corte de encintado existente.", en: "Direct frontage on a DTOP-classified secondary arterial with an existing curb cut." },
      confidence: "high",
      unknown: { es: "Requisitos de movimientos de giro y estudio de tránsito para el número de unidades propuesto.", en: "Turning-movement and traffic-study requirements for the proposed unit count." },
      nextAction: { es: "Encargar un estudio de impacto de tránsito una vez el número de unidades esté más definido.", en: "Commission a traffic impact study once unit count is closer to final." },
      sourceId: "src-dtop",
    },
    water: {
      available: { es: "La parcela cae dentro del territorio general de servicio del área metro de San Juan de PRASA.", en: "Parcel falls within PRASA's general San Juan metro service territory." },
      confidence: "low",
      unknown: { es: "La capacidad de la tubería no se puede determinar con la información disponible.", en: "Line capacity cannot be determined from available information." },
      nextAction: { es: "Solicitar una carta de disponibilidad/capacidad de PRASA para el número de unidades específico.", en: "Request a PRASA availability/capacity letter for the specific unit count." },
      sourceId: "src-prasa",
    },
    electricity: {
      available: { es: "La parcela cae dentro del área de servicio de distribución de LUMA.", en: "Parcel falls within LUMA's distribution service area." },
      confidence: "low",
      unknown: { es: "La capacidad de distribución no se puede determinar con la información disponible.", en: "Distribution capacity cannot be determined from available information." },
      nextAction: { es: "Solicitar una evaluación de capacidad e interconexión de LUMA.", en: "Request a LUMA capacity and interconnection assessment." },
      sourceId: "src-luma",
    },
  };

  // ---- development history ----
  const developmentHistory = [
    { year: "2022", eventType: { es: "Solicitud de permiso", en: "Permit application" }, description: { es: "Se presentó un permiso de renovación menor para una estructura existente en la parcela.", en: "A minor renovation permit was filed for an existing structure on the parcel." }, sourceId: "src-permits", documents: [{ es: "Formulario de solicitud de permiso (exportación pública)", en: "Permit application form (public export)" }] },
    { year: "2023", eventType: { es: "Consulta de planificación", en: "Planning consultation" }, description: { es: "Se abrió una consulta de planificación previa a la solicitud sobre un posible redesarrollo; los detalles públicos de resolución son limitados.", en: "A pre-application planning consultation was opened regarding potential redevelopment; public resolution details are limited." }, sourceId: "src-permits", documents: [{ es: "Récord de admisión de consulta", en: "Consultation intake record" }] },
    { year: "2024", eventType: { es: "Resolución", en: "Resolution" }, description: { es: "El récord de consulta se marcó como resuelto sin variación emitida en expediente.", en: "Consultation record marked resolved with no variance issued on file." }, sourceId: "src-permits", documents: [{ es: "Resumen de resolución (exportación pública)", en: "Resolution summary (public export)" }] },
    { year: "2025", eventType: { es: "Nueva actividad de permisos", en: "New permit activity" }, description: { es: "Se registró una nueva consulta previa a la solicitud, consistente con un renovado interés de desarrollo en el área.", en: "A new pre-application inquiry was logged, consistent with renewed development interest in the area." }, sourceId: "src-permits", documents: [{ es: "Entrada de registro de consulta", en: "Inquiry log entry" }] },
  ];

  // ---- unknowns (dedicated section) ----
  const unknowns = [
    { title: { es: "Capacidad de servicios públicos", en: "Utility capacity" }, whyItMatters: { es: "Las limitaciones de capacidad de agua y electricidad pueden forzar mejoras costosas fuera del predio que cambien la economía del proyecto de forma importante.", en: "Water and electrical capacity constraints can force costly off-site upgrades that change project economics materially." }, nextStep: { es: "Solicitar confirmación de disponibilidad/capacidad de servicios a PRASA y LUMA.", en: "Request utility availability/capacity confirmation from PRASA and LUMA." }, relatedFindingId: "f-utility-capacity" },
    { title: { es: "Envolvente de desarrollo exacta", en: "Exact development envelope" }, whyItMatters: { es: "Altura, densidad y estacionamiento están señalados para investigación — juntos definen lo que realmente se puede construir.", en: "Height, density, and parking are each flagged for investigation — together they define what can actually be built." }, nextStep: { es: "Encargar una revisión de cumplimiento de zonificación con un planificador licenciado.", en: "Commission a zoning compliance review with a licensed planner." }, relatedFindingId: "f-density-tbd" },
    { title: { es: "Ciertos requisitos municipales", en: "Certain municipal requirements" }, whyItMatters: { es: "San Juan podría aplicar requisitos locales adicionales más allá del Reglamento Conjunto de toda la isla.", en: "San Juan may apply additional local requirements beyond the island-wide Reglamento Conjunto." }, nextStep: { es: "Consultar directamente con la oficina de planificación municipal de San Juan.", en: "Consult the San Juan municipal planning office directly." }, relatedFindingId: null },
    { title: { es: "Limitaciones ambientales específicas del sitio", en: "Site-specific environmental constraints" }, whyItMatters: { es: "Una sobreposición de amortiguamiento costero cercana podría o no aplicar a esta parcela exacta.", en: "A nearby coastal-buffer overlay may or may not apply to this exact parcel." }, nextStep: { es: "Solicitar una determinación formal de evaluación ambiental.", en: "Request a formal environmental screening determination." }, relatedFindingId: "f-envt-sensitivity" },
  ];

  // ---- next actions ----
  const nextActions = [
    {
      order: 1,
      title: { es: "Verificar requisitos de inundación", en: "Verify flood requirements" },
      whyItMatters: { es: "La zona de inundación AE interseca parte de la parcela y puede afectar el diseño del sitio, los requisitos de construcción y el financiamiento.", en: "Flood zone AE intersects part of the parcel and may affect site design, construction requirements, and financing." },
      professional: "Engineer",
      evidenceRef: "f-flood-exposure",
      sourceId: "src-fema",
    },
    {
      order: 2,
      title: { es: "Confirmar capacidad de servicios públicos", en: "Confirm utility capacity" },
      whyItMatters: { es: "La capacidad de agua y electricidad para 60–80 unidades no se puede confirmar solo con datos públicos.", en: "Water and electrical capacity for 60–80 units cannot be confirmed from public data alone." },
      professional: "Engineer",
      evidenceRef: "f-utility-capacity",
      sourceId: "src-prasa",
    },
    {
      order: 3,
      title: { es: "Revisar reglamentación municipal", en: "Review municipal regulations" },
      whyItMatters: { es: "San Juan podría añadir requisitos locales adicionales sobre la reglamentación de toda la isla.", en: "San Juan may layer additional local requirements onto the island-wide regulation." },
      professional: "Planner",
      evidenceRef: null,
      sourceId: "src-rc2023",
    },
    {
      order: 4,
      title: { es: "Que un arquitecto evalúe la envolvente de desarrollo", en: "Have an architect evaluate the development envelope" },
      whyItMatters: { es: "Densidad, altura y estacionamiento están todos señalados para investigación — un arquitecto puede modelar números de unidades realistas bajo cada escenario.", en: "Density, height, and parking are all flagged for investigation — an architect can model realistic unit counts under each scenario." },
      professional: "Architect",
      evidenceRef: "f-density-tbd",
      sourceId: "src-calificacion",
    },
  ];

  // ---- map geometry (SVG viewBox 0 0 640 520, arbitrary local coordinate space) ----
  const map = {
    viewBox: "0 0 640 520",
    roads: [
      { points: "0,150 640,120", width: 10 },
      { points: "230,0 260,520", width: 7 },
    ],
    context: [
      // surrounding neighboring parcels, purely decorative context
      { points: "20,170 190,150 200,260 30,280" },
      { points: "270,140 420,120 430,230 280,250" },
      { points: "440,150 620,170 610,290 430,270" },
      { points: "40,300 200,280 210,420 50,440" },
      { points: "280,270 420,250 440,400 290,420" },
    ],
    parcel: { points: "200,175 355,165 365,300 210,315" },
    flood: {
      points: "200,255 365,240 365,300 210,315",
    },
    zoning: {
      code: "R-3",
      points: "150,120 460,100 470,340 160,360",
    },
    environmental: {
      points: "20,330 620,300 620,420 20,450",
    },
    infrastructure: [
      { type: "water", points: "0,150 640,120" },
      { type: "electric", points: "230,0 260,520" },
    ],
    development: [
      { year: "2022", x: 250, y: 200 },
      { year: "2023", x: 300, y: 240 },
      { year: "2025", x: 330, y: 210 },
    ],
  };

  // ---- comparison properties (lightweight summaries for Compare mode) ----
  const comparisonProperties = [
    {
      id: property.id,
      label: { es: "Propiedad A", en: "Property A" },
      address: property.address,
      municipality: "San Juan",
      projectType: project.type,
      status: "favorable",
      statusLabel: { es: "Vale la pena investigar", en: "Worth investigating" },
      lastAnalyzed: property.lastAnalyzed,
      regulatoryComplexity: { es: "Complejidad regulatoria aparentemente menor", en: "Lower apparent regulatory complexity" },
      floodExposure: { es: "Parcial — la zona AE interseca ~40% de la parcela", en: "Partial — Zone AE intersects ~40% of parcel" },
      environmental: { es: "Amortiguamiento costero cercano, aplicabilidad sin confirmar", en: "Coastal buffer nearby, applicability unconfirmed" },
      infrastructure: { es: "Acceso vial fuerte; capacidad de servicios desconocida", en: "Road access strong; utility capacity unknown" },
      unknownsCount: unknowns.length,
      constraintsCount: findings.filter((f) => f.category === "constraint").length,
      keyDifference: { es: "Complejidad regulatoria aparentemente menor", en: "Lower apparent regulatory complexity" },
    },
    {
      id: "ashford-ave-88",
      label: { es: "Propiedad B", en: "Property B" },
      address: "88 Ashford Avenue",
      municipality: "San Juan",
      projectType: { es: "Multifamiliar", en: "Multifamily" },
      status: "investigate",
      statusLabel: { es: "Investigar más a fondo", en: "Investigate further" },
      lastAnalyzed: "Sep 12, 2026",
      regulatoryComplexity: { es: "Moderada — aplica sobreposición de uso mixto", en: "Moderate — mixed-use overlay applies" },
      floodExposure: { es: "Ninguna zona mapeada", en: "None mapped" },
      environmental: { es: "Sin sobreposiciones de sensibilidad conocidas", en: "No known sensitivity overlays" },
      infrastructure: { es: "Mejores señales de infraestructura — mejora de servicios reciente confirmada cerca", en: "Better infrastructure signals — confirmed recent utility upgrade nearby" },
      unknownsCount: 2,
      constraintsCount: 0,
      keyDifference: { es: "Mejores señales de infraestructura", en: "Better infrastructure signals" },
    },
    {
      id: "isla-verde-ave-410",
      label: { es: "Propiedad C", en: "Property C" },
      address: "410 Isla Verde Avenue",
      municipality: "Carolina",
      projectType: { es: "Hotelero", en: "Hospitality" },
      status: "constraint",
      statusLabel: { es: "Posibles limitaciones", en: "Potential constraints" },
      lastAnalyzed: "Sep 8, 2026",
      regulatoryComplexity: { es: "Mayor — aplican tanto el retranqueo costero como la sobreposición de altura", en: "Higher — coastal setback and height overlay both apply" },
      floodExposure: { es: "Zona VE — zona costera de alto riesgo de inundación", en: "Zone VE — high-hazard coastal flood zone" },
      environmental: { es: "Retranqueo costero confirmado como aplicable", en: "Coastal setback confirmed applicable" },
      infrastructure: { es: "Capacidad de servicios desconocida; acceso vial limitado", en: "Utility capacity unknown; road access limited" },
      unknownsCount: 5,
      constraintsCount: 3,
      keyDifference: { es: "Más limitaciones sin resolver", en: "More unresolved constraints" },
    },
  ];

  // ---- dashboard ----
  const dashboard = {
    activeProjects: [
      { name: project.name, propertiesCount: 3, unitsLabel: project.unitsLabel, investmentLabel: project.investmentLabel },
    ],
    intelligenceUpdates: [
      { type: { es: "Nuevo documento regulatorio", en: "New regulatory document" }, detail: { es: "Se indexó una enmienda al Reglamento Conjunto 2023 para parcelas de San Juan.", en: "Reglamento Conjunto 2023 amendment indexed for San Juan parcels." }, date: "Sep 17, 2026", propertyId: property.id },
      { type: { es: "Actividad de permisos detectada", en: "Permit activity detected" }, detail: { es: "Se registró una nueva consulta previa a la solicitud para 123 Example Avenue.", en: "New pre-application inquiry logged for 123 Example Avenue." }, date: "Sep 15, 2026", propertyId: property.id },
      { type: { es: "Datos actualizados", en: "Data updated" }, detail: { es: "Se actualizó la capa de inundación de FEMA para el área metro de San Juan.", en: "FEMA flood layer refreshed for the San Juan metro area." }, date: "Sep 10, 2026", propertyId: property.id },
      { type: { es: "Datos actualizados", en: "Data updated" }, detail: { es: "Se actualizó la capa de territorio de servicio de PRASA.", en: "PRASA service-territory layer refreshed." }, date: "Sep 3, 2026", propertyId: "ashford-ave-88" },
    ],
  };

  // ---- explore (map-first discovery) ----
  // potentialUse / flood / infrastructure keep canonical English values so
  // explore.html's filter matching stays simple; explore.html translates
  // them for display via its own small lookup.
  const exploreProperties = [
    { id: property.id, address: property.address, municipality: "San Juan", x: 430, y: 300, sizeAcres: 1.03, landUse: "R-3 Residencial General", potentialUse: "Multifamily", flood: "Zone AE", infrastructure: "Moderate", constraints: true, status: "favorable" },
    { id: "ashford-ave-88", address: "88 Ashford Avenue", municipality: "San Juan", x: 470, y: 250, sizeAcres: 0.8, landUse: "C-2 Comercial", potentialUse: "Mixed-use", flood: "None mapped", infrastructure: "Strong", constraints: false, status: "investigate" },
    { id: "isla-verde-ave-410", address: "410 Isla Verde Avenue", municipality: "Carolina", x: 700, y: 210, sizeAcres: 2.1, landUse: "T-3 Turístico", potentialUse: "Hospitality", flood: "Zone VE", infrastructure: "Weak", constraints: true, status: "constraint" },
    { id: "loiza-st-215", address: "215 Loíza Street", municipality: "San Juan", x: 500, y: 340, sizeAcres: 0.5, landUse: "C-1 Comercial", potentialUse: "Commercial", flood: "None mapped", infrastructure: "Strong", constraints: false, status: "favorable" },
    { id: "rio-piedras-ind-12", address: "12 Calle Industrial", municipality: "San Juan", x: 260, y: 400, sizeAcres: 3.4, landUse: "I-1 Industrial Liviano", potentialUse: "Industrial", flood: "None mapped", infrastructure: "Moderate", constraints: false, status: "unknown" },
    { id: "guaynabo-rio-45", address: "45 Río Hondo Avenue", municipality: "Guaynabo", x: 150, y: 260, sizeAcres: 1.6, landUse: "R-2 Residencial General", potentialUse: "Residential", flood: "Zone X", infrastructure: "Strong", constraints: false, status: "favorable" },
    { id: "carolina-comm-9", address: "9 Avenida Roosevelt", municipality: "Carolina", x: 640, y: 380, sizeAcres: 1.1, landUse: "C-3 Comercial Pesado", potentialUse: "Commercial", flood: "Zone AE", infrastructure: "Moderate", constraints: true, status: "investigate" },
    { id: "santurce-mixed-3", address: "3 Calle De Diego", municipality: "San Juan", x: 380, y: 220, sizeAcres: 0.6, landUse: "MU-1 Uso Mixto", potentialUse: "Mixed-use", flood: "None mapped", infrastructure: "Strong", constraints: false, status: "favorable" },
  ];

  const aiInsights = {
    explainThis: {
      es: "Esta parcela se lee como compatible con uso multifamiliar bajo su clasificación actual, que es la razón principal por la que pasa el umbral para mayor investigación. Dicho esto, tres de las seis preguntas regulatorias y físicas que normalmente estarían resueltas a esta altura — densidad, altura y capacidad de servicios — siguen abiertas. Ninguna es una señal de alerta por sí sola, pero juntas son la razón por la que esto queda en \"vale la pena investigar\" en lugar de una señal más fuerte.",
      en: "This parcel reads as multifamily-compatible under its current classification, which is the main reason it clears the bar for further investigation. That said, three of the six regulatory and physical questions that would normally be resolved by this stage — density, height, and utility capacity — are still open. None of them are red flags on their own, but together they're why this sits at \"worth investigating\" rather than a stronger signal.",
    },
    investigateNext: {
      es: "Con base en lo señalado hasta ahora, los dos elementos con más impacto son la capacidad de servicios públicos y la intersección con la zona de inundación AE — ambos podrían cambiar la envolvente edificable, y ambos ya tienen un siguiente paso claro definido abajo.",
      en: "Based on what's flagged so far, the two items with the most leverage are utility capacity and the flood zone AE intersection — both could reshape the buildable envelope, and both have a clear next step already defined below.",
    },
  };

  function findingById(id) {
    return findings.find((f) => f.id === id) || null;
  }
  function sourceById(id) {
    return id ? srcById[id] || null : null;
  }

  return {
    property,
    project,
    feasibility,
    findings,
    findingCategories,
    regulatory,
    physical,
    infrastructure,
    developmentHistory,
    unknowns,
    nextActions,
    sources,
    map,
    comparisonProperties,
    dashboard,
    exploreProperties,
    aiInsights,
    findingById,
    sourceById,
  };
})();
