/* Renders the Property Intelligence panel: finding categories, unknowns,
   next actions, regulatory / physical / infrastructure sections, and the
   development-history timeline. Pure DOM string rendering, no framework. */

window.ParcelaRender = (function () {
  const I = window.ParcelaI18N;

  function confidenceBadge(level) {
    return `<span class="confidence" data-level="${level}"><span class="confidence-bars"><span></span><span></span><span></span></span>${I.t("confidence_" + level)}</span>`;
  }

  function findingCard(f) {
    return `
      <div class="finding-card" data-finding="${f.id}">
        <div class="finding-card-top">
          <h4>${I.tv(f.title)}</h4>
          <span class="status status-${f.category}">${I.t("common_status_" + f.category)}</span>
        </div>
        <p class="fc-summary">${I.tv(f.summary)}</p>
        <div class="fc-footer">
          ${confidenceBadge(f.confidence)}
          <button class="why-link" data-why="${f.id}">${I.t("common_why")} <svg viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        </div>
      </div>`;
  }

  function chevronSvg() {
    return `<svg class="chevron" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  function renderFindingCategories(container, categories, openKey) {
    container.innerHTML = categories
      .map(
        (c) => `
      <div class="category-group${c.key === openKey ? " is-open" : ""}" data-category="${c.key}">
        <button class="category-toggle">
          <span class="category-toggle-left">
            <span class="category-dot ${c.key}"></span>
            <span>${I.t("common_status_" + c.key)}</span>
          </span>
          <span class="category-toggle-left">
            <span class="cat-count">${c.findings.length} ${I.t(c.findings.length === 1 ? "property_findings_one" : "property_findings_many")}</span>
            ${chevronSvg()}
          </span>
        </button>
        <div class="category-body">${c.findings.map(findingCard).join("")}</div>
      </div>`
      )
      .join("");

    container.querySelectorAll(".category-toggle").forEach((btn) => {
      btn.addEventListener("click", () => btn.closest(".category-group").classList.toggle("is-open"));
    });
    container.querySelectorAll("[data-why]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        window.ParcelaPanel.open(btn.dataset.why);
      });
    });
    container.querySelectorAll(".finding-card").forEach((card) => {
      card.addEventListener("click", () => window.ParcelaPanel.open(card.dataset.finding));
    });
  }

  function renderUnknowns(container, unknowns) {
    container.innerHTML = unknowns
      .map(
        (u) => `
      <div class="unknown-item">
        <h4><span class="status status-unknown">${I.t("common_status_unknown")}</span></h4>
        <h4>${I.tv(u.title)}</h4>
        <div class="u-label">${I.t("common_whyItMatters")}</div>
        <p class="text-sm" style="margin-bottom:0;">${I.tv(u.whyItMatters)}</p>
        <div class="u-label">${I.t("common_nextStep")}</div>
        <div class="u-next">
          <svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <p class="text-sm" style="margin-bottom:0;">${I.tv(u.nextStep)}</p>
        </div>
        ${u.relatedFindingId ? `<button class="why-link" style="margin-top:8px;" data-why="${u.relatedFindingId}">${I.t("common_seeRelatedFinding")}</button>` : ""}
      </div>`
      )
      .join("");
    container.querySelectorAll("[data-why]").forEach((btn) => {
      btn.addEventListener("click", () => window.ParcelaPanel.open(btn.dataset.why));
    });
  }

  function renderNextActions(container, actions) {
    container.innerHTML = actions
      .map(
        (a) => `
      <div class="action-item" data-action="${a.order}">
        <button class="action-row">
          <span class="action-num">${a.order}</span>
          <h4>${I.tv(a.title)}</h4>
          ${chevronSvg()}
        </button>
        <div class="action-detail">
          <div class="a-label">${I.t("common_whyItMatters")}</div>
          <p class="text-sm" style="margin-bottom:0;">${I.tv(a.whyItMatters)}</p>
          <div class="a-label">${I.t("common_suggestedProfessional")}</div>
          <span class="professional-tag">${I.t("professional_" + a.professional)}</span>
          <div class="a-label">${I.t("common_relevantEvidence")}</div>
          <div class="evidence-mini">
            <span>${a.sourceId ? window.PARCELA.sourceById(a.sourceId).name : "—"}</span>
            ${a.evidenceRef ? `<button class="why-link" data-why="${a.evidenceRef}">${I.t("common_viewFinding")}</button>` : ""}
          </div>
        </div>
      </div>`
      )
      .join("");
    container.querySelectorAll(".action-row").forEach((btn) => {
      btn.addEventListener("click", () => btn.closest(".action-item").classList.toggle("is-open"));
    });
    container.querySelectorAll("[data-why]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        window.ParcelaPanel.open(btn.dataset.why);
      });
    });
  }

  function renderRegulatory(container, reg) {
    const rows = [
      { key: "landUse", labelKey: "common_landUse", f: reg.landUse },
      { key: "proposedUse", labelKey: "property_proposedUse", f: reg.proposedUse },
      { key: "applicableRegulation", labelKey: "property_applicableRegulation", f: reg.applicableRegulation },
      { key: "density", labelKey: "property_density", f: reg.density },
      { key: "height", labelKey: "property_height", f: reg.height },
      { key: "parking", labelKey: "property_parking", f: reg.parking },
    ];
    const findingMap = {
      density: "f-density-tbd",
      height: "f-height-overlay",
      parking: "f-parking-standard",
      landUse: "f-zoning-compat",
    };
    container.innerHTML = rows
      .map(
        (r) => `
      <div class="field-row">
        <span class="f-label">${I.t(r.labelKey)}</span>
        <span class="f-value-group">
          <span class="f-value">${I.tv(r.f.value)}</span>
          ${findingMap[r.key] ? `<button class="why-link" data-reg-why="${r.key}">${I.t("common_why")}</button>` : ""}
          ${r.key === "applicableRegulation" ? `<button class="why-link" data-summarize="1">${I.t("property_summarize")}</button>` : ""}
        </span>
      </div>`
      )
      .join("");

    container.querySelectorAll("[data-reg-why]").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.ParcelaPanel.open(findingMap[btn.dataset.regWhy]);
      });
    });
    const summarizeBtn = container.querySelector("[data-summarize]");
    if (summarizeBtn) {
      summarizeBtn.addEventListener("click", () => {
        const es = [
          `<strong>${reg.applicableRegulation.value}</strong> es la reglamentación de toda la isla que rige el uso de suelo, la densidad y la permisología para esta clasificación.`,
          "En términos sencillos: establece las reglas base de lo que se puede construir por derecho, y qué bonos de densidad o altura requieren confirmación adicional — como la verificación de capacidad de infraestructura actualmente pendiente para esta parcela.",
        ];
        const en = [
          `<strong>${reg.applicableRegulation.value}</strong> is the island-wide regulation governing land use, density, and permitting for this classification.`,
          "In plain terms: it sets the baseline rules for what can be built by right, and which density or height bonuses require extra confirmation — like the infrastructure-capacity check currently open for this parcel.",
        ];
        window.ParcelaAI.open(I.t("ai_summarizeTitle"), I.lang === "es" ? es : en);
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
        <h4>${I.t(c.labelKey)}</h4>
        <div class="pc-row">
          <span class="pc-tag">${I.t("common_known")}</span>
          <p class="pc-text">${I.tv(d.known)}</p>
        </div>
        <div class="pc-row">
          <span class="pc-tag">${I.t("common_needsVerification")}</span>
          <p class="pc-text">${I.tv(d.needsVerification)}</p>
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
          <h4>${I.t(i.labelKey)}</h4>
          ${confidenceBadge(d.confidence)}
        </div>
        <p class="pc-text">${I.tv(d.available)}</p>
        <div class="u-label">${I.t("common_unknown")}</div>
        <p class="pc-text">${I.tv(d.unknown)}</p>
        <div class="u-label">${I.t("common_nextAction")}</div>
        <p class="pc-text" style="margin-bottom:0;">${I.tv(d.nextAction)}</p>
      </div>`;
      })
      .join("");
  }

  function renderTimeline(container, history) {
    container.innerHTML = history
      .map(
        (h, i) => `
      <div class="timeline-item" data-idx="${i}">
        <button class="timeline-toggle">
          <span class="timeline-year">${h.year}</span>
          <h4>${I.tv(h.eventType)}</h4>
        </button>
        <div class="timeline-detail">
          <p style="margin-bottom:6px;">${I.tv(h.description)}</p>
          <div class="evidence-mini">
            <span>${window.PARCELA.sourceById(h.sourceId) ? window.PARCELA.sourceById(h.sourceId).name : "—"}</span>
            <span>${h.documents.map(I.tv).join(", ")}</span>
          </div>
        </div>
      </div>`
      )
      .join("");
    container.querySelectorAll(".timeline-toggle").forEach((btn) => {
      btn.addEventListener("click", () => btn.closest(".timeline-item").classList.toggle("is-open"));
    });
  }

  return {
    renderFindingCategories,
    renderUnknowns,
    renderNextActions,
    renderRegulatory,
    renderPhysical,
    renderInfrastructure,
    renderTimeline,
  };
})();
