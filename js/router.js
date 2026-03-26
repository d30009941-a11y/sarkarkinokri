/**
 * Router.js — BASE SAFE VERSION (NO LOGIC CHANGE)
 */

const BASE = window.location.pathname.includes("sarkarkinokri")
  ? "/sarkarkinokri/"
  : "/";

window.MeshRouter = {
    async navigate(id, section = '') {
        if (!id) return;

        let targetId = id.toLowerCase().trim();
        const parts = targetId.split('-'); 
        const shortName = parts[0]; 

        const currentPath = window.location.pathname;
        const isInsideCluster = currentPath.includes(`/${shortName}/`) || currentPath.includes(`${shortName}.html`);

        if (window.Loader && !Loader.indexManifest) {
            try { await Loader.init(); } catch(e) {}
        }

        let validatedId = null;
        if (Loader.indexManifest) {
            validatedId =
                Loader.indexManifest.entries.find(e => e.master_id === targetId)?.master_id ||
                (parts.length >= 2 && Loader.indexManifest.entries.find(e => e.master_id && e.master_id.startsWith(`${parts[0]}-${parts[1]}`))?.master_id) ||
                Loader.indexManifest.entries.find(e => e.master_id && e.master_id.startsWith(shortName))?.master_id;
        }

        if (!isInsideCluster) {
            const pathsToTry = [
                `${BASE}${shortName}/index.html`,
                `${BASE}${shortName}.html`,
                `${BASE}${targetId}.html`
            ];

            for (const path of pathsToTry) {
                try {
                    const res = await fetch(path, { method: 'HEAD' });
                    if (res.ok) {
                        window.location.href = path;
                        return;
                    }
                } catch (e) {}
            }
        }

        if (validatedId) {
            window.location.href = `${BASE}details.html?id=${validatedId}${section ? '#' + section : ''}`;
            return;
        }

        try {
            const portalRes = await fetch(BASE + 'data/staticportals.json');
            const portals = await portalRes.json();
            const portalMatch = portals.find(p => p.name.toLowerCase().includes(shortName));
            if (portalMatch) {
                window.location.href = portalMatch.url;
                return;
            }
        } catch (e) {}

        console.error("Route not found for:", targetId);
        window.location.href = BASE + "index.html?status=404&target=" + targetId;
    }
};