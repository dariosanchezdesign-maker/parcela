/* Accounts and saved projects (Supabase Auth email links + the
   saved_projects table from db/migration_004_accounts.sql). Needs the
   Supabase CDN client and supabaseClient.js loaded first. */

window.ParcelaAccount = (function () {
  const db = () => window.ParcelaDB.client();

  async function user() {
    const { data } = await db().auth.getSession();
    return data.session ? data.session.user : null;
  }

  async function accessToken() {
    const { data } = await db().auth.getSession();
    return data.session ? data.session.access_token : null;
  }

  // Sends the sign-in link; `next` is where the link lands afterwards.
  async function sendLink(email, next) {
    const redirect = new URL("signin.html", location.href);
    if (next) redirect.searchParams.set("next", next);
    const { error } = await db().auth.signInWithOtp({ email, options: { emailRedirectTo: redirect.href } });
    if (error) throw error;
  }

  async function signOut() {
    await db().auth.signOut();
  }

  function onChange(fn) {
    db().auth.onAuthStateChange((_event, session) => fn(session ? session.user : null));
  }

  // Upserts the project for this parcel from the page's live data.
  async function saveProject(P) {
    const u = await user();
    if (!u) throw Object.assign(new Error("signed out"), { code: "signed_out" });
    const project = window.ParcelaLive.loadProject() || {};
    const counts = {};
    P.findingCategories.forEach((c) => { counts[c.key] = c.findings.length; });
    const fit = P.findingById("project-fit");
    const row = {
      user_id: u.id,
      cadastral: P.property.cadastral,
      address: P.liveData.property.address,
      municipality: P.property.municipality,
      project_type: project.type || null,
      units: project.units || null,
      investment: project.investment || null,
      summary: {
        feasibility: P.feasibility.status,
        counts,
        fit: fit ? { category: fit.category, title: fit.title } : null,
        zoning: P.liveData.zoning ? P.liveData.zoning.code : null,
        areaSqm: P.property.parcelAreaSqm,
      },
      updated_at: new Date().toISOString(),
    };
    const { error } = await db().from("saved_projects").upsert(row, { onConflict: "user_id,cadastral" });
    if (error) throw error;
  }

  async function isSaved(cadastral) {
    if (!(await user())) return false;
    const { data, error } = await db().from("saved_projects").select("id").eq("cadastral", cadastral).maybeSingle();
    if (error) throw error;
    return !!data;
  }

  async function listProjects() {
    const { data, error } = await db().from("saved_projects").select("*").order("updated_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  async function deleteProject(id) {
    const { error } = await db().from("saved_projects").delete().eq("id", id);
    if (error) throw error;
  }

  return { user, accessToken, sendLink, signOut, onChange, saveProject, isSaved, listProjects, deleteProject };
})();
