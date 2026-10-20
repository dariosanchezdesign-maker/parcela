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

Real property lookups run in the browser (the Planning Board's map server
doesn't answer cloud data centers, but allows browser requests), so a plain
static server is enough for everything.

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
- `js/data/lookup.js` — address or cadastral number → real parcel, zoning,
  and flood findings with sources
- `js/data/zoning-rules.js` — what each San Juan district allows (uses,
  lot size, coverage, floor area, density, height, parking) per the
  Reglamento Conjunto 2023, with page citations
- `js/data/live.js` — runs the lookup and maps the result onto the
  pages; a page is in live mode when its URL has `?parcel=<cadastral>`
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

## Real data

Coverage: **San Juan only** for now (`COVERED_MUNICIPALITIES` in
`js/data/lookup.js`). A lookup combines:

| What | Source |
| --- | --- |
| Parcel boundary, cadastral number, area | CRIM parcels, Feb 2025 (`crim/crim_feb_2025` on the Planning Board's SIGE server) |
| Zoning district, overlays, resolution, effective date | Planning Board current zoning (`calificacion/cali_vige`) |
| Flood zone, FIRM panel, effective date | FEMA National Flood Hazard Layer |
| Address → map point | Esri World Geocoder (only the point is used; results aren't stored) |

**District rules.** For lots under San Juan's Plan Territorial (about 80% of
the city's zoning rows, `regla` 133), the district is translated to the
current Reglamento Conjunto 2023 district through its Table 6.14, and the
app checks the project type against that district's uses table and
estimates lot capacity. Every value was read from the page images of the
Planning Board's PDF and cites its page. The regulation was adopted by
emergency in 2023 and a 2025 court order requires the Board to finish
ordinary rulemaking, so the app labels it accordingly. Lots under other
plans, districts with no official equivalent (R-5, R-6), and public or
conservation districts come back as unknown.

Utility capacity, title, and environmental history are **not** covered yet;
the app lists them as unknowns with a next step instead of guessing.

## Data & AI disclaimer

Lookups use real public records, but this is a preliminary analysis, not a
legal or professional determination — records can lag reality, and every
finding links to its source for verification. The demo property (no
`?parcel=` in the URL) and the Overview/Explore/Properties/Compare/Reports
pages still use seeded demo data. The AI panel shows pre-written analyst
text; no model is called yet.
