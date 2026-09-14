# Parcela

*"Before you build, know what you can build."*

Parcela is a Puerto Rico property intelligence MVP. A user enters an
address and a goal, and gets back a feasibility report: what they can
likely do with the property, what's uncertain, and what to check first —
built to feel like a serious tech product, not government software.

## Running locally

No build step. Any static file server works:

```bash
npx serve .
# or
python -m http.server 5173
```

Then open the printed local URL.

## Structure

- `index.html` — landing page
- `analyze.html` — address + goal input, staged analysis animation
- `dashboard.html` — the Property Intelligence Dashboard (zoning, scenarios,
  recommendation, permit roadmap)
- `report.html` — clean printable/shareable report view
- `projects.html` — "My Projects", saved analyses (localStorage)
- `css/` — design tokens + page styles
- `js/data/` — mock property + zoning datasets (swap for real PR data
  sources later)
- `js/engine/` — `analyzeProperty()`, the AI-analysis abstraction (rule-based
  mock today; same call signature a real LLM/service could fill later)
- `js/state/` — localStorage-backed project persistence + a session stub
  (the seam for real auth later)

## Data & AI disclaimer

All property, zoning, and environmental data in this prototype is
**mock data** seeded for demo purposes — see `js/data/properties.js`. The
analysis engine is a deterministic rule-based stand-in for an AI/LLM call,
clearly labeling every finding as verified, estimated, assumed, or unknown.
Nothing here is a legal or professional determination.
