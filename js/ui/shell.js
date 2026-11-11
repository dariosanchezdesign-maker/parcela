/* ATERRA shell: the brand and navigation components every page shares.
   Defined as light-DOM custom elements so pages declare them once instead of
   copying markup:

     <aterra-logo [tone="dark"] [size="lg"] [mark-only]>
     <aterra-sidebar active="overview" [status="sample|none"]>
     <aterra-flowbar [step="1|2|3"]>

   Load this file (after js/i18n.js) in <head> so the elements upgrade as the
   parser reaches them and nothing shifts after first paint. */

window.AterraShell = (function () {
  const I = window.AterraI18N;
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // ---------- logo ----------
  // Mark: a peak standing on a ground line — the "A" of ATERRA on terra.
  // Wordmark: drawn letterforms; the A's carry no crossbar, echoing the mark.
  // Each logo gets its own gradient id so several can share a page.
  let logoCount = 0;
  const mark = (id) => `<svg class="logo-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <defs><linearGradient id="${id}" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#4818B8"/><stop offset="0.38" stop-color="#7831FD"/><stop offset="0.7" stop-color="#D33C70"/><stop offset="1" stop-color="#FE6F33"/>
    </linearGradient></defs>
    <rect class="logo-tile" x="0" y="0" width="32" height="32" rx="9" fill="url(#${id})"/>
    <path class="logo-peak" d="M7 20 14.3 7h3.4L25 20h-3.4L16 10l-5.6 10z"/>
    <rect class="logo-ground" x="7" y="22.4" width="18" height="2.6" rx="1.3"/>
  </svg>`;
  const WORD = `<svg class="logo-word" viewBox="0 0 100 16" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M0 16 6 0h3l6 16h-3L7.5 4 3 16z"/>
    <path d="M18.2 0h13v2.8h-5.1V16h-2.8V2.8h-5.1z"/>
    <path d="M35.7 0h11v2.8h-8.2v3.8h6.7v2.8h-6.7v3.8h8.2V16h-11z"/>
    <path fill-rule="evenodd" d="M51.2 0h7.5a5 5 0 0 1 1.6 9.74L64.1 16h-3.4l-3.6-6h-3.1v6h-2.8zM54 2.8h4.7a2.2 2.2 0 0 1 0 4.4H54z"/>
    <path fill-rule="evenodd" d="M68.6 0h7.5a5 5 0 0 1 1.6 9.74L81.5 16h-3.4l-3.6-6h-3.1v6h-2.8zM71.4 2.8h4.7a2.2 2.2 0 0 1 0 4.4h-4.7z"/>
    <path d="M85 16 91 0h3l6 16h-3L92.5 4 88 16z"/>
  </svg>`;

  class AterraLogo extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready) return;
      this.dataset.ready = "1";
      this.setAttribute("role", "img");
      this.setAttribute("aria-label", "ATERRA");
      this.innerHTML = mark(`aterra-logo-g${++logoCount}`) + (this.hasAttribute("mark-only") ? "" : WORD);
    }
  }

  // ---------- icons ----------
  const ICONS = {
    plus: '<path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    overview: '<rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>',
    explore: '<path d="M3 6l5-2 4 2 5-2v10l-5 2-4-2-5 2V6z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 4v10M12 6v10" stroke="currentColor" stroke-width="1.5"/>',
    properties: '<path d="M3 7.5 10 3l7 4.5V17H3V7.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 17v-5h4v5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
    compare: '<rect x="3" y="4" width="5.5" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="11.5" y="4" width="5.5" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/>',
    projects: '<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h3.2l1.6 2h6.2A1.5 1.5 0 0 1 17 8.5v6A1.5 1.5 0 0 1 15.500 16h-11A1.5 1.5 0 0 1 3 14.5v-8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
    reports: '<path d="M5 2.5h7l3 3v12H5v-15z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 10h4M8 13h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    sources: '<path d="M4 4.5h12M4 10h12M4 15.500h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="15" cy="15.500" r="1.6" stroke="currentColor" stroke-width="1.4"/>',
  };
  const icon = (name) => `<svg class="shell-nav-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;

  // The workflow the product is organized around: Discover → Analyze →
  // Evaluate → Decide. Compare and Sources are secondary on phones (reached
  // from Properties and from any report or finding).
  const NAV = [
    { labelKey: "nav_group_workspace", items: [{ id: "overview", href: "overview.html" }] },
    { labelKey: "nav_group_discover", items: [{ id: "explore", href: "explore.html" }] },
    { labelKey: "nav_group_analyze", items: [{ id: "properties", href: "properties.html" }] },
    { labelKey: "nav_group_evaluate", items: [{ id: "compare", href: "compare.html", secondary: true }, { id: "projects", href: "projects.html" }] },
    { labelKey: "nav_group_decide", items: [{ id: "reports", href: "reports.html" }, { id: "sources", href: "sources.html", secondary: true }] },
  ];

  class AterraSidebar extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready) return;
      this.dataset.ready = "1";
      const active = this.getAttribute("active");
      const status = this.getAttribute("status") || "sample";
      const groups = NAV.map((g) => `
        <div class="shell-nav-group">
          <div class="shell-nav-label" aria-hidden="true">${esc(I.t(g.labelKey))}</div>
          <ul class="shell-nav-list">
            ${g.items.map((it) => `<li${it.secondary ? " data-secondary" : ""}><a href="${it.href}"${it.id === active ? ' aria-current="page"' : ""} title="${esc(I.t("nav_" + it.id))}">${icon(it.id)}<span>${esc(I.t("nav_" + it.id))}</span></a></li>`).join("")}
          </ul>
        </div>`).join("");
      this.innerHTML = `
        <a class="skip-link" href="#main">${esc(I.t("a11y_skip"))}</a>
        <nav class="shell-nav" aria-label="${esc(I.t("a11y_mainNav"))}">
          <a href="overview.html" class="shell-brand" aria-label="${esc(I.t("a11y_home"))}"><aterra-logo tone="dark"></aterra-logo></a>
          <a href="search.html" class="shell-cta" title="${esc(I.t("nav_newAnalysis"))}"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true">${ICONS.plus}</svg><span>${esc(I.t("nav_newAnalysis"))}</span></a>
          <div class="shell-nav-groups">${groups}</div>
          <div class="shell-nav-footer">
            <span class="shell-data-status" id="nav-footer"${status === "none" ? "" : ' data-i18n="nav_footer"'}>${status === "none" ? "" : esc(I.t("nav_footer"))}</span>
            <a class="shell-account" href="signin.html">${esc(I.t("nav_account"))}</a>
            ${I.toggleHTML()}
          </div>
        </nav>`;
    }
  }

  // ---------- flow header (search → confirm → project) ----------
  class AterraFlowbar extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready) return;
      this.dataset.ready = "1";
      const step = Number(this.getAttribute("step")) || 0;
      const steps = ["flow_step_property", "flow_step_confirm", "flow_step_project"];
      const stepper = step
        ? `<ol class="flow-steps" aria-label="${esc(I.t("a11y_progress"))}">
            ${steps.map((k, i) => {
              const n = i + 1;
              const state = n < step ? "done" : n === step ? "current" : "todo";
              return `<li class="flow-step is-${state}"${state === "current" ? ' aria-current="step"' : ""}><span class="flow-step-n">${n}</span><span class="flow-step-label">${esc(I.t(k))}</span></li>`;
            }).join("")}
          </ol>`
        : "";
      this.innerHTML = `
        <a class="skip-link" href="#main">${esc(I.t("a11y_skip"))}</a>
        <header class="onboard-topbar">
          <a href="index.html" class="brand" aria-label="ATERRA"><aterra-logo></aterra-logo></a>
          ${stepper}
          <div class="onboard-topbar-right">
            <a href="overview.html" class="btn-text text-sm onboard-exit">${esc(I.t("flow_exit"))}</a>
            ${I.toggleHTML()}
          </div>
        </header>`;
    }
  }

  customElements.define("aterra-logo", AterraLogo);
  customElements.define("aterra-sidebar", AterraSidebar);
  customElements.define("aterra-flowbar", AterraFlowbar);

  // ---------- toast (polite status messages) ----------
  let toastRegion;
  function toast(message) {
    if (!toastRegion) {
      toastRegion = document.createElement("div");
      toastRegion.className = "toast-region";
      toastRegion.setAttribute("role", "status");
      toastRegion.setAttribute("aria-live", "polite");
      document.body.appendChild(toastRegion);
    }
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    toastRegion.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  // ---------- side-panel dialog behavior ----------
  // Moves focus into the panel when it opens, keeps Tab inside it, closes on
  // Escape, and returns focus to whatever opened it.
  function dialog(panel, scrim) {
    let opener = null;
    const focusables = () => [...panel.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((el) => el.offsetParent !== null);
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("tabindex", "-1");
    panel.inert = true;

    function isOpen() { return panel.classList.contains("is-open"); }
    function open() {
      if (!isOpen()) opener = document.activeElement;
      panel.inert = false;
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      if (scrim) scrim.classList.add("is-visible");
      const first = panel.querySelector("[data-autofocus]") || focusables()[0] || panel;
      first.focus({ preventScroll: true });
    }
    function close() {
      if (!isOpen()) return;
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      panel.inert = true;
      if (scrim && !document.querySelector(".side-panel.is-open")) scrim.classList.remove("is-visible");
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
      opener = null;
    }
    panel.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { e.stopPropagation(); close(); return; }
      if (e.key !== "Tab") return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    if (scrim) scrim.addEventListener("click", close);
    return { open, close, isOpen };
  }

  // ---------- disclosure buttons (accordion rows) ----------
  // Keeps aria-expanded in step with the `is-open` class the CSS keys off.
  function disclosure(button, container) {
    const sync = () => button.setAttribute("aria-expanded", container.classList.contains("is-open") ? "true" : "false");
    button.addEventListener("click", () => { container.classList.toggle("is-open"); sync(); });
    sync();
  }

  // ---------- tabs (WAI-ARIA tabs pattern, arrow-key navigation) ----------
  function tabs(tablist, onChange) {
    const tabEls = [...tablist.querySelectorAll('[role="tab"]')];
    function select(id, focus) {
      tabEls.forEach((t) => {
        const on = t.dataset.tab === id;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
        if (on && focus) t.focus();
      });
      if (onChange) onChange(id);
    }
    tabEls.forEach((t, i) => {
      t.addEventListener("click", () => select(t.dataset.tab));
      t.addEventListener("keydown", (e) => {
        const visible = tabEls.filter((x) => !x.hidden);
        const at = visible.indexOf(t);
        let next = null;
        if (e.key === "ArrowRight") next = visible[(at + 1) % visible.length];
        if (e.key === "ArrowLeft") next = visible[(at - 1 + visible.length) % visible.length];
        if (e.key === "Home") next = visible[0];
        if (e.key === "End") next = visible[visible.length - 1];
        if (next) { e.preventDefault(); select(next.dataset.tab, true); }
      });
    });
    return { select };
  }

  return { toast, dialog, disclosure, tabs, esc };
})();
