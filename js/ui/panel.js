/* The evidence panel: conclusion → why it matters → evidence → how far to
   trust it. Opens from any finding so the reader never leaves the analysis
   to see what a statement rests on.

   The panel builds its own markup on first use, so a page only needs to
   load this file (after shell.js). */

window.AterraPanel = (function () {
  const I = window.AterraI18N;
  const UI = window.AterraShell;
  const esc = UI.esc;

  let panel, dlg, els;

  function build() {
    let scrim = document.getElementById("scrim");
    if (!scrim) {
      scrim = document.createElement("div");
      scrim.className = "scrim";
      scrim.id = "scrim";
      document.body.appendChild(scrim);
    }
    panel = document.createElement("aside");
    panel.className = "side-panel";
    panel.id = "why-panel";
    panel.setAttribute("aria-hidden", "true");
    panel.setAttribute("aria-labelledby", "wp-title");
    panel.innerHTML = `
      <div class="side-panel-head">
        <div>
          <span class="status" id="wp-status"></span>
          <h2 id="wp-title"></h2>
        </div>
        <button type="button" class="side-panel-close" id="wp-close" aria-label="${esc(I.t("a11y_close"))}">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="side-panel-body">
        <div class="side-panel-section">
          <div class="sp-label">${esc(I.t("panel_whatFound"))}</div>
          <div class="sp-body" id="wp-found"></div>
        </div>
        <div class="side-panel-section">
          <div class="sp-label">${esc(I.t("common_whyItMatters"))}</div>
          <div class="sp-body" id="wp-matters"></div>
        </div>
        <div class="side-panel-section">
          <div class="sp-label">${esc(I.t("panel_basis"))}</div>
          <div id="wp-basis"></div>
          <p class="sp-note" id="wp-basis-note"></p>
        </div>
        <div class="side-panel-section">
          <div class="sp-label">${esc(I.t("panel_evidence"))}</div>
          <dl class="evidence-block">
            <div class="evidence-row"><dt class="e-k">${esc(I.t("panel_source"))}</dt><dd class="e-v" id="wp-src-name"></dd></div>
            <div class="evidence-row"><dt class="e-k">${esc(I.t("panel_agency"))}</dt><dd class="e-v" id="wp-src-agency"></dd></div>
            <div class="evidence-row"><dt class="e-k">${esc(I.t("panel_date"))}</dt><dd class="e-v" id="wp-src-date"></dd></div>
            <div class="evidence-row" id="wp-src-retrieved-row"><dt class="e-k">${esc(I.t("panel_retrieved"))}</dt><dd class="e-v" id="wp-src-retrieved"></dd></div>
            <div class="evidence-row"><dt class="e-k">${esc(I.t("panel_section"))}</dt><dd class="e-v" id="wp-src-section"></dd></div>
            <div class="evidence-row"><dt class="e-k">${esc(I.t("panel_document"))}</dt><dd class="e-v" id="wp-src-doc"></dd></div>
          </dl>
        </div>
        <div class="side-panel-section side-panel-pair">
          <div>
            <div class="sp-label">${esc(I.t("panel_confidence"))}</div>
            <span class="confidence" id="wp-confidence" data-level="">
              <span class="confidence-bars" aria-hidden="true"><span></span><span></span><span></span></span>
              <span id="wp-confidence-label"></span>
            </span>
          </div>
          <div>
            <div class="sp-label">${esc(I.t("panel_professionalVerification"))}</div>
            <div class="verification-block">
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1.5l5.5 2.2v4.1c0 3.6-2.3 6.4-5.5 7.7-3.200-1.3-5.5-4.1-5.5-7.7V3.700L8 1.5z" stroke="currentColor" stroke-width="1.3"/></svg>
              <span id="wp-verification"></span>
            </div>
          </div>
        </div>
      </div>
      <div class="side-panel-footer" id="wp-footer">
        <a href="sources.html" class="btn btn-ghost btn-block" id="wp-all-sources">${esc(I.t("panel_viewAllSources"))}</a>
      </div>`;
    document.body.appendChild(panel);
    const q = (id) => document.getElementById(id);
    els = {
      status: q("wp-status"), title: q("wp-title"), found: q("wp-found"), matters: q("wp-matters"),
      basis: q("wp-basis"), basisNote: q("wp-basis-note"),
      srcName: q("wp-src-name"), srcAgency: q("wp-src-agency"), srcDate: q("wp-src-date"),
      srcRetrievedRow: q("wp-src-retrieved-row"), srcRetrieved: q("wp-src-retrieved"),
      srcSection: q("wp-src-section"), srcDoc: q("wp-src-doc"),
      confidence: q("wp-confidence"), confidenceLabel: q("wp-confidence-label"),
      verification: q("wp-verification"), footer: q("wp-footer"),
    };
    dlg = UI.dialog(panel, scrim);
    q("wp-close").addEventListener("click", close);
  }

  function open(findingId) {
    const P = window.ATERRA;
    const finding = P.findingById(findingId);
    if (!finding) return;
    if (!panel) build();
    if (window.AterraAI) window.AterraAI.close();
    const source = P.sourceById(finding.sourceId);
    const basis = window.AterraRender ? window.AterraRender.basisOf(finding) : (P.live ? "record" : "sample");

    els.status.className = `status status-${finding.category}`;
    els.status.textContent = I.t("common_status_" + finding.category);
    els.title.textContent = I.tv(finding.title);
    els.found.textContent = I.tv(finding.why.found);
    els.matters.textContent = I.tv(finding.why.matters);
    els.basis.innerHTML = `<span class="basis basis-${basis}">${esc(I.t("basis_" + basis))}</span>`;
    els.basisNote.textContent = I.t("basis_" + basis + "_def");

    const dash = "—";
    if (source) {
      els.srcName.textContent = source.name || dash;
      els.srcAgency.textContent = source.agency || dash;
      els.srcDate.textContent = source.date || dash;
      els.srcRetrievedRow.hidden = !source.retrieved;
      els.srcRetrieved.textContent = source.retrieved || "";
      els.srcSection.textContent = source.section || dash;
      if (/^https:\/\//.test(source.document || "")) {
        els.srcDoc.innerHTML = "";
        const a = document.createElement("a");
        a.href = source.document;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = `${new URL(source.document).hostname} ↗`;
        els.srcDoc.appendChild(a);
      } else {
        els.srcDoc.textContent = source.document || dash;
      }
    } else {
      els.srcName.textContent = I.t("panel_noSource");
      [els.srcAgency, els.srcDate, els.srcSection, els.srcDoc].forEach((el) => { el.textContent = dash; });
      els.srcRetrievedRow.hidden = true;
    }

    els.confidence.dataset.level = finding.confidence;
    els.confidenceLabel.textContent = I.t("confidence_" + finding.confidence);
    els.verification.textContent = I.t("verification_" + finding.why.verification);
    // The source library page documents the sample property only.
    els.footer.hidden = !!P.live;

    dlg.open();
  }

  function close() {
    if (dlg) dlg.close();
  }

  return { open, close };
})();
