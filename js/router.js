window.MeshRouter = {
    async navigate(id, section = '') {
        if (!id) return;
        let targetId = id.toLowerCase().trim();
        const parts = targetId.split('-'); 
        const shortName = parts[0]; 

        // DETECT CONTEXT: Are we already in the cluster?
        const currentPath = window.location.pathname;
        const isInsideCluster = currentPath.includes(`/${shortName}/`) || currentPath.includes(`${shortName}.html`);

        if (window.Loader && !Loader.indexManifest) {
            try { await Loader.init("/data/index.json"); } catch(e) {}
        }

        // LAYER 1: VALIDATE (3-2-1)
        let validatedId = null;
        if (Loader.indexManifest) {
            validatedId = Loader.indexManifest.entries.find(e => e.master_id === targetId)?.master_id ||
                          (parts.length >= 2 && Loader.indexManifest.entries.find(e => e.master_id && e.master_id.startsWith(`${parts[0]}-${parts[1]}`))?.master_id) ||
                          Loader.indexManifest.entries.find(e => e.master_id && e.master_id.startsWith(shortName))?.master_id;
        }

        // LAYER 2: HTML PRIORITY (Only if NOT already inside the cluster)
        if (!isInsideCluster) {
            const pathsToTry = [`/${shortName}/index.html`, `/${shortName}.html`, `/${targetId}.html`];
            for (const path of pathsToTry) {
                try {
                    const res = await fetch(path, { method: 'HEAD' });
                    if (res.ok) { window.location.href = path; return; }
                } catch (e) {}
            }
        }

        // LAYER 3: DYNAMIC DETAILS
        if (validatedId) {
            window.location.href = `/details.html?id=${validatedId}${section ? '#' + section : ''}`;
            return;
        }

        // LAYER 4: STATIC PORTAL & 404 SAFETY NET
        try {
            const portalRes = await fetch('/data/staticportals.json');
            const portals = await portalRes.json();
            const portalMatch = portals.find(p => p.name.toLowerCase().includes(shortName));
            if (portalMatch) {
                window.location.href = portalMatch.url;
                return;
            }
        } catch (e) {}

        // FINAL 404: Redirect home instead of staying on broken page
        console.error("Route not found for:", targetId);
        window.location.href = "/index.html?status=404&target=" + targetId;
    }
};
