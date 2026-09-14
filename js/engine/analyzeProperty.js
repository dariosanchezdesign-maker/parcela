/**
 * The "AI analysis" abstraction.
 *
 * analyzeProperty(property, goalId) -> report
 *
 * Today this is a deterministic, rule-based engine over the mock datasets
 * in js/data/. It's isolated behind this one function on purpose: a real
 * version could call an LLM or a licensed data provider and return the
 * same report shape, and nothing in dashboard.html/report.html would need
 * to change. Every finding carries a `confidence` level — verified,
 * estimated, assumption, or unknown — because the whole point of this
 * product is to never quietly present a guess as a fact.
 */
(function () {
  const ZONING = window.PARCELA_ZONING;
  const FLOOD = window.PARCELA_FLOOD_ZONES;

  const STAGES = [
    { id: "identify", label: "Identifying property", detail: (p) => `Matching ${p.address}, ${p.barrio} against municipal cadastral records.` },
    { id: "zoning", label: "Understanding zoning", detail: (p, z) => `Reading zoning district ${z.code} — ${z.name} — and its permitted-use envelope.` },
    { id: "geographic", label: "Checking geographic constraints", detail: (p) => `Reviewing lot geometry, frontage, topography, and setback exposure.` },
    { id: "environmental", label: "Checking environmental / flood considerations", detail: (p, z, f) => `Cross-referencing flood mapping (${f.label}) and coastal-zone proximity.` },
    { id: "uses", label: "Evaluating potential uses", detail: () => `Testing candidate development scenarios against zoning, lot size, and site conditions.` },
    { id: "complexity", label: "Estimating development complexity", detail: () => `Weighing required studies, permitting path, and known unknowns for each scenario.` }
  ];

  function finding(id, category, label, value, confidence, why, source) {
    return { id, category, label, value, confidence, why, source };
  }

  function buildFindings(p, zoning, flood) {
    const list = [];
    list.push(finding("zoning-class", "zoning", "Zoning district", `${zoning.code} — ${zoning.name}`, "verified",
      "Matched directly against the municipal zoning layer for this parcel's catastro number.", "Mock cadastral/zoning layer"));
    list.push(finding("lot-size", "geographic", "Lot size", `${p.lotSizeM2.toLocaleString()} m² (${(p.lotSizeM2/3930).toFixed(2)} cuerdas)`, "verified",
      "Taken from the parcel boundary on record.", "Mock cadastral layer"));
    list.push(finding("frontage", "geographic", "Frontage", `${p.frontageM} m`, "verified",
      "Measured along the street line of the parcel boundary.", "Mock cadastral layer"));
    list.push(finding("flood", "environmental", "Flood zone", `${flood.label} — ${flood.risk} risk`, "verified",
      flood.description, "Mock FEMA flood layer"));
    if (p.coastalProximityM != null) {
      const assumption = p.coastalProximityM < 100;
      list.push(finding("coastal", "environmental", "Distance to coastline", `~${p.coastalProximityM} m`, assumption ? "assumption" : "verified",
        assumption
          ? "Under ~100m from the shoreline, parcels commonly fall inside DRNA's maritime-terrestrial zone (zona marítimo-terrestre) jurisdiction — that boundary isn't in this dataset, so treat this as a flag to confirm, not a determination."
          : "Measured from parcel centroid to the mapped shoreline.",
        assumption ? "Inferred from distance — confirm with DRNA" : "Mock GIS distance calculation"));
    }
    list.push(finding("structure", "structural", "Existing structure", p.existingStructure.type === "none" || p.existingStructure.type === "vacant lot"
      ? "None — vacant lot" : `${p.existingStructure.type}, built ${p.existingStructure.yearBuilt}, ${p.existingStructure.areaM2} m²`,
      "verified", "From the structure record tied to this catastro number.", "Mock cadastral layer"));
    if (p.existingStructure.condition) {
      list.push(finding("condition", "structural", "Structure condition", p.existingStructure.condition, "estimated",
        "Condition is an estimate from the most recent available assessment, not a fresh inspection.", "Estimated"));
    }
    list.push(finding("water", "regulatory", "Water service", p.utilities.water, /not/.test(p.utilities.water) ? "unknown" : "verified",
      /not/.test(p.utilities.water) ? "No AAA connection on file — cost and distance to tie in are unconfirmed." : "AAA service record for this address.",
      "Mock utility layer"));
    list.push(finding("sewer", "regulatory", "Sewer / wastewater", p.utilities.sewer, /unknown|unpermitted/.test(p.utilities.sewer) ? "unknown" : "verified",
      /unknown|unpermitted/.test(p.utilities.sewer) ? "There's a septic system on site but no confirmed permit on file for it — worth verifying before any expansion." : "AAA service record for this address.",
      "Mock utility layer"));
    if (p.historicDistrict) {
      list.push(finding("historic", "regulatory", "Historic district", "Yes — design review applies", "verified",
        "Parcel falls inside a designated historic zone, which adds ICP (Instituto de Cultura Puertorriqueña) design review to any exterior work.", "Mock historic-district layer"));
    }
    return list;
  }

  function buildUnknowns(p, zoning, flood) {
    const unknowns = [];
    if (p.existingStructure.yearBuilt && p.existingStructure.yearBuilt < 1990) {
      unknowns.push({ label: "Permitting history of the existing structure", detail: "Built before 1990 — whether prior additions or renovations were permitted isn't in this dataset. Worth a title/permit history pull before relying on the existing footprint." });
    }
    if (/unknown|unpermitted/.test(p.utilities.sewer)) {
      unknowns.push({ label: "Septic system legality", detail: "An on-site septic system exists but its permit status is unconfirmed. This affects any scenario that adds occupants or units." });
    }
    if (p.coastalProximityM != null && p.coastalProximityM < 200) {
      unknowns.push({ label: "Exact maritime-terrestrial zone boundary", detail: "This dataset doesn't include DRNA's surveyed zona marítimo-terrestre line — only a licensed surveyor (agrimensor) can establish the exact setback." });
    }
    if (flood.risk === "high") {
      unknowns.push({ label: "Base flood elevation certificate", detail: "No elevation certificate on file. Required before finalizing construction plans in this flood zone." });
    }
    unknowns.push({ label: "Current utility capacity for added units", detail: "Service exists today, but whether the line has spare capacity for additional units isn't confirmed until AAA issues a factibilidad (service availability) letter." });
    return unknowns;
  }

  // ---- scenario candidates ----

  function feasFromScore(score) { return score >= 2 ? "HIGH" : score >= 1 ? "MEDIUM" : "LOW"; }

  function scenarioSingleFamily(p, zoning, flood) {
    if (!(zoning.category === "residential" || zoning.category === "tourism")) return null;
    let score = 1;
    if (p.lotSizeM2 >= zoning.minLotM2) score++;
    if (flood.risk === "minimal") score++;
    const feasibility = feasFromScore(score);
    const isNew = p.existingStructure.type === "none" || p.existingStructure.type === "vacant lot";
    const complexity = flood.risk === "high" ? "HIGH" : isNew ? "MEDIUM" : "LOW";
    return {
      id: "single-family", title: isNew ? "New single-family residence" : "Single-family residence, as-is or expanded",
      feasibility, complexity,
      whyItMayWork: [
        `${zoning.code} zoning permits single-family use outright.`,
        p.lotSizeM2 >= zoning.minLotM2 ? `Lot size clears the ${zoning.minLotM2.toLocaleString()} m² minimum for this district.` : `Lot is close to, but under, the typical ${zoning.minLotM2.toLocaleString()} m² minimum — may still qualify with a minor variance.`
      ],
      whatCouldPreventIt: flood.risk === "high" ? ["Flood zone elevation requirements add cost and design constraints."] : ["Setback or lot-coverage limits once a surveyed plot plan is on hand."],
      infoNeeded: ["Surveyed plot plan", flood.risk === "high" ? "Base flood elevation certificate" : "Setback confirmation from municipal permitting office"],
      nextStep: "Commission a topographic/boundary survey to confirm buildable envelope."
    };
  }

  function scenarioAdu(p, zoning, flood) {
    if (!zoning.aduAllowed) return null;
    const hasHeadroom = p.lotSizeM2 >= zoning.minLotM2 * 1.5;
    const hasPrincipal = !(p.existingStructure.type === "none" || p.existingStructure.type === "vacant lot");
    let score = 1;
    if (hasHeadroom) score++;
    if (hasPrincipal) score++;
    // an ADU presumes a principal residence to be "accessory" to — without one,
    // this is really "build two structures from scratch," which is weaker.
    const feasibility = hasPrincipal ? feasFromScore(score) : (feasFromScore(score) === "HIGH" ? "MEDIUM" : feasFromScore(score));
    const complexity = flood.risk === "high" || /unknown|unpermitted/.test(p.utilities.sewer) ? "HIGH" : "MEDIUM";
    return {
      id: "adu", title: "Accessory dwelling unit (second unit)",
      feasibility, complexity,
      whyItMayWork: [
        `${zoning.code} zoning generally allows an accessory unit alongside the principal residence.`,
        hasHeadroom ? "Lot has meaningful room beyond the district minimum for a second structure." : "Lot is workable but tight — a second unit would likely be compact."
      ],
      whatCouldPreventIt: [
        hasPrincipal ? "Lot coverage and setback limits once both structures are on the plot plan." : "No principal residence on site yet — this would mean building both structures from scratch, which changes the cost picture.",
        /unknown|unpermitted/.test(p.utilities.sewer) ? "Wastewater capacity for a second unit is unconfirmed." : "Parking requirement for the added unit."
      ],
      infoNeeded: ["Plot plan showing both structures", "AAA factibilidad letter for added service demand"],
      nextStep: "Sketch a site plan with an architect to test unit placement against setbacks."
    };
  }

  function scenarioMultifamily(p, zoning, flood) {
    if (!zoning.maxUnitsPerLot || zoning.maxUnitsPerLot < 2) return null;
    let score = 0;
    if (zoning.maxUnitsPerLot >= 4) score++;
    if (p.lotSizeM2 >= zoning.minLotM2 * 2) score++;
    if (!(p.existingStructure.type === "none" || p.existingStructure.type === "vacant lot") && /unit/.test(p.existingStructure.type)) score++;
    const feasibility = feasFromScore(score);
    return {
      id: "multifamily", title: `Small multifamily development (up to ${zoning.maxUnitsPerLot} units)`,
      feasibility, complexity: "HIGH",
      whyItMayWork: [
        `${zoning.code} zoning is rated for up to ${zoning.maxUnitsPerLot} units on a qualifying lot.`,
        /unit/.test(p.existingStructure.type) ? "An existing multi-unit structure suggests the surrounding block already accepts this density." : "Lot size is in range for multi-unit site planning."
      ],
      whatCouldPreventIt: ["Parking and stormwater requirements scale with unit count and can be the binding constraint.", "Neighboring development pattern may trigger extra design review."],
      infoNeeded: ["Formal site plan and parking study", "Stormwater management plan"],
      nextStep: "Engage a licensed architect for a feasibility massing study before committing."
    };
  }

  function scenarioRenovate(p) {
    if (p.existingStructure.type === "none" || p.existingStructure.type === "vacant lot") return null;
    const goodCondition = /good|renovated|sound|maintained/.test(p.existingStructure.condition);
    const feasibility = goodCondition ? "HIGH" : "MEDIUM";
    const old = p.existingStructure.yearBuilt && p.existingStructure.yearBuilt < 1990;
    return {
      id: "renovate", title: "Renovate the existing structure",
      feasibility, complexity: old ? "MEDIUM" : "LOW",
      whyItMayWork: [`Structure is ${p.existingStructure.condition}, which limits how much needs to be rebuilt from scratch.`, "Renovation within the existing footprint typically avoids new setback review."],
      whatCouldPreventIt: old ? ["Unclear permit history on prior work could complicate a renovation permit.", "Code upgrades (electrical, structural) may be triggered depending on scope."] : ["Scope creep once walls are opened up on an older build."],
      infoNeeded: ["As-built drawings or a measured survey of the current structure", "Permit history pull"],
      nextStep: "Get a structural walkthrough from a licensed engineer before scoping renovation work."
    };
  }

  function scenarioBusiness(p, zoning) {
    const commercial = zoning.category === "commercial";
    return {
      id: "business", title: commercial ? "Ground-floor business / mixed use" : "Small business use (requires zoning change)",
      feasibility: commercial ? "HIGH" : "LOW",
      complexity: commercial ? "MEDIUM" : "HIGH",
      whyItMayWork: commercial
        ? [`${zoning.code} zoning directly permits commercial use.`, `${p.frontageM}m of street frontage supports customer-facing access.`]
        : ["Location may still support a use-variance application even though the base zoning doesn't currently permit business use."],
      whatCouldPreventIt: commercial
        ? ["Parking minimums and accessibility (ADA-equivalent) retrofits for the space."]
        : [`${zoning.code} zoning would need a formal variance — not guaranteed, and neighbors can weigh in during review.`],
      infoNeeded: commercial ? ["Use classification confirmation from the permitting office"] : ["Pre-application consulta with the Junta de Planificación on variance odds"],
      nextStep: commercial ? "Confirm the specific business classification is within C-district use table." : "Request a pre-application meeting to gauge variance feasibility before investing further."
    };
  }

  function scenarioSTR(p, zoning, flood) {
    const tourism = zoning.category === "tourism";
    const hasStructure = !(p.existingStructure.type === "none" || p.existingStructure.type === "vacant lot");
    let score = tourism ? 2 : 1;
    if (flood.risk === "high") score--;
    if (/unknown|unpermitted/.test(p.utilities.sewer)) score--;
    if (!hasStructure) score--;
    const feasibility = feasFromScore(Math.max(score, 0));
    return {
      id: "str", title: "Short-term rental operation",
      feasibility, complexity: hasStructure ? "MEDIUM" : "HIGH",
      whyItMayWork: [
        tourism ? `${zoning.code} zoning is oriented toward tourism-scale occupancy.` : "Short-term rentals are common in the area regardless of base zoning.",
      ],
      whatCouldPreventIt: [
        hasStructure ? "Municipal short-term-rental registration and Compañía de Turismo requirements change fairly often — treat this as a moving target." : "There's no existing structure to rent — this would need new construction before it could operate as a rental.",
        /unknown|unpermitted/.test(p.utilities.sewer) ? "Unconfirmed septic permit status is a real risk for a use with more frequent occupants." : "HOA or neighborhood association rules, if any, aren't captured here."
      ],
      infoNeeded: ["Current municipal STR ordinance for this address", "Registro de Turismo status check"],
      nextStep: hasStructure ? "Confirm current municipal short-term-rental rules before listing — these are among the fastest-changing regulations in this dataset." : "Treat this as a longer-term option — confirm zoning supports new construction before planning around rental income."
    };
  }

  function scenarioAgricultural(p, zoning) {
    const zoned = zoning.category === "agricultural";
    if (!zoned && p.lotSizeM2 < 3000) return null;
    return {
      id: "agricultural", title: zoned ? "Continued / expanded agricultural use" : "Small-scale agricultural use on a large residential lot",
      feasibility: zoned ? "HIGH" : "MEDIUM",
      complexity: "MEDIUM",
      whyItMayWork: zoned ? [`${zoning.code} zoning exists specifically to preserve agricultural use.`, "Lot size and topography both support cultivation."] : ["Lot size leaves meaningful room for cultivation alongside residential use."],
      whatCouldPreventIt: zoned ? ["Any future non-agricultural construction needs a special permit from the Junta de Planificación."] : ["Residential zoning doesn't guarantee agricultural tax/use classification — needs a separate application."],
      infoNeeded: ["Soil and water source assessment", "Departamento de Agricultura registration, if pursuing incentives"],
      nextStep: "Contact the Departamento de Agricultura for current incentive and classification programs."
    };
  }

  function buildScenarios(p, zoning, flood, goalId) {
    const candidates = [
      scenarioSingleFamily(p, zoning, flood),
      scenarioAdu(p, zoning, flood),
      scenarioMultifamily(p, zoning, flood),
      scenarioRenovate(p),
      scenarioBusiness(p, zoning),
      scenarioSTR(p, zoning, flood),
      scenarioAgricultural(p, zoning)
    ].filter(Boolean);

    const rank = { HIGH: 2, MEDIUM: 1, LOW: 0 };
    const complexityRank = { LOW: 0, MEDIUM: 1, HIGH: 2 };
    candidates.sort((a, b) => (rank[b.feasibility] - rank[a.feasibility]) || (complexityRank[a.complexity] - complexityRank[b.complexity]));

    const goalMap = {
      "build-home": "single-family", "adu": "adu", "multifamily": "multifamily", "renovate": "renovate",
      "business": "business", "str": "str", "agricultural": "agricultural"
    };
    const preferredId = goalMap[goalId];
    let ordered = candidates;
    if (preferredId) {
      const idx = candidates.findIndex((c) => c.id === preferredId);
      if (idx > 0) {
        const [match] = candidates.splice(idx, 1);
        match.matchesGoal = true;
        ordered = [match, ...candidates];
      } else if (idx === 0) {
        candidates[0].matchesGoal = true;
      }
    }
    return ordered.slice(0, 5).map((s, i) => ({ ...s, label: String.fromCharCode(65 + i) }));
  }

  function buildRoadmap(p, zoning, flood) {
    const studies = ["Boundary/topographic survey"];
    if (flood.risk === "high") studies.push("Flood elevation certificate & hydrology review");
    if (p.coastalProximityM != null && p.coastalProximityM < 200) studies.push("DRNA maritime-terrestrial zone determination");
    if (zoning.category === "agricultural") studies.push("Junta de Planificación special-use consulta");
    if (p.historicDistrict) studies.push("ICP historic design review");

    return [
      { id: "verify", label: "Property verification", status: "in-app", detail: "This report — cadastral, zoning, and environmental data cross-checked against the address on file." },
      { id: "professional", label: "Professional review", status: "requires-professional", detail: "A licensed architect or engineer confirms buildable envelope and reviews this report's assumptions." },
      { id: "studies", label: "Required studies", status: "requires-professional", detail: studies.join(" · ") },
      { id: "permit", label: "Permit / application stage", status: "requires-agency", detail: "Filing through ARPE or the municipality's autonomous permitting office (municipio autónomo), depending on jurisdiction." },
      { id: "construction", label: "Construction authorization", status: "requires-agency", detail: "Final authorization to begin construction, issued once permits clear review." }
    ];
  }

  function buildRecommendation(p, zoning, flood, scenarios, unknowns) {
    const top = scenarios[0];
    const criticalUnknown = unknowns[0];
    const lines = [];
    if (criticalUnknown) {
      lines.push(`Before anything else, resolve <strong>${criticalUnknown.label.toLowerCase()}</strong> — ${criticalUnknown.detail}`);
    }
    if (top) {
      lines.push(`Your strongest path looks like Option ${top.label} (${top.title}). Its biggest open question is: ${top.whatCouldPreventIt[0]}`);
    }
    lines.push("Start with a licensed surveyor (agrimensor) for a current plot plan — nearly every scenario above depends on one, and it's the cheapest way to remove uncertainty early.");
    return {
      headline: criticalUnknown ? criticalUnknown.label : "Get a current plot plan",
      body: lines
    };
  }

  function analyzeProperty(property, goalId) {
    const zoning = ZONING[property.zoningCode];
    const flood = FLOOD[property.floodZone];
    const findings = buildFindings(property, zoning, flood);
    const unknowns = buildUnknowns(property, zoning, flood);
    const scenarios = buildScenarios(property, zoning, flood, goalId);
    const roadmap = buildRoadmap(property, zoning, flood);
    const recommendation = buildRecommendation(property, zoning, flood, scenarios, unknowns);
    const stages = STAGES.map((s) => ({ id: s.id, label: s.label, detail: s.detail(property, zoning, flood) }));

    return {
      propertyId: property.id, goalId, generatedAt: new Date().toISOString(),
      zoning, flood, stages, findings, unknowns, scenarios, roadmap, recommendation
    };
  }

  window.PARCELA_ENGINE = { analyzeProperty };
})();
