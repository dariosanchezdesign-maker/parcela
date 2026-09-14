/**
 * Timeline intelligence. Deliberately returns a range plus the factors
 * that could widen it — never a fake precise completion date.
 */
window.PARCELA_TIMELINE_ENGINE = (function () {
  const STEP_WEEKS = {
    survey: [2, 3], design: [3, 6], engineering: [2, 4], studies: [1, 4],
    "permit-prep": [1, 2], submission: [1, 1], corrections: [4, 12], approval: [1, 2], "final-inspection": [1, 3]
  };

  function estimate(workspace, roadmap) {
    let minW = 0, maxW = 0;
    roadmap.filter((s) => s.status !== "approved").forEach((s) => {
      const d = STEP_WEEKS[s.id] || [2, 4];
      minW += d[0]; maxW += d[1];
    });

    const riskFactors = [];
    const corrections = roadmap.find((s) => s.id === "corrections");
    if (corrections && corrections.status !== "approved") {
      riskFactors.push({ label: "Permit correction cycles", detail: "The widest-swinging stage in the process — a clean review can take 4 weeks, a contested one can take 12 or more." });
    }
    const studies = roadmap.find((s) => s.id === "studies");
    if (studies && studies.subItems && studies.subItems.length) {
      riskFactors.push({ label: "Required-study turnaround", detail: studies.subItems.map((i) => i.label).join(", ") + " can each add several weeks depending on consultant availability." });
    }

    let buildMin = 0, buildMax = 0;
    if (workspace.status === "build" || workspace.status === "complete") {
      const remaining = workspace.buildMode.milestones.filter((m) => m.status !== "complete");
      remaining.forEach(() => { buildMin += 3; buildMax += 6; });
      riskFactors.push({ label: "Material delivery timing", detail: "Imported materials can face longer lead times than mainland projects." });
      riskFactors.push({ label: "Inspection scheduling", detail: "Inspector availability can add 1-2 weeks between requesting and completing an inspection." });
      const pendingCO = workspace.buildMode.changeOrders.some((c) => c.status === "pending");
      if (pendingCO) riskFactors.push({ label: "Pending change order", detail: "An unresolved change order can pause downstream work until it is approved." });
      const month = new Date().getMonth();
      if (month >= 5 && month <= 10) riskFactors.push({ label: "Hurricane season", detail: "June through November weather can delay exterior work and material deliveries." });
    }

    return {
      estimatedWeeksMin: minW + buildMin, estimatedWeeksMax: maxW + buildMax,
      riskFactors: riskFactors.slice(0, 4)
    };
  }

  return { estimate };
})();
