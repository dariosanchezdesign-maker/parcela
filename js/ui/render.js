/**
 * Shared render helpers for dashboard.html and report.html so the two
 * pages don't drift out of sync with each other.
 */
window.PARCELA_RENDER = (function () {
  function fullLabel(p) { return `${p.address}, ${p.barrio}, ${p.municipio}`; }

  function goalLabel(goalId) {
    const g = window.PARCELA_GOALS.find((x) => x.id === goalId);
    return g ? g.label : "Exploring options";
  }

  function feasibilityBadgeClass(f) { return f === "HIGH" ? "badge-high" : f === "MEDIUM" ? "badge-medium" : "badge-low"; }

  function parcelMapSVG(property, zoning, flood) {
    const floodTint = flood.risk === "high" ? "rgba(162,59,46,0.28)" : "rgba(31,131,134,0.30)";
    const floodStroke = flood.risk === "high" ? "#c96a58" : "#5fb3b5";
    const showCoast = property.coastalProximityM != null && property.coastalProximityM < 1200;
    return `
      <svg viewBox="0 0 420 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pmgrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M0 0 H30 V30" fill="none" stroke="rgba(250,248,243,0.07)" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="420" height="300" fill="url(#pmgrid)"/>
        ${showCoast ? '<rect x="0" y="230" width="420" height="70" fill="rgba(95,179,181,0.18)"/><path d="M0 232 Q 90 218 180 232 T 420 230" fill="none" stroke="rgba(95,179,181,0.55)" stroke-width="2"/>' : ""}
        <path d="M110 220 L90 120 L180 70 L290 100 L300 200 L200 240 Z" fill="${floodTint}" stroke="${floodStroke}" stroke-width="2.2"/>
        <circle cx="200" cy="150" r="4" fill="#faf8f3"/>
        <text x="205" y="153" fill="#faf8f3" font-size="11" font-family="monospace">parcel</text>
      </svg>`;
  }

  function confidenceRow(f) {
    const id = "why-" + f.id;
    return `
      <div class="fact-row">
        <div class="fact-label"><span class="confidence-dot confidence-${f.confidence}"></span>${f.label}</div>
        <div class="fact-value">${f.value}
          <button class="why-btn" type="button" data-target="${id}" aria-expanded="false" title="Why?">${window.parcelaIcon("info", 16)}</button>
        </div>
        <div class="why-pop" id="${id}">${f.why}<span class="why-source">${f.confidence} · ${f.source}</span></div>
      </div>`;
  }

  function unknownItem(u) {
    return `<div class="unknown-item">
      <span class="confidence-dot confidence-unknown" style="margin-top:5px;"></span>
      <div><div class="u-title">${u.label}</div><p>${u.detail}</p></div>
    </div>`;
  }

  function scenarioCard(s, propertyId, goalId) {
    return `
      <div class="card scenario-card">
        ${s.matchesGoal ? `<div class="matches-goal">${window.parcelaIcon("check", 12)} Matches your goal</div>` : ""}
        <div class="scenario-top">
          <div>
            <div class="scenario-label">OPTION ${s.label}</div>
            <h3>${s.title}</h3>
          </div>
          <div class="scenario-badges">
            <span class="badge ${feasibilityBadgeClass(s.feasibility)}">Feasibility: ${s.feasibility}</span>
            <span class="badge badge-neutral">Complexity: ${s.complexity}</span>
          </div>
        </div>
        <div class="scenario-cols">
          <div>
            <h4>Why it may work</h4>
            <ul>${s.whyItMayWork.map((x) => `<li>${x}</li>`).join("")}</ul>
          </div>
          <div>
            <h4>What could prevent it</h4>
            <ul>${s.whatCouldPreventIt.map((x) => `<li>${x}</li>`).join("")}</ul>
          </div>
        </div>
        <div class="scenario-cols">
          <div>
            <h4>Information still required</h4>
            <ul>${s.infoNeeded.map((x) => `<li>${x}</li>`).join("")}</ul>
          </div>
        </div>
        <div class="scenario-footer">
          <div class="next-step"><strong>Recommended next step:</strong> ${s.nextStep}</div>
          ${propertyId ? `<button type="button" class="btn btn-primary btn-sm start-project-btn" data-scenario-id="${s.id}" data-scenario-title="${s.title.replace(/"/g, "&quot;")}" data-property-id="${propertyId}" data-goal-id="${goalId}">Start this project →</button>` : ""}
        </div>
      </div>`;
  }

  function roadmapItem(r, i, total) {
    return `
      <div class="roadmap-item">
        <div class="roadmap-marker">
          <div class="roadmap-dot">${i + 1}</div>
          ${i < total - 1 ? '<div class="roadmap-line"></div>' : ""}
        </div>
        <div class="roadmap-content">
          <h4>${r.label}</h4>
          <p>${r.detail}</p>
          <span class="roadmap-tag tag-${r.status}">${
            r.status === "in-app" ? "This report" : r.status === "requires-professional" ? "Needs a licensed professional" : "Needs agency approval"
          }</span>
        </div>
      </div>`;
  }

  function attachWhyToggles(root) {
    root.querySelectorAll(".why-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pop = document.getElementById(btn.dataset.target);
        const open = pop.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(open));
      });
    });
  }

  return { fullLabel, goalLabel, feasibilityBadgeClass, parcelMapSVG, confidenceRow, unknownItem, scenarioCard, roadmapItem, attachWhyToggles };
})();
