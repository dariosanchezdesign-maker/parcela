/**
 * Auth-ready seam. This MVP has no real accounts — everyone is a local
 * "guest" whose projects live in this browser's localStorage. Swap this
 * module for real session logic (cookies/JWT/provider) later; the nav
 * partial and projects.html only call getUser()/label(), so nothing else
 * needs to change.
 */
window.PARCELA_SESSION = (function () {
  const KEY = "parcela_guest_id";

  function getUser() {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = "guest_" + Math.random().toString(36).slice(2, 8);
      try { localStorage.setItem(KEY, id); } catch (e) { /* private mode */ }
    }
    return { id, label: "Guest", isGuest: true };
  }

  return { getUser };
})();
