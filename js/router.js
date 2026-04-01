/**
 * router.js — UNIVERSAL NAVIGATION & SEARCH ENGINE
 * Priority: Specific Category HTML > Folder HTML > Dynamic Details > Sitemap
 */

window.MeshRouter = {
    // 1. DYNAMIC SEARCH MATCHER (For Search Layer Suggestions)
    getSearchMatches(query, manifest) {
        const term = query.toLowerCase().trim();
        const termSquashed = term.replace(/-/g, '');
        
        return manifest.filter(entry => {
            const mid = entry.master_id?.toLowerCase() || "";
            const midSquashed = mid.replace(/-/g, '');
            const label = (entry.label || "").toLowerCase();
            
            return mid.includes(term) || midSquashed.includes(termSquashed) || label.includes(term);
        }).slice(0, 8);
    },

    // 2. SMART INTERNAL ROUTING (The Waterfall)
    async navigate(id, category = '', section = '') {
        if (!id) return;
        
        const rawId = id.toLowerCase().trim();
        const cleanId = rawId.replace(/-\d{4}$/, ''); // ssc-cgl-2026 -> ssc-cgl
        const squashedId = rawId.replace(/-/g, '');  // ssc-cgl -> ssccgl
        
        // Auto-detect folder based on ID prefix
        const folder = category || (rawId.startsWith('ssc') ? 'ssc' : (rawId.startsWith('rrb') ? 'railways' : ''));

        // --- LAYER 1: CATEGORY/FOLDER CHECK (railways/ntpc.html etc.) ---
        if (folder) {
            const folderPaths = [
                window.rel(`${folder}/${rawId}.html`),      // ssc/ssc-cgl-2026.html
                window.rel(`${folder}/${cleanId}.html`),    // ssc/ssc-cgl.html
                window.rel(`${folder}/${squashedId}.html`)  // ssc/ssccgl.html
            ];

            for (const path of folderPaths) {
                try {
                    const res = await fetch(path, { method: 'HEAD' });
                    if (res.ok) { window.location.href = path + (section ? '#' + section : ''); return; }
                } catch (e) {}
            }
        }

        // --- LAYER 2: RESOURCES CHECK (Syllabus/Pattern/Apply) ---
        // Using paths from importantlinks.json structure
        const resourceCats = ['syllabus', 'exampattern', 'apply'];
        for (const cat of resourceCats) {
            const resPath = window.rel(`resources/${cat}/${cleanId}.html`);
            try {
                const res = await fetch(resPath, { method: 'HEAD' });
                if (res.ok) { window.location.href = resPath; return; }
            } catch (e) {}
        }

        // --- LAYER 3: DYNAMIC DETAILS (The Source of Truth) ---
        if (window.Loader) {
            if (!Loader.indexManifest) await Loader.init(window.rel("data/index.json"));
            
            const match = Loader.indexManifest.entries.find(e => 
                e.master_id === rawId || e.master_id.includes(cleanId) || e.master_id.replace(/-/g, '') === squashedId
            );

            if (match) {
                window.location.href = window.rel(`details.html?id=${match.master_id}${section ? '#' + section : ''}`);
                return;
            }
        }

        // --- LAYER 4: FINAL FALLBACK (Sitemap) ---
        window.location.href = window.rel(`sitemap.html?target=${rawId}`);
    }
};
