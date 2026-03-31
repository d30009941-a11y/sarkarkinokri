/**
 * main.js — THE FINAL SELF-CLEANING POWER ENGINE
 * ---------------------------------------------------------
 * FEATURES:
 * 1. 15-Month Anchor Logic
 * 2. Self-Cleaning Lifecycle
 * 3. Power-Naming
 * 4. Dual-Container Support
 * 5. Portals + Important Links + Ads
 */

document.addEventListener("DOMContentLoaded", async () => {
  console.log("=== ULTRA ENGINE START ===");

  // ===============================
  // UNIVERSAL PATH BUILDER (FIXED)
  // ===============================
  const BASE = window.Loader ? Loader.getBase() : '/';
  const build = (p) => {
    if (!p || p === "#" || p.startsWith("http")) return p;
    // Strip leading slash to ensure it appends to the subfolder base correctly
    const clean = p.startsWith('/') ? p.slice(1) : p;
    return BASE + clean;
  };

  // ===============================
  // SAFE FILTERS (NEW)
  // ===============================

  // UI display (allow placeholders)
  const isDisplayItem = (obj) => {
    if (!obj) return false;
    if (!obj.name && !obj.title) return false;
    return true;
  };

  // footer strict (internal only)
  const isFooterLink = (obj) => {
    if (!obj || !obj.url) return false;
    const u = obj.url.trim();
    if (!u) return false;
    if (u === "#") return false;
    if (u.startsWith("http")) return false;
    return true;
  };

  // ===============================
  // LOADER INIT (UNCHANGED LOGIC - FIXED PATH)
  // ===============================
  try {
    await Loader.init(build("data/index.json"));
  } catch (e) {
    console.error("Loader Init Failed", e);
    return;
  }

  const containers = {
    jobs: document.getElementById("list-jobs"),
    admit: document.getElementById("list-admit"),
    answer: document.getElementById("list-answer"),
    result: document.getElementById("list-result"),
    interview: document.getElementById("list-interview"),
    dv: document.getElementById("list-dv")
  };

  let allEvents = [];

  // ===============================
  // DATA AGGREGATION (UNCHANGED)
  // ===============================
  const masterIds = Loader.getAllMasterIds();
  
  for (const mid of masterIds) {
    try {
      const eventsData = await Loader.fetchByMaster(mid, "events");
      
      if (eventsData?.events) {
        allEvents.push(...eventsData.events.map(ev => ({
          ...ev,
          master_id: mid,
          file_title: eventsData.title || eventsData.exam_name || null,
          file_employer: eventsData.employer || eventsData.board || null
        })));
      }
    } catch (err) {
      console.warn(`Data skip for ${mid}:`, err);
    }
  }

  allEvents.sort((a, b) => new Date(b.start_date || 0) - new Date(a.start_date || 0));

  // ===============================
  // LIFECYCLE (UNCHANGED)
  // ===============================
  const today = new Date();
  const fifteenMonthsAgo = new Date();
  fifteenMonthsAgo.setMonth(today.getMonth() - 15);

  const buckets = { jobs: [], admit: [], answer: [], result: [], interview: [], dv: [] };
  const latestJobs = new Map();

  function isActive(ev) {
    if (!ev.start_date || !ev.end_date) return false;
    const s = new Date(ev.start_date);
    const e = new Date(ev.end_date);
    return s <= today && e >= today;
  }

  function normalize(stage) {
    if (!stage) return "jobs";
    const s = stage.toLowerCase();
    if (s.includes("admit")) return "admit";
    if (s.includes("answer")) return "answer";
    if (s.includes("result")) return "result";
    if (s.includes("interview")) return "interview";
    if (s.includes("dv")) return "dv";
    return "jobs";
  }

  allEvents.forEach(ev => {
    const eventDate = new Date(ev.start_date || 0);

    if (eventDate >= fifteenMonthsAgo) {
      if (!latestJobs.has(ev.master_id)) {
        latestJobs.set(ev.master_id, ev);
      }
    }

    if (isActive(ev)) {
      const bType = normalize(ev.stage);
      if (bType !== "jobs") {
        buckets[bType].push(ev);
      }
    }
  });

  // ===============================
  // RENDER (UNCHANGED LOGIC - FIXED PATH)
  // ===============================
  async function render(el, data) {
    if (!el) return;
    if (!data.length) {
      el.innerHTML = `<li style="padding:10px;color:#94a3b8;font-size:0.9em;">No Current Updates</li>`;
      return;
    }

    el.innerHTML = data.map(ev => {
      const idTitle = ev.master_id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const baseName = ev.file_title || idTitle;
      const phaseStr = ev.phase ? `<span style="color:#ef4444;font-weight:600;">${ev.phase}:</span> ` : "";
      const labelStr = ev.label || ev.stage || "View Info";
      
      return `<li>
                <a href="${build('details.html')}?id=${ev.master_id}">
                  ${baseName} - ${phaseStr}${labelStr}
                </a>
              </li>`;
    }).join("");
  }

  render(containers.jobs, Array.from(latestJobs.values()));
  render(containers.result, buckets.result);
  render(containers.admit, buckets.admit);
  render(containers.answer, buckets.answer);
  render(containers.interview, buckets.interview);
  render(containers.dv, buckets.dv);

  async function safeFetch(p) {
    try {
      // Use the universal build function
      const r = await fetch(build(p));
      return r.ok ? await r.json() : null;
    } catch(e) { return null; }
  }

// ===============================
// PORTALS (FULL CATEGORY SUPPORT)
// ===============================
const portals = await safeFetch("data/staticportals.json");

if (portals) {

  const listTop = document.getElementById("list-top");
  const gridAll = document.getElementById("all-portal-grid");

  // extended categories (NEW)
  const pCats = {
    rrb: document.getElementById("list-rrb"),
    ssc: document.getElementById("list-ssc"),
    ibps: document.getElementById("list-ibps"),
    sbi: document.getElementById("list-sbi"),
    police: document.getElementById("list-police"),
    teaching: document.getElementById("list-teaching"),
    state: document.getElementById("list-state")
  };

  const colors = ["#fef2f2","#fff7ed","#fffbeb","#ecfdf5","#eff6ff","#f5f3ff","#fdf2f8"];

  portals.filter(isDisplayItem).forEach(p => {

    // TOP PRIORITY (unchanged logic - fixed path)
    if (p.priority === "top" && listTop) {
      listTop.innerHTML += `
        <div class="recruit-box">
          <a href="${build(p.url)}" class="recruit-btn-main">
            ${p.icon || ""} ${p.name}
          </a>
        </div>`;
    }

    // CATEGORY DROPDOWNS (FIXED)
    if (p.category && pCats[p.category]) {
      pCats[p.category].innerHTML += `
        <a href="${build(p.url)}">
          ${p.icon || ""} ${p.name}
        </a>`;
    }

    // ALL PORTALS GRID (unchanged - fixed path)
    if (gridAll) {
      const bg = colors[Math.floor(Math.random()*colors.length)];
      gridAll.innerHTML += `
        <a href="${build(p.url)}" class="portal-item2" style="background:${bg}">
          ${p.icon || ""} ${p.name}
        </a>`;
    }

  });
}
  // ===============================
  // IMPORTANT LINKS (FIXED PATH)
  // ===============================
  const links = await safeFetch("data/importantlinks.json");

  if (links) {

    const grid = document.getElementById("resource-grid");

    if (grid) {
      links.forEach(cat => {

        const valid = (cat.links || []).filter(isDisplayItem);
        if (!valid.length) return;

        const card = document.createElement("div");
        card.className = "resource-card";

        card.innerHTML = `
          <h3>${cat.category}</h3>
          <div class="resource-links">
            ${valid.map(l => `
              <a href="${build(l.url)}" class="resource-btn">
                ${l.title}
              </a>
            `).join("")}
          </div>
        `;

        grid.appendChild(card);
      });
    }
  }

// ===============================
// GLOBAL FOOTER (RESOURCE STYLE + HOME SPACING)
// ===============================
const footer = document.createElement("footer");
footer.className = "site-footer";

let linksHTML = "";

const [importantLinks, footerPortals] = await Promise.all([
  safeFetch("data/importantlinks.json"),
  safeFetch("data/staticportals.json")
]);

const normalized = [];

/* importantlinks grouped */
if (importantLinks) {
  importantLinks.forEach(section => {
    (section.links || []).forEach(link => {
      normalized.push({
        name: link.title || link.name,
        url: link.url,
        category: section.category || "General"
      });
    });
  });
}

/* portals flat */
if (footerPortals) {
  footerPortals.forEach(p => {
    normalized.push({
      name: p.name || p.title,
      url: p.url,
      category: p.category || "Portals"
    });
  });
}

/* footer safe filter */
const filtered = normalized.filter(isFooterLink);

/* group */
const groups = {};
filtered.forEach(item => {
  if (!groups[item.category]) groups[item.category] = [];
  groups[item.category].push(item);
});

/* render */
Object.keys(groups).forEach(cat => {

  linksHTML += `
    <div class="footer-item">
      <h4>${cat}</h4>
      ${groups[cat].map(l =>
        `<a href="${build(l.url)}">${l.name}</a>`
      ).join("")}
    </div>
  `;

});

/* static site links */
linksHTML += `
  <div class="footer-item">
    <h4>Site</h4>
    <a href="${build('index.html')}">Home</a>
    <a href="${build('about.html')}">About</a>
    <a href="${build('contact.html')}">Contact</a>
    <a href="${build('disclaimer.html')}">Disclaimer</a>
  </div>
`;

footer.innerHTML = `
  <div class="footer-grid">
    ${linksHTML}
  </div>

  <div class="footer-disclaimer">
    © 2026 SarkarKinokri
  </div>
`;

document.body.appendChild(footer);

// ===============================
// ADVERTISEMENT MANAGEMENT (RESTORED)
// ===============================
function manageAds() {

  // hide empty placeholders
  document.querySelectorAll(".ad-box").forEach(b => {
    if(!b.innerHTML.trim()) b.style.display="none";
  });

  // popup show once per session
  if (!sessionStorage.getItem("mainAd")) {
    setTimeout(() => {
      const p = document.getElementById("popup-ad");
      if(p) {
        p.style.display="flex";
        sessionStorage.setItem("mainAd", "t");
      }
    }, 4000);
  }

  // close button
  const c = document.getElementById("ad-close");
  if(c) {
    c.onclick = () => {
      const p = document.getElementById("popup-ad");
      if(p) p.style.display="none";
    };
  }

  // click trigger
  document.querySelectorAll(".list a").forEach(a => {
    a.addEventListener("click", () => {
      const p = document.getElementById("popup-ad");
      if(p) p.style.display="flex";
    });
  });
}

manageAds();
  console.log("=== ENGINE FULLY OPERATIONAL ===");
});

