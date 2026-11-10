/* Renders the property analysis: finding categories, open questions, next
   steps, regulatory / physical / infrastructure sections, and the
   development-history timeline. Pure DOM string rendering, no framework.

   Every finding carries an evidence basis so the reader can tell an
   official record from ATERRA's reading of a rule, an estimate, or a gap:
     record   — stated by the cited official source
     derived  — ATERRA applied a published rule to this parcel
     estimate — a calculated range, not a determination
     missing  — no data available
     sample   — fictional demonstration data */

window.AterraRender = (function () {
  const I = window.AterraI18N;
  const UI = window.AterraShell;
  const esc = UI.esc;

  function basisOf(f) {
    if (!window.ATERRA.live) return "sample";
    if (f.basis) return f.basis;
    if (f.category === "unknown" || f.confidence === "none" || !f.sourceId) return "missing";
    return "record";
  }

  function basisTag(basis) {
    return `<span class="basis basis-${basis}">${esc(I.t("basis_" + basis))}</span>`;
  }

  function sourceLine(sourceId) {
    const src = window.ATERRA.sourceById(sourceId);
    if (!src) return "";
    return [src.agency || src.name, src.date].filter(Boolean).join(" · ");
  }

  function confidenceBadge(level) {
    return `<span class="confidence" data-level="${esc(level)}"><span class="confidence-bars" aria-hidden="true"><span></span><span></span><span></span></span>${esc(I.t("confidence_" + level))}</span>`;
  }

  function chevronSvg() {
    return `<svg class="chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  function findingCard(f) {
    const src = sourceLine(f.sourceId);
    return `
      <article class="finding-card" data-finding="${esc(f.id)}">
        <h4>${esc(I.tv(f.title))}</h4>
        <p class="fc-summary">${esc(I.tv(f.summary))}</p>
        <div class="fc-footer">
          <div class="fc-evidence">
            ${basisTag(basisOf(f))}
            ${f.confidence && f.confidence !== "none" ? confidenceBadge(f.confidence) : ""}
            ${src ? `<span class="fc-source">${esc(src)}</span>` : ""}
          </div>
          <button type="button" class="why-link" data-why="${esc(f.id)}" aria-haspopup="dialog">${esc(I.t("common_evidence"))} <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        </div>
      </article>`;
  }

  function wireWhy(container) {
    container.querySelectorAll("[data-why]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        window.AterraPanel.open(btn.dataset.why);
      });
    });
  }

  function wireDisclosures(container, toggleSelector, itemSelector) {
    container.querySelectorAll(toggleSelector).forEach((btn) => UI.disclosure(btn, btn.closest(itemSelector)));
  }

  // `openKey` may be a category key, or true to open the first non-empty one.
  function renderFindingCategories(container, categories, openKey) {
    const firstFilled = categories.find((c) => c.findings.length);
    const open = openKey === true ? (firstFilled && firstFilled.key) : openKey;
    container.innerHTML = categories
      .map(
        (c) => `
      <section class="category-group${c.key === open ? " is-open" : ""}" data-category="${c.key}">
        <button type="button" class="category-toggle">
          <span class="category-toggle-left">
            <span class="category-dot ${c.key}" aria-hidden="true"></span>
            <span>${esc(I.t("common_status_" + c.key))}</span>
          </span>
          <span class="category-toggle-left">
            <span class="cat-count">${c.findings.length} ${esc(I.t(c.findings.length === 1 ? "property_findings_one" : "property_findings_many"))}</span>
            ${chevronSvg()}
          </span>
        </button>
        <div class="category-body">${c.findings.length ? c.findings.map(findingCard).join("") : `<p class="category-empty">${esc(I.t("property_noFindings"))}</p>`}</div>
      </section>`
      )
      .join("");
    wireDisclosures(container, ".category-toggle", ".category-group");
    wireWhy(container);
  }

  function renderUnknowns(container, unknowns) {
    if (!unknowns.length) {
      container.innerHTML = `<p class="category-empty">${esc(I.t("property_noUnknowns"))}</p>`;
      return;
    }
    container.innerHTML = unknowns
      .map(
        (u) => `
      <div class="unknown-item">
        <h4>${esc(I.tv(u.title))}</h4>
        <div class="u-label label-xs">${esc(I.t("common_whyItMatters"))}</div>
        <p>${esc(I.tv(u.whyItMatters))}</p>
        <div class="u-label label-xs">${esc(I.t("common_nextStep"))}</div>
        <div class="u-next">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <p>${esc(I.tv(u.nextStep))}</p>
        </div>
        ${u.relatedFindingId && window.ATERRA.findingById(u.relatedFindingId) ? `<button type="button" class="why-link" style="margin-top:6px;" data-why="${esc(u.relatedFindingId)}" aria-haspopup="dialog">${esc(I.t("common_seeRelatedFinding"))}</button>` : ""}
      </div>`
      )
      .join("");
    wireWhy(container);
  }

  function professionalLabel(a) {
    return typeof a.professional === "object" ? I.tv(a.professional) : I.t("professional_" + a.professional);
  }

  function renderNextActions(container, actions) {
    container.innerHTML = actions
      .map(
        (a, i) => `
      <div class="action-item${i === 0 ? " is-open" : ""}" data-action="${esc(a.order)}">
        <button type="button" class="action-row">
          <span class="action-num" aria-hidden="true">${esc(a.order)}</span>
          <span class="action-title">${esc(I.tv(a.title))}</span>
          ${chevronSvg()}
        </button>
        <div class="action-detail">
          <div class="a-label label-xs">${esc(I.t("common_whyItMatters"))}</div>
          <p>${esc(I.tv(a.whyItMatters))}</p>
          <div class="a-label label-xs">${esc(I.t("common_suggestedProfessional"))}</div>
          <span class="professional-tag">${esc(professionalLabel(a))}</span>
          <div class="a-label label-xs">${esc(I.t("common_relevantEvidence"))}</div>
          <div class="evidence-mini">
            <span>${a.sourceId && window.ATERRA.sourceById(a.sourceId) ? esc(window.ATERRA.sourceById(a.sourceId).name) : esc(I.t("common_noSource"))}</span>
            ${a.evidenceRef && window.ATERRA.findingById(a.evidenceRef) ? `<button type="button" class="why-link" data-why="${esc(a.evidenceRef)}" aria-haspopup="dialog">${esc(I.t("common_viewFinding"))}</button>` : ""}
          </div>
        </div>
      </div>`
      )
      .join("");
    wireDisclosures(container, ".action-row", ".action-item");
    wireWhy(container);
  }

  function renderRegulatory(container, reg) {
    // Live data passes a plain list of rows; the demo keeps its fixed set.
    if (reg.rows) {
      container.innerHTML = reg.rows
        .map(
          (r, i) => `
      <div class="field-row">
        <span class="f-label">${esc(I.tv(r.label))}</span>
        <span class="f-value">${esc(I.tv(r.value))}</span>
        <span class="f-actions">${r.whyId && window.ATERRA.findingById(r.whyId) ? `<button type="button" class="why-link" data-reg-row="${i}" aria-haspopup="dialog">${esc(I.t("common_evidence"))}</button>` : ""}</span>
      </div>`
        )
        .join("");
      container.querySelectorAll("[data-reg-row]").forEach((btn) => {
        btn.addEventListener("click", () => window.AterraPanel.open(reg.rows[btn.dataset.regRow].whyId));
      });
      return;
    }
    const rows = [
      { key: "landUse", labelKey: "common_landUse", f: reg.landUse },
      { key: "proposedUse", labelKey: "property_proposedUse", f: reg.proposedUse },
      { key: "applicableRegulation", labelKey: "property_applicableRegulation", f: reg.applicableRegulation },
      { key: "density", labelKey: "property_density", f: reg.density },
      { key: "height", labelKey: "property_height", f: reg.height },
      { key: "parking", labelKey: "property_parking", f: reg.parking },
    ];
    const findingMap = reg.whyIds || {
      density: "f-density-tbd",
      height: "f-height-overlay",
      parking: "f-parking-standard",
      landUse: "f-zoning-compat",
    };
    container.innerHTML = rows
      .map(
        (r) => `
      <div class="field-row">
        <span class="f-label">${esc(I.t(r.labelKey))}</span>
        <span class="f-value">${esc(I.tv(r.f.value))}</span>
        <span class="f-actions">
          ${findingMap[r.key] ? `<button type="button" class="why-link" data-reg-why="${r.key}" aria-haspopup="dialog">${esc(I.t("common_evidence"))}</button>` : ""}
          ${r.key === "applicableRegulation" && !reg.noSummarize ? `<button type="button" class="why-link" data-summarize="1" aria-haspopup="dialog">${esc(I.t("property_summarize"))}</button>` : ""}
        </span>
      </div>`
      )
      .join("");

    container.querySelectorAll("[data-reg-why]").forEach((btn) => {
      btn.addEventListener("click", () => window.AterraPanel.open(findingMap[btn.dataset.regWhy]));
    });
    const summarizeBtn = container.querySelector("[data-summarize]");
    if (summarizeBtn) {
      // Pre-written for the sample property; shown as sample text, not AI.
      summarizeBtn.addEventListener("click", () => {
        const es = [
          `<strong>${esc(reg.applicableRegulation.value)}</strong> es la reglamentación de toda la isla que rige el uso de suelo, la densidad y la permisología para esta clasificación.`,
          "En términos sencillos: establece las reglas base de lo que se puede construir por derecho, y qué bonos de densidad o altura requieren confirmación adicional — como la verificación de capacidad de infraestructura actualmente pendiente para esta parcela.",
        ];
        const en = [
          `<strong>${esc(reg.applicableRegulation.value)}</strong> is the island-wide regulation governing land use, density, and permitting for this classification.`,
          "In plain terms: it sets the baseline rules for what can be built by right, and which density or height bonuses require extra confirmation — like the infrastructure-capacity check currently open for this parcel.",
        ];
        window.AterraAI.open(I.t("ai_summarizeTitle"), I.lang === "es" ? es : en, { mode: "sample" });
      });
    }
  }

  function renderPhysical(container, physical) {
    const cards = [
      { key: "flood", labelKey: "common_flood" },
      { key: "topography", labelKey: "property_topography" },
      { key: "environmental", labelKey: "property_environmental" },
      { key: "soil", labelKey: "property_soilGeology" },
    ];
    container.innerHTML = cards
      .map((c) => {
        const d = physical[c.key];
        return `
      <div class="pc-card">
        <h4>${esc(I.t(c.labelKey))}</h4>
        <div class="pc-row">
          <span class="pc-tag label-xs">${esc(I.t("common_known"))}</span>
          <p class="pc-text">${esc(I.tv(d.known))}</p>
        </div>
        <div class="pc-row">
          <span class="pc-tag label-xs">${esc(I.t("common_needsVerification"))}</span>
          <p class="pc-text">${esc(I.tv(d.needsVerification))}</p>
        </div>
      </div>`;
      })
      .join("");
  }

  function renderInfrastructure(container, infra) {
    const items = [
      { key: "roads", labelKey: "property_roads" },
      { key: "water", labelKey: "property_water" },
      { key: "electricity", labelKey: "property_electricity" },
    ];
    container.innerHTML = items
      .map((i) => {
        const d = infra[i.key];
        return `
      <div class="infra-card">
        <div class="infra-card-top">
          <h4>${esc(I.t(i.labelKey))}</h4>
          ${confidenceBadge(d.confidence)}
        </div>
        <p class="pc-text">${esc(I.tv(d.available))}</p>
        <div class="u-label label-xs">${esc(I.t("common_unknown"))}</div>
        <p class="pc-text">${esc(I.tv(d.unknown))}</p>
        <div class="u-label label-xs">${esc(I.t("common_nextAction"))}</div>
        <p class="pc-text" style="margin-bottom:0;">${esc(I.tv(d.nextAction))}</p>
      </div>`;
      })
      .join("");
  }

  function renderTimeline(container, history) {
    container.innerHTML = history
      .map(
        (h, i) => `
      <div class="timeline-item" data-idx="${i}">
        <button type="button" class="timeline-toggle">
          <span class="timeline-year">${esc(h.year)}</span>
          <span class="timeline-title">${esc(I.tv(h.eventType))}</span>
        </button>
        <div class="timeline-detail">
          <p style="margin-bottom:6px;">${esc(I.tv(h.description))}</p>
          <div class="evidence-mini">
            <span>${window.ATERRA.sourceById(h.sourceId) ? esc(window.ATERRA.sourceById(h.sourceId).name) : "—"}</span>
            <span>${esc(h.documents.map(I.tv).join(", "))}</span>
          </div>
        </div>
      </div>`
      )
      .join("");
    wireDisclosures(container, ".timeline-toggle", ".timeline-item");
  }

  // The legend that explains the basis tags; `kinds` picks which to show.
  function renderEvidenceKey(container, kinds) {
    container.innerHTML = `<span class="evidence-key-title">${esc(I.t("basis_keyTitle"))}</span>` + kinds.map(basisTag).join("");
  }

  return {
    basisOf,
    basisTag,
    professionalLabel,
    renderFindingCategories,
    renderUnknowns,
    renderNextActions,
    renderRegulatory,
    renderPhysical,
    renderInfrastructure,
    renderTimeline,
    renderEvidenceKey,
  };
})();
