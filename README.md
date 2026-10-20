# Parcela

*"Know what you're getting into before you develop."*

Parcela is a development-intelligence platform for Puerto Rico. A
developer or investor enters an address or parcel and gets a structured
read on the site — zoning, regulation, environment, infrastructure, and
development history — before committing significant time and capital.
Built for professional, $10M+ deals (B2B), in Spanish (default) and
English.

Every finding is labeled **Favorable**, **Investigate**, **Constraint**, or
**Unknown**, and every one links to the evidence behind it through the
"Why?" panel. *AI explains. Data proves. Professionals decide.*

## Running locally

No build step. Any static file server works:

```bash
npx serve .
# or
python -m http.server 5173
```

Then open the printed local URL. `index.html` is the marketing landing page;
`search.html` is the start of the app flow.

## Structure

Core flow:

- `search.html` — property search ("What are you looking at?")
- `identify.html` — confirm the parcel on the map
- `setup.html` — project type, optional units/investment
- `property.html` — the Property Intelligence screen: map + findings,
  "Why?" evidence panel, unknowns, next actions, regulatory/physical/
  infrastructure sections, development history

App pages:

- `overview.html` — dashboard
- `explore.html` — map-first property browsing with filters
- `properties.html` / `compare.html` — property list and side-by-side compare
- `projects.html` — project workspace
- `reports.html` — generated feasibility report
- `sources.html` — every source and the findings that cite it
- `index.html` — marketing landing page (site root)

Code:

- `css/` — design tokens (`tokens.css`) + page styles
- `js/i18n.js` — Spanish/English strings and language toggle
- `js/ui/` — map, findings renderer, "Why?" panel, AI panel
- `js/data/mockData.js` — prototype data for the demo property and project
- `js/data/supabaseClient.js` — Supabase client; pages that read live data
  fall back to `mockData.js` if the database is unreachable
- `db/` — Postgres schema, migrations, and seed data for Supabase
- `tasks/todo.md` — build log: what was built, why, and what was decided

## Backend

Data lives in Supabase (parcels, projects, findings, sources, questions,
permit steps — see `db/schema.sql`). The browser reads it directly with the public anon
key; Row Level Security limits that key to read-only. Free-tier Supabase
projects pause after inactivity — resume from the Supabase dashboard if
pages are showing mock data instead of live data.

## Data & AI disclaimer

This is a prototype. Property, zoning, and environmental data is seeded
demo data (one example property plus comparison properties), not live
Puerto Rico records. The AI panel shows pre-written analyst text; no model
is called yet. Nothing here is a legal or professional determination.
