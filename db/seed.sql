-- Parcela — seed data mirroring the existing prototype's demo property
-- (123 Example Avenue / Condado Multifamily) from js/data/mockData.js,
-- so the real backend starts out equivalent to what the static site
-- already shows. Run after schema.sql, against the same project.
--
-- Fixed UUIDs are used throughout (rather than gen_random_uuid()) purely
-- so this script's own foreign-key references can be written literally
-- without a round trip — they have no other significance.
--
-- If you already ran an earlier version of this file (one whose Spanish
-- text was missing accents), run this first to clear it out cleanly:
--   TRUNCATE TABLE parcels, sources CASCADE;
-- then run this corrected version.

-- ---------------------------------------------------------------------
-- parcel + project
-- ---------------------------------------------------------------------
insert into parcels (id, address, municipality, cadastral, parcel_area_sqm, parcel_area_acres, map_geometry)
values (
  'a0000000-0000-4000-8000-000000000001',
  '123 Example Avenue',
  'San Juan, Puerto Rico',
  '115-042-018-09-901',
  4180,
  1.03,
  '{
    "viewBox": "0 0 640 520",
    "roads": [{"points": "0,150 640,120", "width": 10}, {"points": "230,0 260,520", "width": 7}],
    "parcel": {"points": "200,175 355,165 365,300 210,315"},
    "flood": {"points": "200,255 365,240 365,300 210,315"},
    "zoning": {"code": "R-3", "points": "150,120 460,100 470,340 160,360"},
    "environmental": {"points": "20,330 620,300 620,420 20,450"}
  }'::jsonb
);

insert into projects (id, parcel_id, name, project_type, units_label, investment_label, feasibility_status, feasibility_summary, last_analyzed_at)
values (
  'a0000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000001',
  'Condado Multifamily',
  '{"es": "Multifamiliar", "en": "Multifamily"}'::jsonb,
  '{"es": "60–80 unidades", "en": "60–80 units"}'::jsonb,
  '$10M–$15M',
  '{"es": "Vale la pena investigar", "en": "Worth investigating"}'::jsonb,
  '{"es": "El uso multifamiliar propuesto parece potencialmente compatible con la información regulatoria disponible. Varios factores requieren verificación adicional antes de una debida diligencia significativa.", "en": "The proposed multifamily use appears potentially compatible with the available regulatory information. Several factors require additional verification before significant due diligence."}'::jsonb,
  '2026-09-18T00:00:00Z'
);

-- ---------------------------------------------------------------------
-- sources
-- ---------------------------------------------------------------------
insert into sources (id, name, agency, document, section, published_at) values
  ('50000000-0000-4000-8000-000000000001', 'FEMA Flood Insurance Rate Map', 'FEMA / Puerto Rico GIS', 'FIRM Panel 72000C0245J', 'Zone AE delineation', 'Mar 2024'),
  ('50000000-0000-4000-8000-000000000002', 'Reglamento Conjunto 2023', 'Junta de Planificación de Puerto Rico', 'Reglamento Conjunto para la Evaluación y Expedición de Permisos', 'Art. 5.2 — Multifamily density standards', '2023 ed.'),
  ('50000000-0000-4000-8000-000000000003', 'Mapa de Calificación', 'Junta de Planificación de Puerto Rico', 'Land Use Classification Map, San Juan', 'Parcel 115-042-018', 'Jan 2022'),
  ('50000000-0000-4000-8000-000000000004', 'PRASA Service Territory Data', 'Puerto Rico Aqueduct and Sewer Authority', 'Service availability layer', 'San Juan metro', '2021 (last public update)'),
  ('50000000-0000-4000-8000-000000000005', 'LUMA Grid Infrastructure', 'LUMA Energy', 'Distribution capacity disclosure', '—', 'Not publicly available'),
  ('50000000-0000-4000-8000-000000000006', 'DTOP Road Classification', 'Departamento de Transportación y Obras Públicas', 'PR-1 corridor classification', 'San Juan segment', '2020'),
  ('50000000-0000-4000-8000-000000000007', 'Permit Activity Records', 'OGPe (Oficina de Gerencia de Permisos)', 'Public permit search export', 'Parcel 115-042-018', '2022–2025'),
  ('50000000-0000-4000-8000-000000000008', 'USGS Topographic Data', 'U.S. Geological Survey', '3DEP elevation dataset', 'San Juan quad', '2023'),
  ('50000000-0000-4000-8000-000000000009', 'Junta de Calidad Ambiental — screening layer', 'Junta de Calidad Ambiental', 'Environmental sensitivity screening', 'Coastal buffer overlay', '2021');

