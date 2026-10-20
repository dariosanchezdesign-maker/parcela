/* The "Why?" contextual side panel: Conclusion -> Explanation -> Evidence.
   Also doubles as the finding-level "view source" surface so the user never
   navigates away to see evidence. */

window.ParcelaPanel = (function () {
  const I = window.ParcelaI18N;

  let panel, scrim, els;

  function q(id) { return document.getElementById(id); }

  function init() {
    panel = q("why-panel");
    scrim = q("scrim");
    if (!panel) return;
    els = {
      status: q("wp-status"),
      title: q("wp-title"),
      found: q("wp-found"),
      matters: q("wp-matters"),
      srcName: q("wp-src-name"),
      srcAgency: q("wp-src-agency"),
      srcDate: q("wp-src-date"),
      confidence: q("wp-confidence"),
      confidenceLabel: q("wp-confidence-label"),
      verification: q("wp-verification"),
      close: q("wp-close"),
      viewSource: q("wp-view-source"),
      sourceDetail: q("wp-source-detail"),
      srcSection: q("wp-src-section"),
      srcDoc: q("wp-src-doc"),
    };
    els.close.addEventListener("click", close);
    scrim.addEventListener("click", close);
    els.viewSource.addEventListener("click", () => {
      const open = els.sourceDetail.classList.toggle("is-open");
      els.viewSource.textContent = open ? I.t("panel_hideSourceDetail") : I.t("panel_viewSource");
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  function open(findingId) {
    const finding = window.PARCELA.findingById(findingId);
    if (!finding) return;
    if (window.ParcelaAI) window.ParcelaAI.close();
    const source = window.PARCELA.sourceById(finding.sourceId);

    els.status.className = `status status-${finding.category}`;
    els.status.textContent = I.tv(finding.title);
    els.title.textContent = I.t("panel_title_" + finding.category);
    els.found.textContent = I.tv(finding.why.found);
    els.matters.textContent = I.tv(finding.why.matters);

    if (source) {
      els.srcName.textContent = source.name;
      els.srcAgency.textContent = source.agency;
      els.srcDate.textContent = source.date;
      els.srcSection.textContent = source.section;
      if (/^https:\/\//.test(source.document || "")) {
        els.srcDoc.innerHTML = "";
        const a = document.createElement("a");
        a.href = source.document;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = new URL(source.document).hostname;
        els.srcDoc.appendChild(a);
      } else {
        els.srcDoc.textContent = source.document;
      }
    } else {
      els.srcName.textContent = I.t("panel_notAvailable");
      els.srcAgency.textContent = "—";
      els.srcDate.textContent = "—";
      els.srcSection.textContent = "—";
      els.srcDoc.textContent = "—";
    }

    els.confidence.dataset.level = finding.confidence;
    els.confidenceLabel.textContent = I.t("confidence_" + finding.confidence);
    els.verification.textContent = I.t("verification_" + finding.why.verification);

    els.sourceDetail.classList.remove("is-open");
    els.viewSource.textContent = I.t("panel_viewSource");

    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    scrim.classList.add("is-visible");
  }

  function close() {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    scrim.classList.remove("is-visible");
  }

  document.addEventListener("DOMContentLoaded", init);

  return { open, close };
})();
