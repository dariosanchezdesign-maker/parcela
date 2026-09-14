/**
 * Cost intelligence. Category ranges are seeded estimates for this
 * prototype, scaled by development scenario — not a real cost database.
 * Every number here is presented as a range with a confidence label, never
 * a single "exact" figure, per the product's no-false-precision principle.
 */
window.PARCELA_BUDGET_ENGINE = (function () {
  const CONSTRUCTION_PROFILE = {
    "adu": { materials: [28000, 45000], labor: [25000, 42000], utilities: [3000, 7000], contingencyPct: [0.08, 0.15], financing: [500, 1500] },
    "single-family": { materials: [55000, 95000], labor: [50000, 90000], utilities: [5000, 10000], contingencyPct: [0.08, 0.15], financing: [800, 2000] },
    "multifamily": { materials: [140000, 260000], labor: [130000, 240000], utilities: [12000, 25000], contingencyPct: [0.10, 0.18], financing: [2000, 5000] },
    "renovate": { materials: [15000, 35000], labor: [15000, 32000], utilities: [1500, 4000], contingencyPct: [0.08, 0.15], financing: [400, 1200] },
    "business": { materials: [20000, 45000], labor: [18000, 40000], utilities: [3000, 8000], contingencyPct: [0.08, 0.15], financing: [600, 1600] },
    "str": { materials: [18000, 38000], labor: [16000, 34000], utilities: [2500, 6000], contingencyPct: [0.08, 0.15], financing: [500, 1400] },
    "agricultural": { materials: [8000, 20000], labor: [6000, 16000], utilities: [1000, 3000], contingencyPct: [0.08, 0.15], financing: [300, 900] }
  };
  const DEFAULT_PROFILE = CONSTRUCTION_PROFILE["single-family"];
  const CATEGORY_LABELS = {
    design: "Design", surveys: "Surveys", engineering: "Engineering", permits: "Permits",
    materials: "Materials", labor: "Labor", utilities: "Utilities", contingency: "Contingency", financing: "Financing"
  };

  function getCategoryRanges(scenarioId) {
    const cost = window.PARCELA_SCENARIO_COST_PROFILE[scenarioId] || window.PARCELA_DEFAULT_COST_PROFILE;
    const build = CONSTRUCTION_PROFILE[scenarioId] || DEFAULT_PROFILE;
    const conMin = build.materials[0] + build.labor[0];
    const conMax = build.materials[1] + build.labor[1];
    return {
      design: cost.design, surveys: [800, 1800], engineering: cost.engineering, permits: [200, 800],
      materials: build.materials, labor: build.labor, utilities: build.utilities,
      contingency: [Math.round(conMin * build.contingencyPct[0]), Math.round(conMax * build.contingencyPct[1])],
      financing: build.financing
    };
  }

  function evaluateEstimate(ranges, category, amount) {
    const range = ranges[category];
    if (!range) return { withinRange: null, message: "No baseline range for this category yet." };
    const [min, max] = range;
    if (amount > max) {
      const pct = Math.round(((amount - max) / max) * 1000) / 10;
      return { withinRange: false, direction: "above", pct, message: `This estimate is ${pct}% above the current project range for ${CATEGORY_LABELS[category] || category} ($${min.toLocaleString()}–$${max.toLocaleString()}).` };
    }
    if (amount < min) {
      const pct = Math.round(((min - amount) / min) * 1000) / 10;
      return { withinRange: false, direction: "below", pct, message: `This estimate is ${pct}% below the current project range for ${CATEGORY_LABELS[category] || category} — worth double-checking scope isn't missing something.` };
    }
    return { withinRange: true, message: `Within the expected range for ${CATEGORY_LABELS[category] || category}.` };
  }

  function acceptedTotal(workspace, categories) {
    return workspace.estimates
      .filter((e) => !categories || categories.includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0);
  }

  function evaluateChangeOrder(workspace, amountDelta) {
    const base = acceptedTotal(workspace, ["materials", "labor", "utilities", "contingency"]);
    if (!base) return { pct: null, message: "Not enough budget history yet to compare this change order against." };
    const pct = Math.round((amountDelta / base) * 1000) / 10;
    return { pct, base, message: `This increases the construction budget by ${pct}% (+$${amountDelta.toLocaleString()} on a $${base.toLocaleString()} base).` };
  }

  function summary(workspace, scenarioId) {
    const ranges = getCategoryRanges(scenarioId);
    const byCategory = Object.keys(CATEGORY_LABELS).map((cat) => {
      const accepted = acceptedTotal(workspace, [cat]);
      const evalResult = accepted ? evaluateEstimate(ranges, cat, accepted) : null;
      return { category: cat, label: CATEGORY_LABELS[cat], range: ranges[cat], accepted, evalResult };
    });
    const changeOrderTotal = (workspace.buildMode.changeOrders || []).reduce((s, c) => s + (c.status !== "rejected" ? c.amountDelta : 0), 0);
    const totalAccepted = acceptedTotal(workspace) + changeOrderTotal;
    const totalRangeMin = Object.values(ranges).reduce((s, r) => s + r[0], 0);
    const totalRangeMax = Object.values(ranges).reduce((s, r) => s + r[1], 0);
    return { ranges, byCategory, totalAccepted, totalRangeMin, totalRangeMax, changeOrderTotal, CATEGORY_LABELS };
  }

  return { getCategoryRanges, evaluateEstimate, evaluateChangeOrder, acceptedTotal, summary, CATEGORY_LABELS };
})();
