/**
 * "Your Next Move" — the single highest-priority thing to look at right
 * now, computed from live project state (pending change orders > permit
 * corrections > flagged photos > unassigned-but-ready steps > in-progress
 * steps > budget anomalies > the next open step). Same pattern as V1's
 * recommendation engine, applied project-wide instead of property-wide.
 */
window.PARCELA_NEXT_MOVE = (function () {
  function compute(workspace, roadmap, budgetSummary) {
    const pendingCO = (workspace.buildMode.changeOrders || []).find((c) => c.status === "pending");
    if (pendingCO) {
      const evalResult = window.PARCELA_BUDGET_ENGINE.evaluateChangeOrder(workspace, pendingCO.amountDelta);
      return {
        headline: `Your contractor submitted a change order that increases the project budget by ${evalResult.pct}%.`,
        detail: pendingCO.description, cta: "Review change order", section: "build"
      };
    }

    const correctionStep = roadmap.find((s) => s.status === "needs-correction");
    if (correctionStep) {
      const preferredType = correctionStep.id === "final-inspection" ? "inspection" : "government-letter";
      const relatedDoc = workspace.documents.find((d) => d.type === preferredType) || workspace.documents.find((d) => d.type === "inspection" || d.type === "government-letter");
      return {
        headline: `Your ${correctionStep.label.toLowerCase()} needs a correction.`,
        detail: relatedDoc ? relatedDoc.extracted[0] : correctionStep.nextAction,
        cta: "View requirement", section: "roadmap"
      };
    }

    const flaggedPhoto = (workspace.buildMode.photos || []).find((p) => p.flagged);
    if (flaggedPhoto) {
      return { headline: "A progress photo may need your attention.", detail: flaggedPhoto.flagReason, cta: "Review photo", section: "build" };
    }

    const readyUnassigned = roadmap.find((s) => !s.blocked && s.status === "not-started" && s.professionalCategory && !workspace.assignments[s.id]);
    if (readyUnassigned) {
      return {
        headline: `Your project appears to require a ${readyUnassigned.professionalCategory} for "${readyUnassigned.label}."`,
        detail: readyUnassigned.why, cta: "Find qualified professionals", section: "professionals"
      };
    }

    const inProgress = roadmap.find((s) => s.status === "preparing" || s.status === "ready");
    if (inProgress) {
      return { headline: `"${inProgress.label}" is in progress.`, detail: inProgress.nextAction, cta: "View roadmap", section: "roadmap" };
    }

    const anomalyCategory = budgetSummary.byCategory.find((c) => c.evalResult && c.evalResult.withinRange === false && c.evalResult.direction === "above");
    if (anomalyCategory) {
      return { headline: `Your ${anomalyCategory.label.toLowerCase()} estimate looks high.`, detail: anomalyCategory.evalResult.message, cta: "Review budget", section: "budget" };
    }

    const nextUp = roadmap.find((s) => !s.blocked && s.status === "not-started");
    if (nextUp) {
      return { headline: `You're ready to start "${nextUp.label}."`, detail: nextUp.why, cta: "View roadmap", section: "roadmap" };
    }

    return { headline: "Everything on the roadmap is moving — nothing urgent right now.", detail: "Check back as documents, permits, or contractor updates come in.", cta: null, section: "overview" };
  }

  function changesSince(workspace, sinceISO) {
    if (!sinceISO) return [];
    return workspace.activity.filter((a) => new Date(a.at) > new Date(sinceISO));
  }

  return { compute, changesSince };
})();
