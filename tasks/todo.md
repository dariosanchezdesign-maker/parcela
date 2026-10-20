# Parcela V3 — Development Intelligence Platform (pivot from V2)

Spec supplied is exhaustive and prescriptive (product concept, IA, copy,
screen-by-screen behavior already decided). This plan is build-order
tracking only — no re-litigating the concept, no added flourishes beyond
what's specified. Priority order below matches the spec's own
"IMPLEMENTATION PRIORITY" section.

**Pivot note:** this replaces V2's homeowner/ADU-focused consumer concept
with a B2B professional development-intelligence product for $10M+ deals.
Old pages (index/analyze/dashboard/project/projects/report/professionals/
pricing) get superseded by a new IA (Overview/Explore/Properties/Projects/
Reports). Old work stays recoverable via git history (7c6d715, 354bdbe) —
nothing destructive, just a fresh set of files reflecting the new concept.

Stack: vanilla HTML/CSS/JS, no build step, per existing project convention
(css/tokens+pages, js/data, js/engine, js/state, js/ui).

## Foundation
- [x] Rewrite `css/tokens.css`: off-white/near-black neutral palette, muted
      green/amber/red/gray status accents, type scale for dense numerical UI
- [x] Mock data layer (`js/data/mockData.js`): the demo property (123 Example
      Avenue), Condado Multifamily project, findings (favorable/investigate/
      constraint/unknown), evidence/sources, regulatory fields, physical
      constraints, infrastructure, development-history timeline, unknowns,
      next actions, 3 comparison properties, map geometry
- [x] App shell + left nav (Overview/Explore/Properties/Projects/Reports),
      quiet active-state styling — in `css/base.css`, used by `property.html`

## Core flow (priority 1-7 — the experience the product lives or dies on)
- [x] Property search screen ("What are you looking at?") — `index.html`
- [x] Property identification/confirmation screen (map + parcel highlight) —
      `identify.html`
- [x] Project setup screen (project type + optional units/investment) —
      `setup.html`
- [x] Main Property Intelligence screen: two-part layout (map left,
      intelligence panel right), header, preliminary feasibility statement —
      `property.html`
- [x] Finding categories (Favorable/Investigate/Constraints/Unknown) +
      reusable finding card component — `js/ui/intelligence-render.js`
- [x] Interactive map: parcel/roads/base layers + Satellite/Zoning/Flood/
      Environmental/Infrastructure/Development layer controls, click-driven
      layer + legend updates — `js/ui/map.js` (fixed a bug where the layer
      buttons lived outside the mounted container and never got listeners)
- [x] "Why?" side panel: Conclusion → Explanation → Evidence, confidence
      indicator, expandable "View source" detail — `js/ui/panel.js`
- [x] Unknowns section ("What we don't know yet") w/ why-it-matters + next
      step, linked back to related findings
- [x] Next Actions ("Before you move forward"), expandable, professional
      labels, linked evidence
- [x] Regulatory analysis, physical constraints, infrastructure expandable
      sections (regulatory rows link into the Why panel via existing findings)
- [x] Development history timeline (expandable events)
- [x] Verified full core flow live in Chrome at 1440px: search → identify →
      setup → property, all 6 map layers, Why panel + view-source toggle,
      every expandable section

**Checked in with user after this phase per plan — approved to continue.**

## Secondary (priority 8-9)
- [x] Properties list page (`properties.html`) — property cards with
      select-to-compare checkboxes, feeds `compare.html` via sessionStorage
- [x] Compare properties mode (`compare.html`) — chips, comparison table,
      "Key differences" cards per property, explicitly no "winner"
- [x] Dashboard (`overview.html`) — time-of-day greeting, recent properties,
      active projects, intelligence updates feed
- [x] Fixed a card layout bug: `.pcard-meta` used `justify-content:
      space-between` on two text spans with no wrap allowance, so on
      3-column cards "Multifamily" and "Analyzed Sep 18, 2026" ran together
      with no gap. Restructured as stacked label/value fields (same m/v
      pattern as the intel header) instead of a two-span flex row.
- [x] Verified in Chrome: overview → properties (toggle selection) →
      compare, and re-verified property.html has no regressions

## Later (priority 11-12 + supporting pages)
- [x] Explore page (`explore.html`) — map-first with 8 mock properties,
      7 filter controls (municipality/size/land-use/potential-use/
      infrastructure/flood-only/constraints-only), live client-side
      filtering (dims non-matching markers), click-to-popover per marker
- [x] Report generation preview (`reports.html`) — all 11 spec sections
      generated from `mockData.js`, mocked Download/Share button states
- [x] Project workspace page (`projects.html`) — Condado Multifamily,
      properties being evaluated, "+ Add another property" → search.
      Overview's "Active projects" card now links here.
- [x] Contextual AI actions — `js/ui/ai-panel.js`, a second slide-in panel
      distinct from the Why panel (mutually exclusive — opening one closes
      the other). Wired to "Explain this" / "What should I investigate
      next?" on the feasibility card and "Summarize this regulation" next
      to Applicable regulation. Deliberately understated (text links, not
      buttons), panel is analyst-voice text, never a chat surface.
- [x] Verified all of the above in Chrome, including popover positioning,
      filter counts, mock download/share timers, and panel mutual-exclusion
      (checked via direct DOM assertions after two Computer-tool click
      misses on small targets — small-hitbox text links are worth a wider
      click target if this becomes a pattern elsewhere)

