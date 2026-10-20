-- Parcela — seed data for two more properties (88 Ashford Avenue,
-- 410 Isla Verde Avenue), so Compare and the Properties list show real
-- database rows instead of hand-typed summary text.
--
-- Run this after schema.sql, seed.sql, and
-- migration_002_comparison_fields.sql have all been applied.
--
-- Unlike the demo property (123 Example Avenue), these two didn't have
-- real findings authored anywhere before — mockData.js only ever had
-- rollup summary text for them. The findings/questions below are newly
-- authored to be consistent with that existing summary text and with
-- the tone of the demo property's findings, but are new prototype
-- content, not a port of something that existed before.
--
-- Reuses the same 9 source rows from seed.sql (FEMA, Reglamento
-- Conjunto, Mapa de Calificación, PRASA, LUMA, DTOP, Permit Activity
-- Records, USGS, Junta de Calidad Ambiental) rather than creating
-- duplicates — the same island-wide agencies/documents apply to any
-- Puerto Rico parcel.

-- ---------------------------------------------------------------------
-- 88 Ashford Avenue, San Juan — multifamily under a mixed-use overlay
-- ---------------------------------------------------------------------
insert into parcels (id, address, municipality, cadastral, parcel_area_sqm, parcel_area_acres)
values (
  'a0000000-0000-4000-8000-000000000003',
  '88 Ashford Avenue',
  'San Juan, Puerto Rico',
  '115-041-006-04-902',
  3237,
  0.8
);

insert into projects (
  id, parcel_id, name, project_type, units_label, investment_label,
  feasibility_status, feasibility_summary, last_analyzed_at,
  compare_label, compare_status, regulatory_complexity,
  flood_exposure_summary, environmental_summary, infrastructure_summary, key_difference
) values (
  'a0000000-0000-4000-8000-000000000004',
  'a0000000-0000-4000-8000-000000000003',
  'Ashford Residencial',
  '{"es": "Multifamiliar", "en": "Multifamily"}'::jsonb,
  '{"es": "40–55 unidades", "en": "40–55 units"}'::jsonb,
  '$6M–$9M',
  '{"es": "Investigar más a fondo", "en": "Investigate further"}'::jsonb,
  '{"es": "El uso multifamiliar propuesto parece compatible con la sobreposición de uso mixto vigente sobre la clasificación comercial. Persisten preguntas sobre los estándares exactos de la sobreposición y la capacidad de servicios.", "en": "The proposed multifamily use appears compatible with the applicable mixed-use overlay on the commercial classification. Questions remain about the overlay''s exact standards and utility capacity."}'::jsonb,
  '2026-09-12T00:00:00Z',
  '{"es": "Propiedad B", "en": "Property B"}'::jsonb,
  'investigate',
  '{"es": "Moderada — aplica sobreposición de uso mixto", "en": "Moderate — mixed-use overlay applies"}'::jsonb,
  '{"es": "Ninguna zona mapeada", "en": "None mapped"}'::jsonb,
  '{"es": "Sin sobreposiciones de sensibilidad conocidas", "en": "No known sensitivity overlays"}'::jsonb,
  '{"es": "Mejores señales de infraestructura — mejora de servicios reciente confirmada cerca", "en": "Better infrastructure signals — confirmed recent utility upgrade nearby"}'::jsonb,
  '{"es": "Mejores señales de infraestructura", "en": "Better infrastructure signals"}'::jsonb
);

