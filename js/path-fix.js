/* SarkarKinokri Path Fix Layer
   Safe for localhost, GitHub pages, deep folders
   Non-intrusive (does not override existing logic)
*/

(function () {

    if (window.SK_build) return; // prevent duplicate load

    function detectBase() {

        const { origin, pathname, hostname } = window.location;

        // GitHub Pages repo support
        if (hostname.includes("github.io")) {
            const parts = pathname.split("/").filter(Boolean);
            if (parts.length > 0) {
                return origin + "/" + parts[0] + "/";
            }
        }

        // Localhost / Acode
        if (hostname === "localhost" || hostname === "127.0.0.1") {
            return origin + "/";
        }

        // Deep folder fallback
        return origin + pathname.replace(/\/[^\/]*$/, "/");
    }

    const BASE = detectBase();

    // expose but do not override anything
    window.SK_BASE = BASE;

    window.SK_build = function (path) {
        if (!path) return BASE;
        return new URL(path.replace(/^\//, ""), BASE).href;
    };

})();