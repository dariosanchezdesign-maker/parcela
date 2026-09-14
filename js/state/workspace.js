/**
 * The ProjectWorkspace entity — V2's persistent command center per chosen
 * scenario. Stores only raw events/overrides (permit statuses, documents,
 * estimates, build-mode records, activity, collaborators); derived views
 * (live roadmap, budget ranges, timeline, next-move) are computed at
 * render time by the engines in js/engine/, reading this + V1's property/
 * zoning data — nothing here duplicates what those can recompute.
 *
 * Separate from js/state/projects.js (V1's lightweight saved-analysis
 * list) on purpose: not every saved analysis becomes a project.
 */
window.PARCELA_WORKSPACE = (function () {
  const KEY = "parcela_workspaces_v1";

  function daysAgo(n) { return new Date(Date.now() - n * 86400000).toISOString(); }
  function uid(prefix) { return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  function readAll() {
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; }
    catch (e) { return []; }
  }
  function writeAll(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* storage unavailable */ }
  }

  function list() { return readAll().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); }
  function get(id) { return readAll().find((w) => w.id === id) || null; }
  function findByPropertyAndScenario(propertyId, scenarioId) {
    return readAll().find((w) => w.propertyId === propertyId && w.scenarioId === scenarioId) || null;
  }

  function save(workspace) {
    const all = readAll();
    const idx = all.findIndex((w) => w.id === workspace.id);
    workspace.updatedAt = new Date().toISOString();
    if (idx >= 0) all[idx] = workspace; else all.push(workspace);
    writeAll(all);
    return workspace;
  }

  function update(id, patch) {
    const w = get(id);
    if (!w) return null;
    Object.assign(w, patch);
    return save(w);
  }

  function appendActivity(id, actor, text) {
    const w = get(id);
    if (!w) return null;
    w.activity.unshift({ id: uid("act"), at: new Date().toISOString(), actor, text });
    return save(w);
  }

  function markSeen(id) {
    const w = get(id);
    if (!w) return null;
    const previous = w.lastSeenAt;
    w.lastSeenAt = new Date().toISOString();
    save(w);
    return previous;
  }

  function setPermitStatus(id, stepId, status, actor) {
    const w = get(id);
    if (!w) return null;
    w.permitStatus[stepId] = status;
    w.activity.unshift({ id: uid("act"), at: new Date().toISOString(), actor: actor || "You", text: `Updated "${stepId}" to ${status.replace("-", " ")}.` });
    return save(w);
  }

  function addDocument(id, doc) {
    const w = get(id);
    if (!w) return null;
    doc.id = doc.id || uid("doc");
    doc.uploadedAt = doc.uploadedAt || new Date().toISOString();
    w.documents.unshift(doc);
    w.activity.unshift({ id: uid("act"), at: doc.uploadedAt, actor: "You", text: `Uploaded "${doc.name}" — AI found ${doc.extracted.length} relevant item${doc.extracted.length === 1 ? "" : "s"}.` });
    return save(w);
  }

  function addEstimate(id, estimate) {
    const w = get(id);
    if (!w) return null;
    estimate.id = estimate.id || uid("est");
    estimate.submittedAt = estimate.submittedAt || new Date().toISOString();
    w.estimates.unshift(estimate);
    w.activity.unshift({ id: uid("act"), at: estimate.submittedAt, actor: "You", text: `Logged a ${estimate.category} estimate of $${estimate.amount.toLocaleString()}.` });
    return save(w);
  }

  function addChangeOrder(id, co) {
    const w = get(id);
    if (!w) return null;
    co.id = co.id || uid("co");
    co.submittedAt = co.submittedAt || new Date().toISOString();
    co.status = co.status || "pending";
    w.buildMode.changeOrders.unshift(co);
    w.activity.unshift({ id: uid("act"), at: co.submittedAt, actor: "Contractor", text: `Submitted a change order: ${co.description}` });
    return save(w);
  }

  function assignProfessional(id, stepId, professionalId, actor) {
    const w = get(id);
    if (!w) return null;
    w.assignments[stepId] = professionalId;
    const pro = (window.PARCELA_PROFESSIONALS || []).find((p) => p.id === professionalId);
    w.activity.unshift({ id: uid("act"), at: new Date().toISOString(), actor: actor || "You", text: `Assigned ${pro ? pro.name : "a professional"} to "${stepId}".` });
    return save(w);
  }

  function addCollaborator(id, collaborator) {
    const w = get(id);
    if (!w) return null;
    collaborator.id = uid("collab");
    collaborator.addedAt = new Date().toISOString();
    w.collaborators.push(collaborator);
    w.activity.unshift({ id: uid("act"), at: collaborator.addedAt, actor: "You", text: `Invited ${collaborator.name} (${collaborator.roleLabel}) to the project.` });
    return save(w);
  }

  function remove(id) { writeAll(readAll().filter((w) => w.id !== id)); }

  function create({ propertyId, scenarioId, scenarioTitle, goalId }) {
    const existing = findByPropertyAndScenario(propertyId, scenarioId);
    if (existing) return existing;
    const now = new Date().toISOString();
    const w = {
      id: uid("ws"), propertyId, scenarioId, scenarioTitle, goalId,
      status: "planning", createdAt: now, updatedAt: now, lastSeenAt: now,
      permitStatus: {}, assignments: {},
      documents: [], estimates: [],
      buildMode: { contractorId: null, milestones: [], invoices: [], photos: [], changeOrders: [], inspections: [] },
      collaborators: [{ id: uid("collab"), name: "You", roleLabel: "Property Owner", category: "owner", addedAt: now }],
      activity: [{ id: uid("act"), at: now, actor: "You", text: `Started this project — ${scenarioTitle}.` }]
    };
    return save(w);
  }

  /** Hand-authored flagship demo project: the brief's own "2-unit property" example, mid-construction. */
  function seedFlagship() {
    const id = "ws-caguas-adu-demo";
    if (get(id)) return;
    const w = {
      id, propertyId: "caguas-turabo", scenarioId: "adu", scenarioTitle: "Accessory dwelling unit (second unit)", goalId: "adu",
      status: "build", createdAt: daysAgo(95), updatedAt: daysAgo(1), lastSeenAt: daysAgo(8),
      permitStatus: {
        survey: "approved", design: "approved", engineering: "approved", studies: "approved",
        "permit-prep": "approved", submission: "approved", corrections: "approved", approval: "approved",
        "final-inspection": "needs-correction"
      },
      assignments: {
        survey: "surv-delgado", design: "arch-rivera", engineering: "eng-santiago", studies: "arch-rivera",
        "permit-prep": "arch-rivera", submission: "arch-rivera", corrections: "arch-rivera",
        "final-inspection": "insp-roman"
      },
      documents: [
        { id: "doc4", name: "Inspection Report — Román Inspection Services.pdf", type: "inspection", uploadedAt: daysAgo(9),
          extracted: ["Flagged: smoke detector spacing in Area B does not match the approved plan.", "All other inspected items pass."] },
        { id: "doc3", name: "Contractor Proposal — Báez Construcción.pdf", type: "contractor-proposal", uploadedAt: daysAgo(35),
          extracted: ["Total bid: $84,200 for ADU construction (materials, labor, utility tie-in).", "Estimated timeline: 14 weeks from permit approval."] },
        { id: "doc2", name: "Boundary Survey — Delgado Agrimensura.pdf", type: "survey", uploadedAt: daysAgo(80),
          extracted: ["Lot boundary confirmed at 712 m², frontage 18m.", "No encroachments found on adjacent parcels.", "Existing structure setback: 4.2m from rear property line."] },
        { id: "doc1", name: "Deed — Calle 9 SE 240.pdf", type: "deed", uploadedAt: daysAgo(94),
          extracted: ["Confirmed sole ownership, no liens on record.", "Legal description matches catastro 025-004-018-33."] }
      ],
      estimates: [
        { id: "est1", category: "design", amount: 4200, submittedBy: "Elena Rivera Ortiz (Architect)", submittedAt: daysAgo(90), note: "Initial design fee" },
        { id: "est2", category: "engineering", amount: 1900, submittedBy: "Marisol Santiago Cruz (Engineer)", submittedAt: daysAgo(85), note: "Structural review" },
        { id: "est3", category: "surveys", amount: 1100, submittedBy: "Ramón Delgado Pérez (Surveyor)", submittedAt: daysAgo(93), note: "Boundary survey" },
        { id: "est4", category: "materials", amount: 41000, submittedBy: "Héctor Báez Rosado (Contractor)", submittedAt: daysAgo(35), note: "Contractor proposal — materials" },
        { id: "est5", category: "labor", amount: 38000, submittedBy: "Héctor Báez Rosado (Contractor)", submittedAt: daysAgo(35), note: "Contractor proposal — labor" },
        { id: "est6", category: "utilities", amount: 5200, submittedBy: "Héctor Báez Rosado (Contractor)", submittedAt: daysAgo(35), note: "Utility tie-in" }
      ],
      buildMode: {
        contractorId: "con-baez",
        milestones: [
          { id: "m1", label: "Site prep & foundation", status: "complete", date: daysAgo(60) },
          { id: "m2", label: "Framing", status: "complete", date: daysAgo(30) },
          { id: "m3", label: "Rough-in (electrical/plumbing)", status: "in-progress", date: null, note: "Electrical panel change order pending review" },
          { id: "m4", label: "Insulation & drywall", status: "not-started", date: null },
          { id: "m5", label: "Interior finishes", status: "not-started", date: null },
          { id: "m6", label: "Final inspection & CO", status: "not-started", date: null }
        ],
        invoices: [
          { id: "inv1", label: "Foundation — progress payment", amount: 18000, date: daysAgo(58), status: "paid" },
          { id: "inv2", label: "Framing — progress payment", amount: 22000, date: daysAgo(28), status: "paid" },
          { id: "inv3", label: "Rough-in — progress payment", amount: 15000, date: daysAgo(5), status: "pending" }
        ],
        photos: [
          { id: "ph2", areaLabel: "Area B — framing, rear wall", note: "Framing progress, rear ADU wall.", uploadedAt: daysAgo(12), flagged: true,
            flagReason: "This photo may indicate that work in Area B differs from the approved scope — the rear wall appears offset from the plan by roughly a foot. Consider asking your contractor for clarification." },
          { id: "ph1", areaLabel: "Area A — foundation", note: "Foundation poured and cured.", uploadedAt: daysAgo(58), flagged: false }
        ],
        changeOrders: [
          { id: "co1", description: "Additional electrical panel upgrade required for unit separation, requested by contractor after rough-in inspection.", amountDelta: 7075, submittedAt: daysAgo(4), status: "pending" }
        ],
        inspections: [
          { id: "insp1", label: "Foundation inspection", status: "complete", date: daysAgo(57), note: "Passed." },
          { id: "insp2", label: "Framing inspection", status: "complete", date: daysAgo(26), note: "Passed." },
          { id: "insp3", label: "Final inspection", status: "needs-correction", date: daysAgo(9), note: "Smoke detector spacing in Area B does not match approved plan." }
        ]
      },
      collaborators: [
        { id: "c-owner", name: "You", roleLabel: "Property Owner", category: "owner", addedAt: daysAgo(95) },
        { id: "c-arch", name: "Elena Rivera Ortiz", roleLabel: "Architect", category: "architect", addedAt: daysAgo(92) },
        { id: "c-con", name: "Héctor Báez Rosado", roleLabel: "Contractor", category: "contractor", addedAt: daysAgo(62) },
        { id: "c-inv", name: "Marta Delgado", roleLabel: "Investor", category: "investor", addedAt: daysAgo(70) }
      ],
      activity: [
        { id: "a16", at: daysAgo(4), actor: "Contractor", text: "Submitted a change order: additional electrical panel upgrade (+$7,075)." },
        { id: "a15", at: daysAgo(9), actor: "Inspector", text: "Final inspection flagged: smoke detector spacing in Area B needs correction." },
        { id: "a14", at: daysAgo(12), actor: "AI Copilot", text: "Flagged a progress photo in Area B — possible scope mismatch, worth asking the contractor." },
        { id: "a13", at: daysAgo(28), actor: "You", text: "Framing progress payment released ($22,000)." },
        { id: "a12", at: daysAgo(30), actor: "Inspector", text: "Framing inspection passed." },
        { id: "a11", at: daysAgo(58), actor: "Inspector", text: "Foundation inspection passed." },
        { id: "a10", at: daysAgo(58), actor: "You", text: "Foundation progress payment released ($18,000)." },
        { id: "a9", at: daysAgo(62), actor: "You", text: "Construction started — project entered Build Mode." },
        { id: "a8", at: daysAgo(62), actor: "You", text: "Hired Héctor Báez Rosado (Báez Construcción General) as general contractor." },
        { id: "a7", at: daysAgo(63), actor: "AI Copilot", text: "Permit approved — the project is ready for construction." },
        { id: "a6", at: daysAgo(66), actor: "Architect", text: "Corrections resolved and resubmitted." },
        { id: "a5", at: daysAgo(70), actor: "Municipio de Caguas", text: "Correction requested on the initial submission." },
        { id: "a4", at: daysAgo(72), actor: "Architect", text: "Permit application submitted to the Municipio Autónomo de Caguas." },
        { id: "a3", at: daysAgo(85), actor: "Engineer", text: "Structural engineering review approved." },
        { id: "a2", at: daysAgo(88), actor: "Architect", text: "Architectural design approved." },
        { id: "a1", at: daysAgo(95), actor: "You", text: "Started this project — Accessory dwelling unit (second unit)." }
      ]
    };
    save(w);
  }

  return {
    list, get, create, save, update, remove, findByPropertyAndScenario,
    appendActivity, markSeen, setPermitStatus, addDocument, addEstimate,
    addChangeOrder, assignProfessional, addCollaborator, seedFlagship
  };
})();