-- ---------------------------------------------------------------------
-- findings
-- ---------------------------------------------------------------------
insert into findings (id, project_id, category, title, summary, confidence, why_found, why_matters, verification) values
  ('f0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'favorable',
   '{"es": "La zonificación permite uso multifamiliar", "en": "Zoning permits multifamily use"}'::jsonb,
   '{"es": "La clasificación de uso de suelo de la parcela generalmente permite el desarrollo residencial multifamiliar.", "en": "The parcel''s land-use classification generally permits multifamily residential development."}'::jsonb,
   'high',
   '{"es": "Clasificación: R-3 (Residencial General) — multifamiliar permitido por derecho hasta los límites de densidad aplicables.", "en": "Classification: R-3 (Residencial General) — multifamily permitted by right up to applicable density limits."}'::jsonb,
   '{"es": "Un uso permitido por derecho reduce considerablemente el riesgo de titularidad y el tiempo del proceso, comparado con un uso que requiere variación o consulta.", "en": "A permitted-by-right use materially reduces entitlement risk and timeline compared to a use requiring a variance or consultation."}'::jsonb,
   'Recommended'),

  ('f0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'favorable',
   '{"es": "Frente directo sobre una vía arterial clasificada", "en": "Direct frontage on a classified arterial"}'::jsonb,
   '{"es": "La parcela tiene frente a una arteria secundaria clasificada por DTOP con acceso de encintado existente.", "en": "The parcel fronts a DTOP-classified secondary arterial with existing curb access."}'::jsonb,
   'high',
   '{"es": "La vía de frente está clasificada como arteria secundaria (segmento del corredor PR-1) con un corte de encintado existente que sirve a la parcela.", "en": "Frontage road is classified as a secondary arterial (PR-1 corridor segment) with an existing curb cut serving the parcel."}'::jsonb,
   '{"es": "Un acceso arterial establecido simplifica el diseño de entrada/salida del sitio y el alcance del estudio de tránsito.", "en": "Established arterial access simplifies site ingress/egress design and traffic study scoping."}'::jsonb,
   'Optional'),

  ('f0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', 'favorable',
   '{"es": "Sin historial de permisos adversos en récord", "en": "No adverse permit history on record"}'::jsonb,
   '{"es": "Los récords públicos de permisos no muestran denegaciones ni acciones de cumplimiento vinculadas a esta parcela.", "en": "Public permit records show no denials or enforcement actions tied to this parcel."}'::jsonb,
   'medium',
   '{"es": "La búsqueda de permisos muestra una consulta de planificación inactiva (2023) y ningún récord de denegación, revocación o cumplimiento.", "en": "Permit search returns one inactive planning consultation (2023) and no denial, revocation, or enforcement record."}'::jsonb,
   '{"es": "La ausencia de historial adverso es una señal levemente positiva, pero un récord limpio no confirma la viabilidad por sí solo.", "en": "Absence of adverse history is a mild positive signal, but a clean record does not itself confirm feasibility."}'::jsonb,
   'Recommended'),

  ('f0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', 'constraint',
   '{"es": "Exposición a inundación", "en": "Flood exposure"}'::jsonb,
   '{"es": "La parcela interseca áreas mapeadas de riesgo de inundación.", "en": "The parcel intersects mapped flood-risk areas."}'::jsonb,
   'high',
   '{"es": "Zona de inundación: AE. Aproximadamente el 40% del límite sur de la parcela cae dentro de la zona AE mapeada.", "en": "Flood zone: AE. Approximately 40% of the parcel''s southern boundary falls within the mapped AE zone."}'::jsonb,
   '{"es": "Los requisitos de inundación pueden afectar el diseño del sitio, el proceso de permisos, los requisitos de construcción y la economía del desarrollo.", "en": "Flood requirements may affect site design, permitting, construction requirements, and development economics."}'::jsonb,
   'Recommended'),

  ('f0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000002', 'investigate',
   '{"es": "Techo de densidad aún no establecido", "en": "Density ceiling not yet established"}'::jsonb,
   '{"es": "El estándar de densidad aplicable a esta clasificación depende de hallazgos de infraestructura aún no confirmados.", "en": "The applicable density standard for this classification depends on infrastructure findings not yet confirmed."}'::jsonb,
   'medium',
   '{"es": "El Reglamento Conjunto 2023 vincula los bonos de densidad de R-3 a la capacidad de infraestructura confirmada, la cual no se ha establecido para esta parcela.", "en": "Reglamento Conjunto 2023 ties R-3 density bonuses to confirmed infrastructure capacity, which has not been established for this parcel."}'::jsonb,
   '{"es": "La meta de 60–80 unidades podría exceder, alcanzar o quedar por debajo del techo permitido por derecho, dependiendo de esa confirmación.", "en": "The 60–80 unit target may exceed, meet, or fall under the as-of-right ceiling depending on that confirmation."}'::jsonb,
   'Recommended'),

  ('f0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000002', 'investigate',
   '{"es": "Posible sobreposición de altura cerca del corredor", "en": "Possible height overlay near corridor"}'::jsonb,
   '{"es": "La parcela está cerca de un corredor que podría tener una restricción de altura adicional.", "en": "The parcel sits close to a corridor that may carry an additional height restriction."}'::jsonb,
   'low',
   '{"es": "El mapa de calificación muestra un límite de sobreposición cercano; no está claro en los datos disponibles si se extiende hasta esta parcela.", "en": "The classification map shows a nearby overlay boundary; it is unclear from available data whether it extends onto this parcel."}'::jsonb,
   '{"es": "Una sobreposición de altura podría limitar el número de unidades o requerir cambios en el diseño de la masa edificada si aplica.", "en": "A height overlay could constrain unit count or require design massing changes if it applies."}'::jsonb,
   'Recommended'),

  ('f0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000002', 'investigate',
   '{"es": "Razón de estacionamiento requiere confirmación", "en": "Parking ratio needs confirmation"}'::jsonb,
   '{"es": "La razón de estacionamiento aplicable depende de una determinación de proximidad a transporte colectivo no disponible en los datos actuales.", "en": "Applicable parking ratio depends on a transit-proximity determination not available in current data."}'::jsonb,
   'low',
   '{"es": "El Reglamento Conjunto permite una razón de estacionamiento reducida cerca de corredores de transporte colectivo que califiquen; la calificación de esta parcela no está determinada aquí.", "en": "Reglamento Conjunto allows a reduced parking ratio near qualifying transit corridors; qualification for this parcel is undetermined here."}'::jsonb,
   '{"es": "La razón de estacionamiento afecta significativamente la eficiencia del plano de sitio y el número de unidades alcanzable en una parcela de 1.03 cuerdas.", "en": "Parking ratio materially affects site plan efficiency and achievable unit count on a 1.03-acre parcel."}'::jsonb,
   'Recommended'),

  ('f0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000002', 'investigate',
   '{"es": "Consulta de planificación previa en expediente", "en": "Prior planning consultation on file"}'::jsonb,
   '{"es": "Existe una consulta de planificación de 2023 para esta parcela sin resumen de resolución público.", "en": "A 2023 planning consultation exists for this parcel with no public resolution summary."}'::jsonb,
   'medium',
   '{"es": "El récord muestra una consulta de planificación abierta en 2023; el resultado o resolución no se detalla en la exportación pública.", "en": "Record shows a planning consultation opened in 2023; outcome/resolution is not detailed in the public export."}'::jsonb,
   '{"es": "Las consultas previas a veces revelan limitaciones que no son visibles en los datos de clasificación o SIG.", "en": "Prior consultations sometimes surface constraints not otherwise visible in classification or GIS data."}'::jsonb,
   'Recommended'),

  ('f0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000002', 'unknown',
   '{"es": "Capacidad de servicios públicos", "en": "Utility capacity"}'::jsonb,
   '{"es": "La capacidad de agua y electricidad para una carga de 60–80 unidades no se puede establecer con datos públicos.", "en": "Water and electrical capacity for a 60-80 unit load cannot be established from public data."}'::jsonb,
   'none',
   '{"es": "PRASA y LUMA no publican datos de capacidad a nivel de parcela; solo hay cobertura general de territorio de servicio disponible.", "en": "PRASA and LUMA do not publish parcel-level capacity data; only general service-territory coverage is available."}'::jsonb,
   '{"es": "Las limitaciones de capacidad pueden requerir mejoras costosas de infraestructura fuera del predio que afecten la economía del proyecto.", "en": "Capacity constraints can require costly off-site utility upgrades that affect project economics."}'::jsonb,
   'Required'),

  ('f0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000002', 'unknown',
   '{"es": "Condiciones de suelo y geotécnicas", "en": "Soil and geotechnical conditions"}'::jsonb,
   '{"es": "No hay datos geotécnicos disponibles para esta parcela en fuentes públicas.", "en": "No geotechnical data is available for this parcel in public sources."}'::jsonb,
   'none',
   '{"es": "Los datos de USGS proveen solo topografía regional; no hay sondeo de suelo ni informe geotécnico específico del sitio en expediente.", "en": "USGS data provides regional topography only; no site-specific soil boring or geotechnical report is on file."}'::jsonb,
   '{"es": "Las condiciones del suelo afectan directamente el tipo de fundación y el costo, especialmente para una estructura multifamiliar.", "en": "Soil conditions directly affect foundation type and cost, especially for a multifamily structure."}'::jsonb,
   'Required'),

  ('f0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000002', 'unknown',
   '{"es": "Limitaciones ambientales específicas del sitio", "en": "Site-specific environmental constraints"}'::jsonb,
   '{"es": "Existe una zona de amortiguamiento costero cercana; su aplicabilidad específica al sitio no está confirmada.", "en": "A coastal buffer overlay exists nearby; site-specific applicability is unconfirmed."}'::jsonb,
   'low',
   '{"es": "El análisis regional muestra una sobreposición de sensibilidad de amortiguamiento costero en el área circundante; la aplicabilidad a nivel de parcela no está confirmada.", "en": "Regional screening shows a coastal-buffer sensitivity overlay in the surrounding area; parcel-level applicability is not confirmed."}'::jsonb,
   '{"es": "Si aplica, un amortiguamiento ambiental podría limitar el área edificable o requerir una evaluación ambiental.", "en": "If applicable, an environmental buffer could constrain buildable area or require an environmental assessment."}'::jsonb,
   'Required');

