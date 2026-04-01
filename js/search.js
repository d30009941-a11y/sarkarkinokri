/**
 * search.js — FULL UNIVERSAL SEARCH & DROPDOWN ENGINE
 * SarkarKinokri - Updated for GitHub Pages & MeshRouter
 */

window.SearchLayer = {
    data: { index: [], links: [], portals: [] },
    isReady: false,

    // 1. PATH BUILDER (Commander/Path-Fix Compatible)
    build(p) {
        const BASE = window.Loader ? Loader.getBase() : './';
        if (!p || p === "#" || p.startsWith("http")) return p;
        const clean = p.startsWith('/') ? p.slice(1) : p;
        return BASE + clean;
    },

    // 2. DATA INITIALIZATION
    async init() {
        if (this.isReady) return;
        try {
            // Hum direct fetch kar rahe hain taaki Loader par dependence kam ho
            const [idxRes, lnkRes, prtRes] = await Promise.all([
                fetch(this.build('data/index.json')),
                fetch(this.build('data/importantlinks.json')),
                fetch(this.build('data/staticportals.json'))
            ]);

            const idx = await idxRes.json();
            this.data.index = idx.entries || [];
            this.data.links = await lnkRes.json();
            this.data.portals = await prtRes.json();
            
            this.isReady = true;
            console.log("🚀 Search Engine Fully Operational");
        } catch (e) {
            console.error("❌ Search Data Load Failed:", e);
        }
    },

    // 3. MATCHING LOGIC (With Typo Correction Support)
    getMatches(input) {
        const query = input.toLowerCase().trim();
        const squashed = query.replace(/[-\s]/g, ''); // "ssc cgl" -> "ssccgl"
        if (query.length < 2) return null;

        const res = { exams: [], resources: {}, portals: [] };

        // A. Match Notifications (index.json)
        const seenExams = new Set();
        this.data.index.forEach(e => {
            const mid = (e.master_id || "").toLowerCase();
            const label = (e.label || "").toLowerCase();
            if (mid.includes(query) || mid.replace(/-/g,'').includes(squashed) || label.includes(query)) {
                if (!seenExams.has(e.master_id) && e.type !== 'static') {
                    res.exams.push({ id: e.master_id, title: e.label || e.master_id.toUpperCase() });
                    seenExams.add(e.master_id);
                }
            }
        });

        // B. Match Important Links (importantlinks.json)
        this.data.links.forEach(catGroup => {
            const matches = catGroup.links.filter(l => 
                l.title.toLowerCase().includes(query) || 
                l.title.toLowerCase().replace(/[-\s]/g, '').includes(squashed)
            );
            if (matches.length) {
                res.resources[catGroup.category] = matches.slice(0, 5);
            }
        });

        // C. Match Static Portals (staticportals.json)
        res.portals = this.data.portals.filter(p => 
            p.name.toLowerCase().includes(query) || 
            (p.slug && p.slug.toLowerCase().includes(squashed))
        ).slice(0, 5);

        return res;
    },

    // 4. UI RENDERING
    render(results, box) {
        if (!results) { box.style.display = 'none'; return; }
        
        let html = "";

        // Exams/Notifications Section
        if (results.exams.length) {
            html += `<div class="s-cat">🎯 Latest Notifications</div>`;
            results.exams.forEach(e => {
                html += `<div class="s-item" onclick="MeshRouter.navigate('${e.id}')">
                            <strong>${e.title}</strong>
                         </div>`;
            });
        }

        // Quick Portals Section
        if (results.portals.length) {
            html += `<div class="s-cat">🌐 Quick Portals</div>`;
            results.portals.forEach(p => {
                html += `<div class="s-item" onclick="location.href='${this.build(p.url)}'">
                            ${p.icon || '🔗'} ${p.name}
                         </div>`;
            });
        }

        // Resources (Syllabus, Pattern, Admit Card etc.)
        for (const [category, links] of Object.entries(results.resources)) {
            html += `<div class="s-cat">📂 ${category}</div>`;
            links.forEach(l => {
                html += `<div class="s-item" onclick="location.href='${this.build(l.url)}'">
                            📄 ${l.title}
                         </div>`;
            });
        }

        box.innerHTML = html;
        box.style.display = html ? 'block' : 'none';
    }
};

// --- DOM BINDING & EVENT LISTENERS ---
const sInput = document.getElementById('hero-search-input');
const sBox = document.getElementById('search-dropdown-box');

if (sInput && sBox) {
    // Typing par data fetch aur filter
    sInput.addEventListener('input', async (e) => {
        if (!SearchLayer.isReady) await SearchLayer.init();
        const results = SearchLayer.getMatches(e.target.value);
        SearchLayer.render(results, sBox);
    });

    // Enter Key - First result ya Sitemap par bhejega
    sInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const firstItem = sBox.querySelector('.s-item');
            if (firstItem) {
                firstItem.click();
            } else {
                window.location.href = SearchLayer.build(`sitemap.html?q=${sInput.value}`);
            }
        }
    });

    // Dropdown ke bahar click karne par band karein
    document.addEventListener('click', (ev) => {
        if (!sInput.contains(ev.target) && !sBox.contains(ev.target)) {
            sBox.style.display = 'none';
        }
    });
}
