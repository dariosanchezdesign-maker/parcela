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

---

# V2 — AI Property Development Copilot

V1 answered "what can I do here?". V2 answers "let's get it done": a
persistent Project Workspace per chosen scenario, a rule-based "Project
Copilot," a dependency-aware permit roadmap, mock document intelligence,
a professional directory, budget/timeline/financing intelligence, a
construction Build Mode, a "Your Next Move" notification, simulated
collaboration, and a pricing/business-model page. **Extends V1, does not
rebuild it** — V1's engine, data, and pages are untouched; V2 reads V1's
property/scenario output as its input.

## Architecture decisions (flagging before I build — shout if any of these
should go differently)

1. **Still no backend.** Same as V1: vanilla HTML/CSS/JS, localStorage.
   "Collaboration" (architect/contractor/investor each seeing relevant-only
   info) and "invite a person" are simulated with a **"Viewing as: ⌄" role
   switcher** inside one browser session — clearly labeled as a demo
   mechanism, not real multi-account auth. A real version would need an
   actual backend; this keeps the seam honest rather than faking accounts
   that don't exist.
2. **Copilot is rule-based over real project state, not a live LLM call.**
   Same honesty principle as V1's engine: `js/engine/copilot.js` pattern-
   matches the question (including the 7 example prompts from the brief)
   and answers from the project's actual data. No API key is wired up —
   V1's brief said to *assume* AI infrastructure exists; I'm not bolting on
   a real Anthropic API call without that being an explicit ask.
3. **The Project Workspace is one page (`project.html`), not eight.** A
   sidebar app-shell (Overview / Roadmap & Permits / Documents /
   Professionals / Budget / Financing / Build / Activity) switched
   client-side — that's what makes it *feel* like Notion/Linear/Procore
   rather than a pile of separate pages.
4. **"Start this project →" lives on V1's `dashboard.html` scenario
   cards.** Clicking it creates a `ProjectWorkspace` record (new
   `js/state/workspace.js`, separate from V1's lightweight
   `js/state/projects.js` saved-analysis list) seeded from that scenario +
   property, generates its permit roadmap, and opens `project.html?id=...`.
5. **`projects.html` (V1 "My Projects") gets extended, not replaced** — it
   already lists saved analyses; V2 adds richer cards for anything that's
   been turned into a full workspace (status, progress, next-move preview).
6. **One flagship seeded example workspace**, auto-present on first visit,
   so the whole V2 story is walkable without setup: the brief's own
   example ("I want to build a 2-unit property") mapped to the Caguas
   single-family-plus-ADU scenario from V1, mid-progress — survey done,
   architect assigned and mid-design, one AI-processed document, one
   budget-anomaly flag, a "needs correction" permit, an activity log.
   Starting a *new* project from scratch (any V1 scenario) still works and
   begins at day one.
7. **Pricing/business-model page is UI-only** — tier cards for FREE / PRO /
   TRANSACTION / B2B / FINANCIAL, no real billing.
8. **Document upload stays a labeled stub**, like V1's parcel-upload box:
   the user picks a document *type* (deed/plan/survey/estimate/government
   letter/permit/contractor proposal/inspection), and
   `js/engine/documentIntelligence.js` returns type-appropriate canned
   "extracted requirements" and appends them to the roadmap/document list
   — same "we're not pretending to OCR a PDF" honesty as V1's file stub.
9. **Photo-vs-scope comparison in Build Mode is the same pattern**: user
   tags an uploaded progress photo with an area/scope note; a small rule
   set decides whether to flag it "for human review" rather than actually
   doing computer vision.

## Checklist

**Data & state layer**
- [x] 1. `js/data/professionals.js` — ~12 seed profiles across architects,
      engineers, surveyors, lawyers, contractors, inspectors, environmental
      consultants (name, firm, specialty, region, blurb).
- [x] 2. `js/data/permitTemplates.js` — dependency-graph permit/requirement
      templates per scenario type (survey → design → engineering →
      required studies → permit prep → submission → corrections →
      approval), conditionally including steps from V1's zoning/flood/
      coastal findings (e.g. DRNA review only if coastal, ICP review only
      if historic district).
- [x] 3. `js/state/workspace.js` — the `ProjectWorkspace` entity + CRUD:
      property, scenario, status, timeline, tasks, documents, professionals,
      permits, budget, financing, activity log, collaborators/roles.
- [x] 4. Seed one flagship mid-progress workspace + wire "Start this
      project →" on `dashboard.html` to create/open a workspace.

**Engines (mock "AI," same deterministic/confidence-labeled pattern as V1)**
- [x] 5. `js/engine/permitEngine.js` — builds the dependency-aware roadmap,
      derives blocked/ready status from prerequisite completion.
- [x] 6. `js/engine/copilot.js` — answers the 7 example prompts (+ a few
      variants) from live project data; graceful fallback for anything else.
- [x] 7. `js/engine/nextMove.js` — single highest-priority "Your Next Move"
      card from project state; tracks last-seen timestamp for "what changed
      since last week."
- [x] 8. `js/engine/documentIntelligence.js` — canned type-aware extraction
      + roadmap updates ("I found 3 requirements that affect your project").
- [x] 9. `js/engine/budgetEngine.js` — category ranges (design/surveys/
      engineering/permits/materials/labor/utilities/contingency/financing)
      + anomaly detection against user-submitted estimates.
- [x] 10. `js/engine/timelineEngine.js` — estimated date range + ranked
       schedule-risk factors from permit/task state.
- [x] 11. `js/engine/financingEngine.js` — assembles the lender-ready
       Financing Package summary with assumptions clearly labeled.