-- ---------------------------------------------------------------------
-- finding <-> source links (1:1 today, matching the current prototype;
-- the join table already supports a finding citing multiple sources)
-- ---------------------------------------------------------------------
insert into finding_sources (finding_id, source_id) values
  ('f0000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000003'), -- zoning-compat -> calificacion
  ('f0000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000006'), -- road-access -> dtop
  ('f0000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000007'), -- no-recent-denials -> permits
  ('f0000000-0000-4000-8000-000000000004', '50000000-0000-4000-8000-000000000001'), -- flood-exposure -> fema
  ('f0000000-0000-4000-8000-000000000005', '50000000-0000-4000-8000-000000000002'), -- density-tbd -> rc2023
  ('f0000000-0000-4000-8000-000000000006', '50000000-0000-4000-8000-000000000003'), -- height-overlay -> calificacion
  ('f0000000-0000-4000-8000-000000000007', '50000000-0000-4000-8000-000000000002'), -- parking-standard -> rc2023
  ('f0000000-0000-4000-8000-000000000008', '50000000-0000-4000-8000-000000000007'), -- consultation-history -> permits
  ('f0000000-0000-4000-8000-000000000009', '50000000-0000-4000-8000-000000000004'), -- utility-capacity -> prasa
  ('f0000000-0000-4000-8000-000000000010', '50000000-0000-4000-8000-000000000008'), -- soil-geology -> usgs
  ('f0000000-0000-4000-8000-000000000011', '50000000-0000-4000-8000-000000000009'); -- envt-sensitivity -> junta-amb

