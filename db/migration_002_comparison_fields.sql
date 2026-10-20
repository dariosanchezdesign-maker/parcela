-- Parcela — migration 002: comparison/summary fields on `projects`
--
-- Compare and Properties list show short editorial rollups (regulatory
-- complexity, flood exposure, environmental, infrastructure, "key
-- difference") that aren't raw Finding rows — they're a synthesis step,
-- closer to `feasibility_summary` than to a `Finding`. `unknownsCount`
-- and `constraintsCount` are NOT stored here — they're computed live
-- from the real `questions`/`findings` rows so they can never drift out
-- of sync with the actual data.
--
-- Purely additive: nullable columns, no existing data or queries break.
-- Run this once against the same project that already has schema.sql
-- and seed.sql applied.

alter table projects add column if not exists compare_label jsonb;              -- {es, en}, e.g. "Property A"
alter table projects add column if not exists compare_status finding_category;  -- reuses the same enum as findings.category
alter table projects add column if not exists regulatory_complexity jsonb;      -- {es, en}
alter table projects add column if not exists flood_exposure_summary jsonb;     -- {es, en}
alter table projects add column if not exists environmental_summary jsonb;      -- {es, en}
alter table projects add column if not exists infrastructure_summary jsonb;     -- {es, en}
alter table projects add column if not exists key_difference jsonb;             -- {es, en}
