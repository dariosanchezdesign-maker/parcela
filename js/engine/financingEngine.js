/**
 * Assembles a lender-ready Financing Package from everything else the
 * workspace already knows. This is NOT financial advice — every number is
 * a range, and expected income is explicitly labeled as an unverified
 * assumption, not a market comp.
 */
window.PARCELA_FINANCING_ENGINE = (function () {
  const MUNI_MONTHLY_RATE = { "San Juan": 18, "Guaynabo": 15, "Caguas": 11, "Rincón": 22, "Ponce": 9, "Fajardo": 10 };

  function estimateIncome(scenarioId, property) {
    const rate = MUNI_MONTHLY_RATE[property.municipio] || 10;
    if (scenarioId === "adu") {
      const sizeRange = [40, 70];
      return {
        type: "Long-term rental (accessory unit)",
        rangeMin: Math.round(sizeRange[0] * rate * 0.9), rangeMax: Math.round(sizeRange[1] * rate * 1.1), unit: "per month",
        assumption: `Based on a typical 40-70 m² accessory unit at roughly $${rate}/m²/month for ${property.municipio} — an unverified planning assumption, not a market comp.`
      };
    }
    if (scenarioId === "multifamily") {
      return {
        type: "Long-term rental (multiple units)",
        rangeMin: Math.round(property.lotSizeM2 * 0.25 * rate * 0.85), rangeMax: Math.round(property.lotSizeM2 * 0.4 * rate * 1.1), unit: "per month, all units combined",
        assumption: `Rough per-m² planning estimate for ${property.municipio}, scaled to lot size — actual achievable rent depends on unit mix and finish level.`
      };
    }
    if (scenarioId === "str") {
      const nightly = Math.round(rate * 3.4);
      return {
        type: "Short-term rental", rangeMin: Math.round(nightly * 0.65 * 14), rangeMax: Math.round(nightly * 1.15 * 20), unit: "per month (seasonal, occupancy-dependent)",
        assumption: `Very rough nightly-rate x occupancy planning estimate for ${property.municipio} — actual STR income varies heavily by season and platform fees.`
      };
    }
    return null;
  }

  function assemble(workspace, property, scenarioTitle, roadmap, budgetSummary, timeline) {
    const income = estimateIncome(workspace.scenarioId, property);
    return {
      generatedAt: new Date().toISOString(),
      property: { address: property.address, municipio: property.municipio, barrio: property.barrio, lotSizeM2: property.lotSizeM2, zoningCode: property.zoningCode },
      developmentPlan: { scenarioTitle, status: workspace.status, roadmapProgress: window.PARCELA_PERMIT_ENGINE.progress(roadmap) },
      estimatedCosts: { rangeMin: budgetSummary.totalRangeMin, rangeMax: budgetSummary.totalRangeMax, accepted: budgetSummary.totalAccepted },
      timeline: { weeksMin: timeline.estimatedWeeksMin, weeksMax: timeline.estimatedWeeksMax, riskFactors: timeline.riskFactors },
      expectedIncome: income,
      disclaimers: [
        "This package is a planning summary generated from project data you and your team entered — it is not a loan application, appraisal, or guarantee of financing.",
        "Cost and income figures are ranges built from mock/estimated data in this prototype and should be verified with your lender, contractor, and a licensed appraiser.",
        "Parcela does not provide regulated financial or lending advice."
      ]
    };
  }

  return { assemble, estimateIncome };
})();