-- ---------------------------------------------------------------------
-- questions (the "unknowns" section)
-- ---------------------------------------------------------------------
insert into questions (project_id, related_finding_id, title, why_it_matters, next_step) values
  ('a0000000-0000-4000-8000-000000000002', 'f0000000-0000-4000-8000-000000000009',
   '{"es": "Capacidad de servicios públicos", "en": "Utility capacity"}'::jsonb,
   '{"es": "Las limitaciones de capacidad de agua y electricidad pueden forzar mejoras costosas fuera del predio que cambien la economía del proyecto de forma importante.", "en": "Water and electrical capacity constraints can force costly off-site upgrades that change project economics materially."}'::jsonb,
   '{"es": "Solicitar confirmación de disponibilidad/capacidad de servicios a PRASA y LUMA.", "en": "Request utility availability/capacity confirmation from PRASA and LUMA."}'::jsonb),

  ('a0000000-0000-4000-8000-000000000002', 'f0000000-0000-4000-8000-000000000005',
   '{"es": "Envolvente de desarrollo exacta", "en": "Exact development envelope"}'::jsonb,
   '{"es": "Altura, densidad y estacionamiento están señalados para investigación — juntos definen lo que realmente se puede construir.", "en": "Height, density, and parking are each flagged for investigation — together they define what can actually be built."}'::jsonb,
   '{"es": "Encargar una revisión de cumplimiento de zonificación con un planificador licenciado.", "en": "Commission a zoning compliance review with a licensed planner."}'::jsonb),

  ('a0000000-0000-4000-8000-000000000002', null,
   '{"es": "Ciertos requisitos municipales", "en": "Certain municipal requirements"}'::jsonb,
   '{"es": "San Juan podría aplicar requisitos locales adicionales más allá del Reglamento Conjunto de toda la isla.", "en": "San Juan may apply additional local requirements beyond the island-wide Reglamento Conjunto."}'::jsonb,
   '{"es": "Consultar directamente con la oficina de planificación municipal de San Juan.", "en": "Consult the San Juan municipal planning office directly."}'::jsonb),

  ('a0000000-0000-4000-8000-000000000002', 'f0000000-0000-4000-8000-000000000011',
   '{"es": "Limitaciones ambientales específicas del sitio", "en": "Site-specific environmental constraints"}'::jsonb,
   '{"es": "Una sobreposición de amortiguamiento costero cercana podría o no aplicar a esta parcela exacta.", "en": "A nearby coastal-buffer overlay may or may not apply to this exact parcel."}'::jsonb,
   '{"es": "Solicitar una determinación formal de evaluación ambiental.", "en": "Request a formal environmental screening determination."}'::jsonb);

