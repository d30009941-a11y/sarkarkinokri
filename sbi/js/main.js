/**
 * SarkarKinokri Master JS Engine v4.0
 * Features: Smart Navigation, Ad-Cleanup, & Retention Logic
 */

document.addEventListener("DOMContentLoaded", function() {
    
    // 1. DYNAMIC NAVIGATION ENGINE
    // Automatically handles the 'active' state for the sticky-tabs
    const initNavigation = () => {
        const navContainer = document.querySelector('.sticky-tabs');
        if (!navContainer) return;

        const currentFile = window.location.pathname.split("/").pop() || "index.html";
        const navLinks = navContainer.querySelectorAll('a');

        navLinks.forEach(link => {
            const linkFile = link.getAttribute('href');
            if (currentFile === linkFile) {
                // Apply 'Active' styles dynamically from CSS variables
                link.style.background = "var(--strategy-emerald, #10b981)";
                link.style.color = "white";
                link.classList.add('active-tab');
            }
        });
    };

    // 2. SURGICAL AD-CLEANUP
    // Hides .ad-box containers if they fail to load (to maintain clean UI)
    const adCleanup = () => {
        const adBoxes = document.querySelectorAll('.ad-box');
        
        // Wait 3 seconds to give Google Ads time to inject content
        setTimeout(() => {
            adBoxes.forEach(box => {
                const ins = box.querySelector('ins');
                // If 'ins' tag doesn't have a 'data-ad-status="filled"', hide the box
                if (ins && ins.getAttribute('data-ad-status') !== 'filled' && ins.offsetHeight < 10) {
                    box.style.opacity = '0';
                    setTimeout(() => box.style.display = 'none', 300);
                } else if (!ins || box.innerHTML.trim() === "") {
                    box.style.display = 'none';
                }
            });
        }, 3000);
    };

    // 3. RETENTION POPUP ENGINE
    // Triggers a helpful slide-in popup after 8 seconds for better conversion
    const triggerRetentionPopup = () => {
        // Only show if the user hasn't closed it this session
        if (sessionStorage.getItem('sk_popup_closed')) return;

        setTimeout(() => {
            const popup = document.createElement('div');
            popup.className = 'popup-ad';
            popup.id = 'retention-box';
            popup.style.display = 'block'; // Overriding the 'none' in your CSS
            
            popup.innerHTML = `
                <div style="position:relative;">
                    <span id="close-sk-popup" style="position:absolute; top:-10px; right:0; cursor:pointer; font-size:20px;">&times;</span>
                    <h4 style="margin:0 0 10px 0; color:var(--sbi-blue);">🚀 Don't Miss Out!</h4>
                    <p style="font-size:13px; margin-bottom:15px;">Get our <strong>2026 SBI PO Question Bank PDF</strong> (Free Clue Inside).</p>
                    <a href="sbipo.html" style="display:block; background:var(--primary-red); color:white; text-align:center; padding:10px; text-decoration:none; border-radius:5px; font-weight:bold; font-size:12px;">DOWNLOAD FREE PDF</a>
                </div>
            `;
            
            document.body.appendChild(popup);

            document.getElementById('close-sk-popup').onclick = () => {
                popup.style.transform = 'translateX(120%)';
                popup.style.transition = '0.5s ease-in';
                sessionStorage.setItem('sk_popup_closed', 'true');
                setTimeout(() => popup.remove(), 600);
            };
        }, 8000); 
    };

    // 4. PERFORMANCE SCROLL OBSERVER
    // Adds a subtle shadow to header on scroll
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
        } else {
            header.style.boxShadow = "none";
        }
    });

    // EXECUTION
    initNavigation();
    adCleanup();
    triggerRetentionPopup();
});

/**
 * 5. ROUTER INTEGRATION (Optional)
 * Helps with your 'MeshRouter' calls in the HTML
 */
window.MeshRouter = {
    navigate: function(destination) {
        console.log("Navigating to:", destination);
        // Add custom routing logic here if needed
        window.location.href = destination + ".html";
    }
};
