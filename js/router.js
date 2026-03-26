window.MeshRouter = {
    async navigate(id, section = '') {
        if (!id) return;
        let targetId = id.toLowerCase().trim();
        const parts = targetId.split('-'); 
        const shortName = parts[0]; 

        const currentPath = window.location.pathname;
        const isInsideCluster = currentPath.includes(`/${shortName}/`) || currentPath.includes(`${shortName}.html`);

        if (window.Loader && !Loader.indexManifest) {
            // Fix: Use relative path for manifest
            try { await Loader.init("data/index.json"); } catch(e) {}
        }

        let validatedId = null;
        if (Loader.indexManifest) {
            validatedId = Loader.indexManifest.entries.find(e => e.master_id === targetId)?.master_id ||
                          (parts.length >= 2 && Loader.indexManifest.entries.find(e => e.master_id && e.master_id.startsWith(`${parts[0]}-${parts[1]}`))?.master_id) ||
                          Loader.indexManifest.entries.find(e => e.master_id && e.master_id.startsWith(shortName))?.master_id;
        }

        if (!isInsideCluster) {
            // Fix: Remove leading slashes to keep paths relative to the repo folder
            const pathsToTry = [`${shortName}/index.html`, `${shortName}.html`, `${targetId}.html`];
            for (const path of pathsToTry) {
                try {
                    const res = await fetch(path, { method: 'HEAD' });
                    if (res.ok) { window.location.href = path; return; }
                } catch (e) {}
            }
        }

        // Fix: Removed leading '/' to prevent jumping to the root domain
        if (validatedId) {
            window.location.href = `details.html?id=${validatedId}${section ? '#' + section : ''}`;
            return;
        }

        try {
            // Fix: Relative path for portals
            const portalRes = await fetch('data/staticportals.json');
            const portals = await portalRes.json();
            const portalMatch = portals.find(p => p.name.toLowerCase().includes(shortName));
            if (portalMatch) {
                window.location.href = portalMatch.url;
                return;
            }
        } catch (e) {}

        // Fix: Ensure fallback stays in the repo
        console.error("Route not found for:", targetId);
        window.location.href = "index.html?status=404&target=" + targetId;
    }
};
