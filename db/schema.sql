-- Parcela — core entity schema (Supabase / Postgres)
--
-- Models the ontology decided for the product: a Finding is never just
-- text — it is a row that points at the Source(s) that produced it and
-- the Project/Parcel it applies to. See tasks/todo.md, "Backend scaffold"
-- section, for the reasoning behind each table.
--
-- Bilingual text fields (title/summary/why/etc.) are stored as jsonb
-- shaped { "es": "...", "en": "..." }, matching the existing JS object
-- shape in js/data/mockData.js exactly, so seeding/reading needs no
-- reshaping on either side.
--
-- Run this once in the Supabase SQL editor for a fresh project, then run
-- seed.sql.

create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- ---------------------------------------------------------------------
-- parcels — a physical piece of land, independent of any project
-- ---------------------------------------------------------------------
create table if not exists parcels (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  municipality text not null,
  cadastral text,
  parcel_area_sqm numeric,
  parcel_area_acres numeric,
  map_geometry jsonb, -- arbitrary SVG-space geometry (viewBox, parcel outline, roads, etc.)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- projects — a parcel plus a set of assumptions (use, units, timeline)
-- ---------------------------------------------------------------------
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  parcel_id uuid not null references parcels(id) on delete cascade,
  name text not null,
  project_type jsonb not null,          -- {es, en}
  units_label jsonb,                    -- {es, en}, e.g. "60-80 units"
  investment_label text,                -- e.g. "$10M-$15M" (not bilingual, a figure)
  feasibility_status jsonb,             -- {es, en}, e.g. "Worth investigating"
  feasibility_summary jsonb,            -- {es, en}
  last_analyzed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- sources — a piece of government/public evidence, versioned so a
-- finding's confidence stays auditable after the underlying dataset changes
-- ---------------------------------------------------------------------
create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,                   -- e.g. "FEMA Flood Insurance Rate Map"
  agency text not null,                 -- e.g. "FEMA / Puerto Rico GIS"
  document text,                        -- e.g. "FIRM Panel 72000C0245J"
  section text,                         -- e.g. "Zone AE delineation"
  published_at text,                    -- source's own stated date (often just a year/quarter)
  retrieved_at timestamptz not null default now(), -- when Parcela actually pulled this data
  dataset_version text,                 -- hash or version string for the underlying dataset, when known
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- findings — never just text: always tied to a project and its source(s)
-- ---------------------------------------------------------------------
create type finding_category as enum ('favorable', 'investigate', 'constraint', 'unknown');
create type finding_confidence as enum ('none', 'low', 'medium', 'high');
create type finding_verification as enum ('Optional', 'Recommended', 'Required');

create table if not exists findings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  category finding_category not null,
  title jsonb not null,                 -- {es, en}
  summary jsonb not null,               -- {es, en}
  confidence finding_confidence not null default 'none',
  why_found jsonb,                      -- {es, en}
  why_matters jsonb,                    -- {es, en}
  verification finding_verification,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- a finding can cite more than one source
create table if not exists finding_sources (
  finding_id uuid not null references findings(id) on delete cascade,
  source_id uuid not null references sources(id) on delete restrict,
  primary key (finding_id, source_id)
);

-- ---------------------------------------------------------------------
-- questions — the "what don't we know yet" side; a finding can have zero
-- or more open questions attached to it (nullable: some questions aren't
-- tied to any specific finding, e.g. general municipal-requirements gaps)
-- ---------------------------------------------------------------------
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  related_finding_id uuid references findings(id) on delete set null,
  title jsonb not null,                 -- {es, en}
  why_it_matters jsonb not null,        -- {es, en}
  next_step jsonb not null,             -- {es, en}
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- permit_steps — "what should I investigate next," generated from which
-- findings are active
-- ---------------------------------------------------------------------
create table if not exists permit_steps (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  step_order int not null,
  title jsonb not null,                 -- {es, en}
  why_it_matters jsonb not null,        -- {es, en}
  professional text,                    -- e.g. "Engineer", "Architect", "Planner"
  evidence_finding_id uuid references findings(id) on delete set null,
  source_id uuid references sources(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Row Level Security: public read-only, no public writes.
-- Matches "no account required to explore" — the anon key is safe to
-- embed client-side because it can only ever select, never mutate.
-- ---------------------------------------------------------------------
alter table parcels enable row level security;
alter table projects enable row level security;
alter table sources enable row level security;
alter table findings enable row level security;
alter table finding_sources enable row level security;
alter table questions enable row level security;
alter table permit_steps enable row level security;

create policy "public read parcels" on parcels for select using (true);
create policy "public read projects" on projects for select using (true);
create policy "public read sources" on sources for select using (true);
create policy "public read findings" on findings for select using (true);
create policy "public read finding_sources" on finding_sources for select using (true);
create policy "public read questions" on questions for select using (true);
create policy "public read permit_steps" on permit_steps for select using (true);

-- No insert/update/delete policies are defined for the anon role, so
-- writes are denied by default under RLS. Writes belong to a future
-- authenticated/admin path, not this scaffold.
