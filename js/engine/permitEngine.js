/**
 * Builds a live, dependency-aware permit roadmap for a specific project.
 * Takes the V1 property/zoning/flood data + a chosen scenario + the
 * workspace's current per-step status overrides, and returns the full
 * step objects the Project Workspace renders. A step is "blocked" when
 * any of its dependencies isn't Approved yet — the UI uses that to decide
 * what's actionable right now vs. waiting on something upstream.
 */
window.PARCELA_PERMIT_ENGINE = (function () {
  const STATUS_ORDER = ["not-started", "preparing", "ready", "submitted", "needs-correction", "approved"];
  const STATUS_LABEL = {
    "not-started": "Not started", "preparing": "Preparing", "ready": "Ready",
    "submitted": "Submitted", "needs-correction": "Needs correction", "approved": "Approved"
  };

  function studiesDetail(property, zoning, flood) {
    const items = [];
    if (flood.risk === "high") {
      items.push({ label: "Flood elevation & hydrology study", cost: [1200, 2800], professionalCategory: "environmental",
        why: "Zone " + flood.label.replace("Zone ", "") + " requires a base flood elevation certificate before design can finalize." });
    }
    if (property.coastalProximityM != null && property.coastalProximityM < 200) {
      items.push({ label: "DRNA maritime-terrestrial zone determination", cost: [900, 2200], professionalCategory: "environmental",
        why: "Parcels this close to the shoreline typically need DRNA to confirm the zona marítimo-terrestre boundary." });
    }
    if (property.historicDistrict) {
      items.push({ label: "ICP historic design review", cost: [500, 1500], professionalCategory: "architect",
        why: "This parcel sits inside a designated historic zone, which adds design review before permitting." });
    }
    if (zoning.category === "agricultural") {
      items.push({ label: "Junta de Planificación special-use consulta", cost: [400, 1200], professionalCategory: "lawyer",
        why: "Non-agricultural construction on agriculturally-zoned land needs a special-use determination first." });
    }
    if (!items.length) {
      return {
        why: "Nothing in this property's flood, coastal, historic, or zoning data currently triggers an additional study — worth a quick confirmation with your architect before skipping it.",
        docsRequired: [], professionalCategory: "architect", cost: [0, 300], subItems: []
      };
    }
    return {
      why: items.map((i) => i.why).join(" "),
      docsRequired: items.map((i) => i.label),
      professionalCategory: items[0].professionalCategory,
      cost: [items.reduce((s, i) => s + i.cost[0], 0), items.reduce((s, i) => s + i.cost[1], 0)],
      subItems: items
    };
  }

  function costFor(stepId, scenarioId) {
    const profile = window.PARCELA_SCENARIO_COST_PROFILE[scenarioId] || window.PARCELA_DEFAULT_COST_PROFILE;
    if (stepId === "survey") return [800, 1800];
    if (profile[stepId]) return profile[stepId];
    if (stepId === "final-inspection") return [300, 700];
    if (stepId === "submission") return [200, 800];
    return null;
  }

  function nextActionFor(step, blocked, assignedProfessional) {
    if (step.status === "approved") return "Complete.";
    if (blocked) {
      const dep = step.dependsOn[0];
      return `Waiting on "${dep}" to be approved first.`;
    }
    if (step.status === "needs-correction") return "Address the correction request, then resubmit.";
    if (step.status === "submitted") return "Awaiting review from the permitting office.";
    if (step.status === "preparing") return assignedProfessional ? `In progress with ${assignedProfessional}.` : "In progress.";
    if (step.status === "ready") return "Ready to submit.";
    return step.professionalCategory ? `Ready to start — assign a ${step.professionalCategory}.` : "Ready to start.";
  }

  function buildRoadmap(property, zoning, flood, scenarioId, statusOverrides, workspaceStatus, assignments) {
    statusOverrides = statusOverrides || {};
    assignments = assignments || {};
    const includeInspection = workspaceStatus === "build" || workspaceStatus === "complete";
    const templates = window.PARCELA_PERMIT_STEPS.filter((s) => !s.buildModeOnly || includeInspection);

    return templates.map((tpl) => {
      let why = tpl.why, docsRequired = tpl.docsRequired, professionalCategory = tpl.professionalCategory, cost = costFor(tpl.id, scenarioId), subItems = null;
      if (tpl.id === "studies") {
        const d = studiesDetail(property, zoning, flood);
        why = d.why; docsRequired = d.docsRequired; professionalCategory = d.professionalCategory; cost = d.cost; subItems = d.subItems;
      }
      const status = statusOverrides[tpl.id] || "not-started";
      const depStatuses = tpl.dependsOn.map((id) => statusOverrides[id] || "not-started");
      const blocked = depStatuses.some((s) => s !== "approved");
      const stepForAction = { ...tpl, status, dependsOn: tpl.dependsOn.map((id) => (templates.find((t) => t.id === id) || {}).label || id) };
      return {
        id: tpl.id, label: tpl.label, why, docsRequired, professionalCategory, estCostRange: cost,
        dependsOn: tpl.dependsOn, subItems, status, statusLabel: STATUS_LABEL[status], blocked,
        assignedProfessionalId: assignments[tpl.id] || null,
        nextAction: nextActionFor(stepForAction, blocked, assignments[tpl.id + "_name"])
      };
    });
  }

  function progress(roadmap) {
    const done = roadmap.filter((s) => s.status === "approved").length;
    return { done, total: roadmap.length, pct: Math.round((done / roadmap.length) * 100) };
  }

  return { buildRoadmap, progress, STATUS_ORDER, STATUS_LABEL };
})();
