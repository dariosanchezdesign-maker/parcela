-- Parcela — migration 003: fields needed for the Explore map
--
-- Explore shows a property as a dot on an island-wide overview map,
-- filterable by land-use classification, potential use, flood-zone
-- label, and a qualitative infrastructure rating. Like migration 002's
-- comparison fields, these are editorial/positional attributes, not raw
-- Finding rows:
--   - map position and zoning classification describe the physical
--     parcel itself, so they live on `parcels`
--   - flood-zone label and infrastructure rating are short editorial
--     summaries (same category as migration 002's `flood_exposure_
--     summary`/`infrastructure_summary`, just as a clean filterable
--     label instead of a sentence), so they live on `projects`
--
-- `potentialUse` needs no new column — `projects.project_type->>'en'`
-- already is that canonical English value. `constraints` (boolean)
-- needs no new column either — it's `constraintsCount > 0`, computed
-- the same way Compare already computes it. `status` reuses migration
-- 002's `compare_status`. `sizeAcres` reuses `parcels.parcel_area_acres`.
--
-- Purely additive: nullable columns, no existing data or queries break.

alter table parcels add column if not exists explore_x numeric;              -- position on the 860x500 Explore overview map
alter table parcels add column if not exists explore_y numeric;
alter table parcels add column if not exists land_use_classification text;   -- e.g. "R-3 Residencial General" (not bilingual — a zoning code label)

alter table projects add column if not exists flood_zone_label text;         -- e.g. "Zone AE" / "Zone VE" / "None mapped" (canonical, for filtering)
alter table projects add column if not exists infrastructure_rating text;    -- "Strong" / "Moderate" / "Weak"