insert into findings (id, project_id, category, title, summary, confidence, why_found, why_matters, verification) values
  ('f1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000004', 'favorable',
   '{"es": "La zonificación permite uso multifamiliar", "en": "Zoning permits multifamily use"}'::jsonb,
   '{"es": "La sobreposición de uso mixto sobre la clasificación C-2 Comercial permite el desarrollo residencial multifamiliar.", "en": "The mixed-use overlay on the C-2 Comercial classification permits multifamily residential development."}'::jsonb,
   'high',
   '{"es": "La sobreposición de uso mixto vigente permite uso residencial multifamiliar sobre la clasificación comercial base.", "en": "The applicable mixed-use overlay permits multifamily residential use on top of the base commercial classification."}'::jsonb,
   '{"es": "Un uso permitido por la sobreposición vigente reduce el riesgo de titularidad comparado con un uso que requiere variación.", "en": "A use permitted under the applicable overlay reduces entitlement risk compared to a use requiring a variance."}'::jsonb,
   'Recommended'),

  ('f1000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000004', 'favorable',
   '{"es": "Sin exposición a zona de inundación mapeada", "en": "No exposure to a mapped flood zone"}'::jsonb,
   '{"es": "La parcela no interseca ninguna zona de inundación mapeada por FEMA.", "en": "The parcel does not intersect any FEMA-mapped flood zone."}'::jsonb,
   'high',
   '{"es": "El mapeo de inundación de FEMA no muestra ninguna zona de inundación designada que interseque esta parcela.", "en": "FEMA flood mapping shows no designated flood zone intersecting this parcel."}'::jsonb,
   '{"es": "La ausencia de exposición a zona de inundación simplifica el diseño del sitio y reduce el riesgo de costo de construcción.", "en": "Absence of flood-zone exposure simplifies site design and reduces construction cost risk."}'::jsonb,
   'Optional'),

  ('f1000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000004', 'favorable',
   '{"es": "Mejora reciente de infraestructura de servicios cercana confirmada", "en": "Recent nearby utility infrastructure upgrade confirmed"}'::jsonb,
   '{"es": "Se confirmó una mejora reciente de servicios de PRASA/LUMA en el área circundante.", "en": "A recent PRASA/LUMA service upgrade was confirmed in the surrounding area."}'::jsonb,
   'medium',
   '{"es": "Los récords públicos indican una mejora reciente en la distribución de servicios cerca de este corredor.", "en": "Public records indicate a recent utility distribution upgrade near this corridor."}'::jsonb,
   '{"es": "Las mejoras de infraestructura cercanas son una señal positiva para la capacidad de servicios, aunque la capacidad específica de la parcela aún requiere confirmación.", "en": "Nearby infrastructure upgrades are a positive signal for utility capacity, though parcel-specific capacity still requires confirmation."}'::jsonb,
   'Recommended'),

  ('f1000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004', 'investigate',
   '{"es": "Estándares exactos de la sobreposición de uso mixto", "en": "Exact mixed-use overlay standards"}'::jsonb,
   '{"es": "El Reglamento Conjunto aplica la sobreposición de uso mixto, pero los estándares exactos de estacionamiento y retranqueo para el componente multifamiliar no están confirmados.", "en": "Reglamento Conjunto applies the mixed-use overlay, but the exact parking and setback standards for the multifamily component are unconfirmed."}'::jsonb,
   'medium',
   '{"es": "La sobreposición de uso mixto aplicable a este corredor podría añadir estándares de diseño adicionales más allá de la clasificación base C-2.", "en": "The mixed-use overlay applicable to this corridor may layer additional design standards beyond the base C-2 classification."}'::jsonb,
   '{"es": "Los requisitos de la sobreposición podrían afectar el número de unidades alcanzable y la eficiencia del plano de sitio.", "en": "Overlay requirements could affect achievable unit count and site plan efficiency."}'::jsonb,
   'Recommended'),

  ('f1000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000004', 'unknown',
   '{"es": "Capacidad de servicios a nivel de parcela no confirmada", "en": "Exact parcel-level utility capacity not confirmed"}'::jsonb,
   '{"es": "La capacidad de agua y electricidad a nivel de parcela no se puede establecer con datos públicos.", "en": "Water and electrical capacity at the parcel level cannot be established from public data."}'::jsonb,
   'none',
   '{"es": "PRASA y LUMA no publican datos de capacidad a nivel de parcela; solo hay cobertura general de territorio de servicio disponible.", "en": "PRASA and LUMA do not publish parcel-level capacity data; only general service-territory coverage is available."}'::jsonb,
   '{"es": "Las limitaciones de capacidad podrían requerir mejoras de infraestructura fuera del predio que afecten la economía del proyecto.", "en": "Capacity constraints could require off-site utility upgrades affecting project economics."}'::jsonb,
   'Required');

