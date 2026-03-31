/**
 * SarkarKinokri Master JS Engine v4.0
 * Features: Smart Navigation, Ad-Cleanup, & Retention Logic
 */

document.addEventListener("DOMContentLoaded", function() {
    
    // 1. DYNAMIC NAVIGATION ENGINE
    const initNavigation = () => {
        const navContainer = document.querySelector('.sticky-tabs');
        if (!navContainer) return;

        const currentFile = window.location.pathname.split("/").pop() || "index.html";
        const navLinks = navContainer.querySelectorAll('a');

        navLinks.forEach(link => {
            const linkFile = link.getAttribute('href');
            if (currentFile === linkFile) {
                link.style.background = "var(--strategy-emerald, #10b981)";
                link.style.color = "white";
                link.classList.add('active-tab');
            }
        });
    };


    // 2. SURGICAL AD-CLEANUP
    const adCleanup = () => {
        const adBoxes = document.querySelectorAll('.ad-box');
        
        setTimeout(() => {
            adBoxes.forEach(box => {
                const ins = box.querySelector('ins');
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
    const triggerRetentionPopup = () => {
        if (sessionStorage.getItem('sk_popup_closed')) return;

        setTimeout(() => {
            const popup = document.createElement('div');
            popup.className = 'popup-ad';
            popup.id = 'retention-box';
            popup.style.display = 'block';
            
            const base = document.baseURI || window.location.origin + "/";
            const build = (p)=> new URL(p, base).href;

            popup.innerHTML = `
                <div style="position:relative;">
                    <span id="close-sk-popup" style="position:absolute; top:-10px; right:0; cursor:pointer; font-size:20px;">&times;</span>
                    <h4 style="margin:0 0 10px 0; color:var(--sbi-blue);">🚀 Don't Miss Out!</h4>
                    <p style="font-size:13px; margin-bottom:15px;">Get our <strong>2026 SBI PO Question Bank PDF</strong></p>
                    <a href="${build('/sbi/sbipo.html')}" style="display:block; background:var(--primary-red); color:white; text-align:center; padding:10px; text-decoration:none; border-radius:5px; font-weight:bold; font-size:12px;">DOWNLOAD FREE PDF</a>
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
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (!header) return;
        if (window.scrollY > 50) {
            header.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
        } else {
            header.style.boxShadow = "none";
        }
    });


// 5. UNIVERSAL BACK + HOME BUTTON
const injectBackButton = () => {

    if(document.querySelector(".back-btn")) return;

    const base = document.baseURI || window.location.origin + "/";
    const build = (p)=> new URL(p, base).href;

    const header = document.querySelector(".header");
    if(!header) return;

    // HOME ICON
    const home = document.createElement("a");
    home.className = "home-icon";
    home.href = build("/index.html");
    home.innerHTML = "🏡";

    // BACK BUTTON
    const btn = document.createElement("a");
    btn.className = "back-btn";
    btn.href = build("/index.html");
    btn.innerHTML = "← Back to Home";

    header.appendChild(home);
    header.appendChild(btn);
};


// 6. UNIVERSAL CLUSTER CTA ENGINE (BASE-RELATIVE)
const injectClusterCTA = () => {

    const path = window.location.pathname;
    const file = path.split("/").pop().replace(".html","");
    const folder = path.split("/").slice(-2,-1)[0];

    const map = {
        "sbipo": "sbi-po",
        "sbiclerk": "sbi-clerk",
        "sbiso": "sbi-so"
    };

    let slug = map[file];

    // PATCH: allow folder index
    if(!slug && file === "index"){
        if(folder === "sbi") slug = "sbi-po";
    }

    if (!slug) return;

    const base = document.baseURI || window.location.origin + "/";
    const build = (path) => new URL(path, base).href;

    const cta = document.createElement("div");
    cta.className = "cluster-cta";

    cta.innerHTML = `
        <a class="cta-btn cta-strategy" href="${build('/sbi/blueprint.html')}">📘 Strategy</a>
        <a class="cta-btn cta-syllabus" href="${build('/resources/syllabus/' + slug + '.html')}">📚 Syllabus</a>
        <a class="cta-btn cta-ongoing" href="${build('/details.html?id=' + slug)}">🔥 Ongoing</a>
    `;

    const container = document.querySelector(".container");
    if (container) {
        container.insertBefore(cta, container.firstChild);
    }
};

// 7. GLOBAL FOOTER SITEMAP (INTERNAL ONLY)
const injectGlobalFooter = async () => {

    if(document.querySelector(".site-footer")) return;

    const base = document.baseURI || window.location.origin + "/";
    const build = (p)=> new URL(p, base).href;

    const footer = document.createElement("footer");
    footer.className = "site-footer";

    let linksHTML = "";
    let portalsHTML = "";

    // universal filter
    const isValidInternal = (item) => {
        if(!item) return false;
        if(!item.url) return false;
        if(item.url.startsWith("http")) return false;
        if(item.url === "#" || item.url === "/") return false;
        return true;
    };

    try {

        const [importantRes, portalsRes] = await Promise.all([
            fetch(build('/data/importantlinks.json')),
            fetch(build('/data/staticportals.json'))
        ]);

        const importantData = await importantRes.json();
        let portalsData = await portalsRes.json();

importantData.forEach(section => {

    if(!section.links) return;

    const internalLinks = section.links.filter(l => {
        if(!l || !l.url) return false;
        if(l.url.startsWith("http")) return false;
        if(l.url === "#" || l.url === "/") return false;

        // critical fix: skip fake header item
        const text = l.title || l.name || l.label;
        if(text && text.trim() === section.category.trim()) return false;

        return true;
    });

    if(internalLinks.length === 0) return;

    linksHTML += `
        <div class="footer-item">
            <h4>${section.category}</h4>
            ${internalLinks.map(l => 
                `<a href="${build(l.url)}">${l.title || l.name || l.label}</a><br>`
            ).join("")}
        </div>
    `;
});

        // normalize portals
        if(!Array.isArray(portalsData)){
            portalsData =
                portalsData.portals ||
                portalsData.data ||
                portalsData.links ||
                [];
        }

        // STATIC PORTALS
        portalsData
            .filter(isValidInternal)
            .forEach(item => {

                const text =
                    item.title ||
                    item.name ||
                    item.label ||
                    item.portal ||
                    "Portal";

                portalsHTML += `<a href="${build(item.url)}">${text}</a><br>`;
            });

        if(portalsHTML){
            linksHTML += `
                <div class="footer-item">
                    <h4>Portals</h4>
                    ${portalsHTML}
                </div>
            `;
        }

    } catch(e){
        console.warn("Footer links failed:", e);
    }

    footer.innerHTML = `
        <div class="footer-grid">
            ${linksHTML}

            <div class="footer-item">
                <h4>Site</h4>
                <a href="${build('/index.html')}">Home</a><br>
                <a href="${build('/about.html')}">About</a><br>
                <a href="${build('/contact.html')}">Contact</a><br>
                <a href="${build('/disclaimer.html')}">Disclaimer</a>
            </div>
        </div>

        <div class="footer-disclaimer">
            © 2026 SarkarKinokri
        </div>
    `;

    document.body.appendChild(footer);
};
    // EXECUTION
    initNavigation();
    adCleanup();
    triggerRetentionPopup();
    injectBackButton();
    injectClusterCTA();
    injectGlobalFooter();

});


/**
 * 8. ROUTER INTEGRATION
 */
window.MeshRouter = {
    navigate: function(destination) {
        console.log("Navigating to:", destination);
        window.location.href = destination + ".html";
    }
};