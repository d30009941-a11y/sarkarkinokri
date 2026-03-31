/**
 * SarkarKinokri Railway Cluster Engine
 * Location: root/railways/js/main.js
 * Context: Dedicated logic for Railway (RRB) sub-directory
 */

document.addEventListener("DOMContentLoaded", function() {
    
    // 1. RAILWAY NAVIGATION ENGINE (11-Page Logic)
    const railwayNavigation = {
        init() {
            const navContainer = document.getElementById('main-nav');
            if (!navContainer) return;

            // Updated to reflect your 11-page structure
            const links = [
                { name: "Home", url: "index.html" },
                { name: "NTPC", url: "ntpc.html" },
                { name: "ALP", url: "alp.html" },
                { name: "Tech", url: "Technician.html" }, // Matches your filename
                { name: "Group D", url: "groupd.html" },
                { name: "JE", url: "je.html" },
                { name: "Syllabus", url: "syllabus.html" }, // Matches your spelling
                { name: "Medical", url: "medical.html" },
                { name: "Salary", url: "salary.html" },
                { name: "Analysis", url: "analysis.html" },
                { name: "Strategy", url: "blueprint.html" }
            ];

            const currentFile = window.location.pathname.split("/").pop() || "index.html";
            
            navContainer.innerHTML = links.map(link => {
                // Using #002d57 (Rail Blue) for branding
                const isActive = (currentFile.toLowerCase() === link.url.toLowerCase()) 
                    ? 'class="active-tab" style="background:#002d57; color:white; border-bottom:3px solid #ff6a00;"' 
                    : '';
                return `<a href="${link.url}" ${isActive}>${link.name}</a>`;
            }).join('');
        }
    };

    railwayNavigation.init();

    // 2. RAILWAY RETENTION POPUP (Mentorship Focus)
    const triggerRailwayPopup = () => {
        const popup = document.getElementById('popup-ad-container');
        if (!popup || sessionStorage.getItem('railway_v3_closed')) return;

        setTimeout(() => {
            popup.style.display = 'block';
            popup.innerHTML = `
                <div style="padding:25px; text-align:center; position:relative; background:#fff; border-radius:15px; border-top:5px solid #d32f2f; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                    <span id="close-rail-popup" style="position:absolute; top:10px; right:15px; cursor:pointer; font-size:24px; font-weight:bold; color:#888;">&times;</span>
                    <p style="font-size:11px; color:#d32f2f; font-weight:bold; text-transform:uppercase; letter-spacing:1px;">Mentor's Choice 2026</p>
                    <h3 style="margin:5px 0 10px 0; color:#333;">The A-1 Vision Checklist</h3>
                    <p style="font-size:14px; color:#666; margin-bottom:20px;">Don't apply for ALP until you check your eye-power against official standards.</p>
                    <a href="medical.html" style="display:block; background:#002d57; color:white; padding:12px; text-decoration:none; border-radius:8px; font-weight:bold; box-shadow: 0 4px 0 #001a33;">OPEN MEDICAL GUIDE</a>
                </div>
            `;

            document.getElementById('close-rail-popup').onclick = () => {
                popup.style.display = 'none';
                sessionStorage.setItem('railway_v3_closed', 'true');
            };
        }, 12000); // Trigger after 12 seconds for Railway (deeper reading time)
    };
    triggerRailwayPopup();

    // 3. AD-BOX OPTIMIZER
    const cleanEmptyAds = () => {
        const adBoxes = document.querySelectorAll('.ad-box');
        let attempts = 0;
        const checkInterval = setInterval(() => {
            adBoxes.forEach(box => {
                const ins = box.querySelector('ins');
                if (ins && ins.getAttribute('data-ad-status') === 'unfilled') {
                    box.style.opacity = '0.5'; // Soft hide during dev
                    if (attempts >= 5) box.style.display = 'none';
                }
            });
            if (++attempts > 5) clearInterval(checkInterval);
        }, 1500);
    };
    cleanEmptyAds();

    // 4. CROSS-CLUSTER NAVIGATOR (To Dynamic Details Page)
    window.openRailwayDetails = function(id) {
        // Points back to your dynamic landing page outside the cluster
        window.location.href = `../details.html?id=${id.toLowerCase().trim()}&ref=railway_cluster`;
    };
});
