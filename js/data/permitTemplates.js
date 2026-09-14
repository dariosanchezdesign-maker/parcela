/**
 * Permit/requirement chain templates — mock reference data, not legal
 * guidance. permitEngine.js turns these into a live, dependency-aware
 * roadmap for a specific project (property + scenario + workspace state).
 *
 * Base chain (matches the brief's example exactly):
 *   Survey -> Design -> Engineering -> Required studies -> Permit
 *   preparation -> Submission -> Corrections -> Approval
 * A conditional 9th step (Final inspection) is added once a project
 * reaches Build Mode.
 */
window.PARCELA_PERMIT_STEPS = [
  {
    id: "survey", label: "Boundary & topographic survey", dependsOn: [],
    why: "Establishes the legal boundary and existing site conditions that every downstream drawing and study depends on.",
    docsRequired: ["Deed or title", "Prior survey, if one exists"],
    professionalCategory: "surveyor"
  },
  {
    id: "design", label: "Architectural design / plans", dependsOn: ["survey"],
    why: "Translates the chosen development scenario into buildable drawings the engineer and permitting office can review.",
    docsRequired: ["Approved survey", "Zoning determination"],
    professionalCategory: "architect"
  },
  {
    id: "engineering", label: "Structural / MEP engineering", dependsOn: ["design"],
    why: "Confirms the design is structurally sound and meets code before it goes to permitting.",
    docsRequired: ["Architectural plans"],
    professionalCategory: "engineer"
  },
  {
    id: "studies", label: "Required studies", dependsOn: ["survey"],
    why: "Site-specific studies triggered by this property's environmental, coastal, or historic-district flags.",
    docsRequired: [],
    professionalCategory: "environmental"
  },
  {
    id: "permit-prep", label: "Permit application preparation", dependsOn: ["engineering", "studies"],
    why: "Assembles plans, studies, and supporting documents into a complete application package.",
    docsRequired: ["Engineering sign-off", "Completed studies"],
    professionalCategory: "architect"
  },
  {
    id: "submission", label: "Submission", dependsOn: ["permit-prep"],
    why: "Files the application with ARPE or the municipality's autonomous permitting office.",
    docsRequired: ["Complete application package"],
    professionalCategory: "architect"
  },
  {
    id: "corrections", label: "Corrections", dependsOn: ["submission"],
    why: "Permitting offices routinely return correction requests before final approval — this tracks that back-and-forth.",
    docsRequired: [],
    professionalCategory: "architect"
  },
  {
    id: "approval", label: "Approval", dependsOn: ["corrections"],
    why: "Final sign-off authorizing construction to begin.",
    docsRequired: [],
    professionalCategory: null
  },
  {
    id: "final-inspection", label: "Final inspection / Certificate of Occupancy", dependsOn: ["approval"],
    why: "Confirms completed construction matches the approved plans before the property can be legally occupied or rented.",
    docsRequired: ["Completed construction milestones"],
    professionalCategory: "inspector",
    buildModeOnly: true
  }
];

/** Per-scenario cost multipliers (applied to a base range per step) and extra docs. */
window.PARCELA_SCENARIO_COST_PROFILE = {
  "single-family": { design: [3500, 7500], engineering: [1800, 3500], "permit-prep": [600, 1200] },
  "adu": { design: [2200, 4800], engineering: [1200, 2400], "permit-prep": [500, 1000] },
  "multifamily": { design: [8000, 18000], engineering: [4000, 9000], "permit-prep": [1200, 2800] },
  "renovate": { design: [1500, 3800], engineering: [900, 2200], "permit-prep": [400, 900] },
  "business": { design: [2500, 6000], engineering: [1500, 3200], "permit-prep": [700, 1500] },
  "str": { design: [2000, 4500], engineering: [1000, 2200], "permit-prep": [500, 1100] },
  "agricultural": { design: [1200, 3000], engineering: [800, 1800], "permit-prep": [400, 900] }
};

/** Fallback used when a scenario id isn't in the cost profile above. */
window.PARCELA_DEFAULT_COST_PROFILE = { design: [2500, 6000], engineering: [1200, 3000], "permit-prep": [500, 1200] };
