/**
 * search.js — UNIVERSAL SEARCH ENGINE
 */

async function handleSearch() {
    const input = document.getElementById('hero-search-input').value.toLowerCase().trim();
    if (!input) return;

    // ===============================
    // UNIVERSAL PATH BUILDER
    // ===============================
    const BASE = window.Loader ? Loader.getBase() : '/';
    const build = (p) => {
        if (!p || p === "#" || p.startsWith("http")) return p;
        const clean = p.startsWith('/') ? p.slice(1) : p;
        return BASE + clean;
    };

    // 1. Initialize Loader to get access to index.json
    if (window.Loader && !Loader.indexManifest) {
        try {
            await Loader.init(build("data/index.json"));
        } catch(e) {
            console.warn("Search: Loader init failed.");
        }
    }

    // --- LAYER 1: SEARCH MANIFEST (index.json) ---
    // Logic: Letter-by-letter original
    const manifestMatch = Loader.indexManifest?.entries.find(e => 
        e.master_id && e.master_id.toLowerCase().includes(input)
    );

    if (manifestMatch) {
        return MeshRouter.navigate(manifestMatch.master_id);
    }

    // --- LAYER 2: SEARCH STATIC PORTALS ---
    // Logic: Letter-by-letter original
    try {
        const portalRes = await fetch(build('data/staticportals.json'));
        const portals = await portalRes.json();
        const portalMatch = portals.find(p => p.name.toLowerCase().includes(input));
        
        if (portalMatch) {
            // Using MeshRouter to handle the portal navigation logic
            return MeshRouter.navigate(portalMatch.name.split(' ')[0], ''); 
        }
    } catch (e) { console.warn("Portal search failed"); }

    // --- LAYER 3: SEARCH IMPORTANT LINKS ---
    // Logic: Letter-by-letter original
    try {
        const linksRes = await fetch(build('data/importantlinks.json'));
        const linkGroups = await linksRes.json();
        
        for (const group of linkGroups) {
            // Category match
            if (group.category.toLowerCase().includes(input)) {
                return MeshRouter.navigate(input, 'resources');
            }
            
            // Specific link match
            const linkMatch = group.links.find(l => l.title.toLowerCase().includes(input));
            if (linkMatch) {
                // Fixed: Apply universal build to the link URL
                window.location.href = build(linkMatch.url);
                return;
            }
        }
    } catch (e) { console.warn("Link search failed"); }

    alert("No matching recruitment, portal, or resource found. Try 'SSC', 'SBI', or 'Syllabus'.");
}

// Event Listeners (Logic preserved)
document.getElementById('search-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    handleSearch();
});

document.getElementById('hero-search-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
    }
});
