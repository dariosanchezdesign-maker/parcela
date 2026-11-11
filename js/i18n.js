/* ATERRA i18n. Spanish is the default language (Puerto Rico), English is
   the toggle. Official Spanish-language names (agencies, regulations,
   documents, municipalities) are treated as proper nouns and stay in
   Spanish in both languages, same as "Reglamento Conjunto" would stay
   untranslated in an English-language legal brief. */

window.AterraI18N = (function () {
  const STORAGE_KEY = "aterra-lang";

  const STRINGS = {
    // ---- nav ----
    nav_overview: { es: "Resumen", en: "Overview" },
    nav_explore: { es: "Explorar", en: "Explore" },
    nav_properties: { es: "Propiedades", en: "Properties" },
    nav_projects: { es: "Proyectos", en: "Projects" },
    nav_reports: { es: "Informes", en: "Reports" },
    nav_footer: { es: "Datos de muestra", en: "Sample data" },
    nav_compare: { es: "Comparar", en: "Compare" },
    nav_sources: { es: "Fuentes", en: "Sources" },
    nav_newAnalysis: { es: "Nuevo análisis", en: "New analysis" },
    nav_account: { es: "Cuenta e inicio de sesión", en: "Account & sign-in" },
    nav_group_workspace: { es: "Espacio de trabajo", en: "Workspace" },
    nav_group_discover: { es: "Descubrir", en: "Discover" },
    nav_group_analyze: { es: "Analizar", en: "Analyze" },
    nav_group_evaluate: { es: "Evaluar", en: "Evaluate" },
    nav_group_decide: { es: "Decidir", en: "Decide" },
    a11y_skip: { es: "Saltar al contenido", en: "Skip to content" },
    a11y_mainNav: { es: "Navegación principal", en: "Main navigation" },
    a11y_home: { es: "ATERRA — ir al resumen", en: "ATERRA — go to overview" },
    a11y_progress: { es: "Progreso", en: "Progress" },
    a11y_close: { es: "Cerrar", en: "Close" },
    flow_step_property: { es: "Propiedad", en: "Property" },
    flow_step_confirm: { es: "Confirmar", en: "Confirm" },
    flow_step_project: { es: "Proyecto", en: "Project" },
    flow_exit: { es: "Salir al espacio de trabajo", en: "Exit to workspace" },
    // ---- ATERRA additions ----
    signin_errUnavailable: { es: "El servicio de cuentas no responde ahora. Puedes seguir analizando propiedades sin iniciar sesión.", en: "The account service isn't responding right now. You can keep analyzing properties without signing in." },
    // ---- landing (index.html) ----
    l_nav_problem: { es: "Por qué ATERRA", en: "Why ATERRA" },
    l_nav_platform: { es: "Plataforma", en: "Platform" },
    l_nav_outcome: { es: "Principios", en: "Principles" },
    l_nav_cta: { es: "Abrir espacio de trabajo", en: "Open workspace" },
    l_hero_eyebrow: { es: "Inteligencia inmobiliaria · Puerto Rico", en: "Real estate intelligence · Puerto Rico" },
    l_hero_title_a: { es: "Descubre el potencial de", en: "See the potential in" },
    l_hero_title_b: { es: "cada parcela.", en: "every parcel." },
    l_hero_sub: { es: "Inteligencia inmobiliaria para mejores decisiones de desarrollo. Entiende el terreno, evalúa oportunidades y avanza con claridad.", en: "Real estate intelligence for better development decisions. Understand the land, evaluate opportunities, and move forward with clarity." },
    l_hero_cta: { es: "Explorar ATERRA", en: "Explore ATERRA" },
    l_hero_cta2: { es: "Cómo funciona", en: "How it works" },
    l_hero_note: { es: "Construido sobre registros públicos en vivo del CRIM, la Junta de Planificación y FEMA. Cobertura actual: San Juan.", en: "Built on live public records from CRIM, the Planning Board and FEMA. Coverage today: San Juan." },
    l_viz_sample: { es: "Análisis de muestra · parcela ficticia", en: "Sample analysis · fictional parcel" },
    l_problem_eyebrow: { es: "El problema", en: "The problem" },
    l_problem_title: { es: "La respuesta a «¿qué puede llegar a ser este terreno?» está dispersa entre agencias.", en: "The answer to \"what can this land become?\" is scattered across agencies." },
    l_problem_body: { es: "Los registros de parcelas, los mapas de calificación, los mapas de inundación y los reglamentos que los conectan se publican por separado, en formatos y sistemas distintos. Reunirlos para un solo sitio toma días, y es fácil pasar por alto lo que falta.", en: "Parcel records, zoning maps, flood maps and the regulations that tie them together are published separately, in different formats, on different systems. Assembling them for a single site takes days, and the gaps are easy to miss." },
    l_problem_cost: { es: "El costo no es solo tiempo. Una restricción descubierta después de firmar una opción, o después de empezar el diseño, cambia el negocio en peores términos.", en: "The cost isn't only time. A constraint found after an option is signed, or after design has started, changes the deal on worse terms." },
    l_src_crim: { es: "Límites, área y número de catastro", en: "Parcel boundaries, area and cadastral number" },
    l_src_jp: { es: "Mapa de calificación, licuación, tsunami y zonas históricas", en: "Zoning map, liquefaction, tsunami and historic zones" },
    l_src_fema: { es: "Zonas de inundación y elevaciones base", en: "Flood zones and base flood elevations" },
    l_src_rc: { es: "Qué permite cada distrito: usos, densidad, altura, estacionamiento", en: "What each district allows: uses, density, height, parking" },
    l_src_ogpe: { es: "Historial de permisos y consultas previas", en: "Permit history and prior consultations" },
    l_src_util: { es: "Capacidad de agua, alcantarillado y energía, a menudo no publicada por parcela", en: "Water, sewer and power capacity, often not published per parcel" },
    l_platform_eyebrow: { es: "La plataforma", en: "The platform" },
    l_platform_title: { es: "Un análisis, de la parcela a la decisión.", en: "One analysis, from parcel to decision." },
    l_cap1_title: { es: "Entiende el terreno", en: "Understand the land" },
    l_cap1_body: { es: "Ingresa una dirección o número de catastro. ATERRA identifica la parcela y lee su calificación, exposición a inundación y capas de riesgo en las fuentes oficiales.", en: "Enter an address or cadastral number. ATERRA identifies the parcel and reads its zoning, flood exposure and hazard layers from the official sources." },
    l_cap2_title: { es: "Evalúa el potencial de desarrollo", en: "Evaluate development potential" },
    l_cap2_body: { es: "Ve si un tipo de proyecto encaja en el distrito y qué podría albergar el solar, con cada dato identificado como registro oficial, interpretación de ATERRA, estimado o faltante.", en: "See whether a project type fits the district and what the lot could hold, with every statement labeled as an official record, ATERRA's interpretation, an estimate, or missing." },
    l_cap2_f1: { es: "Calificación en el mapa de la Junta", en: "Zoning on the Planning Board map" },
    l_cap2_f2: { es: "Tipo de proyecto permitido en el distrito actual", en: "Project type allowed in the current district" },
    l_cap2_f3: { es: "Rango de unidades antes de patios y estacionamiento", en: "Unit range before yards and parking" },
    l_cap2_f4: { es: "Capacidad de servicios", en: "Utility capacity" },
    l_cap3_title: { es: "Toma decisiones de inversión informadas", en: "Make informed investment decisions" },
    l_cap3_body: { es: "Sabe qué sigue abierto y quién lo resuelve. Cada análisis termina en próximos pasos ordenados y un informe que puedes compartir con tu equipo.", en: "Know what is still open and who resolves it. Every analysis ends in ordered next steps and a report you can share with your team." },
    l_platform_note: { es: "La inteligencia de mercado y el modelo financiero están en desarrollo. ATERRA no estima precios, costos ni rendimientos hasta poder mostrar sus fuentes.", en: "Market intelligence and financial modeling are in development. ATERRA does not estimate prices, costs or returns until it can show its sources." },
    l_outcome_eyebrow: { es: "El resultado", en: "The outcome" },
    l_outcome_title: { es: "Terreno, reglas y riesgo en un solo lugar, con la evidencia adjunta.", en: "Land, rules and risk in one place, with the evidence attached." },
    l_outcome_body: { es: "Decide qué sitios merecen tu tiempo, entra a la debida diligencia sabiendo qué preguntar y dale a tu arquitecto, ingeniero y abogado un punto de partida claro.", en: "Decide which sites deserve your time, go into due diligence knowing what to ask, and bring your architect, engineer and attorney a clear starting point." },
    l_p1_t: { es: "Evidencia antes que conclusiones", en: "Evidence before conclusions" },
    l_p1_b: { es: "Cada hallazgo enlaza al registro en que se basa, con su fecha.", en: "Every finding links to the record it rests on, with its date." },
    l_p2_t: { es: "Lo desconocido sigue siendo desconocido", en: "Unknowns stay unknown" },
    l_p2_b: { es: "Los datos faltantes se muestran como faltantes, nunca se rellenan.", en: "Missing data is shown as missing, never filled in." },
    l_p3_t: { es: "La IA explica, no decide", en: "AI explains, it doesn't decide" },
    l_p3_b: { es: "Los resúmenes con IA están identificados y usan solo los hallazgos de la página.", en: "AI summaries are labeled and use only the findings on the page." },
    l_final_title: { es: "Empieza a explorar oportunidades.", en: "Start exploring opportunities." },
    l_footer_tag: { es: "La infraestructura de inteligencia detrás del desarrollo inmobiliario en el Caribe.", en: "The intelligence infrastructure powering real estate development across the Caribbean." },
    l_footer_sample: { es: "Análisis de muestra", en: "Sample analysis" },
    l_footer_legal: { es: "ATERRA ofrece inteligencia preliminar de propiedades a partir de registros públicos. No es una determinación legal, de ingeniería, de tasación ni de permisos; verifica los hallazgos con un profesional licenciado o la agencia responsable antes de actuar.", en: "ATERRA provides preliminary property intelligence from public records. It is not a legal, engineering, appraisal or permitting determination; verify findings with a licensed professional or the responsible agency before acting." },
    properties_selectFor: { es: "Incluir {a} en la comparación", en: "Include {a} in the comparison" },
    analyzing_titleFor: { es: "Analizando {p}…", en: "Analyzing {p}…" },
    setup_unitsHelp: { es: "Se usa para revisar la densidad del distrito. Déjalo en blanco si no lo has decidido.", en: "Used to check the district's density. Leave blank if undecided." },
    setup_invHelp: { es: "Solo como referencia; ATERRA aún no modela rendimientos.", en: "For your reference only; ATERRA does not model returns yet." },
    // ---- evidence basis ----
    basis_keyTitle: { es: "Origen de cada dato", en: "Where each statement comes from" },
    basis_record: { es: "Registro oficial", en: "Official record" },
    basis_record_def: { es: "Lo dice la fuente oficial citada (CRIM, Junta de Planificación, FEMA), consultada para esta parcela.", en: "Stated by the cited official source (CRIM, Planning Board, FEMA), queried for this parcel." },
    basis_derived: { es: "Interpretación de ATERRA", en: "ATERRA interpretation" },
    basis_derived_def: { es: "ATERRA aplicó una regla publicada (p. ej. Reglamento Conjunto 2023) a los datos de esta parcela. Requiere confirmación profesional.", en: "ATERRA applied a published rule (e.g. Reglamento Conjunto 2023) to this parcel's data. Needs professional confirmation." },
    basis_estimate: { es: "Estimado", en: "Estimate" },
    basis_estimate_def: { es: "Un rango calculado para dar orden de magnitud. No es una determinación y excluye factores que aún no se conocen.", en: "A calculated range for order of magnitude. Not a determination, and it leaves out factors not yet known." },
    basis_missing: { es: "Sin datos", en: "No data" },
    basis_missing_def: { es: "La fuente no tiene información para esta parcela, o ATERRA aún no la cubre. No se rellena con suposiciones.", en: "The source has nothing for this parcel, or ATERRA doesn't cover it yet. It is not filled in with assumptions." },
    basis_ai: { es: "Explicación con IA", en: "AI explanation" },
    basis_ai_def: { es: "Texto escrito por IA solo a partir de los hallazgos mostrados. No añade datos y no sustituye la fuente.", en: "Text written by AI only from the findings shown. It adds no data and does not replace the source." },
    basis_sample: { es: "Datos de muestra", en: "Sample data" },
    basis_sample_def: { es: "Datos ficticios de demostración. No describen una propiedad real.", en: "Fictional demonstration data. It does not describe a real property." },
    common_evidence: { es: "Evidencia", en: "Evidence" },
    common_noSource: { es: "Sin fuente específica", en: "No specific source" },
    panel_basis: { es: "Tipo de evidencia", en: "Evidence type" },
    panel_noSource: { es: "Sin fuente: dato faltante", en: "No source: data missing" },
    panel_retrieved: { es: "Consultado", en: "Retrieved" },
    // ---- AI ----
    ai_rowLabel: { es: "Explicación con IA", en: "AI explanation" },
    ai_rowLabelSample: { es: "Explicación de muestra", en: "Sample explanation" },
    ai_tagAI: { es: "Explicación con IA", en: "AI explanation" },
    ai_tagSample: { es: "Texto de muestra", en: "Sample text" },
    ai_disclaimerSample: { es: "Texto prescrito para la propiedad de muestra. En una parcela real, la explicación se genera con IA a partir de los hallazgos de la página.", en: "Pre-written for the sample property. On a real parcel, the explanation is AI-generated from the page's findings." },
    // ---- overview ----
    overview_qaTitle: { es: "Analizar una propiedad", en: "Analyze a property" },
    overview_qaBody: { es: "Ingresa una dirección o número de catastro. ATERRA lee el registro público y te dice qué se sabe, qué es estimado y qué falta verificar.", en: "Enter an address or cadastral number. ATERRA reads the public record and tells you what is known, what is estimated, and what still needs verification." },
    overview_qaHint: { es: "Registros públicos en vivo: CRIM, Junta de Planificación, FEMA. Cobertura actual: San Juan.", en: "Live public records: CRIM, Planning Board, FEMA. Current coverage: San Juan." },
    overview_recent: { es: "Continúa donde lo dejaste", en: "Continue where you left off" },
    overview_recentNote: { es: "Analizadas en esta sesión", en: "Analyzed in this session" },
    overview_saved: { es: "Análisis guardados", en: "Saved analyses" },
    overview_savedSignedOutTitle: { es: "Guarda tus análisis", en: "Keep your analyses" },
    overview_savedSignedOutBody: { es: "Inicia sesión para guardar análisis y volver a ellos desde cualquier dispositivo.", en: "Sign in to save analyses and return to them from any device." },
    overview_savedEmptyTitle: { es: "Aún no hay análisis guardados", en: "No saved analyses yet" },
    overview_savedUnavailable: { es: "No pudimos conectar con tu cuenta. Tus análisis guardados no se muestran ahora; inténtalo de nuevo en un momento.", en: "We couldn't reach your account. Saved analyses can't be shown right now; try again in a moment." },
    overview_signIn: { es: "Iniciar sesión", en: "Sign in" },
    overview_sample: { es: "Espacio de muestra", en: "Sample workspace" },
    overview_sampleNote: { es: "Estas propiedades son ficticias. Muestran cómo se lee un análisis antes de correrlo en una parcela real.", en: "These properties are fictional. They show how an analysis reads before you run one on a real parcel." },
    overview_attention: { es: "Requiere atención", en: "Needs attention" },
    overview_coverage: { es: "Cobertura de datos", en: "Data coverage" },
    overview_coverageFoot: { es: "Los comparables de mercado y el modelo financiero aún no forman parte de ATERRA. Ningún análisis se estima a partir de ellos.", en: "Market comparables and financial modeling are not part of ATERRA yet. Nothing in an analysis is estimated from them." },
    coverage_live: { es: "En vivo", en: "Live" },
    coverage_unavailable: { es: "Aún no disponible", en: "Not yet available" },
    coverage_notYet: { es: "En desarrollo; no se usa en los análisis.", en: "In development; not used in analyses." },
    coverage_crim: { es: "Límites, área y catastro de cada parcela", en: "Parcel boundaries, area, and cadastral number" },
    coverage_jpName: { es: "Junta de Planificación", en: "Planning Board" },
    coverage_jp: { es: "Calificación, licuación, tsunami y zonas históricas", en: "Zoning, liquefaction, tsunami, and historic zones" },
    coverage_fema: { es: "Zonas de inundación y niveles base", en: "Flood zones and base flood elevations" },
    coverage_rc: { es: "Usos, densidad y altura por distrito (San Juan)", en: "Uses, density, and height by district (San Juan)" },
    coverage_marketName: { es: "Inteligencia de mercado", en: "Market intelligence" },
    coverage_financeName: { es: "Modelo financiero", en: "Financial modeling" },
    // ---- property analysis ----
    property_dataLive: { es: "Registros públicos en vivo", en: "Live public records" },
    property_dataSample: { es: "Propiedad de muestra · datos ficticios", en: "Sample property · fictional data" },
    property_recommendedNext: { es: "Siguiente paso recomendado", en: "Recommended next step" },
    property_allSteps: { es: "Ver todos los pasos", en: "See all next steps" },
    property_mapLayers: { es: "Capas del mapa", en: "Map layers" },
    property_tab_findings: { es: "Hallazgos", en: "Findings" },
    property_tab_unknowns: { es: "Preguntas abiertas", en: "Open questions" },
    property_tab_actions: { es: "Próximos pasos", en: "Next steps" },
    property_tab_regulation: { es: "Calificación y reglas", en: "Zoning & rules" },
    property_tab_site: { es: "Sitio", en: "Site" },
    property_tab_limits: { es: "Fuentes y límites", en: "Sources & limits" },
    property_noFindings: { es: "Ningún hallazgo en esta categoría.", en: "No findings in this category." },
    property_noUnknowns: { es: "No hay preguntas abiertas registradas.", en: "No open questions recorded." },
    property_unknownsIntro: { es: "Lo que el registro público aún no responde. Trata cada punto como no resuelto hasta que un profesional lo confirme.", en: "What the public record does not answer yet. Treat each as unresolved until a professional confirms it." },
    property_actionsIntro: { es: "Ordenados por lo que desbloquea la decisión primero, cada uno con el profesional que puede resolverlo.", en: "Ordered by what unblocks the decision first, each with the professional who can resolve it." },
    property_regIntroLive: { es: "La calificación viene del mapa vigente de la Junta de Planificación. Las reglas del distrito son la lectura de ATERRA del Reglamento Conjunto 2023 y deben confirmarse.", en: "Zoning comes from the Planning Board's current map. District rules are ATERRA's reading of the Reglamento Conjunto 2023 and need confirmation." },
    property_regIntroSample: { es: "Valores de muestra para ilustrar el análisis regulatorio.", en: "Sample values illustrating the regulatory analysis." },
    property_siteLiveTitle: { es: "Las condiciones del sitio aún no están en este análisis", en: "Site conditions are not in this analysis yet" },
    property_siteLiveBody: { es: "Las capas de inundación, licuación, tsunami y zonas históricas se leen en vivo y aparecen en Hallazgos. Topografía, suelos, capacidad de servicios e historial de permisos no están disponibles en las fuentes públicas que ATERRA lee hoy, así que se listan como preguntas abiertas en lugar de estimarse.", en: "Flood, liquefaction, tsunami and historic-zone layers are read live and appear under Findings. Topography, soils, utility capacity and permit history are not available from the public sources ATERRA reads today, so they are listed as open questions instead of being estimated." },
    property_seeUnknowns: { es: "Ver preguntas abiertas", en: "See open questions" },
    property_howToRead: { es: "Cómo leer este análisis", en: "How to read this analysis" },
    property_sourcesUsed: { es: "Fuentes usadas", en: "Sources used" },
    property_notCovered: { es: "No cubierto", en: "Not covered" },
    property_disclaimer: { es: "Análisis preliminar a partir de registros públicos. No es una determinación legal, de ingeniería, de tasación ni de permisos.", en: "A preliminary analysis from public records. It is not a legal, engineering, appraisal or permitting determination." },
    limits_market: { es: "Mercado y comparables", en: "Market and comparables" },
    limits_market_detail: { es: "Ventas, rentas y absorción no forman parte del análisis.", en: "Sales, rents and absorption are not part of the analysis." },
    limits_financial: { es: "Costos y rendimiento", en: "Costs and returns" },
    limits_financial_detail: { es: "ATERRA no proyecta costos, valor ni retorno.", en: "ATERRA does not project costs, value or returns." },
    limits_utilities: { es: "Capacidad de servicios", en: "Utility capacity" },
    limits_utilities_detail: { es: "AAA y LUMA no publican capacidad por parcela.", en: "PRASA and LUMA don't publish parcel-level capacity." },
    limits_soils: { es: "Suelos y topografía", en: "Soils and topography" },
    limits_soils_detail: { es: "Requiere estudio geotécnico y agrimensura.", en: "Requires a geotechnical study and survey." },
    limits_title: { es: "Título y gravámenes", en: "Title and liens" },
    limits_title_detail: { es: "Requiere estudio de título.", en: "Requires a title search." },
    live_loadErrorBody: { es: "Una de las fuentes del gobierno no respondió o la parcela no se encontró. Nada se muestra en su lugar.", en: "A government source didn't respond or the parcel wasn't found. Nothing is shown in its place." },


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
    common_status_constraint: { es: "Restricción", en: "Constraint" },
    common_status_unknown: { es: "Desconocido", en: "Unknown" },

    // ---- search (search.html) ----
    search_step: { es: "Nuevo análisis", en: "New analysis" },
    search_title: { es: "¿Qué propiedad estás evaluando?", en: "What are you looking at?" },
    search_subtitle: { es: "Ingresa una dirección, número de catastro o ubicación para iniciar un análisis preliminar de viabilidad.", en: "Enter an address, cadastral number, or location to start a preliminary feasibility analysis." },
    search_placeholder: { es: "Busca una dirección, parcela o ubicación", en: "Search an address, parcel, or location" },
    search_exploreMap: { es: "Explorar el mapa", en: "Explore the map" },
    search_sugg1: { es: "Condado, San Juan · Catastro 040-028-001-25", en: "Condado, San Juan · Cadastral 040-028-001-25" },
    search_sugg2: { es: "Santurce, San Juan · Catastro 041-041-134-02", en: "Santurce, San Juan · Cadastral 041-041-134-02" },
    search_sugg3: { es: "Viejo San Juan · búsqueda por número de catastro", en: "Old San Juan · search by cadastral number" },

    // ---- identify.html ----
    identify_step: { es: "Confirma la parcela", en: "Confirm the parcel" },
    identify_cta: { es: "Analizar esta propiedad", en: "Analyze this property" },
    identify_change: { es: "Cambiar propiedad", en: "Change property" },
    identify_subjectParcel: { es: "Parcela en estudio", en: "Subject parcel" },
    identify_baseMap: { es: "Mapa base", en: "Base map" },

    // ---- setup.html ----
    setup_step: { es: "Define el proyecto", en: "Define the project" },
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
    property_mapNote: { es: "Mapa de muestra", en: "Sample map" },
    property_layer_satellite: { es: "Mapa base", en: "Base map" },
    property_layer_zoning: { es: "Zonificación", en: "Zoning" },
    property_layer_flood: { es: "Inundación", en: "Flood" },
    property_layer_environmental: { es: "Ambiental", en: "Environmental" },
    property_layer_infrastructure: { es: "Infraestructura", en: "Infrastructure" },
    property_layer_development: { es: "Desarrollo", en: "Development" },
    property_aiExplain: { es: "Explica esto", en: "Explain this" },
    property_aiNext: { es: "¿Qué debería investigar primero?", en: "What should I investigate first?" },
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
    panel_whatFound: { es: "Qué muestra el registro", en: "What the record shows" },
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
    ai_analyst: { es: "Analista de ATERRA", en: "ATERRA analyst" },
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

    // ---- live data (CRIM / Planning Board / FEMA via /api/lookup) ----
    // ---- accounts ----
    signin_title: { es: "Inicia sesión para guardar proyectos", en: "Sign in to save projects" },
    signin_subtitle: { es: "Escribe tu correo y te enviaremos un enlace para entrar. No necesitas contraseña.", en: "Enter your email and we'll send you a sign-in link. No password needed." },
    signin_email: { es: "Correo electrónico", en: "Email" },
    signin_emailPlaceholder: { es: "tu@empresa.com", en: "you@company.com" },
    signin_send: { es: "Enviar enlace", en: "Send sign-in link" },
    signin_sentTitle: { es: "Revisa tu correo", en: "Check your email" },
    signin_sentBody: { es: "Enviamos un enlace de acceso a", en: "We sent a sign-in link to" },
    signin_sentHint: { es: "Ábrelo en este u otro dispositivo. Puede tardar un minuto; revisa el correo no deseado si no lo ves.", en: "Open it on this device or any other. It can take a minute to arrive; check spam if you don't see it." },
    signin_doneTitle: { es: "Sesión iniciada", en: "You're signed in" },
    signin_doneBody: { es: "Conectado como", en: "Signed in as" },
    signin_toProjects: { es: "Ir a mis proyectos", en: "Go to my projects" },
    signin_continue: { es: "Continuar", en: "Continue" },
    signin_signOut: { es: "Cerrar sesión", en: "Sign out" },
    signin_errSend: { es: "No pudimos enviar el enlace. Revisa el correo e inténtalo de nuevo.", en: "We couldn't send the link. Check the email address and try again." },
    signin_errRate: { es: "Se enviaron demasiados enlaces. Espera unos minutos e inténtalo de nuevo.", en: "Too many links were sent. Wait a few minutes and try again." },
    save_project: { es: "Guardar análisis", en: "Save analysis" },
    save_saving: { es: "Guardando…", en: "Saving…" },
    save_saved: { es: "Análisis guardado", en: "Analysis saved" },
    save_update: { es: "Actualizar guardado", en: "Update saved analysis" },
    save_error: { es: "No se pudo guardar. Inténtalo de nuevo.", en: "Couldn't save. Try again." },
    myprojects_title: { es: "Mis proyectos", en: "My projects" },
    myprojects_signedOut: { es: "Inicia sesión para ver y guardar tus proyectos.", en: "Sign in to see and save your projects." },
    myprojects_empty: { es: "Aún no has guardado proyectos. Analiza una propiedad y pulsa «Guardar proyecto».", en: "You haven't saved any projects yet. Analyze a property and press \"Save project\"." },
    myprojects_new: { es: "Analizar una propiedad", en: "Analyze a property" },
    myprojects_delete: { es: "Eliminar", en: "Delete" },
    myprojects_confirmDelete: { es: "¿Eliminar este proyecto guardado?", en: "Delete this saved project?" },
    myprojects_saved: { es: "Guardado", en: "Saved" },
    myprojects_loadError: { es: "No pudimos cargar tus proyectos.", en: "We couldn't load your projects." },
    ai_thinking: { es: "Analizando los hallazgos…", en: "Analyzing the findings…" },
    ai_remaining: { es: "Te quedan {n} de {limit} explicaciones hoy.", en: "{n} of {limit} explanations left today." },
    ai_errLimit: { es: "Llegaste al límite de explicaciones de hoy. Vuelve mañana.", en: "You've reached today's explanation limit. Come back tomorrow." },
    ai_errDeclined: { es: "La IA no pudo responder esta pregunta. Los hallazgos de la página siguen disponibles.", en: "The AI couldn't answer this one. The findings on the page are still available." },
    ai_errBusy: { es: "El servicio de IA está ocupado. Inténtalo en un momento.", en: "The AI service is busy. Try again in a moment." },
    ai_errUnavailable: { es: "La explicación no está disponible ahora. Inténtalo de nuevo.", en: "The explanation isn't available right now. Try again." },
    rep_eyebrow: { es: "Análisis preliminar de viabilidad · Datos públicos", en: "Preliminary feasibility analysis · Public records" },
    rep_meta: { es: "Catastro {cad} · Generado {date}", en: "Cadastral {cad} · Generated {date}" },
    rep_s_summary: { es: "Resumen", en: "Summary" },
    rep_s_property: { es: "Propiedad", en: "Property" },
    rep_s_maps: { es: "Mapas", en: "Maps" },
    rep_s_rules: { es: "Calificación y reglas del distrito", en: "Zoning and district rules" },
    rep_s_findings: { es: "Hallazgos", en: "Findings" },
    rep_s_unknowns: { es: "Lo que aún no sabemos", en: "What we don't know yet" },
    rep_s_actions: { es: "Próximos pasos", en: "Next steps" },
    rep_s_ai: { es: "Resumen del analista (IA)", en: "Analyst summary (AI)" },
    rep_s_sources: { es: "Fuentes", en: "Sources" },
    rep_mapZoning: { es: "Calificación", en: "Zoning" },
    rep_mapFlood: { es: "Inundación (FEMA)", en: "Flood (FEMA)" },
    rep_evidence: { es: "Evidencia", en: "Evidence" },
    rep_whyMatters: { es: "Por qué importa", en: "Why it matters" },
    rep_source: { es: "Fuente", en: "Source" },
    rep_nextStep: { es: "Siguiente paso", en: "Next step" },
    rep_who: { es: "Quién", en: "Who" },
    rep_aiNote: { es: "Generado por IA a partir de los hallazgos de este informe; no añade datos.", en: "AI-generated from this report's findings; it adds no data." },
    rep_colSource: { es: "Fuente", en: "Source" },
    rep_colAgency: { es: "Agencia", en: "Agency" },
    rep_colDetail: { es: "Detalle", en: "Detail" },
    rep_colDate: { es: "Fecha", en: "Date" },
    rep_retrieved: { es: "consultado {date}", en: "retrieved {date}" },
    rep_disclaimer: { es: "Análisis preliminar a partir de registros públicos (CRIM, Junta de Planificación, FEMA) y del Reglamento Conjunto 2023. No es una determinación legal, de ingeniería ni de permisos. Los registros pueden no reflejar la realidad actual; verifique cada hallazgo en su fuente antes de decidir.", en: "Preliminary analysis from public records (CRIM, Planning Board, FEMA) and the Reglamento Conjunto 2023. It is not a legal, engineering, or permitting determination. Records may not reflect current conditions; verify each finding at its source before deciding." },
    rep_area: { es: "Área", en: "Area" },
    rep_barrio: { es: "Barrio", en: "Barrio" },
    rep_units: { es: "Unidades objetivo", en: "Target units" },
    rep_investment: { es: "Inversión", en: "Investment" },
    live_navFooter: { es: "Datos reales · CRIM, JP, FEMA", en: "Real data · CRIM, JP, FEMA" },
    live_parcel: { es: "Parcela", en: "Parcel" },
    live_mapNoData: { es: "ATERRA aún no tiene datos para esta capa", en: "No data for this layer in ATERRA yet" },
    live_mapNote: { es: "Fuentes: CRIM, Junta de Planificación, FEMA", en: "Sources: CRIM, Planning Board, FEMA" },
    live_loading: { es: "Consultando CRIM, la Junta de Planificación y FEMA…", en: "Checking CRIM, the Planning Board, and FEMA…" },
    live_loadError: { es: "No pudimos cargar esta parcela.", en: "We couldn't load this parcel." },
    live_retry: { es: "Buscar otra propiedad", en: "Search another property" },
    search_err_not_found: { es: "No encontramos esa dirección en Puerto Rico. Revisa la dirección o usa el número de catastro (p. ej. 040-028-001-25).", en: "We couldn't find that address in Puerto Rico. Check the address or use the cadastral number (e.g. 040-028-001-25)." },
    search_err_no_parcel: { es: "Encontramos la dirección, pero no hay una parcela del CRIM en ese punto. Prueba con el número de catastro.", en: "We found the address, but there's no CRIM parcel at that point. Try the cadastral number." },
    search_err_outside: { es: "Por ahora ATERRA solo cubre San Juan. Esta propiedad está en {m}.", en: "For now ATERRA only covers San Juan. This property is in {m}." },
    search_err_unavailable: { es: "Una de las fuentes del gobierno no respondió. Inténtalo de nuevo en un momento.", en: "One of the government sources didn't respond. Try again in a moment." },
    search_hint_live: { es: "Datos reales de CRIM (feb. 2025), la Junta de Planificación y FEMA. Cobertura actual: San Juan. Es un análisis preliminar, no una determinación legal ni profesional.", en: "Real data from CRIM (Feb 2025), the Planning Board, and FEMA. Current coverage: San Juan. This is a preliminary analysis, not a legal or professional determination." },
    search_err_empty: { es: "Ingresa una dirección o número de catastro.", en: "Enter an address or cadastral number." },
    search_demoLink: { es: "Ver la propiedad de demostración", en: "See the demo property" },

    // ---- overview.html ----
    overview_goodMorning: { es: "Buenos días.", en: "Good morning." },
    overview_goodAfternoon: { es: "Buenas tardes.", en: "Good afternoon." },
    overview_goodEvening: { es: "Buenas noches.", en: "Good evening." },
    overview_subtitle: { es: "Tu espacio de trabajo: qué estás analizando, qué requiere atención y a dónde ir después.", en: "Your workspace: what you're analyzing, what needs attention, and where to go next." },
    overview_recentProperties: { es: "Propiedades recientes", en: "Recent properties" },
    overview_activeProjects: { es: "Proyectos activos", en: "Active projects" },
    overview_intelligenceUpdates: { es: "Actualizaciones de inteligencia", en: "Intelligence updates" },
    overview_propertiesLabel: { es: "Propiedades", en: "Properties" },

    // ---- properties.html ----
    properties_title: { es: "Propiedades", en: "Properties" },
    properties_subtitle: { es: "Propiedades de muestra con datos ficticios. Selecciona dos o más para comparar. Tus análisis reales están en Proyectos.", en: "Sample properties with fictional data. Select two or more to compare. Your real analyses live in Projects." },
    properties_selected: { es: "seleccionadas", en: "selected" },

    // ---- compare.html ----
    compare_title: { es: "Comparar propiedades", en: "Compare properties" },
    compare_subtitle: { es: "Una comparación lado a lado de lo conocido y lo pendiente. ATERRA no elige un ganador — tú lo haces.", en: "A side-by-side read of what's known and unresolved. ATERRA doesn't pick a winner — you do." },
    compare_status: { es: "Estado", en: "Status" },
    compare_regulatoryCompat: { es: "Compatibilidad regulatoria", en: "Regulatory compatibility" },
    compare_floodExposure: { es: "Exposición a inundación", en: "Flood exposure" },
    compare_environmentalConstraints: { es: "Limitaciones ambientales", en: "Environmental constraints" },
    compare_unknowns: { es: "Incógnitas", en: "Unknowns" },
    compare_potentialConstraints: { es: "Posibles limitaciones", en: "Potential constraints" },
    compare_unresolved: { es: "sin resolver", en: "unresolved" },
    compare_flagged: { es: "señaladas", en: "flagged" },
    compare_keyDifferences: { es: "Diferencias clave", en: "Key differences" },
    compare_disclaimer: { es: "Cada dato anterior refleja únicamente datos de muestra. Nada de esto es una recomendación — confirma cualquier hallazgo relevante para tu decisión con el profesional correspondiente antes de actuar.", en: "Every field above reflects sample data only. None of it is a recommendation — confirm any finding relevant to your decision with the appropriate professional before acting on it." },

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
    reports_docEyebrow: { es: "Análisis preliminar de viabilidad · Datos de muestra", en: "Preliminary feasibility analysis · Sample data" },
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
    reports_disclaimer: { es: "ATERRA es una herramienta de apoyo a la decisión, no una determinación legal o profesional. Cada hallazgo debe verificarse con el profesional autorizado o la agencia gubernamental correspondiente antes de tomar una decisión de desarrollo. Todos los datos de este informe son ficticios.", en: "ATERRA is a decision-support tool, not a legal or professional determination. Every finding above should be verified with the appropriate licensed professional or government agency before it informs a development decision. All data in this report is fictional sample data." },

    // ---- sources.html ----
    sources_title: { es: "Fuentes y evidencia", en: "Sources & evidence" },
    sources_subtitle: { es: "Cada fuente detrás de cada hallazgo de 123 Example Avenue, en un solo lugar.", en: "Every source behind every finding on 123 Example Avenue, in one place." },
    sources_chainFinding: { es: "Hallazgo", en: "Finding" },
    sources_chainFindingSub: { es: "Lo que ATERRA concluyó", en: "What ATERRA concluded" },
    sources_chainEvidenceSub: { es: "Por qué importa y qué tan seguros estamos", en: "Why it matters, and how sure we are" },
    sources_chainSourceSub: { es: "El registro subyacente", en: "The underlying record" },
    sources_tagline: { es: "La IA explica. Los datos prueban. Los profesionales deciden.", en: "AI explains. Data proves. Professionals decide." },
    sources_documentLayer: { es: "Documento / capa", en: "Document / layer" },
    sources_relevantSection: { es: "Sección relevante", en: "Relevant section" },
    sources_referencedBy: { es: "Citado por", en: "Referenced by" },
    sources_notCited: { es: "No está citada actualmente por un hallazgo específico.", en: "Not currently cited by a specific finding." },
    sources_opening: { es: "Abriendo…", en: "Opening…" },
    sources_notAvailable: { es: "Documento no enlazado en la muestra", en: "Document not linked in the sample" },
  };

  function getLang() {
    try {
      // "parcela-lang" is the key the product used before it became ATERRA;
      // read it once so returning users keep their language.
      const v = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("parcela-lang");
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
    (root || document).querySelectorAll("[data-i18n-label]").forEach((el) => {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-label")));
    });
    (root || document).querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
  }

  function toggleHTML() {
    return `
      <div class="lang-toggle" role="group" aria-label="Idioma / Language">
        <button type="button" class="lang-btn" aria-pressed="${lang === "es"}" data-set-lang="es" lang="es" aria-label="Español">ES</button>
        <button type="button" class="lang-btn" aria-pressed="${lang === "en"}" data-set-lang="en" lang="en" aria-label="English">EN</button>
      </div>`;
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-set-lang]");
    if (btn && btn.dataset.setLang !== lang) setLang(btn.dataset.setLang);
  });

  // Pages can drop <span data-lang-toggle></span> anywhere; the shell
  // components render their own.
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-lang-toggle], #lang-toggle-slot").forEach((slot) => {
      if (!slot.children.length) slot.innerHTML = toggleHTML();
    });
    applyStatic(document);
  });

  return { lang, getLang, setLang, t, tv, applyStatic, toggleHTML, STRINGS };
})();
