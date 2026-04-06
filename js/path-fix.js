(function () {
    const isGithub = location.hostname.includes("github.io");
    const repoRoot = "/sarkarkinokri/";

    window.SarkarPath = {
        base: isGithub ? repoRoot : "/",

        rel(path) {
            if (!path || path.startsWith('http') || path.startsWith('#')) return path;

            // prevent double base
            if (path.startsWith(this.base)) return path;

            const clean = path.replace(/^\//, "");
            return this.base + clean;
        }
    };

    window.rel = window.SarkarPath.rel.bind(window.SarkarPath);

    console.log("%c[Commander] Root:", "color: #8b5cf6; font-weight: bold;", window.SarkarPath.base);
})(); // Restored original closing from red line 22