insert into finding_sources (finding_id, source_id) values
  ('f1000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000003'), -- calificacion
  ('f1000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000001'), -- fema
  ('f1000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000004'), -- prasa
  ('f1000000-0000-4000-8000-000000000004', '50000000-0000-4000-8000-000000000002'), -- rc2023
  ('f1000000-0000-4000-8000-000000000005', '50000000-0000-4000-8000-000000000004'); -- prasa

insert into questions (project_id, related_finding_id, title, why_it_matters, next_step) values
  ('a0000000-0000-4000-8000-000000000004', 'f1000000-0000-4000-8000-000000000004',
   '{"es": "Alcance exacto de la sobreposición de uso mixto", "en": "Exact scope of the mixed-use overlay"}'::jsonb,
   '{"es": "Determina qué estándares de diseño adicionales aplican.", "en": "Determines which additional design standards apply."}'::jsonb,
   '{"es": "Solicitar una determinación de zonificación al municipio.", "en": "Request a zoning determination from the municipality."}'::jsonb),

  ('a0000000-0000-4000-8000-000000000004', 'f1000000-0000-4000-8000-000000000005',
   '{"es": "Confirmación de capacidad de servicios", "en": "Utility capacity confirmation"}'::jsonb,
   '{"es": "Necesaria para confirmar la capacidad para el programa de uso multifamiliar propuesto.", "en": "Needed to confirm capacity for the proposed multifamily program."}'::jsonb,
   '{"es": "Solicitar una carta de disponibilidad a PRASA/LUMA.", "en": "Request an availability letter from PRASA/LUMA."}'::jsonb);

-- ---------------------------------------------------------------------
-- 410 Isla Verde Avenue, Carolina — hospitality, coastal constraints
-- ---------------------------------------------------------------------
insert into parcels (id, address, municipality, cadastral, parcel_area_sqm, parcel_area_acres)
values (
  'a0000000-0000-4000-8000-000000000005',
  '410 Isla Verde Avenue',
  'Carolina, Puerto Rico',
  '058-013-221-11-903',
  8498,
  2.1
);

insert into projects (
  id, parcel_id, name, project_type, units_label, investment_label,
  feasibility_status, feasibility_summary, last_analyzed_at,
  compare_label, compare_status, regulatory_complexity,
  flood_exposure_summary, environmental_summary, infrastructure_summary, key_difference
) values (
  'a0000000-0000-4000-8000-000000000006',
  'a0000000-0000-4000-8000-000000000005',
  'Isla Verde Beachfront Hotel',
  '{"es": "Hotelero", "en": "Hospitality"}'::jsonb,
  '{"es": "120 habitaciones", "en": "120 rooms"}'::jsonb,
  '$25M–$35M',
  '{"es": "Posibles limitaciones", "en": "Potential constraints"}'::jsonb,
  '{"es": "El uso hotelero propuesto es compatible con la zonificación turística vigente, pero la parcela enfrenta limitaciones costeras significativas — incluyendo exposición a la Zona VE de FEMA y un retranqueo costero confirmado — que requieren atención temprana en el diseño.", "en": "The proposed hospitality use is compatible with the applicable tourism zoning, but the parcel faces significant coastal constraints — including FEMA Zone VE exposure and a confirmed coastal setback — that require early design attention."}'::jsonb,
  '2026-09-08T00:00:00Z',
  '{"es": "Propiedad C", "en": "Property C"}'::jsonb,
  'constraint',
  '{"es": "Mayor — aplican tanto el retranqueo costero como la sobreposición de altura", "en": "Higher — coastal setback and height overlay both apply"}'::jsonb,
  '{"es": "Zona VE — zona costera de alto riesgo de inundación", "en": "Zone VE — high-hazard coastal flood zone"}'::jsonb,
  '{"es": "Retranqueo costero confirmado como aplicable", "en": "Coastal setback confirmed applicable"}'::jsonb,
  '{"es": "Capacidad de servicios desconocida; acceso vial limitado", "en": "Utility capacity unknown; road access limited"}'::jsonb,
  '{"es": "Más limitaciones sin resolver", "en": "More unresolved constraints"}'::jsonb
);

