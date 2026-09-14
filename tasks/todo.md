# Parcela — Puerto Rico Property Intelligence MVP

Working name: **Parcela** ("parcel" in Spanish — fits a property/land-use product,
short, easy brand mark). Placeholder — easy to rename before launch.

## Stack decision
Surveyed this user's ~10 sibling projects (arc-bank-website, cameo, ai-learn-site,
candor, design-allocator, timbre, umbral, ...) — all are plain HTML/CSS/JS, no
build step, deployed to Netlify. Following that convention here rather than
introducing a framework: multi-page HTML (like arc-bank-website's
index/login/dashboard/pricing split) + shared `css/` and `js/` folders.
localStorage stands in for a backend; code is structured so a real backend/auth/
LLM can slot in later without a rewrite.

## Checklist

- [x] 1. Scaffold: folder structure (`index.html`, `css/`, `js/`, `assets/`),
      `git init`, `netlify.toml` (publish "."), minimal `README.md`
- [x] 2. Design system: `css/tokens.css` — Caribbean-inspired but restrained
      palette (deep ocean teal + warm terracotta accent, near-black text,
      off-white bg), type scale, spacing scale. Distinct from Umbral/Candor/
      Timbre's paper-white editorial look — this one should feel more
      map/data/Linear-Stripe-Palantir.
- [x] 3. Mock property data: `js/data/properties.js` — 6 seed PR properties
      across different municipios/scenarios (e.g. San Juan/Condado infill lot,
      Ponce urban lot, Rincón coastal/flood-zone lot, Caguas suburban lot,
      Fajardo agricultural parcel, Guaynabo multifamily-zoned lot), each with
      zoning class, lot size, existing structures, flood zone, utilities.
- [x] 4. Mock zoning/rules reference: `js/data/zoning-rules.js` — simplified
      Reglamento-Conjunto-style zoning categories used by the mock data.
- [x] 5. AI analysis engine abstraction: `js/engine/analyzeProperty.js` — pure
      function `(property, goal) -> report` producing staged findings,
      confidence levels (verified/estimated/assumption/unknown), 3-5 ranked
      scenarios, a recommendation, and a roadmap. Deterministic/rule-based for
      a reliable demo, but isolated behind one function so a real LLM call can
      replace the internals later without touching callers.
- [x] 6. State/persistence: `js/state/projects.js` (localStorage-backed saved
      analyses = "My Projects") and `js/state/session.js` (mock guest/session
      stub — the auth-ready seam, not real auth).
- [x] 7. Landing page (`index.html`): hero ("Before you build, know what you
      can build."), subheadline, "Analyze a Property" CTA, brief how-it-works,
      disclaimer footer.
- [x] 8. Property input flow (`analyze.html`): address search (matches seed
      properties + freeform fallback), optional parcel-info upload (stub,
      clearly labeled), goal selector (8 options from spec incl. "I don't
      know — show me my options").
- [x] 9. Analysis loading experience: 6-stage animated progress (identifying →
      zoning → geographic → environmental/flood → potential uses →
      complexity) with real explanatory copy per stage, realistic timing.
- [x] 10. Property Intelligence Dashboard (`dashboard.html?id=...`): stylized
      static map/parcel visual, parcel overview, zoning, land/building
      characteristics, constraints, "important unknowns," confidence badges
      with "Why?" popovers citing source category.
- [x] 11. Scenarios section: 3-5 OPTION cards (feasibility + complexity
      badges, why it may work / what could prevent it / info still needed /
      next step).
- [x] 12. "What I would investigate first" AI recommendation callout.
- [x] 13. Permit roadmap preview: verification → professional review →
      required studies → permit stage → construction authorization, with
      uncertain steps clearly flagged as needing a licensed professional/
      agency confirmation.
- [x] 14. Report view (`report.html`): clean print/share layout (print
      stylesheet via `@media print`) users can download as PDF or share.
- [x] 15. "My Projects" page (`projects.html`): list of saved analyses from
      localStorage, empty state for first-time users.
- [x] 16. Responsive + empty/error/loading state pass across all pages;
      quick manual test via a local static server + Chrome.

## Review

Built as a 5-page vanilla HTML/CSS/JS app (`index`, `analyze`, `dashboard`,
`report`, `projects`) with no build step, matching this user's established
project convention. Core logic lives in three isolated layers so a real
backend can replace any one without touching the others:
`js/data/` (mock properties + zoning reference), `js/engine/analyzeProperty.js`
(the rule-based "AI" — one function, deterministic, confidence-tagged
findings), `js/state/` (localStorage projects + a guest-session stub).

**Tested in-browser** (local static server + Chrome automation) end to end:
address autocomplete → goal selection → staged loading animation → dashboard
→ report → My Projects (save/remove/empty state), across three very
different seed properties (a straightforward Caguas single-family lot, a
flood-zone/septic-risk Rincón coastal lot, and a vacant Fajardo agricultural
parcel) to stress-test the scenario logic, not just the happy path.

**Bugs found and fixed during testing:**
1. The AI recommendation text used markdown `**bold**` syntax but was
   injected as raw HTML — literal asterisks showed on screen. Now uses
   `<strong>`.
2. The "open a business" scenario's rejection copy hardcoded "the base
   zoning is residential" even on tourism/agricultural-zoned parcels
   (e.g. Rincón, zoned RT). Generalized to the actual zoning code.
3. The short-term-rental and ADU scenarios could score HIGH feasibility on
   a **vacant lot with no existing structure** (nonsensical — you can't
   rent or add-an-accessory-to a building that doesn't exist yet). Both now
   detect the vacant case, downgrade feasibility, and say so explicitly in
   "what could prevent it."

**Known limitation:** the sandboxed browser session here could resize its
*window* but the page viewport stayed pinned at ~1504px, so true mobile
rendering wasn't visually screenshotted — the responsive CSS (grid
collapses, `.wrap` gutter reduction, nav-link hiding) was written
deliberately with a 400px floor in mind, but you should still eyeball it on
an actual phone-width window before calling it done.

**Not done / deliberately out of scope for this MVP**, per the brief:
no real cadastral/zoning/FEMA data source, no real LLM call (the engine's
signature is drop-in compatible with one), no real auth, no PDF export
beyond the browser's native print-to-PDF via `report.html`.

Nothing has been committed to git yet — repo is initialized
(`git init`) with everything staged as untracked files, left for you to
review and commit.
