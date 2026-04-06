(function () {
  "use strict";

  // 1. THE PATH FIX: Instead of calculating depth with ../
  // we use the actual repository name as the base.
  window.rel = function (path = "") {
    const isGitHub = window.location.hostname.includes('github.io');
    const base = isGitHub ? '/sarkarkinokri/' : '/';
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return (base + cleanPath).replace(/\/+/g, '/');
  };

  function normalize(str) {
    return (str || "").replace(/-\d{4}$/, "").toLowerCase();
  }

  function getSlug() {
    const file = location.pathname.split("/").pop() || "";
    return file.replace(".html", "").toLowerCase();
  }

  // 2. INTEGRATED FETCH: This talks to your Loader
  async function fetchJSON(path) {
    // If the Loader exists, use its manifest to save time/speed
    if (window.Loader && window.Loader.indexManifest) {
       if (path.includes('index.json')) return window.Loader.indexManifest;
    }
    
    try {
      const res = await fetch(window.rel(path));
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn("fetch failed:", path);
      return null;
    }
  }

  async function route() {
    const isDetails = location.pathname.includes("details.html");
    const slug = normalize(getSlug());

    // =====================================================
    // CASE 1 : DETAILS PAGE → ENSURE MASTER ID
    // =====================================================
    if (isDetails) {
      const params = new URLSearchParams(location.search);
      const id = params.get("id");
      if (!id) return;

      const normalized = normalize(id);
      if (normalized !== id) return; // Already has the year/master format

      const index = await fetchJSON("data/index.json");
      if (!index) return;

      // Find the full master_id in the Array
      const match = index.find(item => normalize(item.master_id || item.id) === normalized);

      if (match && match.master_id !== id) {
        location.replace(window.rel(`details.html?id=${match.master_id}`));
      }
      return;
    }

    // =====================================================
    // CASE 2 : SLUG ROUTING (Home to Details)
    // =====================================================
    if (slug === "index" || slug === "") return;

    const staticMap = await fetchJSON("data/staticportals.json");
    if (staticMap && staticMap[slug]) {
      location.replace(window.rel(staticMap[slug]));
      return;
    }

    const index = await fetchJSON("data/index.json");
    if (!index) return;

    // Search the Array for the slug
    const match = index.find(item => normalize(item.master_id || item.id) === slug);

    if (match) {
      console.log("Routing to:", match.master_id);
      location.replace(window.rel(`details.html?id=${match.master_id}`));
    }
  }

  route();
})();