insert into findings (id, project_id, category, title, summary, confidence, why_found, why_matters, verification) values
  ('f2000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000006', 'favorable',
   '{"es": "La zonificación turística permite uso hotelero", "en": "Tourism zoning permits hospitality use"}'::jsonb,
   '{"es": "La clasificación T-3 Turístico permite el desarrollo hotelero por derecho.", "en": "The T-3 Turístico classification permits hospitality development by right."}'::jsonb,
   'high',
   '{"es": "Clasificación: T-3 Turístico — uso hotelero permitido por derecho hasta los límites de densidad y altura aplicables.", "en": "Classification: T-3 Turístico — hospitality use permitted by right up to applicable density and height limits."}'::jsonb,
   '{"es": "Un uso hotelero permitido por derecho reduce el riesgo de titularidad comparado con un uso que requiere variación.", "en": "A permitted-by-right hospitality use reduces entitlement risk compared to a use requiring a variance."}'::jsonb,
   'Recommended'),

  ('f2000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000006', 'constraint',
   '{"es": "Zona de inundación costera de alto riesgo (VE)", "en": "High-hazard coastal flood zone (VE)"}'::jsonb,
   '{"es": "La parcela se encuentra dentro de la Zona VE de FEMA, una zona costera de alto riesgo de inundación.", "en": "The parcel falls within FEMA''s Zone VE, a high-hazard coastal flood zone."}'::jsonb,
   'high',
   '{"es": "El mapeo de inundación de FEMA ubica esta parcela dentro de la Zona VE, que requiere consideraciones de diseño de construcción elevada y acción de oleaje.", "en": "FEMA flood mapping places this parcel within Zone VE, which requires elevated construction and wave-action design considerations."}'::jsonb,
   '{"es": "Los requisitos de construcción de la Zona VE afectan significativamente el diseño de la fundación, el costo y el seguro.", "en": "Zone VE construction requirements significantly affect foundation design, cost, and insurance."}'::jsonb,
   'Required'),

  ('f2000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000006', 'constraint',
   '{"es": "Retranqueo costero confirmado como aplicable", "en": "Coastal setback confirmed applicable"}'::jsonb,
   '{"es": "El retranqueo costero ambiental está confirmado como aplicable a esta parcela.", "en": "The environmental coastal setback is confirmed applicable to this parcel."}'::jsonb,
   'high',
   '{"es": "El análisis de retranqueo costero de la Junta de Calidad Ambiental confirma su aplicabilidad a esta parcela específica, no solo al área circundante.", "en": "Junta de Calidad Ambiental''s coastal setback screening confirms applicability to this specific parcel, not just the surrounding area."}'::jsonb,
   '{"es": "Un retranqueo costero confirmado reduce la envolvente edificable y podría requerir un rediseño del plano de sitio.", "en": "A confirmed coastal setback reduces the buildable envelope and may require redesign of the site plan."}'::jsonb,
   'Required'),

  ('f2000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000006', 'constraint',
   '{"es": "Sobreposición de altura costera limita la masa edificable", "en": "Coastal height overlay limits buildable massing"}'::jsonb,
   '{"es": "Una restricción de altura costera aplica específicamente a esta parcela.", "en": "A coastal height restriction applies specifically to this parcel."}'::jsonb,
   'medium',
   '{"es": "El mapa de calificación confirma que el límite de la sobreposición de altura costera se extiende hasta esta parcela.", "en": "The classification map confirms the coastal height overlay boundary extends onto this parcel."}'::jsonb,
   '{"es": "La restricción de altura limita el número de unidades alcanzable y podría requerir cambios en el diseño de la masa edificada.", "en": "The height restriction limits achievable unit count and may require design changes to the building massing."}'::jsonb,
   'Recommended'),

  ('f2000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000006', 'investigate',
   '{"es": "Capacidad de acceso vial limitada", "en": "Limited road access capacity"}'::jsonb,
   '{"es": "El acceso vial existente podría no soportar el volumen de tráfico hotelero proyectado.", "en": "Existing road access may not support projected hospitality traffic volume."}'::jsonb,
   'medium',
   '{"es": "La vía de frente está clasificada como vía local, no arterial, y podría no tener capacidad para el tráfico hotelero proyectado.", "en": "The frontage road is classified as a local road, not an arterial, and may not have capacity for projected hotel traffic."}'::jsonb,
   '{"es": "Una capacidad vial insuficiente podría requerir mejoras viales fuera del predio como condición de permiso.", "en": "Insufficient road capacity could require off-site roadway improvements as a permitting condition."}'::jsonb,
   'Recommended'),

  ('f2000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000006', 'unknown',
   '{"es": "Capacidad de servicios públicos no determinada", "en": "Utility capacity not determined"}'::jsonb,
   '{"es": "La capacidad de agua y electricidad para un proyecto de escala hotelera no se puede establecer con datos públicos.", "en": "Water and electrical capacity for a hospitality-scale project cannot be established from public data."}'::jsonb,
   'none',
   '{"es": "PRASA y LUMA no publican datos de capacidad a nivel de parcela para este corredor.", "en": "PRASA and LUMA do not publish parcel-level capacity data for this corridor."}'::jsonb,
   '{"es": "La demanda de agua y electricidad de escala hotelera podría exceder la capacidad disponible, requiriendo mejoras fuera del predio.", "en": "Hospitality-scale water and electrical demand may exceed available capacity, requiring off-site upgrades."}'::jsonb,
   'Required'),

  ('f2000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000006', 'unknown',
   '{"es": "Historial de permisos no disponible", "en": "Permit history not available"}'::jsonb,
   '{"es": "No hay historial de permisos público disponible para esta parcela.", "en": "No public permit history is available for this parcel."}'::jsonb,
   'none',
   '{"es": "La búsqueda pública de permisos no arroja récords para esta parcela; no se puede confirmar actividad de permisos histórica.", "en": "Public permit search returns no records for this parcel; historical permitting activity cannot be confirmed."}'::jsonb,
   '{"es": "La ausencia de datos de historial de permisos significa que no se pueden descartar posibles problemas de titularidad o cumplimiento solo con fuentes públicas.", "en": "Absence of permit history data means potential title or compliance issues cannot be ruled out from public sources alone."}'::jsonb,
   'Recommended');

