# ATERRA

*See the potential in every parcel.*

ATERRA is a real estate intelligence and development decision platform,
starting with Puerto Rico. A developer or investor enters an address or
cadastral number and gets a structured read on the site (zoning, district
rules, flood and hazard layers) before committing significant time and
capital. Built for professional development decisions, in Spanish (default)
and English. ATERRA was previously called Parcela.

The product follows one workflow: **Discover → Analyze → Evaluate → Decide.**

Every finding is labeled **Favorable**, **Investigate**, **Constraint**, or
**Unknown**, and carries its **evidence basis**, so the reader can tell what
kind of statement it is:

| Basis | Meaning |
|---|---|
| Official record | Stated by the cited source (CRIM, Planning Board, FEMA) for this parcel |
| ATERRA interpretation | A published rule (Reglamento Conjunto 2023) applied to this parcel |
| Estimate | A calculated range for order of magnitude, not a determination |
| No data | The source has nothing, or ATERRA doesn't cover it; never filled in |
| AI explanation | Written by AI only from the findings on the page; adds no facts |
| Sample data | Fictional demonstration data |

Market intelligence and financial modeling are not built yet. The app says
so (dashboard "Data coverage", property "Sources & limits") rather than
showing placeholder numbers.

## Running locally

No build step. Any static file server works:

```bash
npx serve .
# or
python -m http.server 5173
```

Then open the printed local URL. `index.html` is the marketing site; `overview.html` is the workspace;
`search.html` starts a new analysis.

Real property lookups run in the browser (the Planning Board's map server
doesn't answer cloud data centers, but allows browser requests), so a plain
static server is enough for everything except the AI explanations, which
are a serverless function (`npx vercel dev` or `npx netlify dev` runs both; needs
`ANTHROPIC_API_KEY`).

## Hosting

The site runs on **Vercel** or **Netlify** from the same code. Both copy only
the public files (`*.html`, `assets`, `css`, `js`) into `dist/`, so `db/`,
`tasks/` and this README are never published.

- Vercel: `vercel.json`; the AI endpoint is `api/explain.js`.
- Netlify: `netlify.toml`; the AI endpoint is `netlify/functions/explain.mjs`.

Both entries call the same handler in `lib/explain.mjs`. Each host needs
`ANTHROPIC_API_KEY` set in its environment settings, and Supabase Auth must
list the site's address under Authentication → URL Configuration so sign-in
links return to it.

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
- `reports.html` — feasibility report; with `?parcel=<cadastral>&type=<project type>`
  it's built from the real lookup (maps, district rules, findings, sources)
  and "Download PDF" prints it
- `sources.html` — every source and the findings that cite it
- `index.html` — marketing landing page (site root)

Code:

- `css/tokens.css` — ATERRA design tokens: navy/cyan palette, status and
  evidence-basis colors, type scale (Inter), spacing, radii, motion
- `css/base.css` — shared components: app shell, buttons, cards, status
  badges, evidence-basis tags, notices, forms, tabs, data tables, empty and
  loading states, toasts
- `js/ui/shell.js` — `<aterra-logo>`, `<aterra-sidebar>`, `<aterra-flowbar>`
  custom elements, plus shared dialog (focus trap), tabs and toast helpers
- `assets/brand/` — logo, favicon, app icon, social image
- `assets/fonts/` — Inter (SIL OFL)
- `js/i18n.js` — Spanish/English strings and language toggle
- `js/ui/` — map, findings renderer, "Why?" panel, AI panel
- `js/data/lookup.js` — address or cadastral number → real parcel, zoning,
  and flood findings with sources
- `js/data/zoning-rules.js` — what each San Juan district allows (uses,
  lot size, coverage, floor area, density, height, parking) per the
  Reglamento Conjunto 2023, with page citations
- `js/data/account.js` + `signin.html` — email-link sign-in (Supabase Auth)
  and saved projects; `projects.html` lists them
- `lib/explain.mjs` — `/api/explain`: Claude explains the
  page's findings (signed-in users, 20 a day)
- `js/data/live.js` — runs the lookup and maps the result onto the
  pages; a page is in live mode when its URL has `?parcel=<cadastral>`
- `js/data/mockData.js` — prototype data for the demo property and project
- `js/data/supabaseClient.js` — Supabase client; pages that read live data
  fall back to `mockData.js` if the database is unreachable
- `db/` — Postgres schema, migrations, and seed data for Supabase
  (`migration_004_accounts.sql`: saved projects, AI daily limit)
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
| Liquefaction susceptibility, tsunami flood zone | Planning Board SIGE risk layers (`Licuación`, `Tsunami_flood_zones`; original author not documented in the service) |
| Advisory flood zones (0.2% annual chance, incl. surge and waves) | FEMA ABFE, via the Planning Board's SIGE server (`ABFE_02pct`) |
| Historic zones and sites within 100 m | Planning Board, Reglamento de Planificación Núm. 5 (`JP_Reglamentario/Sitios_Historicos_JP`) |
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

Landslide susceptibility isn't covered: the SIGE landslide layer is four
island-wide polygons and every spatial query against it times out.
Utility capacity, title, and environmental history are **not** covered yet;
the app lists them as unknowns with a next step instead of guessing.

## Data & AI disclaimer

Lookups use real public records, but this is a preliminary analysis, not a
legal or professional determination — records can lag reality, and every
finding links to its source for verification. The demo property (no
`?parcel=` in the URL) and the Overview/Explore/Properties/Compare/Reports
pages still use seeded demo data. On real parcels, the AI panel calls
Claude (`/api/explain`), which only receives the findings already on the
page and is instructed not to add facts; the demo property's AI panel still
shows pre-written text.
