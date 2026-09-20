/* Parcela i18n. Spanish is the default language (Puerto Rico), English is
   the toggle. Official Spanish-language names (agencies, regulations,
   documents, municipalities) are treated as proper nouns and stay in
   Spanish in both languages, same as "Reglamento Conjunto" would stay
   untranslated in an English-language legal brief. */

window.ParcelaI18N = (function () {
  const STORAGE_KEY = "parcela-lang";

  const STRINGS = {
    // ---- nav ----
    nav_overview: { es: "Resumen", en: "Overview" },
    nav_explore: { es: "Explorar", en: "Explore" },
    nav_properties: { es: "Propiedades", en: "Properties" },
    nav_projects: { es: "Proyectos", en: "Projects" },
    nav_reports: { es: "Informes", en: "Reports" },
    nav_footer: { es: "Datos de prototipo · Puerto Rico", en: "Prototype data · Puerto Rico" },

    // ---- common ----
    common_analyzeProperty: { es: "Analizar propiedad", en: "Analyze property" },
    common_backToProperty: { es: "Volver a la propiedad", en: "Back to property" },
    common_changeSelection: { es: "Cambiar selección", en: "Change selection" },
    common_compareProperties: { es: "Comparar propiedades", en: "Compare properties" },
    common_viewAll: { es: "Ver todo", en: "View all" },
    common_optional: { es: "Opcional", en: "Optional" },
    common_known: { es: "Conocido", en: "Known" },
    common_needsVerification: { es: "Requiere verificación", en: "Needs verification" },
    common_unknown: { es: "Desconocido", en: "Unknown" },
    common_nextAction: { es: "Próxima acción", en: "Next action" },
    common_whyItMatters: { es: "Por qué importa", en: "Why it matters" },
    common_nextStep: { es: "Siguiente paso", en: "Next step" },
    common_suggestedProfessional: { es: "Profesional sugerido", en: "Suggested professional" },
    common_relevantEvidence: { es: "Evidencia relevante", en: "Relevant evidence" },
    common_viewFinding: { es: "Ver hallazgo", en: "View finding" },
    common_seeRelatedFinding: { es: "Ver hallazgo relacionado", en: "See related finding" },
    common_why: { es: "¿Por qué?", en: "Why?" },
    common_landUse: { es: "Clasificación de uso de suelo", en: "Land-use classification" },
    common_infrastructure: { es: "Infraestructura", en: "Infrastructure" },
    common_potentialUse: { es: "Uso potencial", en: "Potential use" },
    common_flood: { es: "Inundación", en: "Flood" },
    common_cadastralNumber: { es: "Número de catastro", en: "Cadastral number" },
    common_parcelArea: { es: "Área de la parcela", en: "Parcel area" },
    common_municipality: { es: "Municipio", en: "Municipality" },
    common_lastAnalyzed: { es: "Último análisis", en: "Last analyzed" },
    common_project: { es: "Proyecto", en: "Project" },
    common_status_favorable: { es: "Favorable", en: "Favorable" },
    common_status_investigate: { es: "Por investigar", en: "Investigate" },
    common_status_constraint: { es: "Posibles limitaciones", en: "Potential constraints" },
    common_status_unknown: { es: "Desconocido", en: "Unknown" },

    // ---- search (index.html) ----
    search_step: { es: "Paso 1 de 3", en: "Step 1 of 3" },
    search_title: { es: "¿Qué propiedad estás evaluando?", en: "What are you looking at?" },
    search_subtitle: { es: "Ingresa una dirección, número de catastro o ubicación para iniciar un análisis preliminar de viabilidad.", en: "Enter an address, cadastral number, or location to start a preliminary feasibility analysis." },
    search_placeholder: { es: "Busca una dirección, parcela o ubicación", en: "Search an address, parcel, or location" },
    search_exploreMap: { es: "Explorar el mapa", en: "Explore the map" },
    search_hint: { es: "Datos de prototipo: la información de propiedad, zonificación y regulación mostrada en esta demostración es ficticia.", en: "Prototype data — property, zoning, and regulatory information shown throughout this demo is fictional." },
    search_sugg1: { es: "San Juan, Puerto Rico · Catastro 115-042-018-09-901", en: "San Juan, Puerto Rico · Cadastral 115-042-018-09-901" },
    search_sugg2: { es: "San Juan, Puerto Rico · Catastro 115-041-006-04-902", en: "San Juan, Puerto Rico · Cadastral 115-041-006-04-902" },
    search_sugg3: { es: "Carolina, Puerto Rico · Catastro 058-013-221-11-903", en: "Carolina, Puerto Rico · Cadastral 058-013-221-11-903" },
    search_notFound: { es: "No encontramos una coincidencia segura para esa dirección en los datos de este prototipo. Prueba con una de las direcciones de muestra a continuación.", en: "We couldn't find a confident match for that address in this prototype's data. Try one of the sample addresses below." },

    // ---- identify.html ----
    identify_step: { es: "Paso 2 de 3", en: "Step 2 of 3" },
    identify_cta: { es: "Analizar esta propiedad", en: "Analyze this property" },
    identify_change: { es: "Cambiar propiedad", en: "Change property" },
    identify_subjectParcel: { es: "Parcela en estudio", en: "Subject parcel" },
    identify_baseMap: { es: "Mapa base", en: "Base map" },

    // ---- setup.html ----
    setup_step: { es: "Paso 3 de 3", en: "Step 3 of 3" },
    setup_title: { es: "¿Qué estás pensando construir?", en: "What are you thinking of building?" },
    setup_multifamily: { es: "Multifamiliar", en: "Multifamily" },
    setup_commercial: { es: "Comercial", en: "Commercial" },
    setup_hospitality: { es: "Hotelero", en: "Hospitality" },
    setup_industrial: { es: "Industrial", en: "Industrial" },
    setup_mixedUse: { es: "Uso mixto", en: "Mixed-use" },
    setup_residential: { es: "Residencial", en: "Residential" },
    setup_other: { es: "Otro", en: "Other" },
    setup_targetUnits: { es: "Unidades objetivo", en: "Target units" },
    setup_approxInvestment: { es: "Inversión aproximada", en: "Approximate investment" },
    setup_cta: { es: "Analizar sitio", en: "Analyze site" },
    setup_back: { es: "Atrás", en: "Back" },
    analyzing_title: { es: "Analizando 123 Example Avenue…", en: "Analyzing 123 Example Avenue…" },
    analyzing_subtitle: { es: "Esto usualmente toma unos segundos.", en: "This usually takes a few seconds." },
    analyzing_step1: { es: "Leyendo registros de zonificación y uso de suelo", en: "Reading zoning and land-use records" },
    analyzing_step2: { es: "Cruzando mapas de inundación y ambientales", en: "Cross-referencing flood and environmental maps" },
    analyzing_step3: { es: "Revisando historial de permisos y desarrollo", en: "Checking permit and development history" },
    analyzing_step4: { es: "Compilando la viabilidad preliminar", en: "Compiling preliminary feasibility" },

    // ---- property.html ----
    property_preliminaryFeasibility: { es: "Viabilidad preliminar", en: "Preliminary feasibility" },
    property_generateReport: { es: "Generar informe de viabilidad", en: "Generate feasibility report" },
    property_compareOther: { es: "Comparar con otras propiedades", en: "Compare with other properties" },
    property_parcelSize: { es: "Tamaño de parcela", en: "Parcel size" },
    property_mapNote: { es: "Datos de mapa de prototipo", en: "Prototype map data" },
    property_layer_satellite: { es: "Satélite", en: "Satellite" },
    property_layer_zoning: { es: "Zonificación", en: "Zoning" },
    property_layer_flood: { es: "Inundación", en: "Flood" },
    property_layer_environmental: { es: "Ambiental", en: "Environmental" },
    property_layer_infrastructure: { es: "Infraestructura", en: "Infrastructure" },
    property_layer_development: { es: "Desarrollo", en: "Development" },
    property_aiExplain: { es: "Explica esto", en: "Explain this" },
    property_aiNext: { es: "¿Qué debería investigar primero?", en: "What should I investigate next?" },
    property_findings_one: { es: "hallazgo", en: "finding" },
    property_findings_many: { es: "hallazgos", en: "findings" },
    property_whatDontKnow: { es: "Lo que aún no sabemos", en: "What we don't know yet" },
    property_beforeMoveForward: { es: "Antes de avanzar", en: "Before you move forward" },
    property_regulatoryAnalysis: { es: "Análisis regulatorio", en: "Regulatory analysis" },
    property_physicalConstraints: { es: "Limitaciones físicas", en: "Physical constraints" },
    property_developmentHistory: { es: "Historial de desarrollo", en: "Development history" },
    property_summarize: { es: "Resumir", en: "Summarize" },
    property_proposedUse: { es: "Uso propuesto", en: "Proposed use" },
    property_applicableRegulation: { es: "Reglamento aplicable", en: "Applicable regulation" },
    property_density: { es: "Densidad", en: "Density" },
    property_height: { es: "Altura", en: "Height" },
    property_parking: { es: "Estacionamiento", en: "Parking" },
    property_topography: { es: "Topografía", en: "Topography" },
    property_environmental: { es: "Ambiental", en: "Environmental" },
    property_soilGeology: { es: "Suelo / geología", en: "Soil / geology" },
    property_roads: { es: "Vías", en: "Roads" },
    property_water: { es: "Agua", en: "Water" },
    property_electricity: { es: "Electricidad", en: "Electricity" },

    // ---- why / ai panel ----
    panel_whatFound: { es: "Lo que Parcela encontró", en: "What Parcela found" },
    panel_evidence: { es: "Evidencia", en: "Evidence" },
    panel_source: { es: "Fuente", en: "Source" },
    panel_agency: { es: "Agencia", en: "Agency" },
    panel_date: { es: "Fecha", en: "Date" },
    panel_document: { es: "Documento", en: "Document" },
    panel_section: { es: "Sección", en: "Section" },
    panel_confidence: { es: "Confianza", en: "Confidence" },
    panel_professionalVerification: { es: "Verificación profesional", en: "Professional verification" },
    panel_viewSource: { es: "Ver fuente", en: "View source" },
    panel_hideSourceDetail: { es: "Ocultar detalle de la fuente", en: "Hide source detail" },
    panel_viewAllSources: { es: "Ver todas las fuentes y evidencia", en: "View all sources & evidence" },
    panel_notAvailable: { es: "No disponible", en: "Not available" },
    panel_title_favorable: { es: "¿Por qué es favorable?", en: "Why is this favorable?" },
    panel_title_investigate: { es: "¿Por qué requiere investigación?", en: "Why does this need investigation?" },
    panel_title_constraint: { es: "¿Por qué es una posible limitación?", en: "Why is this a potential constraint?" },
    panel_title_unknown: { es: "¿Por qué es desconocido?", en: "Why is this unknown?" },
    confidence_high: { es: "Confianza alta", en: "High confidence" },
    confidence_medium: { es: "Confianza media", en: "Medium confidence" },
    confidence_low: { es: "Confianza baja", en: "Low confidence" },
    confidence_none: { es: "Información insuficiente", en: "Insufficient information" },
    verification_Recommended: { es: "Recomendada", en: "Recommended" },
    verification_Required: { es: "Requerida", en: "Required" },
    verification_Optional: { es: "Opcional", en: "Optional" },
    ai_analyst: { es: "Analista de Parcela", en: "Parcela analyst" },
    ai_disclaimer: { es: "Generado a partir de los hallazgos ya mostrados en esta página; no sustituye la revisión profesional.", en: "Generated from findings already shown on this page — not a substitute for professional review." },
    ai_summarizeTitle: { es: "Resumir este reglamento", en: "Summarize this regulation" },
    professional_Engineer: { es: "Ingeniero", en: "Engineer" },
    professional_Architect: { es: "Arquitecto", en: "Architect" },
    professional_Planner: { es: "Planificador", en: "Planner" },
    professional_Attorney: { es: "Abogado", en: "Attorney" },
    professional_Developer: { es: "Desarrollador", en: "Developer" },

    // ---- map legends ----
    map_legendTitle_satellite: { es: "Mapa base", en: "Base map" },
    map_legendTitle_zoning: { es: "Zonificación", en: "Zoning" },
    map_legendTitle_flood: { es: "Inundación", en: "Flood" },
    map_legendTitle_environmental: { es: "Ambiental", en: "Environmental" },
    map_legendTitle_infrastructure: { es: "Infraestructura", en: "Infrastructure" },
    map_legendTitle_development: { es: "Desarrollo", en: "Development" },
    map_subjectParcel: { es: "Parcela en estudio", en: "Subject parcel" },
    map_zoneAE: { es: "Zona AE", en: "Zone AE" },
    map_coastalBuffer: { es: "Zona de amortiguamiento costero", en: "Coastal buffer overlay" },
    map_waterMain: { es: "Tubería principal de agua", en: "Water main" },
    map_electricDistribution: { es: "Distribución eléctrica", en: "Electric distribution" },
    map_permitActivity: { es: "Actividad de permisos / consulta", en: "Permit / consultation activity" },

    // ---- overview.html ----
    overview_goodMorning: { es: "Buenos días.", en: "Good morning." },
    overview_goodAfternoon: { es: "Buenas tardes.", en: "Good afternoon." },
    overview_goodEvening: { es: "Buenas noches.", en: "Good evening." },
    overview_subtitle: { es: "Aquí está el estado de tus propiedades y proyectos.", en: "Here's where your properties and projects stand." },
    overview_recentProperties: { es: "Propiedades recientes", en: "Recent properties" },
    overview_activeProjects: { es: "Proyectos activos", en: "Active projects" },
    overview_intelligenceUpdates: { es: "Actualizaciones de inteligencia", en: "Intelligence updates" },
    overview_propertiesLabel: { es: "Propiedades", en: "Properties" },

    // ---- properties.html ----
    properties_title: { es: "Propiedades", en: "Properties" },
    properties_subtitle: { es: "Cada propiedad que has analizado. Selecciona dos o más para comparar.", en: "Every property you've analyzed. Select two or more to compare." },
    properties_selected: { es: "seleccionadas", en: "selected" },

    // ---- compare.html ----
    compare_title: { es: "Comparar propiedades", en: "Compare properties" },
    compare_subtitle: { es: "Una comparación lado a lado de lo conocido y lo pendiente. Parcela no elige un ganador — tú lo haces.", en: "A side-by-side read of what's known and unresolved. Parcela doesn't pick a winner — you do." },
    compare_status: { es: "Estado", en: "Status" },
    compare_regulatoryCompat: { es: "Compatibilidad regulatoria", en: "Regulatory compatibility" },
    compare_floodExposure: { es: "Exposición a inundación", en: "Flood exposure" },
    compare_environmentalConstraints: { es: "Limitaciones ambientales", en: "Environmental constraints" },
    compare_unknowns: { es: "Incógnitas", en: "Unknowns" },
    compare_potentialConstraints: { es: "Posibles limitaciones", en: "Potential constraints" },
    compare_unresolved: { es: "sin resolver", en: "unresolved" },
    compare_flagged: { es: "señaladas", en: "flagged" },
    compare_keyDifferences: { es: "Diferencias clave", en: "Key differences" },
    compare_disclaimer: { es: "Cada dato anterior refleja únicamente datos de prototipo disponibles. Nada de esto es una recomendación — confirma cualquier hallazgo relevante para tu decisión con el profesional correspondiente antes de actuar.", en: "Every field above reflects available prototype data only. None of it is a recommendation — confirm any finding relevant to your decision with the appropriate professional before acting on it." },

    // ---- explore.html ----
    explore_title: { es: "Explorar", en: "Explore" },
    explore_subtitle: { es: "Descubre propiedades visualmente antes de comprometerte a un análisis completo.", en: "Discover properties visually before you commit to a full analysis." },
    explore_municipality: { es: "Municipio", en: "Municipality" },
    explore_propertySize: { es: "Tamaño de propiedad", en: "Property size" },
    explore_allMunicipalities: { es: "Todos los municipios", en: "All municipalities" },
    explore_anySize: { es: "Cualquier tamaño", en: "Any size" },
    explore_under1: { es: "Menos de 1 acre", en: "Under 1 acre" },
    explore_1to2: { es: "1–2 acres", en: "1–2 acres" },
    explore_over2: { es: "Más de 2 acres", en: "Over 2 acres" },
    explore_allClassifications: { es: "Todas las clasificaciones", en: "All classifications" },
    explore_anyUse: { es: "Cualquier uso", en: "Any use" },
    explore_anySignal: { es: "Cualquier nivel de señal", en: "Any signal strength" },
    explore_strong: { es: "Fuerte", en: "Strong" },
    explore_moderate: { es: "Moderado", en: "Moderate" },
    explore_weak: { es: "Débil", en: "Weak" },
    explore_floodOnly: { es: "Solo con exposición a inundación", en: "Flood zone exposure only" },
    explore_constraintsOnly: { es: "Solo con limitaciones señaladas", en: "Flagged constraints only" },
    explore_resetFilters: { es: "Restablecer filtros", en: "Reset filters" },
    explore_ofProperties: { es: "de {n} propiedades", en: "of {n} properties" },
    explore_viewIntelligence: { es: "Ver inteligencia", en: "View intelligence" },
    explore_emptyTitle: { es: "Ninguna propiedad coincide con estos filtros", en: "No properties match these filters" },
    explore_emptySub: { es: "Intenta ampliar tus criterios o restablece los filtros para ver todas las propiedades.", en: "Try widening your criteria, or reset the filters to see every property." },

    // ---- landing.html ----
    // 1. nav
    landing_nav_explore: { es: "Explorar", en: "Explore" },
    landing_nav_how: { es: "Cómo funciona", en: "How it works" },
    landing_nav_trust: { es: "Confianza", en: "Trust" },
    landing_nav_signIn: { es: "Iniciar sesión", en: "Sign in" },
    landing_nav_cta: { es: "Analizar propiedad →", en: "Analyze property →" },
    landing_notAvailable: { es: "No disponible en el prototipo", en: "Not available in prototype" },

    // 2. hero
    landing_hero_eyebrow: { es: "INTELIGENCIA DE DESARROLLO PARA PUERTO RICO", en: "DEVELOPMENT INTELLIGENCE FOR PUERTO RICO" },
    landing_hero_title: { es: "Sepa en qué se está metiendo antes de desarrollar.", en: "Know what you're getting into before you develop." },
    landing_hero_sub: { es: "Parcela reúne información de propiedad, zonificación, regulación, ambiente, infraestructura e historial de desarrollo para que usted entienda un sitio antes de comprometer tiempo y capital significativos.", en: "Parcela brings property, zoning, regulatory, environmental, infrastructure, and development data together so you can understand a site before committing significant time and capital." },
    landing_hero_placeholder: { es: "Ingrese una dirección, parcela o ubicación", en: "Enter an address, parcel, or location" },
    landing_hero_cta: { es: "Analizar propiedad →", en: "Analyze property →" },
    landing_hero_noAccount: { es: "No se requiere cuenta para explorar.", en: "No account required to explore." },

    // 3. hero product visualization
    landing_viz_status: { es: "VIABILIDAD PRELIMINAR", en: "PRELIMINARY FEASIBILITY" },
    landing_viz_worthInvestigating: { es: "Vale la pena investigar", en: "Worth investigating" },
    landing_viz_favorableLabel: { es: "Favorable", en: "Favorable" },
    landing_viz_investigateLabel: { es: "Investigar", en: "Investigate" },
    landing_viz_constraintLabel: { es: "Posible limitación", en: "Potential constraint" },
    landing_viz_unknownLabel: { es: "Desconocido", en: "Unknown" },
    landing_viz_finding_favorable: { es: "Zonificación permite uso multifamiliar", en: "Zoning permits multifamily use" },
    landing_viz_finding_investigate: { es: "Revisar requisitos de zonificación aplicables", en: "Review applicable zoning requirements" },
    landing_viz_finding_constraint: { es: "Exposición a inundación identificada", en: "Flood exposure identified" },
    landing_viz_finding_unknown: { es: "Capacidad de servicios públicos", en: "Utility capacity" },

    // 4. problem + solution (merged)
    landing_ps_h1: { es: "Una propiedad es más que una parcela en un mapa.", en: "A property is more than a parcel on a map." },
    landing_problem_zoning: { es: "Zonificación", en: "Zoning" },
    landing_problem_flood: { es: "Inundación", en: "Flood" },
    landing_problem_permits: { es: "Permisos", en: "Permits" },
    landing_problem_regulations: { es: "Reglamentos", en: "Regulations" },
    landing_problem_infrastructure: { es: "Infraestructura", en: "Infrastructure" },
    landing_problem_environmental: { es: "Ambiente", en: "Environment" },
    landing_problem_history: { es: "Historial de desarrollo", en: "Development history" },
    landing_ps_oneView: { es: "Una sola vista de inteligencia.", en: "One intelligence view." },

    // 5. product / intelligence (merged: four questions + showcase)
    landing_product_h1: { es: "Antes de tramitar una propiedad, sepa en qué se está metiendo.", en: "Before you pursue a property, know what you're getting into." },
    landing_q1_title: { es: "¿Qué puedo hacer aquí?", en: "What can I potentially do here?" },
    landing_q1_body: { es: "Entienda el contexto regulatorio de la propiedad, sus características físicas y sus limitaciones de desarrollo antes de comprometerse a una debida diligencia más profunda.", en: "Understand the property's regulatory context, physical characteristics, and development constraints before committing to deeper due diligence." },
    landing_q2_title: { es: "¿Qué podría interponerse?", en: "What could get in the way?" },
    landing_q2_body: { es: "Identifique limitaciones de inundación, ambientales o regulatorias antes de que se conviertan en sorpresas costosas más adelante en el proceso.", en: "Identify flood, environmental, or regulatory constraints before they become costly surprises later in the process." },
    landing_q3_title: { es: "¿Qué no sé todavía?", en: "What don't I know yet?" },
    landing_q3_body: { es: "Vea con claridad qué preguntas siguen abiertas, en lugar de asumir que el silencio significa que todo está en orden.", en: "See clearly which questions are still open, instead of assuming silence means everything checks out." },
    landing_q4_title: { es: "¿Qué debería investigar primero?", en: "What should I investigate next?" },
    landing_q4_body: { es: "Reciba una lista concreta de próximos pasos, cada uno con el profesional adecuado para resolverlo.", en: "Get a concrete list of next steps, each paired with the right professional to resolve it." },

    landing_showcase_h1: { es: "Véalo en acción.", en: "See it in action." },
    landing_showcase_ann1_title: { es: "01 — Propiedad", en: "01 — Property" },
    landing_showcase_ann1_body: { es: "El sitio que está evaluando.", en: "The site you're evaluating." },
    landing_showcase_ann2_title: { es: "02 — Inteligencia", en: "02 — Intelligence" },
    landing_showcase_ann2_body: { es: "Lo que Parcela encontró.", en: "What Parcela found." },
    landing_showcase_ann3_title: { es: "03 — Evidencia", en: "03 — Evidence" },
    landing_showcase_ann3_body: { es: "Por qué Parcela llegó a esa conclusión.", en: "Why Parcela reached the conclusion." },
    landing_showcase_ann4_title: { es: "04 — Incógnitas", en: "04 — Unknowns" },
    landing_showcase_ann4_body: { es: "Lo que aún necesita verificación.", en: "What still needs verification." },
    landing_showcase_ann5_title: { es: "05 — Próximas acciones", en: "05 — Next actions" },
    landing_showcase_ann5_body: { es: "Qué debería investigar a continuación.", en: "What you should investigate next." },

    // 4b. problem+solution flow row
    landing_diff_flow1: { es: "DATOS", en: "DATA" },
    landing_diff_flow2: { es: "INTELIGENCIA", en: "INTELLIGENCE" },
    landing_diff_flow3: { es: "DECISIÓN", en: "DECISION" },

    // 6. trust / differentiation (merged)
    landing_diff_flow_evidence: { es: "EVIDENCIA", en: "EVIDENCE" },
    landing_trust_h1: { es: "Inteligencia que puede rastrear hasta la fuente.", en: "Intelligence you can trace back to the source." },
    landing_trust_statement2: { es: "Parcela no sustituye la debida diligencia profesional. Le ayuda a saber dónde mirar antes de invertir tiempo y dinero.", en: "Parcela doesn't replace professional due diligence. It helps you know where to look before you spend the time and money." },
    landing_trust_finding: { es: "Exposición a inundación", en: "Flood exposure" },
    landing_trust_status: { es: "Posible limitación", en: "Potential constraint" },
    landing_trust_summary: { es: "La parcela interseca un área mapeada de riesgo de inundación.", en: "The parcel intersects a mapped flood-risk area." },
    landing_trust_whyLabel: { es: "¿Por qué?", en: "Why?" },
    landing_trust_whyValue: { es: "Zona de inundación AE", en: "Flood Zone AE" },
    landing_trust_sourceLabel: { es: "Fuente", en: "Source" },
    landing_trust_sourceValue: { es: "FEMA", en: "FEMA" },
    landing_trust_dataLabel: { es: "Dato relevante", en: "Relevant data" },
    landing_trust_dataValue: { es: "SIG de Puerto Rico", en: "Puerto Rico GIS" },
    landing_trust_confidenceLabel: { es: "Confianza", en: "Confidence" },
    landing_trust_confidenceValue: { es: "Alta", en: "High" },
    landing_trust_viewSource: { es: "Ver fuente →", en: "View source →" },
    landing_trust_docLabel: { es: "Documento", en: "Document" },
    landing_trust_docValue: { es: "Panel FIRM 72000C0245J", en: "FIRM Panel 72000C0245J" },
    landing_trust_sectionLabel: { es: "Sección", en: "Section" },
    landing_trust_sectionValue: { es: "Delimitación de Zona AE", en: "Zone AE delineation" },
    landing_trust_demoNote: { es: "Ejemplo de demostración — no es un hallazgo gubernamental verificado.", en: "Demonstration example — not a verified government finding." },

    // 7. final cta
    landing_final_h1: { es: "¿Tiene una propiedad en mente?", en: "Have a property in mind?" },
    landing_final_sub: { es: "Vea qué puede decirle Parcela.", en: "See what Parcela can tell you." },
    landing_final_placeholder: { es: "Busque una dirección o parcela", en: "Search an address or parcel" },
    landing_final_note: { es: "Empiece a explorar sin crear una cuenta.", en: "Start exploring without creating an account." },

    // 8. footer
    landing_footer_tagline: { es: "Inteligencia de desarrollo para Puerto Rico.", en: "Development intelligence for Puerto Rico." },
    landing_footer_product: { es: "Producto", en: "Product" },
    landing_footer_about: { es: "Acerca de", en: "About" },
    landing_footer_legal: { es: "Legal", en: "Legal" },
    landing_footer_privacy: { es: "Privacidad", en: "Privacy" },
    landing_footer_terms: { es: "Términos", en: "Terms" },
    landing_footer_disclaimerLabel: { es: "Aviso", en: "Disclaimer" },
    landing_footer_disclaimer: { es: "Parcela ofrece inteligencia preliminar de propiedad basada en datos disponibles. La información debe verificarse de forma independiente y no sustituye el asesoramiento profesional legal, arquitectónico, de ingeniería, ambiental, de planificación o regulatorio.", en: "Parcela provides preliminary property intelligence based on available data. Information should be independently verified and does not replace professional legal, architectural, engineering, environmental, planning, or regulatory advice." },

    // ---- projects.html ----
    projects_project: { es: "Proyecto", en: "Project" },
    projects_evaluated: { es: "Propiedades en evaluación", en: "Properties being evaluated" },
    projects_addAnother: { es: "+ Agregar otra propiedad", en: "+ Add another property" },
    projects_worthInvestigating: { es: "Vale la pena investigar", en: "Worth investigating" },
    projects_investigateFurther: { es: "Investigar más a fondo", en: "Investigate further" },
    projects_constraints: { es: "Limitaciones", en: "Constraints" },

    // ---- reports.html ----
    reports_title: { es: "Informe de viabilidad", en: "Feasibility report" },
    reports_share: { es: "Compartir", en: "Share" },
    reports_download: { es: "Descargar PDF", en: "Download PDF" },
    reports_preparing: { es: "Preparando…", en: "Preparing…" },
    reports_downloaded: { es: "Descargado", en: "Downloaded" },
    reports_linkCopied: { es: "Enlace copiado", en: "Link copied" },
    reports_docEyebrow: { es: "Análisis preliminar de viabilidad · Datos de prototipo", en: "Preliminary feasibility analysis · Prototype data" },
    reports_cadastralGenerated: { es: "Catastro {cad} · Generado {date}", en: "Cadastral {cad} · Generated {date}" },
    reports_s01: { es: "Resumen ejecutivo", en: "Executive summary" },
    reports_s02: { es: "Propiedad", en: "Property" },
    reports_s03: { es: "Supuestos del proyecto", en: "Project assumptions" },
    reports_s04: { es: "Análisis regulatorio", en: "Regulatory analysis" },
    reports_s05: { es: "Limitaciones físicas", en: "Physical constraints" },
    reports_s06: { es: "Infraestructura", en: "Infrastructure" },
    reports_s07: { es: "Historial de desarrollo", en: "Development history" },
    reports_s08: { es: "Posibles limitaciones", en: "Potential constraints" },
    reports_s09: { es: "Incógnitas", en: "Unknowns" },
    reports_s10: { es: "Próximas acciones recomendadas", en: "Recommended next actions" },
    reports_s11: { es: "Fuentes", en: "Sources" },
    reports_address: { es: "Dirección", en: "Address" },
    reports_projectType: { es: "Tipo de proyecto", en: "Project type" },
    reports_viewLibrary: { es: "Ver biblioteca completa de fuentes y qué hallazgos citan cada una →", en: "View full source library & which findings cite each one →" },
    reports_disclaimer: { es: "Parcela es un prototipo de apoyo a la decisión, no una determinación legal o profesional. Cada hallazgo debe verificarse con el profesional autorizado o la agencia gubernamental correspondiente antes de tomar una decisión de desarrollo. Todos los datos de este informe son ficticios.", en: "Parcela is a decision-support prototype, not a legal or professional determination. Every finding above should be verified with the appropriate licensed professional or government agency before it informs a development decision. All data in this report is fictional prototype data." },

    // ---- sources.html ----
    sources_title: { es: "Fuentes y evidencia", en: "Sources & evidence" },
    sources_subtitle: { es: "Cada fuente detrás de cada hallazgo de 123 Example Avenue, en un solo lugar.", en: "Every source behind every finding on 123 Example Avenue, in one place." },
    sources_chainFinding: { es: "Hallazgo", en: "Finding" },
    sources_chainFindingSub: { es: "Lo que Parcela concluyó", en: "What Parcela concluded" },
    sources_chainEvidenceSub: { es: "Por qué importa y qué tan seguros estamos", en: "Why it matters, and how sure we are" },
    sources_chainSourceSub: { es: "El registro subyacente", en: "The underlying record" },
    sources_tagline: { es: "La IA explica. Los datos prueban. Los profesionales deciden.", en: "AI explains. Data proves. Professionals decide." },
    sources_documentLayer: { es: "Documento / capa", en: "Document / layer" },
    sources_relevantSection: { es: "Sección relevante", en: "Relevant section" },
    sources_referencedBy: { es: "Citado por", en: "Referenced by" },
    sources_notCited: { es: "No está citada actualmente por un hallazgo específico.", en: "Not currently cited by a specific finding." },
    sources_opening: { es: "Abriendo…", en: "Opening…" },
    sources_notAvailable: { es: "No disponible en el prototipo", en: "Not available in prototype" },
  };

  function getLang() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "en" || v === "es") return v;
    } catch (e) {}
    return "es";
  }

  function setLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
    location.reload();
  }

  const lang = getLang();
  document.documentElement.lang = lang;

  function t(key) {
    const entry = STRINGS[key];
    if (!entry) return key;
    return entry[lang] || entry.es || entry.en || key;
  }

  // For bilingual mockData fields shaped as {es, en} (or a plain string,
  // treated as language-agnostic — proper nouns, agency names, etc).
  function tv(value) {
    if (value == null) return value;
    if (typeof value === "string") return value;
    return value[lang] || value.es || value.en || "";
  }

  function applyStatic(root) {
    (root || document).querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    (root || document).querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
  }

  function toggleHTML() {
    return `
      <div class="lang-toggle" role="group" aria-label="Language / Idioma">
        <button type="button" class="lang-btn${lang === "es" ? " is-active" : ""}" data-set-lang="es">ES</button>
        <button type="button" class="lang-btn${lang === "en" ? " is-active" : ""}" data-set-lang="en">EN</button>
      </div>`;
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-set-lang]");
    if (btn) setLang(btn.dataset.setLang);
  });

  const slot = document.getElementById("lang-toggle-slot");
  if (slot) slot.innerHTML = toggleHTML();

  document.addEventListener("DOMContentLoaded", () => applyStatic(document));

  return { lang, getLang, setLang, t, tv, applyStatic, toggleHTML, STRINGS };
})();
