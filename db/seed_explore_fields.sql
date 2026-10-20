-- Parcela — populate the Explore fields (migration 003) for the three
-- properties that already exist in the database.
--
-- Values for map position, land-use classification, flood-zone label,
-- and infrastructure rating are reused verbatim from mockData.js's
-- original `exploreProperties` entries for these same three addresses,
-- for continuity with the prototype's earlier design — except
-- `potentialUse` for 88 Ashford Avenue, which mockData.js's
-- `exploreProperties` had inconsistently listed as "Mixed-use" while
-- its `comparisonProperties` (and this property's real seeded findings,
-- e.g. "Zoning permits multifamily use") say "Multifamily". Explore
-- reads `potentialUse` from `projects.project_type` directly rather
-- than a separate column, so it now automatically matches the real
-- findings instead of repeating that inconsistency.
--
-- Run after migration_003_explore_fields.sql.

update parcels set
  explore_x = 430,
  explore_y = 300,
  land_use_classification = 'R-3 Residencial General'
where id = 'a0000000-0000-4000-8000-000000000001'; -- 123 Example Avenue

update projects set
  flood_zone_label = 'Zone AE',
  infrastructure_rating = 'Moderate'
where id = 'a0000000-0000-4000-8000-000000000002'; -- 123 Example Avenue's project

update parcels set
  explore_x = 470,
  explore_y = 250,
  land_use_classification = 'C-2 Comercial'
where id = 'a0000000-0000-4000-8000-000000000003'; -- 88 Ashford Avenue

update projects set
  flood_zone_label = 'None mapped',
  infrastructure_rating = 'Strong'
where id = 'a0000000-0000-4000-8000-000000000004'; -- 88 Ashford Avenue's project

update parcels set
  explore_x = 700,
  explore_y = 210,
  land_use_classification = 'T-3 Turístico'
where id = 'a0000000-0000-4000-8000-000000000005'; -- 410 Isla Verde Avenue

update projects set
  flood_zone_label = 'Zone VE',
  infrastructure_rating = 'Weak'
where id = 'a0000000-0000-4000-8000-000000000006'; -- 410 Isla Verde Avenue's project