**Project Workspace (`project.html`) — the command center**
- [x] 12. App shell: sidebar nav, top bar (property/scenario/status pill),
       "Your Next Move" banner, Copilot toggle panel.
- [x] 13. Overview section: property + scenario recap, progress summary,
       AI recommendations.
- [x] 14. Roadmap & Permits section: status pills (Not started/Preparing/
       Ready/Submitted/Needs correction/Approved), dependency chain view,
       per-permit why/docs/professional/cost/next-action.
- [x] 15. Documents section: upload stub + type tag, AI-extracted findings,
       document list.
- [x] 16. Professionals section (project-scoped): assigned professionals,
       AI-identified needs ("your project appears to require a surveyor"),
       CTA into the marketplace.
- [x] 17. Budget section: category breakdown with ranges/confidence,
       submit-an-estimate flow, anomaly flags.
- [x] 18. Financing section: generated Financing Package, printable.
- [x] 19. Build Mode: unlocks when permits reach Approved; contractor,
       milestones, invoices, photos w/ scope-flagging, change orders.
- [x] 20. Activity/Collaboration section: role switcher ("Viewing as"),
       shared activity timeline, invite-stub UI.
- [x] 21. Project Copilot panel: quick-prompt buttons (the 7 from the
       brief) + free-text input wired to `copilot.js`.

**Marketplace & business model**
- [x] 22. `professionals.html` — browsable directory, filter by category,
       "why you might need this" contextual framing (not Fiverr-style).
- [x] 23. `pricing.html` — FREE/PRO/TRANSACTION/B2B/FINANCIAL tier cards,
       reusing V1's marketing visual language.

**Design system evolution**
- [x] 24. `css/workspace.css` — operational visual layer: sidebar shell,
       status pills, dependency-chain diagram, document/professional cards,
       budget bars, activity feed — still Parcela's palette/type, more
       "command center" than V1's editorial dashboard.

**Wrap-up**
- [x] 25. Wire nav links (Pricing, Professionals) across existing V1 pages.
- [x] 26. End-to-end walkthrough test of the seeded story: Address →
       Analyze → Choose a plan → Start project → roadmap appears → attach
       a professional → upload a document → advance a permit → generate
       financing package → reach Build Mode.
- [x] 27. Review section + commit.

## Pacing decision
User confirmed: build the full pass in one go, one review at the end.

## Review

Built the full V2 checklist in one pass: 6 new engines (`permitEngine`,
`budgetEngine`, `timelineEngine`, `financingEngine`, `documentIntelligence`,
`copilot`, `nextMove`), a new `ProjectWorkspace` state layer separate from
V1's saved-analysis list, 2 new data files (professional directory, permit
templates), and 3 new pages (`project.html` — the single-page sidebar
command center, `professionals.html`, `pricing.html`), plus wiring the
"Start this project →" entry point into V1's `dashboard.html` and
`report.html` scenario cards, and surfacing workspaces on `projects.html`
alongside V1's saved analyses. Nothing in V1 was rewritten — the new
engines only read V1's existing property/zoning/flood data as input.

The flagship seeded workspace (Caguas ADU, matching the brief's own
"2-unit property" example) is hand-authored to sit mid-construction with a
pending change order, a flagged inspection correction, and a flagged
progress photo, so the "Your Next Move" priority-ranking logic, Build
Mode, and the Copilot all have something real to demonstrate on first
load — not just an empty scaffold. Starting a brand-new project from any
V1 scenario also works and correctly begins at day one with its own
scenario-scaled budget range.

**Tested end-to-end in-browser** (not just read over): the full nav
(Overview → Roadmap → Documents → Professionals → Budget → Financing →
Build → Activity), the Copilot chat (quick prompts + free text), the role
switcher's visibility dimming, uploading a document and watching the "I
found N requirements" message appear, submitting a budget estimate and
watching the live anomaly percentage, approving a change order and
watching "Your Next Move" re-rank to the next-highest-priority item,
triggering the photo-flagging heuristic, and the full "Start this
project →" flow from a fresh V1 scenario into a brand-new day-one
workspace.

**Bugs found and fixed during that testing pass:**
1. Steps with no direct professional cost (submission/corrections/
   approval) displayed as "$0–$0", which read like a bug rather than "no
   cost here." Submission now shows an actual filing-fee range; the
   genuinely free steps show "No direct professional cost" instead.
2. The Documents and Budget sections' success messages ("I found N
   requirements...", the anomaly-check result) were being wiped
   immediately by the `refresh()` call that followed them in the same
   click handler, since `refresh()` fully re-renders those sections from
   scratch. Fixed with a one-shot pending-message pattern so the message
   survives exactly one re-render before clearing.
3. `nextMove.js`'s correction-step detail picked "any inspection or
   government-letter document, most recently added" rather than the
   document actually relevant to the flagged step — so uploading an
   unrelated government-letter document could hijack the "Your Next Move"
   explanation meant for a different, older inspection finding. Fixed to
   prefer the document type that actually matches the flagged step.

**Known limitation, same as V1:** mobile-width visual verification wasn't
possible in this sandboxed browser session (the window resize tool didn't
propagate to the actual page viewport), so `workspace.css`'s mobile
breakpoint (sidebar collapses to a horizontal scrollable row under 860px)
is designed-for but not screenshotted — worth a manual check.

**Architecture seams left honest, not faked**, per the plan's stated
decisions: no real backend (collaboration is a single-session "Viewing as"
role switcher, not real multi-account auth), no live LLM call (Copilot is
rule-based over real project data, same as V1's engine), no real document
OCR (type-tagged canned extraction, same honesty stance as V1's parcel
upload), no real billing on `pricing.html`.

All committed work is still sitting locally — nothing pushed. Let me know
if you'd like this committed.
