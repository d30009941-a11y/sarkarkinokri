/**
 * Loader.js — ULTRA STABLE UNIVERSAL LOADER (with daily post filtering)
 */

window.Loader = {
    indexManifest: null,

    async init(manifestPath) {
        try {
            // Fix: Ensure manifestPath is relative for GitHub Pages
            const safePath = manifestPath.startsWith('/') ? manifestPath.substring(1) : manifestPath;
            const res = await fetch(safePath);
            if (!res.ok) throw new Error("Manifest load failed");
            this.indexManifest = await res.json();
            console.log("✅ Loader initialized");
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

        if (!entry) {
            // Special case for daily posts
            if(type === "dailypost") {
                const postsEntries = this.indexManifest.entries.filter(e => e.type === "dailypost");
                if(postsEntries.length) {
                    let combinedPosts = [];
                    for(const pEntry of postsEntries) {
                        const posts = await this._fetchJSON(pEntry.file);
                        if(posts?.length) {
                            combinedPosts.push(...posts.filter(dp => dp.master_id === masterId));
                        }
                    }
                    if(combinedPosts.length) return combinedPosts;
                }
            }
            return null;
        }

        return this._fetchJSON(entry.file);
    },

    async _fetchJSON(path) {
        // Fix: Force path to be relative by removing any leading slash
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;

        try {
            const res = await fetch(cleanPath);

            if (!res.ok) {
                console.warn(`❌ Fetch failed:`, cleanPath);
                return null;
            }

            const text = await res.text();

            if (!text.trim().startsWith("{") && !text.trim().startsWith("[")) {
                console.warn("❌ Invalid JSON:", cleanPath);
                return null;
            }

            const json = JSON.parse(text);
            console.log(`✅ Loaded JSON:`, cleanPath);
            return json;

        } catch (err) {
            console.warn(`⚠️ Error fetching JSON:`, cleanPath);
            return null;
        }
    }
};
