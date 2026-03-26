const SarkarKinokri = {
    init() {
        this.buildNav();
        this.handleAds();
        this.triggerPopup();
    },
    buildNav() {
        const navContainer = document.getElementById('main-nav');
        if (!navContainer) return;
        const links = [
            { name: "Home", url: "index.html" },
            { name: "IBPS RRB", url: "ibpsrrb.html" },
            { name: "IBPS Bank", url: "ibpsbank.html" },
            { name: "Regulatory", url: "regulatory.html" },
            { name: "Insurance", url: "insurance.html" },
            { name: "Strategy", url: "banking-blueprint.html" }
        ];
        const currentFile = window.location.pathname.split("/").pop() || "index.html";
        navContainer.innerHTML = links.map(link => {
            const isActive = currentFile === link.url ? 'class="active-tab" style="background:#003366; color:white;"' : '';
            return `<a href="${link.url}" ${isActive}>${link.name}</a>`;
        }).join('');
    },
    handleAds() {
        // Logic to hide ad-boxes if they are empty
        document.querySelectorAll('.ad-box').forEach(box => {
            if (box.innerHTML.trim() === "" || box.children.length === 0) {
                box.style.display = 'none';
            }
        });
    },
    triggerPopup() {
        const popup = document.getElementById('popup-ad-container');
        const content = document.getElementById('ad-popup-slot');
        if (popup && content) {
            setTimeout(() => {
                // Only show if ad content exists or for critical alerts
                popup.style.display = 'block';
            }, 6000); // 6-second retention logic
        }
        document.getElementById('popup-close')?.addEventListener('click', () => {
            document.getElementById('popup-ad-container').style.display = 'none';
        });
    }
};
document.addEventListener("DOMContentLoaded", () => SarkarKinokri.init());