insert into finding_sources (finding_id, source_id) values
  ('f2000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000003'), -- calificacion
  ('f2000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000001'), -- fema
  ('f2000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000009'), -- junta-amb
  ('f2000000-0000-4000-8000-000000000004', '50000000-0000-4000-8000-000000000003'), -- calificacion
  ('f2000000-0000-4000-8000-000000000005', '50000000-0000-4000-8000-000000000006'), -- dtop
  ('f2000000-0000-4000-8000-000000000006', '50000000-0000-4000-8000-000000000004'), -- prasa
  ('f2000000-0000-4000-8000-000000000007', '50000000-0000-4000-8000-000000000007'); -- permits

insert into questions (project_id, related_finding_id, title, why_it_matters, next_step) values
  ('a0000000-0000-4000-8000-000000000006', 'f2000000-0000-4000-8000-000000000002',
   '{"es": "Elevación base de inundación exacta", "en": "Exact base flood elevation"}'::jsonb,
   '{"es": "Determina los requisitos específicos de elevación de construcción bajo la Zona VE.", "en": "Determines specific construction elevation requirements under Zone VE."}'::jsonb,
   '{"es": "Encargar un certificado de elevación de inundación específico del sitio.", "en": "Commission a site-specific flood elevation certificate."}'::jsonb),

  ('a0000000-0000-4000-8000-000000000006', 'f2000000-0000-4000-8000-000000000003',
   '{"es": "Aplicabilidad exacta del retranqueo costero", "en": "Exact applicability of the coastal setback"}'::jsonb,
   '{"es": "Determina la envolvente edificable precisa.", "en": "Determines the precise buildable envelope."}'::jsonb,
   '{"es": "Solicitar una determinación formal de retranqueo costero.", "en": "Request a formal coastal setback determination."}'::jsonb),

  ('a0000000-0000-4000-8000-000000000006', 'f2000000-0000-4000-8000-000000000004',
   '{"es": "Alcance exacto de la restricción de altura costera", "en": "Exact scope of the coastal height restriction"}'::jsonb,
   '{"es": "Determina la altura máxima alcanzable y la masa edificable.", "en": "Determines maximum achievable building height and massing."}'::jsonb,
   '{"es": "Encargar una revisión de cumplimiento de zonificación con un planificador licenciado.", "en": "Commission a zoning compliance review with a licensed planner."}'::jsonb),

  ('a0000000-0000-4000-8000-000000000006', 'f2000000-0000-4000-8000-000000000006',
   '{"es": "Capacidad de servicios públicos", "en": "Utility capacity"}'::jsonb,
   '{"es": "Necesaria para dimensionar la demanda de agua/electricidad de escala hotelera.", "en": "Needed to size hospitality-scale water/electrical demand."}'::jsonb,
   '{"es": "Solicitar cartas de disponibilidad a PRASA y LUMA.", "en": "Request availability letters from PRASA and LUMA."}'::jsonb),

  ('a0000000-0000-4000-8000-000000000006', 'f2000000-0000-4000-8000-000000000007',
   '{"es": "Historial de permisos y cumplimiento", "en": "Permit and compliance history"}'::jsonb,
   '{"es": "Necesario para descartar problemas de titularidad o cumplimiento antes de la debida diligencia.", "en": "Needed to rule out title or compliance issues before due diligence."}'::jsonb,
   '{"es": "Solicitar una búsqueda formal de historial de permisos a OGPe.", "en": "Request a formal permit history search from OGPe."}'::jsonb);

-- ---------------------------------------------------------------------
-- back-fill the demo project's (123 Example Avenue) own comparison
-- fields, so all three properties are complete under the new columns
-- ---------------------------------------------------------------------
update projects set
  compare_label = '{"es": "Propiedad A", "en": "Property A"}'::jsonb,
  compare_status = 'favorable',
  regulatory_complexity = '{"es": "Complejidad regulatoria aparentemente menor", "en": "Lower apparent regulatory complexity"}'::jsonb,
  flood_exposure_summary = '{"es": "Parcial — la zona AE interseca ~40% de la parcela", "en": "Partial — Zone AE intersects ~40% of parcel"}'::jsonb,
  environmental_summary = '{"es": "Amortiguamiento costero cercano, aplicabilidad sin confirmar", "en": "Coastal buffer nearby, applicability unconfirmed"}'::jsonb,
  infrastructure_summary = '{"es": "Acceso vial fuerte; capacidad de servicios desconocida", "en": "Road access strong; utility capacity unknown"}'::jsonb,
  key_difference = '{"es": "Complejidad regulatoria aparentemente menor", "en": "Lower apparent regulatory complexity"}'::jsonb
where id = 'a0000000-0000-4000-8000-000000000002';