-- ---------------------------------------------------------------------
-- permit_steps (the "next actions" section)
-- ---------------------------------------------------------------------
insert into permit_steps (project_id, step_order, title, why_it_matters, professional, evidence_finding_id, source_id) values
  ('a0000000-0000-4000-8000-000000000002', 1,
   '{"es": "Verificar requisitos de inundación", "en": "Verify flood requirements"}'::jsonb,
   '{"es": "La zona de inundación AE interseca parte de la parcela y puede afectar el diseño del sitio, los requisitos de construcción y el financiamiento.", "en": "Flood zone AE intersects part of the parcel and may affect site design, construction requirements, and financing."}'::jsonb,
   'Engineer', 'f0000000-0000-4000-8000-000000000004', '50000000-0000-4000-8000-000000000001'),

  ('a0000000-0000-4000-8000-000000000002', 2,
   '{"es": "Confirmar capacidad de servicios públicos", "en": "Confirm utility capacity"}'::jsonb,
   '{"es": "La capacidad de agua y electricidad para 60–80 unidades no se puede confirmar solo con datos públicos.", "en": "Water and electrical capacity for 60-80 units cannot be confirmed from public data alone."}'::jsonb,
   'Engineer', 'f0000000-0000-4000-8000-000000000009', '50000000-0000-4000-8000-000000000004'),

  ('a0000000-0000-4000-8000-000000000002', 3,
   '{"es": "Revisar reglamentación municipal", "en": "Review municipal regulations"}'::jsonb,
   '{"es": "San Juan podría añadir requisitos locales adicionales sobre la reglamentación de toda la isla.", "en": "San Juan may layer additional local requirements onto the island-wide regulation."}'::jsonb,
   'Planner', null, '50000000-0000-4000-8000-000000000002'),

  ('a0000000-0000-4000-8000-000000000002', 4,
   '{"es": "Que un arquitecto evalúe la envolvente de desarrollo", "en": "Have an architect evaluate the development envelope"}'::jsonb,
   '{"es": "Densidad, altura y estacionamiento están todos señalados para investigación — un arquitecto puede modelar números de unidades realistas bajo cada escenario.", "en": "Density, height, and parking are all flagged for investigation — an architect can model realistic unit counts under each scenario."}'::jsonb,
   'Architect', 'f0000000-0000-4000-8000-000000000005', '50000000-0000-4000-8000-000000000003');