/* =========================
   RECRUITMENT (DYNAMIC JSON)
========================= */

(function(){

const renderRecruitment = async () => {

    const container = document.getElementById("recruitment-grid");
    if (!container) return;

    // BASE AUTO DETECT (FIXED)
    const BASE = window.Loader ? Loader.getBase() : '/';
    const build = (p) => {
      if (!p || p === "#" || p.startsWith("http")) return p;
      const clean = p.startsWith('/') ? p.slice(1) : p;
      return BASE + clean;
    };

    try {

        const res = await fetch(build("data/staticportals.json"));
        const data = await res.json();

        if (!Array.isArray(data)) return;

        const grouped = {};

        data.forEach(item => {

            if (!item || !item.category || !item.url) return;

            const cat = item.category.toLowerCase();

            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(item);

        });

        let html = "";

        Object.keys(grouped).forEach(category => {

            const label =
                category.charAt(0).toUpperCase() +
                category.slice(1);

            html += `
                <div class="recruit-box">
                    <button class="recruit-btn-main dropdown-indicator">
                        ${label} ▼
                    </button>

                    <div class="dropdown-content">
                        ${grouped[category].map(item => `
                            <a href="${build(item.url)}">
                                ${item.name}
                            </a>
                        `).join("")}
                    </div>
                </div>
            `;

        });

        container.innerHTML = html;

    } catch (e) {
        console.warn("Recruitment load failed", e);
    }
};

// run after everything else
window.addEventListener("load", renderRecruitment);

})();
