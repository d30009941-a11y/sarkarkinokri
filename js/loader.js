/**
 * Loader.js — ULTRA STABLE UNIVERSAL LOADER (GitHub + Local Compatible)
 */

const PATH_RESOLVER = (() => {
    const { pathname, hostname } = window.location;

    let base = "/";

    // Detect GitHub Pages repo base
    if (hostname.includes("github.io")) {
        const repo = pathname.split("/")[1];
        base = repo ? `/${repo}/` : "/";
    }

    return {
        base,

        resolve(path) {
            const clean = path.replace(/^\/+/, '');
            return base + clean;
        }
    };
})();


window.Loader = {
    indexManifest: null,

    async init(manifestPath) {
        try {
            const resolvedPath = PATH_RESOLVER.resolve(manifestPath);

            const res = await fetch(resolvedPath);
            if (!res.ok) throw new Error("Manifest load failed");

            const text = await res.text();

            if (!text.trim().startsWith("{")) {
                throw new Error("Invalid manifest JSON");
            }

            this.indexManifest = JSON.parse(text);

            console.log("✅ Loader initialized", resolvedPath);

        } catch (err) {
            console.error("❌ Loader init failed", err);
            throw err;
        }
    },

    getAllMasterIds() {
        if (!this.indexManifest?.entries) return [];

        const ids = new Set();

        this.indexManifest.entries.forEach(e => {
            if (e.master_id) ids.add(e.master_id);
        });

        return Array.from(ids);
    },

    async fetchByMaster(masterId, type) {
        if (!this.indexManifest?.entries) return null;

        const entry = this.indexManifest.entries.find(
            e => e.master_id === masterId && e.type === type
        );

        // 🔥 Special case: dailypost aggregation (UNCHANGED logic, improved path handling)
        if (!entry) {
            if (type === "dailypost") {
                const postsEntries = this.indexManifest.entries.filter(e => e.type === "dailypost");

                if (postsEntries.length) {
                    let combinedPosts = [];

                    for (const pEntry of postsEntries) {
                        const posts = await this._fetchJSON(pEntry.file);

                        if (posts?.length) {
                            combinedPosts.push(
                                ...posts.filter(dp => dp.master_id === masterId)
                            );
                        }
                    }

                    if (combinedPosts.length) return combinedPosts;
                }
            }

            return null;
        }

        return this._fetchJSON(entry.file);
    },

    async _fetchJSON(path) {
        const cleanPath = path.replace(/^\/+/, '');

        const attempts = [
            PATH_RESOLVER.resolve(cleanPath), // ✅ GitHub correct
            cleanPath,                        // ✅ relative
            "/" + cleanPath                  // ✅ absolute fallback
        ];

        for (const p of attempts) {
            try {
                const res = await fetch(p);

                if (!res.ok) {
                    console.warn("❌ Fetch failed:", p);
                    continue;
                }

                const text = await res.text();

                // 🔒 Strict JSON validation (kept strong)
                if (!text.trim().startsWith("{") && !text.trim().startsWith("[")) {
                    console.warn("❌ Invalid JSON:", p);
                    continue;
                }

                const json = JSON.parse(text);

                console.log("✅ Loaded JSON:", p);
                return json;

            } catch (err) {
                console.warn("⚠️ Error fetching JSON:", p);
            }
        }

        console.error("❌ ALL FETCH FAILED →", path);
        return null;
    }
};
