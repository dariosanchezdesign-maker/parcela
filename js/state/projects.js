/**
 * "My Projects" persistence — localStorage today, same shape a real
 * per-user backend table could return tomorrow. Each record stores just
 * the propertyId + goalId + a label; the report itself is re-derived from
 * analyzeProperty() on load since the mock engine is deterministic.
 */
window.PARCELA_PROJECTS = (function () {
  const KEY = "parcela_projects_v1";

  function readAll() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function writeAll(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) {
      /* storage unavailable (private mode, quota) — fail silently, UI treats as empty */
    }
  }

  function list() {
    return readAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function get(id) {
    return readAll().find((p) => p.id === id) || null;
  }

  function findByPropertyAndGoal(propertyId, goalId) {
    return readAll().find((p) => p.propertyId === propertyId && p.goalId === goalId) || null;
  }

  function save({ propertyId, goalId, label }) {
    const existing = findByPropertyAndGoal(propertyId, goalId);
    if (existing) return existing;
    const all = readAll();
    const record = {
      id: "proj_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      propertyId, goalId, label: label || null,
      createdAt: new Date().toISOString()
    };
    all.push(record);
    writeAll(all);
    return record;
  }

  function remove(id) {
    writeAll(readAll().filter((p) => p.id !== id));
  }

  return { list, get, save, remove };
})();
