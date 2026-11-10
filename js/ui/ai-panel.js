/* Contextual explanations ("Explain this", "What should I investigate
   first?"). A side panel, never a chat surface, and always labeled for what
   it is: AI-written text explains the findings on the page and adds no
   facts; sample text is pre-written for the demonstration property.

   open(title, paragraphs, { mode: "ai" | "sample" | "status" })
   `paragraphs` are HTML strings the caller has already escaped. */

window.AterraAI = (function () {
  const I = window.AterraI18N;
  const UI = window.AterraShell;
  const esc = UI.esc;

  let panel, dlg, titleEl, bodyEl, tagEl, noteEl;

  function build() {
    let scrim = document.getElementById("scrim");
    if (!scrim) {
      scrim = document.createElement("div");
      scrim.className = "scrim";
      scrim.id = "scrim";
      document.body.appendChild(scrim);
    }
    panel = document.createElement("aside");
    panel.className = "side-panel side-panel-ai";
    panel.id = "ai-panel";
    panel.setAttribute("aria-hidden", "true");
    panel.setAttribute("aria-labelledby", "ai-title");
    panel.innerHTML = `
      <div class="side-panel-head">
        <div>
          <span class="tag tag-ai" id="ai-tag"></span>
          <h2 id="ai-title"></h2>
        </div>
        <button type="button" class="side-panel-close" id="ai-close" aria-label="${esc(I.t("a11y_close"))}">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="side-panel-body">
        <div class="ai-panel-body" id="ai-body" aria-live="polite"></div>
        <p class="ai-disclaimer" id="ai-note"></p>
      </div>`;
    document.body.appendChild(panel);
    titleEl = document.getElementById("ai-title");
    bodyEl = document.getElementById("ai-body");
    tagEl = document.getElementById("ai-tag");
    noteEl = document.getElementById("ai-note");
    dlg = UI.dialog(panel, scrim);
    document.getElementById("ai-close").addEventListener("click", close);
  }

  function open(title, paragraphs, opts) {
    const mode = (opts && opts.mode) || "ai";
    if (!panel) build();
    if (window.AterraPanel) window.AterraPanel.close();
    titleEl.textContent = title;
    tagEl.className = mode === "sample" ? "tag" : "tag tag-ai";
    tagEl.textContent = I.t(mode === "sample" ? "ai_tagSample" : "ai_tagAI");
    bodyEl.innerHTML = mode === "status"
      ? `<p class="ai-status"><span class="spinner" aria-hidden="true"></span>${paragraphs[0]}</p>`
      : paragraphs.map((p) => `<p>${p}</p>`).join("");
    noteEl.textContent = I.t(mode === "sample" ? "ai_disclaimerSample" : "ai_disclaimer");
    if (!dlg.isOpen()) dlg.open();
  }

  function close() {
    if (dlg) dlg.close();
  }

  return { open, close };
})();
