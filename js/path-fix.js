/* =====================================
   FORCE ROOT = /sarkarkinokri/
   (GitHub + Acode unified)
===================================== */

(function () {

    if (window.__ROOT_LOCK__) return;
    window.__ROOT_LOCK__ = true;

    const TARGET = "/sarkarkinokri/";

    const { pathname, search, hash } = window.location;

    // If already correct → do nothing
    if (pathname.startsWith(TARGET)) {
        console.log("✅ Root OK:", TARGET);
        return;
    }

    // Detect GitHub repo structure
    const parts = pathname.split("/").filter(Boolean);

    // Example:
    // /repo-name/sarkarkinokri/page.html
    if (parts.length >= 2 && parts[1].toLowerCase() === "sarkarkinokri") {

        const newPath = TARGET + parts.slice(2).join("/");

        console.log("🔁 Fixing root:", pathname, "→", newPath);

        // rewrite URL WITHOUT reload
        window.history.replaceState({}, "", newPath + search + hash);
    }

})();