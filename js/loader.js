/**
 * Loader.js — ULTRA STABLE UNIVERSAL LOADER (BASE FIXED)
 */

const BASE = window.location.pathname.includes("sarkarkinokri")
  ? "/sarkarkinokri/"
  : "/";

window.Loader = {
    indexManifest: null,

    async init(manifestPath = "data/index.json") {
        try {
            const res = await fetch(BASE + manifestPath.replace(/^\/+/, ''));
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
        const clean = path.replace(/^\/+/, '');

        const paths = [
            BASE + clean,
            clean,
            "/" + clean
        ];

        for (const p of paths) {
            try {
                const res = await fetch(p);

                if (!res.ok) continue;

                const text = await res.text();

                if (!text.trim().startsWith("{") && !text.trim().startsWith("[")) continue;

                const json = JSON.parse(text);
                console.log("✅ Loaded JSON:", p);
                return json;

            } catch (err) {}
        }

        console.error("❌ ALL FETCH FAILED →", path);
        return null;
    }
};