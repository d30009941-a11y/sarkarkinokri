/**
 * loader.js — PERFORMANCE & RELIABILITY VERSION
 */
window.Loader = {
    indexManifest: null,
    _sharedFetch: null,
    _cache: new Map(), // 1. THIS IS YOUR MEMORY BANK

    getBase() {
        return window.location.hostname.includes('github.io') ? '/sarkarkinokri/' : '/';
    },

    _resolve(path) {
        const clean = path.replace(/^\.\.\//g, '').replace(/^\//, '');
        return (this.getBase() + clean).replace(/\/+/g, '/');
    },

    async init(path) {
        // 2. CHECK CACHE FIRST: If we have the manifest, return it in 0ms
        if (this.indexManifest) return this.indexManifest;
        if (this._sharedFetch) return this._sharedFetch;

        const finalPath = this._resolve('data/index.json');
        
        this._sharedFetch = (async () => {
            for (let i = 0; i < 3; i++) {
                try {
                    const res = await fetch(finalPath, { priority: 'high' });
                    if (res.ok) {
                        this.indexManifest = await res.json();
                        
                        // 3. SAVE MANIFEST TO CACHE: So home page loads instantly next time
                        this._cache.set('manifest', this.indexManifest); 
                        
                        return this.indexManifest;
                    }
                } catch (e) {
                    console.warn(`Retry ${i+1} for manifest...`);
                }
                await new Promise(r => setTimeout(r, 200 * i));
            }
            this._sharedFetch = null;
            return null;
        })();
        return this._sharedFetch;
    },

    async fetchByMaster(id, type) {
        if (!id) return null;
        const cacheKey = `${type}_${id}`;

        // 4. CHECK CACHE: Before asking GitHub, ask the Memory Bank
        if (this._cache.has(cacheKey)) {
            console.log("🚀 Serving from Cache:", cacheKey);
            return this._cache.get(cacheKey);
        }

        const fileName = id.endsWith('.json') ? id : `${id}.json`;
        const finalPath = this._resolve(`data/${type}/${fileName}`);
        
        const raw = await this._fetchJSON(finalPath);
        if (!raw) return null;

        let processed = raw;
        if (type === "events") {
            processed = { ...raw, events: raw.events || (Array.isArray(raw) ? raw : []) };
        } else if (type === "jobsdata") {
            processed = Array.isArray(raw) ? raw : (raw.data || raw.rows || [raw]);
        }

        // 5. SAVE TO CACHE: Store the result for the next click
        this._cache.set(cacheKey, processed); 
        
        return processed;
    },

    async _fetchJSON(url) {
        try {
            const res = await fetch(url);
            return res.ok ? await res.json() : null;
        } catch (e) { 
            return null; 
        }
    },

    getAllMasterIds() {
        const m = this.indexManifest;
        if (!m) return [];
        const list = m.entries || m.rows || (Array.isArray(m) ? m : []);
        return [...new Set(list.map(item => item.master_id || item.id))].filter(Boolean);
    }
};
