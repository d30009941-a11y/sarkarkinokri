async function handleSearch() {
    const input = document.getElementById('hero-search-input').value.toLowerCase().trim();
    if (!input) return;

    // 1. Initialize Loader to get access to index.json
    if (!Loader.indexManifest) {
        await Loader.init("data/index.json");
    }

    // --- LAYER 1: SEARCH MANIFEST (index.json) ---
    // Checks master_id (e.g., ssc-cgl-2026)
    const manifestMatch = Loader.indexManifest.entries.find(e => 
        e.master_id && e.master_id.toLowerCase().includes(input)
    );

    if (manifestMatch) {
        // Use MeshRouter to check for master_id.html before details.html
        return MeshRouter.navigate(manifestMatch.master_id);
    }

    // --- LAYER 2: SEARCH STATIC PORTALS (staticportals.json) ---
    try {
        const portalRes = await fetch('data/staticportals.json');
        const portals = await portalRes.json();
        const portalMatch = portals.find(p => p.name.toLowerCase().includes(input));
        
        if (portalMatch) {
            // If you have SBI.html, MeshRouter will go there instead of the external URL
            return MeshRouter.navigate(portalMatch.name.split(' ')[0], ''); 
        }
    } catch (e) { console.warn("Portal search failed"); }

    // --- LAYER 3: SEARCH IMPORTANT LINKS (importantlinks.json) ---
    try {
        const linksRes = await fetch('data/importantlinks.json');
        const linkGroups = await linksRes.json();
        
        for (const group of linkGroups) {
            // Check category (e.g., 'Syllabus') or specific link titles
            if (group.category.toLowerCase().includes(input)) {
                return MeshRouter.navigate(input, 'resources');
            }
            
            const linkMatch = group.links.find(l => l.title.toLowerCase().includes(input));
            if (linkMatch) {
                // Redirect to the specific saved URL
                window.location.href = linkMatch.url;
                return;
            }
        }
    } catch (e) { console.warn("Link search failed"); }

    // --- FALLBACK ---
    alert("No matching recruitment, portal, or resource found. Try 'SSC', 'SBI', or 'Syllabus'.");
}

// Attach to your Search Button
document.getElementById('search-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    handleSearch();
});
