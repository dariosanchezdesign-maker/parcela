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
