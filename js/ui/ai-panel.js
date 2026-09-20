/* Contextual AI actions ("Explain this", "What should I investigate next?",
   "Summarize this regulation"). A small analyst-style panel — never the
   visual hero, never a persistent chat surface. */

window.ParcelaAI = (function () {
  let panel, scrim, titleEl, bodyEl;

  function q(id) { return document.getElementById(id); }

  function init() {
    panel = q("ai-panel");
    scrim = q("scrim");
    if (!panel) return;
    titleEl = q("ai-title");
    bodyEl = q("ai-body");
    q("ai-close").addEventListener("click", close);
    scrim.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  function open(title, paragraphs) {
    if (window.ParcelaPanel) window.ParcelaPanel.close();
    titleEl.textContent = title;
    bodyEl.innerHTML = paragraphs.map((p) => `<p>${p}</p>`).join("");
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
