/**
 * SarkarKinokri SSC Cluster Engine
 * Location: root/ssc/js/main.js
 * Context: Dedicated logic for SSC sub-directory
 */

document.addEventListener("DOMContentLoaded", function() {
    
    // 1. SSC NAVIGATION ENGINE
    // This matches the "sscNavigation.init()" call in your HTML files
    const sscNavigation = {
        init() {
            const navContainer = document.getElementById('main-nav');
            if (!navContainer) return;

            const links = [
                { name: "Home", url: "index.html" },
                { name: "SSC CGL", url: "ssccgl.html" },
                { name: "SSC CHSL", url: "sscchsl.html" },
                { name: "SSC MTS", url: "sscmts.html" },
                { name: "SSC JE", url: "sscje.html" },
                { name: "Selection Posts", url: "sscselection.html" },
                { name: "Steno", url: "sscsteno.html" },
                { name: "Strategy", url: "blueprint.html" }
            ];

            // Get current filename to apply the "active-tab" CSS class
            const currentFile = window.location.pathname.split("/").pop() || "index.html";
            
            navContainer.innerHTML = links.map(link => {
                // Using #004a8f to match your SSC Brand Color
                const isActive = (currentFile === link.url) ? 'class="active-tab" style="background:#004a8f; color:white;"' : '';
                return `<a href="${link.url}" ${isActive}>${link.name}</a>`;
            }).join('');
        }
    };

    // Execute Nav
    sscNavigation.init();

    // 2. SSC POPUP AD LOGIC (8-Second Retention)
    const triggerSscPopup = () => {
        const popup = document.getElementById('popup-ad-container');
        const content = document.getElementById('popup-content');
        
        if (popup && content && !sessionStorage.getItem('ssc_v2_closed')) {
            setTimeout(() => {
                popup.style.display = 'block';
                content.innerHTML = `
                    <div style="padding:25px; text-align:center; position:relative; background:#fff; border-radius:15px;">
                        <span id="close-ssc-popup" style="position:absolute; top:10px; right:15px; cursor:pointer; font-size:24px; font-weight:bold; color:#888;">&times;</span>
                        <p style="font-size:12px; color:#004a8f; font-weight:bold; text-transform:uppercase; margin-bottom:10px;">Exclusive Study Material</p>
                        <h3 style="margin:0 0 10px 0; color:#333;">SSC 2026 GS Cheat-Sheet</h3>
                        <p style="font-size:14px; color:#666; margin-bottom:20px;">Download 500+ Most Repeated SSC Questions PDF.</p>
                        <a href="../details.html?id=ssc-gs-vault" style="display:block; background:#004a8f; color:white; padding:12px; text-decoration:none; border-radius:8px; font-weight:bold;">GET PDF CLUE</a>
                    </div>
                `;

                document.getElementById('close-ssc-popup').onclick = () => {
                    popup.style.display = 'none';
                    sessionStorage.setItem('ssc_v2_closed', 'true');
                };
            }, 8000); 
        }
    };
    triggerSscPopup();

    // 3. AD-BLOCKER CLEANUP
    // If Google Ads fail to load, this hides the empty white spaces
    const cleanEmptyAds = () => {
        const adBoxes = document.querySelectorAll('.ad-box');
        let attempts = 0;
        const checkInterval = setInterval(() => {
            adBoxes.forEach(box => {
                const ins = box.querySelector('ins');
                if (ins && ins.getAttribute('data-ad-status') === 'unfilled' && attempts >= 5) {
                    box.style.display = 'none';
                }
            });
            if (++attempts > 5) clearInterval(checkInterval);
        }, 1000);
    };
    cleanEmptyAds();

    // 4. NAVIGATION TO ROOT
    // Function to go from /ssc/ folder back to main root /details.html
    window.promiseSscNavigator = function(id) {
        window.location.href = `../details.html?id=${id.toLowerCase().trim()}`;
    };
});
