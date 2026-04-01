/**
 * loader.js — THE HYBRID SPECIALIST
 */
window.Loader = {
    indexManifest: null,
    _sharedFetch: null,

    getBase() {
        return (window.SarkarPath && window.SarkarPath.base) ? window.SarkarPath.base : '/';
    },

    // 1. Manifest is always an Object with 'entries'
    async init(path) {
        if (this.indexManifest) return this.indexManifest;
        if (this._sharedFetch) return this._sharedFetch;

        const finalPath = window.rel ? window.rel(path) : path;
        this._sharedFetch = (async () => {
            try {
                const res = await fetch(finalPath);
                this.indexManifest = await res.json();
                console.log("%c✅ Manifest Secured", "color: #10b981; font-weight: bold;");
                return this.indexManifest;
            } catch (e) {
                this._sharedFetch = null;
                return null;
            }
        })();
        return this._sharedFetch;
    },

    // 2. Intelligent Fetching based on 'type'
    async fetchByMaster(id, type) {
        const fileName = id.endsWith('.json') ? id : `${id}.json`;
        const finalPath = window.rel ? window.rel(`data/${type}/${fileName}`) : `data/${type}/${fileName}`;
        
        const raw = await this._fetchJSON(finalPath);
        if (!raw) return null;

        // --- THE LOGIC HOOKS ---
        if (type === "events") {
            // Ensure it returns an Object with an events array for the hooks
            return {
                ...raw,
                events: raw.events || (Array.isArray(raw) ? raw : [])
            };
        } 
        
        if (type === "jobsdata") {
            // Ensure it returns an Array for table rendering
            return Array.isArray(raw) ? raw : (raw.data || raw.rows || [raw]);
        }

        return raw; // Default for dailyposts or others
    },

    async _fetchJSON(url) {
        try {
            const res = await fetch(url);
            return res.ok ? await res.json() : null;
        } catch (e) { return null; }
    },

    getAllMasterIds() {
        // Correctly targets 'entries' from your index.json
        const m = this.indexManifest;
        if (!m) return [];
        const list = m.entries || m.rows || (Array.isArray(m) ? m : []);
        // Get unique IDs only
        return [...new Set(list.map(item => item.master_id || item.id))].filter(Boolean);
    }
};