## Responsive / mobile pass
- [x] Shell nav collapses to a 64px icon rail below 900px (no hamburger
      drawer — kept the premium app-shell feel per spec's "not a generic
      mobile layout" instruction). Labels hidden via `font-size: 0` on the
      anchor text node rather than duplicating markup per page.
- [x] Wrapped/stacked header and toolbar layouts at narrow widths:
      `.intel-header`, `.page-head`, `.section-head`, `.compare-bar`,
      `.project-card`, `.field-row`, `.finding-card-top`, `.infra-card-top`,
      `.onboard-actions` all get `flex-wrap` so nothing clips or overlaps.
- [x] `reports.html` Sources table: was a plain `<table>` with no
      `table-layout: fixed`, causing real horizontal page overflow at
      mobile widths (confirmed via `scrollWidth` vs `clientWidth`, not just
      visual guessing). Fixed with `table-layout: fixed` + `word-break` +
      a stacked-row layout below 640px.
- [x] Root-caused a systemic overflow bug: CSS Grid/flex children default
      to `min-width: auto`, so a child's min-content width can silently
      stretch its whole grid/flex ancestor past the viewport even when
      every individual element "looks" narrow enough. Found via a
      `getBoundingClientRect().right > clientWidth` sweep after visual
      checks passed but `scrollWidth` still exceeded `clientWidth`. Added
      `min-width: 0` to the direct children of every grid container
      (`.shell-main`, `.dash-grid`, `.intel-layout`, `.explore-layout`,
      `.pc-grid`, `.diff-grid`, `.identify-grid`, `.property-grid`) plus the
      specific flex offenders (`.update-body`/`.update-date`,
      `.pcard-top`'s title block/status badge).
- [x] Verified all 10 pages (index/identify/setup/property/overview/
      properties/compare/explore/projects/reports) have zero horizontal
      overflow at both 390px and a stress-tested 320px, via a throwaway
      iframe-based test harness (`window.resize_window` doesn't actually
      resize the viewport in this environment — confirmed independently —
      so real breakpoint testing needed same-origin iframes sized to the
      target width instead of relying on window resize + screenshots).
- [x] Intentional local-scroll left in place (not "fixed"): `compare.html`'s
      comparison table keeps `overflow-x: auto` on its own wrapper below
      640px rather than stacking, since a scrollable data table reads as
      normal enterprise-tool behavior, not breakage.

## Compare nav placement
- [x] Decided not to add Compare as a 6th primary nav item — spec section 3
      fixes the primary nav at Overview/Explore/Properties/Projects/Reports
      and says to keep it "visually quiet"; spec section 20 also treats
      Compare as a mode you select into, not a nav destination. Adding a
      6th item would contradict both.
- [x] Instead made the two real entry points immediate instead of buried:
      `properties.html` gets a "Compare properties" ghost button in the
      page header (next to "Analyze a property") that fires with whatever
      is currently selected — since all properties are selected by default,
      it works on first click with no setup, same sessionStorage handoff as
      the existing bottom sticky bar (kept for when the user has customized
      the selection).
- [x] `property.html` gets a "Compare with other properties" ghost action
      next to "Generate feasibility report" in the header — jumps straight
      into `compare.html` with the current property + the other two mock
      properties pre-loaded, for the "I'm looking at one property, how does
      it stack up" flow the single-property screen didn't previously serve.
- [x] Verified both new entry points in Chrome.

## Sources & evidence page
- [x] Built `sources.html`: the Finding → Evidence → Source relationship
      diagram from spec section 18, the "AI explains. Data proves.
      Professionals decide." tagline, then a card per source (name, agency,
      document/layer, date, relevant section, mocked "View source" action)
      with a "Referenced by" chip list reverse-looked-up from `findings`.
- [x] Made it bidirectional: each "Referenced by" chip links to
      `property.html?why=<findingId>`, which now auto-opens the Why panel
      for that finding on load. The Why panel itself gained a "View all
      sources & evidence" link in its footer, and the report's Sources
      section gained a "View full source library" link — three ways in,
      one way to jump straight back to the right finding.
- [x] Fixed an ordering bug caught before it shipped: the deep-link handler
      first called `window.ParcelaPanel.open()` synchronously from the same
      inline script block that defines it, but `panel.js`'s own init runs
      on `DOMContentLoaded`, which hadn't fired yet at that point in
      parsing — `panel`/`els` would've still been undefined. Wrapped the
      call in the page's own `DOMContentLoaded` listener, which fires after
      `panel.js`'s (registered earlier in script order) has already run.
- [x] No primary nav entry added for this page either, same reasoning as
      Compare — it's a drill-down from Property/Reports, not a top-level
      section in the spec's fixed 5-item nav.
- [x] Verified in Chrome: page renders, mocked "View source" state change,
      "Referenced by" deep-link opens the correct finding's Why panel, and
      the reports.html link works. No horizontal overflow at 320px.
- [x] Note for future testing in this project: the local `serve` CLI used
      for dev testing silently strips query strings when redirecting
      `foo.html` → `/foo` (its clean-URL feature), which looked like a
      broken deep link until isolated — it is a local-dev-server quirk, not
      a bug in the site or a concern for the actual Netlify deploy target.

## Font swap — Host Grotesk
- [x] Self-hosted Host Grotesk (variable font, weights 300–800, + italic)
      replaces the Google-Fonts Inter/Space Grotesk pairing for both
      `--font-display` and `--font-body`. Font files in `assets/fonts/`
      (extracted from the user's downloaded zip), `@font-face` in
      `css/base.css`. `IBM Plex Mono` (technical labels/coordinates) is
      unchanged — out of scope, distinct purpose.
- [x] Verified the variable font actually loads (`document.fonts` status
      "loaded") rather than silently falling back to `system-ui`.

## Spanish / English language toggle
- [x] Built `js/i18n.js`: a ~180-key bilingual strings dictionary
      (`STRINGS`), `getLang()`/`setLang()` backed by `localStorage`
      (`parcela-lang`, default `"es"`), `t(key)` for UI chrome, `tv(value)`
      for bilingual `{es, en}` data fields (plain strings pass through
      unchanged — used for proper nouns), `applyStatic()` which walks
      `[data-i18n]`/`[data-i18n-placeholder]` on `DOMContentLoaded`, and a
      `toggleHTML()` pill injected into `#lang-toggle-slot` (present in
      every shell page's nav footer and every onboarding page's topbar).
      Switching language does a full `location.reload()` — simplest correct
      option for a multi-page vanilla site with no client-side router.
- [x] Scope rule applied consistently: official Spanish-language names
      (agencies, "Reglamento Conjunto 2023", document/source titles,
      municipality names, zoning-code labels like "R-3 Residencial
      General") stay a single string in both languages, same as a legal
      citation would in an English brief. Parcela's own analysis prose
      (finding titles/summaries/evidence, unknowns, next actions,
      regulatory values, physical/infrastructure text, timeline
      descriptions, feasibility summary, AI-panel insights, comparison
      key-differences) became bilingual `{es, en}` objects in
      `js/data/mockData.js`. Dates and dollar amounts were left as single
      literal strings — reasonable scope cut for a prototype.
- [x] Every page's static chrome (nav, headings, buttons, field labels,
      status/confidence/professional vocabulary, onboarding copy, filter
      labels, table headers) now carries `data-i18n` attributes; every
      render function (`intelligence-render.js`, `map.js` legends,
      `panel.js`, plus each page's own inline script) reads through
      `I.t()`/`I.tv()` instead of hardcoded English strings.
      `explore.html`'s dataset keeps canonical English values for filter
      matching and translates only for display, via small local lookup
      maps, to avoid restructuring filter logic.
- [x] Caught and fixed two real bugs via testing, not just visual read:
      (1) `h-project-tag` showed literal `[object Object]` because
      `unitsLabel` (now a bilingual object) was interpolated without
      `I.tv()` — swapped every bilingual-field usage site by grep-auditing
      all of them, not just the one that visibly broke; (2) the longer
      Spanish button/toolbar text reintroduced the same
      grid/flex-min-width-0 horizontal-overflow class of bug from the
      earlier responsive pass, this time in `.intel-header-actions` and
      `.report-toolbar` (missing `flex-wrap`) — caught by re-running the
      320px `scrollWidth`-vs-`clientWidth` sweep across all 11 pages after
      the copy got longer, not by assuming the earlier pass still covered
      it.
- [x] Verified in Chrome on the persistent tab: Spanish renders by default
      on first load, the Why panel/AI panel/map legends/Explore filters/
      Compare table/Report/Sources page all fully translate, EN toggle
      switches correctly and persists across full-page navigation via
      `localStorage`, and the full 320px overflow audit passes again in
      both languages after the two fixes above.

## Polish pass
- [x] Loading state: submitting project setup now shows a full-screen
      "Analyzing 123 Example Avenue…" overlay with a 4-step checklist
      (zoning/land-use → flood/environmental → permits/history →
      compiling feasibility) that checks off sequentially with a pulsing
      active-step indicator, then hands off to `property.html` — this is
      the actual "reveal" moment of the product and previously jumped
      instantly with no sense of analysis happening. Converted the CTA
      from a plain `<a>` to a `<button>` so the transition could run
      before navigating.
- [x] Error state: searching an address not in the prototype's 3 seeded
      properties now shows an inline error ("couldn't find a confident
      match… try a sample address") instead of silently navigating to a
      confirmation screen for a property that doesn't exist. Clears on
      input or on picking a suggestion.
- [x] Empty state: Explore's filter combination returning zero properties
      now shows a dedicated empty state (icon, message, "reset filters"
      button) over the dimmed map instead of just an unexplained "0 of 8
      properties" counter with every marker faded.
- [x] Both new states are fully bilingual via `js/i18n.js` and re-verified
      at 320px with the same `scrollWidth`/`clientWidth` sweep — no new
      overflow introduced.
- [x] Responsive check at 1440/1280 (desktop-first) — already covered by
      the earlier dedicated responsive pass; still holds after this pass's
      changes.
- [x] Microinteractions already in place from earlier phases (parcel
      selection/highlight, map layer transitions, panel open/close slide,
      finding-card expand, hover/active states throughout); this pass adds
      the loading/empty/error coverage that was still missing.

## Final test
- [x] Walked the full flow end-to-end in the browser after all recent
      changes (font swap, i18n, polish pass): search (including the new
      error state) → pick property → identify → project setup → the new
      analyzing transition → feasibility → findings → Why? panel →
      evidence → unknowns → next actions → regulatory/physical/
      infrastructure/history → compare → report → sources, all in
      Spanish by default, all still correct after every change made this
      session.

## Marketing landing page
- [x] Built `landing.html` as a new, separate page rather than repurposing
      `index.html` — every internal link across all 11 existing pages
      (nav CTAs, "Back" links, etc.) already points to `index.html` as the
      app's step-1 search screen; changing its role would have meant
      touching every file for no functional gain. `landing.html` is the
      new front door for a cold visitor, with "Analyze property" linking
      into the existing `index.html` flow. Worth telling the user this is
      the tradeoff if they want `landing.html` served at the domain root
      on deploy.
- [x] Structure: hero (tagline verbatim from the product brief, "Analyze
      property" + "See a sample analysis" CTAs, a real live-rendered hero
      visual reusing `map.js` + actual mock findings — not a stock image or
      illustration) → "Property → Project → Intelligence → Evidence →
      Unknowns → Next actions" flow diagram → 4 feature cards → "What
      Parcela is not" positioning section → a sample-property teaser card
      pulling live stats from `mockData.js` → final CTA → footer.
      Deliberately no gradients, no illustrations, no chatbot imagery, per
      the product's own explicit design constraints.
- [x] Fully bilingual via the existing `js/i18n.js` system, same toggle
      pattern as every other page.
- [x] Caught two real bugs before they shipped, both by reading the code
      against `map.js`'s actual contract rather than assuming it would
      "just work": (1) `mount()` unconditionally does
      `container.querySelector(".map-legend").innerHTML = …` — the hero
      visual's markup didn't have a `.map-legend` element, which would
      have thrown and silently killed the rest of the page's script
      (including the findings/stats rendering below it); (2) used the
      wrong brand-mark class (`.onboard-brand-mark`, defined in a
      stylesheet this page doesn't load, instead of `.shell-brand-mark`
      from `base.css`).
- [x] Fixed a small mobile-nav overflow (~16px at 320px) the same way as
      every other overflow bug this session — measured, not guessed — with
      a narrow-width breakpoint tightening gap/padding.
- [x] Verified in Chrome: hero visual renders the real parcel/flood
      overlay via the actual map code, sample stats match the live
      finding counts, EN/ES toggle works, no console errors, no horizontal
      overflow at 320px.

## Landing page full redesign (15-section rewrite)
- [x] Replaced the first landing page cut with a full rewrite driven by a
      second, much more detailed design brief: explicit "editorial, spatial,
      aspirational" design north star (distinct from the dense/operational
      app), a restrained single-accent palette (`--l-accent` forest green),
      and 15 named sections in a fixed order (Nav, Hero, Hero Product Viz,
      Problem, Solution, Four Core Questions, Product Showcase,
      Differentiation, Trust/Evidence, Unknowns, How It Works, Future
      Vision, Who It's For, Final CTA, Footer) with mostly-literal copy
      supplied in the brief.
- [x] Kept reusing real app code for product visuals instead of mockups,
      now more deeply: the Product Showcase section embeds an actual
      working mini instance of `property.html` (`ParcelaMap.mount()`,
      `ParcelaRender`'s category/unknowns/next-actions renderers, and the
      real `panel.js` "Why?" panel) inside a browser-chrome frame, so
      clicking "¿Por qué?" on the landing page opens the same evidence
      panel the real app uses — not a screenshot standing in for it.
- [x] Built the interaction details the brief called for: sticky nav that
      gains a background past a scroll threshold, four-questions
      hover/click reveal, scroll-triggered annotation reveals on the
      showcase (IntersectionObserver), click-to-expand accordions for both
      the Trust section's "View source" and the Unknowns section's
      why/how/who detail, and a static candidate-parcel mini-map for the
      Future Vision section built by scaling `exploreProperties` marker
      coordinates into a new small inline SVG.
- [x] Fixed a real UX gap caught during review, not just a rendering bug:
      the Trust section's "View source" expand was re-showing the exact
      same demo-disclaimer text already permanently visible below the
      card — redundant, not new information, and it undercut the brief's
      own stated intent ("View source can visually expand the evidence
      panel"). Replaced it with genuine additional detail (Document /
      Section rows) via four new `js/i18n.js` keys.
- [x] Fixed a real i18n bug caught by reading rendered output, not by
      assuming translated markup worked: the How It Works section's
      "Property → Project → Intelligence" flow pills rendered the raw
      i18n keys (`landing_flow_property` etc.) verbatim on screen because
      those three keys were referenced in `landing.html` but never defined
      in `js/i18n.js`'s `STRINGS` object. Added the missing keys.
- [x] Fixed a real overflow bug found by the 320px `scrollWidth`-vs-
      `clientWidth` sweep (not visual-only): `.l-nav-right` (sign-in +
      lang toggle + CTA button) overflowed by 40px at 320px because the
      existing `max-width: 400px` breakpoint only shrank the CTA button,
      not the gap or the lang-toggle buttons. Tightened gap and both
      buttons' padding/font-size together in that breakpoint until the
      sweep came back clean (0px overage, confirmed twice).
- [x] Distinguished a false positive from a real bug during the same
      sweep: `.l-viz-map-controls` (the map layer-button row inside the
      embedded showcase mini-app) also showed `scrollWidth > clientWidth`,
      but it has `overflow-x: auto` by design — a bounded horizontal
      scroll strip for many small buttons, not a page-level overflow bug.
      Re-ran the sweep filtering out elements with `overflow-x: auto` or
      `scroll` to separate the two cases before treating anything as a
      bug.
- [x] Verified every section in Chrome on the persistent tab, in order:
      Nav, Hero (real map + finding chips), Problem (fragments +
      pull-quote), Solution (before/after transform), Four Questions
      (hover reveal), Product Showcase (real embedded app, "¿Por qué?"
      opens the real Why panel with correct content), Differentiation,
      Trust (fixed expand), Unknowns (accordion expand), How It Works
      (fixed flow pills), Future Vision (candidate-parcel map + flow),
      Who It's For, Final CTA (empty-submit correctly shows the
      no-match error), and Footer (inert Product/Legal links correctly
      flash "not available in the prototype"). No console errors on a
      fresh load. Zero horizontal overflow at 320px after the two fixes
      above.

## Landing page redesign #2 — consolidate 15 sections down to 4-5
User feedback: the 15-section page is too long for a "premium, confident
product." New note specifies a tight 4-section page (5 max, with the CTA
as the optional 5th) built around four questions instead of fifteen:
"What is Parcela?" → "Why does it exist?" → "What does it actually do?"
→ "Why should I believe it?" → "Let me try it."

This is a real content cut, not just a re-skin — Unknowns, How It Works,
Future Vision, and Who It's For get removed as standalone sections
entirely (their content either folds into a surviving section or is cut).
Flagging that explicitly before starting since it's the biggest scope
change of the two redesigns.

Mapping old → new:
- [x] **01 Hero** — kept nav + hero (eyebrow/h1/sub/search) + hero product
      viz as-is (sections 1-3). Nav center links repointed to the new
      in-page anchors (`#product`, `#trust`) since the old `#how-it-works`
      / `#who-its-for` targets no longer exist; third nav item renamed
      "For developers" → "Trust" (new `landing_nav_trust` key) since
      "Who's it for" no longer exists as a destination.
- [x] **02 Problem + Solution** (`#problem-solution`) — merged into one
      section: new headline "A property is more than a parcel on a map,"
      the existing fragment chips, a literal down-arrow → "Parcela"
      wordmark → down-arrow → "One intelligence view" statement (new
      `.l-ps-down`/`.l-ps-brand` CSS), then the `Data → Intelligence →
      Decision` flow row (reused `.l-diff-flow` component). Dropped the
      old before/after `.l-transform` chain and the old separate
      "The information exists..." statement entirely — not in the note's
      structure for this section.
- [x] **03 Product / Intelligence** (`#product`) — merged Four Core
      Questions + Product Showcase into one section, unchanged content:
      all four question cards, then a small "See it in action." bridge
      label (repurposed the old showcase `<h2>` as a `<h3>` sub-heading
      instead of dropping it, so the jump from static cards to the live
      demo isn't abrupt), then the full real embedded mini-app showcase
      exactly as before (map, finding categories, unknowns/next-actions,
      real "Why?" panel, scroll-reveal annotations).
- [x] **04 Trust / Differentiation** (`#trust`) — merged. New headline
      "Intelligence you can trace back to the source," the flood-exposure
      trust card unchanged (including the "View source" expand fix from
      last session), the demo-note caveat, a new statement ("Parcela
      doesn't replace professional due diligence...") replacing the old
      long legal-disclaimer paragraph in this section (the footer already
      carries the full legal disclaimer — having both was redundant), then
      the new 4-node `Data → Evidence → Intelligence → Decision` flow
      (added `landing_diff_flow_evidence` key). Cut the old standalone
      "Not another map" 3-card grid (Maps/Databases/AI chatbots) and its
      "Parcela connects the three" line entirely — the note's section 4
      content list doesn't include it, and keeping it would have worked
      against the "shorter, more confident" goal.
- [x] **05 Final CTA + footer** — unchanged. Footer's Product-column links
      updated to point at the new anchors (`#product`, `#trust`) instead
      of the removed `#how-it-works`/`#who-its-for`.
- [x] **Cut entirely**: Unknowns accordion section, How It Works (3 steps
      + flow), Future Vision (search-prompt mockup + candidate-parcel
      mini-map + Idea→Opportunity→...→Development flow), Who It's For (3
      audience cards). Confirmed nothing elsewhere links to these — safe
      to delete outright.
- [x] `js/i18n.js`: removed all now-orphaned keys for the cut/replaced
      content (`landing_unknowns_*`, `landing_how_*`/`landing_how1-3_*`,
      `landing_flow_property/project/intelligence`, `landing_future_*`,
      `landing_who_*`/`landing_who1-3_*`, `landing_diff_h1/h2`,
      `landing_diff_maps/db/ai_*`, `landing_solution_*`,
      `landing_problem_h1a/h1b/body/statement`, `landing_questions_h1`,
      `landing_trust_disclaimer`, `landing_nav_forDevelopers`) and added
      the new ones the merged sections need. Verified afterward by
      grepping every `data-i18n`/`data-i18n-placeholder` value in
      `landing.html` against the keys defined in `STRINGS` — zero
      mismatches — and separately confirmed none of the removed key names
      still appear anywhere in `i18n.js`.
- [x] `css/landing.css`: removed all component CSS for the cut sections
      (`.l-unknowns-*`, `.l-verify-*`, `.l-how-*`, `.l-future-*`,
      `.l-who-*`, `.l-diff-grid`/`.l-diff-card`/`.l-diff-h2`,
      `.l-transform`/`.l-before-chain`/`.l-after-*`,
      `.l-trust-disclaimer`, `.l-problem-head`), kept and reused
      `.l-fragments`/`.l-fragment`, `.l-statement`, and `.l-diff-flow`
      across both sections that now need them, and added the small new
      `.l-ps-down`/`.l-ps-brand` rules for the merged section's
      down-arrow/wordmark beat.
- [x] Re-verified in Chrome on the persistent tab: nav (new anchors +
      "Confianza" label), the merged Problem+Solution section matches the
      note's literal structure (fragments → ↓ → Parcela → ↓ → statement →
      3-node flow), the merged Product/Intelligence section (four
      questions flowing directly into the real embedded showcase, "¿Por
      qué?" still opens the real Why panel), the merged Trust section
      (flood card, working "View source" expand, new statement, 4-node
      flow), Final CTA, and footer. No console errors on a fresh load.
      320px `scrollWidth`-vs-`clientWidth` overflow sweep came back clean
      (0 elements) in both Spanish and English.

---
## Review
This session took Parcela's V3 build through its full arc: the priority-
ordered core build, a responsive/mobile pass, several smaller feature
pages (Compare entry points, Sources & Evidence), a font swap to Host
Grotesk, a full Spanish/English i18n layer (Spanish default), a polish
pass (loading/error/empty states), and finally two iterations of a
marketing landing page — the second a full rewrite against a much more
detailed 15-section design brief.

The most consistent theme across the whole session was that *measuring*
beat *assuming* every time: nearly every real bug found (the
`[object Object]` bilingual-field bug, the CSS grid/flex `min-width: 0`
overflow class of bug that recurred three separate times as copy got
longer, the raw-i18n-key flow pills, the redundant Trust "View source"
expand, and the final nav overflow) was caught by an explicit check
(a `scrollWidth`/`clientWidth` sweep, reading a module's actual code
contract, or reading the brief's stated interaction intent against what
was actually built) rather than by visual spot-checking or assuming a
prior fix still covered new content. The `resize_window` tool's
limitation in this environment was worked around consistently with the
same same-origin-iframe technique throughout.

The landing page's product visuals reuse the real app's rendering
modules (`map.js`, `intelligence-render.js`, `panel.js`) directly rather
than mocking them up, which is more work up front but means the
marketing page can never drift out of sync with what the product
actually looks like.

No further action items are outstanding; the redesigned landing page is
fully verified end-to-end at both desktop and 320px in Spanish, with the
two bugs found during this review's verification pass (missing i18n
keys, nav overflow) fixed and re-verified in the same session.

**Addendum — redesign #2 (consolidation):** after seeing the 15-section
page, the user brought back hand-written notes arguing for a much
shorter, denser 4-5 section structure for a "premium, confident"
product, organized around four reader questions instead of fifteen
sections. This was a real content cut, not a re-skin: Unknowns, How It
Works, Future Vision, and Who It's For were removed as standalone
sections, and the old 3-card "Not another map" differentiation grid was
also cut since the user's notes didn't call for it. Everything cut was
first confirmed unreferenced elsewhere before deletion. The exercise
reinforced the same lesson as the first redesign: after the content
surgery, a fresh i18n-key cross-reference (grep every `data-i18n` value
in the HTML against what's defined in `STRINGS`) caught what a visual
read alone would have missed, and the 320px overflow sweep was re-run
from scratch rather than assumed to still hold once section boundaries
moved. The page is now ~4 screens shorter while keeping every piece of
real, non-mocked product interaction (embedded live map, real finding
categories, real "Why?" evidence panel) intact.

---
## Backend scaffold — real schema behind the mock data

User's own framing (their words): a Finding should never be just text — it
has to be a row that points at the sources that produced it and the
project/parcel it applies to. This has to be decided pre-launch because
the Report/Sources pages already implicitly assume this shape. Agreed
schema: `Parcel`, `Project` (parcel + assumptions), `Finding` (typed,
tied to Source(s) and, when unresolved, Question(s)), `Source` (agency,
document, publication date, retrieval date, dataset hash/version),
`PermitStep` (generated from active findings).

**Provider decision:** Supabase over a hand-rolled Node/Express API or
raw Neon Postgres. Reasoning: Supabase gives every table an instant
REST + JS-client API with Row Level Security, so the existing vanilla
HTML/JS pages can call the database directly via a CDN-loaded client
script — no custom backend server or Netlify Functions layer to write
and maintain, which fits [[feedback_default_web_stack]]'s minimal-infra
preference far better than standing up my own API would. Trade-off:
ties the data layer to Supabase specifically rather than portable raw
SQL-over-any-Postgres, judged acceptable for how much hand-written
backend code it avoids.

**Scope discipline:** build exactly the five-entity model the user
described, nothing more. `regulatory`/`physical`/`infrastructure`/
`developmentHistory`/`map`/`comparisonProperties`/`dashboard`/
`exploreProperties`/`aiInsights` stay as static mock data in
`js/data/mockData.js` for now — arguably some of those (regulatory rows,
physical constraints) are really Finding-shaped too, but that's a
separate decision to make later, not bundled into this pass.

- [x] `db/schema.sql` — tables `parcels`, `projects`, `sources`,
      `findings`, `finding_sources` (join, since a finding can cite more
      than one source), `questions` (the "unknowns" concept, with a
      nullable `related_finding_id` so a finding can have zero or more
      open questions), `permit_steps` (the "next actions" concept).
      Bilingual text fields (title/summary/why/etc.) stored as `jsonb`
      `{"es": "...", "en": "..."}` to mirror the existing JS object shape
      exactly. UUID primary keys, `created_at`/`updated_at` timestamps.
      `sources` gets a `retrieved_at` timestamp and a `dataset_version`
      text field — the versioning the user specifically flagged as
      needed for auditability when underlying government data changes.
- [x] `db/schema.sql` also defines Row Level Security policies: public
      read-only (`select`) access on every table, no public write access
      — matches the product's current "no account required to explore"
      positioning and keeps the anon key safe to embed client-side.
- [x] `db/seed.sql` — inserts the existing 123 Example Avenue demo
      parcel/project/sources/findings/questions/permit-steps from
      `js/data/mockData.js` into the new schema, so the real backend
      starts out equivalent to what the static prototype already shows.
      (Fixed one bug while writing it: an escaped apostrophe in "the
      parcel's land-use classification" was written as `parcel'' s`
      with a stray space, which would have inserted "parcel' s" instead
      of "parcel's" — caught by grepping the file for the escape pattern
      and fixed to `parcel''s` before this was ever run against a real
      database.)
- [x] `js/data/supabaseClient.js` — a new, parallel data module (does
      NOT touch or replace `js/data/mockData.js` yet) that loads the
      Supabase JS client from a CDN and exposes async functions shaped
      like the existing `window.PARCELA` accessors (e.g. a `findingById`
      equivalent that also resolves its linked sources via
      `finding_sources`), so pages can be migrated one at a time later
      without a rewrite.
- [x] User created a free Supabase project, ran `schema.sql` then
      `seed.sql` against it, and shared the Project URL + `anon` public
      key (verified it was the `anon` role, not `service_role`, by
      decoding the JWT payload before using it).
- [x] Wired `SUPABASE_URL`/`SUPABASE_ANON_KEY` into
      `js/data/supabaseClient.js`. Verified end-to-end in the browser by
      dynamically injecting the Supabase CDN script + `supabaseClient.js`
      into the already-open persistent tab (no page file touched) and
      calling every exported function against the live database:
      `projectByParcelId` correctly joins back to the parcel (123 Example
      Avenue), `findingsByProjectId` returns all 11 findings with the
      `finding_sources` join correctly resolving each finding's linked
      source row(s), `questionsByProjectId` returns all 4, and
      `permitStepsByProjectId` returns all 4. Real backend confirmed
      working before any existing page was touched.
- [x] Migrated `property.html` to read from Supabase as the real proof of
      concept. Scope decision: the database is authoritative only for
      what's actually modeled (header/parcel identity, feasibility,
      findings, unknowns, next actions) — `regulatory`/`physical`/
      `infrastructure`/`developmentHistory`/`map` stay on
      `js/data/mockData.js` since they aren't in the schema yet.
      `window.PARCELA.findingById`/`sourceById` were redefined to check
      the new DB-backed data first, then fall back to the original mock
      lookup functions (captured by reference before being overwritten)
      for anything the database doesn't know about — this is what keeps
      the not-yet-migrated sections' hardcoded legacy finding/source
      references (e.g. Regulatory analysis' "Why?" links) working
      unchanged, and, as a bonus, also keeps `sources.html`'s existing
      `property.html?why=<id>` deep links working even though that page
      still generates them from the old mock IDs.
- [x] Caught and fixed two real bugs during this migration, neither
      visible from reading the diff alone — only from testing:
      1. **Async timing bug of my own making**: wrapping the page's
         script in an `async function` to `await` the Supabase fetch
         meant `document.addEventListener("DOMContentLoaded", ...)`
         (used by the `?why=` deep-link auto-open feature) could now be
         registered *after* `DOMContentLoaded` had already fired,
         silently losing the event. Fixed by capturing a `domReady`
         promise synchronously at the very top of the script (before any
         `await`), using the `document.readyState` check + fallback
         listener pattern, so it resolves correctly regardless of when
         the async fetch finishes.
      2. **Timezone off-by-one in the seed data itself**: `last_analyzed_at`
         was stored as UTC midnight (`2026-09-18T00:00:00Z`), and
         formatting it with the browser's local timezone displayed
         "Sep 17" instead of "Sep 18". Fixed by adding
         `timeZone: "UTC"` to the `toLocaleDateString` call, since this
         value represents a calendar date, not an exact moment.
      3. **Missing Spanish accents in `db/seed.sql`**: written without
         diacritics ("Exposicion" instead of "Exposición" etc.),
         visibly wrong once live since Spanish is this product's default
         language. Rewrote `seed.sql` with the exact accented text from
         `js/data/mockData.js` (including en-dashes and em-dashes it
         also used), then had the user run `TRUNCATE TABLE parcels,
         sources CASCADE;` followed by the corrected file against the
         live database — re-verified afterward that `window.PARCELA`'s
         live Spanish findings now render with correct accents.
- [x] Verified end-to-end in Chrome: header/feasibility/findings/
      unknowns/next-actions all live from Supabase with correct
      accented Spanish and correct dates; the flood-exposure "Why?"
      panel and its "View source" expand show real DB evidence fields;
      "See related finding" on a DB question correctly resolves to its
      DB finding; the Regulatory section's legacy-ID "Why?" links still
      resolve via the mock-data fallback; a legacy `?why=f-flood-exposure`
      deep link (the `sources.html`-style old ID) still auto-opens the
      panel correctly via the same fallback, proving the `domReady` fix
      works; no console errors.

## Second migration — sources.html
User chose to spread the existing backend to another page rather than
grow the schema further. `sources.html` was the obvious next target: it
only depends on `P.sources` and `P.findings`, both fully covered by the
schema already, with zero dependency on the still-unmodeled sections —
the smallest-scope option available.
- [x] Added the same Supabase CDN + `supabaseClient.js` script tags,
      wrapped the inline script in an `async` IIFE, fetched the live
      project + its findings, and rebuilt `P.sources` by deduplicating
      the `sources` arrays nested in each finding (this page never
      needed its own new `ParcelaDB` query — the existing
      `findingsByProjectId` join already carries every source needed).
      No `domReady` timing concern here unlike `property.html`, since
      this page has no `DOMContentLoaded`-dependent deep-link logic of
      its own to race against.
- [x] Verified in Chrome: live data loads with correct accented Spanish
      ("Junta de Planificación de Puerto Rico", "vía arterial
      clasificada", etc.), "Referenced by" correctly groups multiple
      findings under one shared source (Mapa de Calificación → both the
      zoning and height-overlay findings), and — since both this page
      and `property.html` now read the same live database — clicking a
      "Referenced by" chip generates a real DB UUID and opens the
      correct finding directly on `property.html`, no longer needing
      the legacy-ID fallback path at all for this cross-page link.
      Confirmed via the same clean-URL workaround as before (the local
      `serve` CLI still strips query strings on the `.html` → clean-URL
      redirect — unrelated to this change). Re-verified in English too;
      no console errors either language.

## Third step — add more properties (Compare + Properties list)
User picked "add more properties" over "expand the schema for regulatory/
physical/infrastructure/history" as the next move (chose the higher
leverage, lower effort option: reuses the existing schema instead of
designing new tables, and unlocks two pages — `properties.html` and
`compare.html`, which both read the exact same `comparisonProperties`
array — at once instead of one).

Real scope, discovered by reading both pages' code before starting:
`comparisonProperties` isn't just more Finding rows — it's a rollup/
summary shape (regulatory complexity, flood exposure, environmental,
infrastructure, "key difference," all as short editorial text) that
doesn't exist as a queryable fact today. `unknownsCount`/
`constraintsCount` genuinely are derivable from real `questions`/
`findings` rows once those exist for a project, but the summary-text
fields are a human/AI synthesis step, not a raw fact — closer to
`feasibility_summary` than to a `Finding`.
- [x] Small additive migration on `projects` (`db/migration_002_
      comparison_fields.sql`, nullable columns, nothing breaking):
      `compare_label`, `compare_status`, `regulatory_complexity`,
      `flood_exposure_summary`, `environmental_summary`,
      `infrastructure_summary`, `key_difference` — all `jsonb {es,en}`
      except `compare_status` (reuses the existing category enum).
      `statusLabel` and `lastAnalyzed` needed no new column — they're
      already `feasibility_status`/`last_analyzed_at` on every project.
- [x] Seeded two more real parcels+projects (`db/seed_more_properties.sql`):
      88 Ashford Avenue (San Juan, multifamily under a mixed-use
      overlay, 5 findings / 2 questions, 0 constraints) and 410 Isla
      Verde Avenue (Carolina, hospitality with real coastal constraints,
      7 findings / 5 questions, 3 constraints), using mockData.js's
      existing `comparisonProperties` summary text for the new columns
      plus newly-authored findings/sources consistent with that text and
      the demo property's tone — reusing the same 9 source rows rather
      than duplicating them, since the same island-wide agencies apply
      to any Puerto Rico parcel. Caught and fixed the same apostrophe-
      escaping bug as last time (`overlay'' s` → `overlay''s`) by
      grepping for the pattern before ever running this against the
      live database.
- [x] Added `allPropertiesSummary()` to `js/data/supabaseClient.js`:
      fetches all projects+parcels, and for each, its findings and
      questions (reusing the existing per-project functions) to compute
      real `constraintsCount`/`unknownsCount` client-side rather than
      storing them (so they can never drift out of sync with the actual
      findings/questions).
- [x] Migrated `properties.html` and `compare.html` to fetch
      `allPropertiesSummary()` and overwrite `P.comparisonProperties`,
      same fallback-safe pattern as the previous two pages.
- [x] Fixed two real integration bugs found only by testing, not by
      reading the diff:
      1. **Duplicated municipality text**: `allPropertiesSummary()`
         originally passed through `parcels.municipality` as stored
         ("San Juan, Puerto Rico"), but both pages' templates append
         ", Puerto Rico" themselves (matching the original mock data's
         bare-city-name convention) — rendered as "San Juan, Puerto
         Rico, Puerto Rico". Fixed by taking only the text before the
         first comma.
      2. **Stale cross-page ids**: `property.html`'s "Compare with other
         properties" button still stored the old mock-style ids
         ("example-ave-123" etc.) in `sessionStorage`, which no longer
         match anything in `compare.html`'s now-live, UUID-keyed
         `comparisonProperties` — would have landed on an empty compare
         page. Fixed by clearing the stale key instead of setting it,
         so `compare.html`'s own existing "show every property" default
         (for when no valid 2+ selection exists) takes over correctly —
         which was already that button's intent.
- [x] Verified in Chrome: `properties.html` shows all 3 real properties
      with correct accented Spanish, correct statuses/types/dates;
      checkbox selection → Compare works; `compare.html`'s table shows
      real, live-computed counts (4/2/5 unresolved questions, 1/0/3
      flagged constraints — matching the seeded data exactly, not
      hardcoded); the `property.html` → "Compare with other properties"
      button correctly falls through to showing all three; verified in
      both languages; no console errors anywhere in this flow.

## Fifth migration — reports.html
Same partial-migration pattern as `property.html`: this page pulls
property/project/feasibility/findings/unknowns/next-actions/sources
(all modeled) plus regulatory/physical/infrastructure/development-
history (not modeled, sections 04-07 of the 11-section report). No new
schema or content needed — this page reuses the exact same demo-property
data `property.html` already fetches.
- [x] Wired the same fetch-and-overwrite block as `property.html`
      (`P.property`/`P.project`/`P.feasibility`/`P.findings`/
      `P.unknowns`/`P.nextActions`), falling back to mock data on error.
      No `domReady` concern here — this page has no `DOMContentLoaded`-
      dependent logic to race against, same as `sources.html`.
- [x] Caught a real bug before it ever ran, by reasoning through the
      page's own template rather than assuming "migrate everything
      touched" was correct: initially also rebuilt `P.sources` from the
      sources cited by findings, same as the other pages — but this
      page's Sources section (11) is a full bibliography, and the
      still-mock Infrastructure section separately cites LUMA, which no
      Finding references. Overwriting `P.sources` would have silently
      dropped LUMA from the report. Fixed by leaving `P.sources`
      untouched — the original mock list is already the same 9 canonical
      sources now also in the database, so it doesn't need rebuilding to
      stay correct.
- [x] Verified in Chrome: sections 01-03 and 08-10 (feasibility,
      property, project, constraint findings, unknowns, next actions)
      render live from Supabase with correct accented Spanish and
      correct dates; sections 04-07 (regulatory/physical/infrastructure/
      history) render unchanged from mock data with no visual
      inconsistency; section 11's source table still lists all 9
      sources including LUMA; verified in both languages; no console
      errors.

Five pages now run on the real database (`property.html`, `sources.html`,
`properties.html`, `compare.html`, `reports.html`). `explore.html`,
`overview.html`, and `projects.html` remain on mock data.

## Sixth migration — explore.html
Explore uses a genuinely different data shape than everything migrated
so far — map x/y position, a zoning-classification string, a qualitative
infrastructure rating (Strong/Moderate/Weak) — none of which existed in
the schema. It also showed 8 mock properties, but only 3 (the ones
already migrated) have any real findings behind them; the other 5
(Loíza Street, Calle Industrial, etc.) were map dots with nothing real
backing them.

Asked the user how to handle the mismatch rather than guessing: author
5 more full properties (same effort as Ashford/Isla Verde, times 5), or
show only the 3 real ones. User chose showing only the 3 real ones —
every dot on the map is now something real and clickable into actual
findings, at the cost of a sparser demo map.
- [x] Small additive migration (`db/migration_003_explore_fields.sql`):
      `explore_x`/`explore_y`/`land_use_classification` on `parcels`
      (physical-parcel attributes), `flood_zone_label`/
      `infrastructure_rating` on `projects` (editorial rollup fields,
      same category as migration 002's summary columns). `potentialUse`
      needed no new column — `project_type.en` already is that value;
      `constraints` (boolean) needed no new column either — computed
      from real findings the same way Compare's `constraintsCount` is.
- [x] Populated those fields for the 3 existing properties
      (`db/seed_explore_fields.sql`), reusing the exact map
      position/classification/flood-label/infrastructure values from
      mockData.js's original `exploreProperties` entries for continuity
      — except Ashford Avenue's `potentialUse`, which the original mock
      inconsistently listed as "Mixed-use" while its own
      `comparisonProperties` (and its real seeded findings, e.g. "Zoning
      permits multifamily use") said "Multifamily." Since Explore now
      reads `potentialUse` from `project_type` directly instead of a
      separate stored value, it automatically matches the real findings
      instead of repeating that old inconsistency.
- [x] Added `exploreProperties()` to `js/data/supabaseClient.js` and
      migrated `explore.html` to fetch it, same fallback-safe pattern as
      every other page.
- [x] Fixed the same `p.id === P.property.id` bug class as
      `properties.html` had (this page's "View intelligence" vs.
      "Analyze this property" CTA branch) — `P.property` isn't
      overwritten on this page, so the comparison needs the known
      `DEMO_PARCEL_ID` constant instead.
- [x] Verified in Chrome: map shows exactly 3 real, correctly positioned
      and color-coded markers ("3 of 3 properties"); each popover shows
      correct accented Spanish fields; the demo property's popover
      correctly says "Ver inteligencia" and navigates to `property.html`,
      the other two correctly say "Analizar esta propiedad" and go to
      `index.html`; the "flagged constraints only" filter correctly
      shows 2 of 3 (dimming Ashford, which has zero constraint
      findings) — computed live, not hardcoded; verified in both
      languages; no console errors.

Six pages now run on the real database. `overview.html` and
`projects.html` remain on mock data.

## Font swap #2 — Geist, then Inter + Cormorant Garamond pairing
- [x] User wasn't sold on Host Grotesk — discussed free alternatives
      (Geist, IBM Plex Sans, General Sans/Switzer) and swapped the whole
      site to self-hosted **Geist** (SIL OFL, same self-hosting pattern
      as Host Grotesk).
- [x] User then sent two Metrik font zips to try instead. Checked both
      licenses before touching anything — the first was an explicit
      "desktop trial, testing only, not for commercial/public use"
      license from Type Department; the second claimed to be a
      different file but was byte-identical to the first (still
      `MetrikTrial-*.otf`) repackaged by a third-party site (befonts.com)
      with a "Personal Use Only" note that doesn't carry real licensing
      weight and wouldn't cover a business product either way. Declined
      to embed either — flagged why, offered buying the real license,
      a throwaway non-committed preview, or a free alternative instead.
- [x] User chose to drop Metrik and go with **Geist** for the time
      being (already done above).
- [x] User then proposed a two-font pairing: Inter Black + "Apple
      Garamond Light Italic," for landing-page headings only, with
      Inter replacing Geist as the base font everywhere else. Flagged
      that Apple Garamond isn't legitimately licensable at all — it was
      Apple's own customized corporate-identity font, never sold
      publicly, so any copy online is an unauthorized rip with no real
      purchase path (unlike Metrik). Recommended **Cormorant Garamond**
      (SIL OFL, Google Fonts) as the closest legitimate match — it's one
      of the only free Garamond-style faces with an actual Light weight,
      matching "Light Italic" more precisely than EB Garamond.
- [x] Asked a scope-clarifying question before touching anything,
      since "the rest of the text" was ambiguous between "rest of the
      landing page" and "replace Geist everywhere" — user confirmed
      Inter everywhere.
- [x] Downloaded and self-hosted Inter (variable, normal + italic) and
      Cormorant Garamond Light Italic from their npm packages via
      jsDelivr (same self-hosting pattern as every previous font swap;
      verified SIL OFL licensing on both before using them). Removed
      the now-unused Geist font files.
- [x] Updated `tokens.css` (`--font-display`/`--font-body` → Inter, new
      `--font-accent` → Cormorant Garamond for the landing-only pairing)
      and `base.css`'s `@font-face` rules.
- [x] Implemented the heading pairing itself. Real constraint found by
      reading the code first: `i18n.js`'s `applyStatic()` sets
      `el.textContent`, not `innerHTML`, so a single `data-i18n`
      heading can't contain inner `<span>` markup — any such markup
      would be wiped out the moment translations apply. Rather than
      switching the whole i18n system to `innerHTML` (a much bigger,
      riskier change affecting every page, for a landing-only need),
      split each of the five main landing headings' single i18n key
      into `_main`/`_accent` key pairs, each in its own `<span>` — one
      styled heavy Inter (`.l-h-main`, weight 900), one styled
      Cormorant Garamond Light Italic (`.l-h-accent`). Chose the actual
      word-split for each heading by hand (e.g. "Know what you're
      getting into" / "before you develop.") to read as a deliberate
      editorial system, not an arbitrary split.
- [x] Verified in Chrome: all five headings (Hero, Problem+Solution,
      Product, Trust, Final CTA) render the pairing correctly in both
      languages; 320px overflow sweep came back clean; no console
      errors from the font change itself.
- [x] **Separately noticed and flagged, unrelated to the font work**:
      the Supabase backend from the earlier migrations is currently
      unreachable (`TypeError: Failed to fetch`, DNS failure on the
      project's own subdomain, while general internet access from the
      same environment works fine) — almost certainly the free-tier
      project auto-pausing after the ~2-week gap since it was last used.
      Every page's fallback-safe design is working exactly as built:
      pages silently revert to prototype mock data instead of breaking.
      User will need to resume the project from the Supabase dashboard
      to restore the live-data features; not yet done as of this entry.

## Font swap #3 — Urbanist
After the Inter + Cormorant Garamond pairing, user tried to source two
more fonts, both declined for licensing reasons — holding the same line
regardless of being asked twice:
- **"Raptor V1/V2 Premium"** from OnlineWebFonts.com: the "Premium"
  naming directly contradicts the site's own blanket "CC BY 4.0"
  license claim — a commercial font someone else designed, redistributed
  with a license the redistributor has no authority to grant. No
  legitimate path found for this specific one.
- **Svatopluk** from exfont.com, licensed "Free for Personal Use" (not
  commercial, and Parcela is a business product either way). Looked up
  the real foundry out of genuine interest — it's a real, distinctive
  typeface by designer Vojtěch Říha for Superior Type, purchasable
  directly from them or rentable monthly via Fontstand. Gave the user
  both links; they didn't end up buying it.
- User then supplied **Urbanist**, which checked out clean: the real,
  official Google Fonts release (SIL OFL, Corey Hu's project), verified
  by inspecting the zip's actual contents (OFL.txt + README matching
  Google Fonts' standard package format) rather than assuming because
  the name sounded familiar.
- [x] Asked a scope-clarifying question before touching anything, since
      Urbanist could have slotted in as just the base font (keeping
      Cormorant Garamond for the landing accent) or replaced the whole
      pairing. User chose the latter: Urbanist everywhere, using its own
      Black weight + Light Italic for the landing-headline contrast
      instead of a second serif family.
- [x] Replaced Inter and Cormorant Garamond's font files with Urbanist's
      variable fonts (normal + italic, self-hosted `.ttf`, same pattern
      as Host Grotesk). Updated `tokens.css` (`--font-display`/
      `--font-body` → Urbanist, removed the now-unneeded `--font-accent`
      token entirely) and `base.css`'s `@font-face` rules. Simplified
      `.l-h-accent` in `landing.css` to drop the separate font-family
      override, since the heading pairing is now one family at two
      weights/styles rather than two families.
- [x] Verified in Chrome: both variable fonts (normal + italic) load
      correctly; all five landing headlines render the Black+Light-Italic
      pairing correctly in both languages; the dense app UI (property
      page) renders cleanly; 320px overflow sweep came back clean on
      both `landing.html` and `property.html`; no console errors from
      the font change.
- [x] Also complied with the repo's `impeccable` design-lint hook, which
      had separately flagged Inter as an "overused font" after the
      previous swap — acknowledged the finding rather than silently
      ignoring it, explained why it reflected a deliberate choice at the
      time, and gave the user the exact suppression command to run
      themselves (the hook's CLI isn't invokable by the agent directly).
      Moot now that Inter has been replaced by Urbanist.

## Real data, milestone 1 — San Juan parcel lookup (2026-10-20)
Goal set by user: real lookup first (no AI yet), one municipality, keep
Prelan's data separate.
- [x] Verified sources against real addresses before writing code:
      CRIM parcels Feb 2025 (`sigejp.pr.gov/.../crim/crim_feb_2025`, much
      newer than the 2018 layer found first), Planning Board current zoning
      (`calificacion/cali_vige`, joins to CRIM on cadastral number), FEMA
      NFHL layer 28 + FIRM panels (layer 3). Census geocoder rejected — it
      matched "1 Calle Fortaleza" to "1 Calle E"; Esri World Geocoder used
      for the point only, nothing stored.
- [x] `js/data/lookup.js`: address or cadastral → parcel, zoning, overlays,
      flood zones touching the parcel polygon (not just a point — 1055
      Ashford is Zone X at the street but touches VE on the beach side),
      map context. Shared 24 s time budget with retries; FEMA intermittently
      refuses connections and recovers on retry.
- [x] First built as a Netlify Function; it never worked in production —
      `sigejp.pr.gov` doesn't answer Netlify's data centers. All three
      servers allow CORS, so the lookup moved into the browser.
- [x] Pages: search/identify/setup/property run on real data with
      `?parcel=<cadastral>`; sections without real data are hidden, unknowns
      list what isn't covered with a next step. Demo property still works.
- Karst overlay (APE-ZC) shows on ~66% of San Juan zoning rows; it's the
  official record, reported as "investigate", not a constraint.
- Next: allowed uses/density per district (Reglamento use tables), more
  municipalities, saving projects, then AI explanations on top.
