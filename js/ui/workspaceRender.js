/** Shared render helpers for project.html. */
window.PARCELA_WS_RENDER = (function () {
  const ROLE_SECTIONS = {
    owner: ["overview", "roadmap", "documents", "professionals", "budget", "financing", "build", "activity"],
    architect: ["overview", "roadmap", "documents", "professionals", "activity"],
    engineer: ["overview", "roadmap", "documents", "activity"],
    contractor: ["overview", "roadmap", "documents", "build", "activity"],
    investor: ["overview", "budget", "financing", "timeline", "activity"],
    attorney: ["overview", "roadmap", "documents", "activity"],
    family: ["overview", "activity"]
  };
  const ROLE_LABELS = { owner: "Owner", architect: "Architect", engineer: "Engineer", contractor: "Contractor", investor: "Investor", attorney: "Attorney", family: "Family member" };

  function statusPill(status, label) {
    return `<span class="status-pill status-${status}">${label || status.replace("-", " ")}</span>`;
  }

  function proById(id) { return (window.PARCELA_PROFESSIONALS || []).find((p) => p.id === id) || null; }

  function initials(name) { return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(); }

  function proCard(pro, note) {
    return `
      <div class="card pro-card">
        <div class="pro-avatar">${initials(pro.name)}</div>
        <div class="pro-info">
          <h4>${pro.name}</h4>
          <div class="pro-firm">${pro.firm} · ${pro.region}</div>
          <p>${pro.blurb}</p>
          ${note || ""}
        </div>
      </div>`;
  }

  function chainDotClass(step) {
    if (step.status === "approved") return "is-approved";
    if (step.status === "needs-correction") return "is-issue";
    if (step.status === "preparing" || step.status === "ready" || step.status === "submitted") return "is-active";
    return "";
  }

  function chainItem(step, i, total) {
    const pro = step.assignedProfessionalId ? proById(step.assignedProfessionalId) : null;
    const subItemsHtml = step.subItems && step.subItems.length
      ? `<div class="chain-docs"><strong>Includes:</strong> ${step.subItems.map((s) => s.label).join(", ")}</div>` : "";
    return `
      <div class="chain-item">
        <div class="chain-marker">
          <div class="chain-dot ${chainDotClass(step)}">${step.status === "approved" ? "✓" : i + 1}</div>
          ${i < total - 1 ? '<div class="chain-line"></div>' : ""}
        </div>
        <div class="card chain-card">
          <div class="chain-top">
            <h4>${step.label}</h4>
            ${statusPill(step.status, step.statusLabel)}
          </div>
          <p class="text-sm" style="margin-bottom:0;">${step.why}</p>
          ${subItemsHtml}
          ${step.docsRequired.length ? `<div class="chain-docs"><strong>Documents:</strong> ${step.docsRequired.join(", ")}</div>` : ""}
          <div class="chain-meta">
            ${step.professionalCategory ? `<span><strong>${pro ? pro.name : "Unassigned"}</strong> (${step.professionalCategory})</span>` : ""}
            ${step.estCostRange ? `<span>Est. <strong>$${step.estCostRange[0].toLocaleString()}–$${step.estCostRange[1].toLocaleString()}</strong></span>` : `<span class="muted">No direct professional cost</span>`}
            ${step.blocked ? `<span class="blocked-tag">Blocked</span>` : ""}
          </div>
          <div class="chain-next">
            <strong>Next action:</strong> ${step.nextAction}
          </div>
          <div style="margin-top: var(--sp-3); display:flex; gap:8px; align-items:center;">
            <label class="text-sm" style="margin:0;">Mark as</label>
            <select class="status-select" data-step="${step.id}">
              ${["not-started","preparing","ready","submitted","needs-correction","approved"].map((s) =>
                `<option value="${s}" ${s === step.status ? "selected" : ""}>${s.replace("-", " ")}</option>`).join("")}
            </select>
          </div>
        </div>
      </div>`;
  }

  function docTypeLabel(type) { return (window.PARCELA_DOCUMENT_ENGINE.TYPE_LABELS || {})[type] || type; }

  function docCard(doc) {
    return `
      <div class="card doc-card">
        <div class="doc-main">
          <h4>${doc.name}</h4>
          <div class="doc-meta">${docTypeLabel(doc.type)} · uploaded ${new Date(doc.uploadedAt).toLocaleDateString()}</div>
          <ul class="doc-extracted">${doc.extracted.map((e) => `<li>${e}</li>`).join("")}</ul>
        </div>
      </div>`;
  }

  function budgetBar(range, accepted, evalResult) {
    const scaleMax = Math.max(range[1] * 1.25, accepted || 0);
    const rangeLeft = (range[0] / scaleMax) * 100, rangeWidth = ((range[1] - range[0]) / scaleMax) * 100;
    const markerLeft = accepted ? Math.min((accepted / scaleMax) * 100, 99) : null;
    const anomaly = evalResult && evalResult.withinRange === false;
    return `
      <div class="budget-bar-track">
        <div class="budget-bar-range" style="left:${rangeLeft}%; width:${rangeWidth}%;"></div>
        ${markerLeft != null ? `<div class="budget-bar-marker ${anomaly ? "anomaly" : ""}" style="left:${markerLeft}%;"></div>` : ""}
      </div>`;
  }

  function activityItem(entry) {
    return `
      <div class="activity-item">
        <div class="activity-dot"></div>
        <div>
          <div class="activity-meta">${entry.actor} · ${new Date(entry.at).toLocaleDateString()} ${new Date(entry.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
          <div class="text-sm">${entry.text}</div>
        </div>
      </div>`;
  }

  function collabRow(c) {
    return `
      <div class="collab-row">
        <div class="pro-avatar" style="width:36px;height:36px;font-size:0.8rem;">${initials(c.name)}</div>
        <div><strong>${c.name}</strong><div class="text-sm muted">${c.roleLabel}</div></div>
      </div>`;
  }

  return { ROLE_SECTIONS, ROLE_LABELS, statusPill, proById, initials, proCard, chainItem, docTypeLabel, docCard, budgetBar, activityItem, collabRow };
})();
