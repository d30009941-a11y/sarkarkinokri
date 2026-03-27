async function handleSearch() {
    const input = document.getElementById('hero-search-input').value.toLowerCase().trim();
    if (!input) return;

    const BASE = window.location.pathname.includes("sarkarkinokri") ? "/sarkarkinokri/" : "/";

    // 1. Initialize Loader
    if (!Loader.indexManifest) {
        await Loader.init("data/index.json");
    }

    // --- LAYER 1: SEARCH MANIFEST ---
    const manifestMatch = Loader.indexManifest.entries.find(e => 
        e.master_id && e.master_id.toLowerCase().includes(input)
    );

    if (manifestMatch) {
        return MeshRouter.navigate(manifestMatch.master_id);
    }

    // --- LAYER 2: SEARCH STATIC PORTALS ---
    try {
        const portalRes = await fetch(BASE + 'data/staticportals.json');
        const portals = await portalRes.json();
        const portalMatch = portals.find(p => p.name.toLowerCase().includes(input));
        
        if (portalMatch) {
            return MeshRouter.navigate(portalMatch.name.split(' ')[0], ''); 
        }
    } catch (e) { console.warn("Portal search failed"); }

    // --- LAYER 3: SEARCH IMPORTANT LINKS ---
    try {
        const linksRes = await fetch(BASE + 'data/importantlinks.json');
        const linkGroups = await linksRes.json();
        
        for (const group of linkGroups) {
            if (group.category.toLowerCase().includes(input)) {
                return MeshRouter.navigate(input, 'resources');
            }
            
            const linkMatch = group.links.find(l => l.title.toLowerCase().includes(input));
            if (linkMatch) {
                window.location.href = linkMatch.url;
                return;
            }
        }
    } catch (e) { console.warn("Link search failed"); }

    // --- FALLBACK ---
    alert("No matching recruitment, portal, or resource found. Try 'SSC', 'SBI', or 'Syllabus'.");
}

// Attach
document.getElementById('search-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    handleSearch();
});