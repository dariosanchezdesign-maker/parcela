/* Parcela — Supabase-backed data access, parallel to js/data/mockData.js.
   Does not replace window.PARCELA or touch any existing page yet — this
   is the proof-of-concept layer described in tasks/todo.md's "Backend
   scaffold" section. A page opts in by loading this script (after the
   Supabase JS client, loaded from a CDN) instead of / alongside
   mockData.js.

   Setup, once you have a Supabase project (see db/schema.sql for the
   schema and db/seed.sql for matching demo data):
     1. Fill in SUPABASE_URL and SUPABASE_ANON_KEY below.
     2. Run schema.sql then seed.sql in the Supabase SQL editor.
     3. Add this before this script's own <script> tag in a page:
          <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>

   The anon key is safe to embed client-side: schema.sql's Row Level
   Security policies only grant it SELECT, never INSERT/UPDATE/DELETE. */

window.ParcelaDB = (function () {
  const SUPABASE_URL = "https://wwmunjpojzfjkketbpvl.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3bXVuanBvanpmamtrZXRicHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MjgyNDcsImV4cCI6MjEwNTUwNDI0N30.qwfIZT64_FAmq0n9tHGTbI-BPlf-uV8RtVuZnZFgVxk"; // public "anon" key — safe client-side, RLS grants it SELECT only

  let client = null;
  function getClient() {
    if (client) return client;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("ParcelaDB: set SUPABASE_URL and SUPABASE_ANON_KEY in js/data/supabaseClient.js before use.");
    }
    if (!window.supabase) {
      throw new Error("ParcelaDB: Supabase JS client not loaded — add the CDN <script> tag before this file.");
    }
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return client;
  }

  // ---- Project (parcel + assumptions), by parcel id ----
  async function projectByParcelId(parcelId) {
    const db = getClient();
    const { data, error } = await db
      .from("projects")
      .select("*, parcels(*)")
      .eq("parcel_id", parcelId)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  // ---- All findings for a project, each with its linked source rows ----
  async function findingsByProjectId(projectId) {
    const db = getClient();
    const { data, error } = await db
      .from("findings")
      .select("*, finding_sources(source_id, sources(*))")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    // flatten finding_sources(...) into a plain `sources` array per finding,
    // matching the shape callers actually want
    return (data || []).map((f) => ({
      ...f,
      sources: (f.finding_sources || []).map((fs) => fs.sources),
      finding_sources: undefined,
    }));
  }

  // ---- One finding by id, with its sources ----
  async function findingById(id) {
    const db = getClient();
    const { data, error } = await db
      .from("findings")
      .select("*, finding_sources(source_id, sources(*))")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return { ...data, sources: (data.finding_sources || []).map((fs) => fs.sources), finding_sources: undefined };
  }

  // ---- Open questions ("unknowns") for a project ----
  async function questionsByProjectId(projectId) {
    const db = getClient();
    const { data, error } = await db
      .from("questions")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  }

  // ---- Permit steps ("next actions") for a project ----
  async function permitStepsByProjectId(projectId) {
    const db = getClient();
    const { data, error } = await db
      .from("permit_steps")
      .select("*, findings(*), sources(*)")
      .eq("project_id", projectId)
      .order("step_order", { ascending: true });
    if (error) throw error;
    return data || [];
  }

  // ---- Rollup summary across every property, for Compare / Properties
  // list. unknownsCount/constraintsCount are computed here from the real
  // findings/questions rows rather than stored, so they can never drift
  // out of sync with the underlying data. ----
  async function allPropertiesSummary() {
    const db = getClient();
    const { data: projects, error } = await db
      .from("projects")
      .select("*, parcels(*)")
      .order("last_analyzed_at", { ascending: false });
    if (error) throw error;

    return Promise.all(
      (projects || []).map(async (p) => {
        const [findings, questions] = await Promise.all([findingsByProjectId(p.id), questionsByProjectId(p.id)]);
        return {
          id: p.parcels.id,
          label: p.compare_label,
          address: p.parcels.address,
          // parcels.municipality is stored as the full "San Juan, Puerto Rico";
          // both properties.html and compare.html append ", Puerto Rico"
          // themselves, so this needs to be just the bare city name.
          municipality: (p.parcels.municipality || "").split(",")[0].trim(),
          projectType: p.project_type,
          status: p.compare_status,
          statusLabel: p.feasibility_status,
          lastAnalyzed: p.last_analyzed_at
            ? new Date(p.last_analyzed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
            : "",
          regulatoryComplexity: p.regulatory_complexity,
          floodExposure: p.flood_exposure_summary,
          environmental: p.environmental_summary,
          infrastructure: p.infrastructure_summary,
          unknownsCount: questions.length,
          constraintsCount: findings.filter((f) => f.category === "constraint").length,
          keyDifference: p.key_difference,
        };
      })
    );
  }

  // ---- Map-marker summary for every property, for the Explore page.
  // constraints (boolean) is computed from real findings the same way
  // Compare's constraintsCount is, rather than stored. ----
  async function exploreProperties() {
    const db = getClient();
    const { data: projects, error } = await db
      .from("projects")
      .select("*, parcels(*)");
    if (error) throw error;

    return Promise.all(
      (projects || []).map(async (p) => {
        const findings = await findingsByProjectId(p.id);
        return {
          id: p.parcels.id,
          address: p.parcels.address,
          municipality: (p.parcels.municipality || "").split(",")[0].trim(),
          x: p.parcels.explore_x,
          y: p.parcels.explore_y,
          sizeAcres: p.parcels.parcel_area_acres,
          landUse: p.parcels.land_use_classification,
          potentialUse: p.project_type ? p.project_type.en : null,
          flood: p.flood_zone_label,
          infrastructure: p.infrastructure_rating,
          constraints: findings.some((f) => f.category === "constraint"),
          status: p.compare_status,
        };
      })
    );
  }

  return {
    projectByParcelId,
    findingsByProjectId,
    findingById,
    questionsByProjectId,
    permitStepsByProjectId,
    allPropertiesSummary,
    exploreProperties,
  };
})();
