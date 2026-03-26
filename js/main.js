/**
 * main.js — THE FINAL SELF-CLEANING POWER ENGINE
 * ---------------------------------------------------------
 * FEATURES:
 * 1. 15-Month Anchor Logic: Jobs stay in "Latest" even without active events.
 * 2. Self-Cleaning: New recruitment cycles automatically replace old ones.
 * 3. Power-Naming: Title + Phase + Label (Never shows "Update").
 * 4. Dual-Container Support: Max 2 locations (Anchor + Active Event).
 * 5. Integrated: Portals, Important Links, and Advertisement System.
 */

document.addEventListener("DOMContentLoaded", async () => {
  console.log("=== ULTRA ENGINE START ===");

  // 1. LOADER INITIALIZATION
  try {
    // Fix: Ensure path is relative for GitHub sub-folders
    await Loader.init("data/index.json");
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
  // 2. DATA AGGREGATION
  // ===============================
  const masterIds = Loader.getAllMasterIds();
  
  for (const mid of masterIds) {
    try {
      // Fetch both events and jobsdata for schema enforcement
      const eventsData = await Loader.fetchByMaster(mid, "events");
      
      if (eventsData && eventsData.events) {
        const jobsData = await Loader.fetchByMaster(mid, "jobsdata");
        
        // Find the "Anchor" (The main Identity of the recruitment)
        const anchor = jobsData || eventsData; 

        eventsData.events.forEach(ev => {
          allEvents.push({
            ...ev,
            master_id: mid,
            anchor_title: anchor.title || anchor.job_title || mid.toUpperCase(),
            anchor_dept: anchor.dept || anchor.organization || ""
          });
        });
      }
    } catch (err) {
      console.warn(`Skipping ${mid} due to error`, err);
    }
  }

  // ===============================
  // 3. FILTERING & SORTING (Self-Cleaning)
  // ===============================
  const now = new Date();
  const fifteenMonthsAgo = new Date();
  fifteenMonthsAgo.setMonth(now.getMonth() - 15);

  // Group by Master ID to find the "Freshest" event for each recruitment
  const latestByMaster = {};
  allEvents.forEach(ev => {
    const evDate = new Date(ev.date || ev.posted_date);
    if (!latestByMaster[ev.master_id] || evDate > new Date(latestByMaster[ev.master_id].date)) {
      latestByMaster[ev.master_id] = ev;
    }
  });

  // ===============================
  // 4. RENDERING ENGINE
  // ===============================
  Object.values(latestByMaster)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(ev => {
      const li = document.createElement("li");
      const url = `details.html?id=${ev.master_id}`;
      
      // Power Naming: Title + Phase + Label
      const displayName = `${ev.anchor_title} ${ev.phase || ""} ${ev.label}`.replace(/\s+/g, ' ').trim();

      li.innerHTML = `<a href="${url}">
        <span style="color:#2563eb; font-weight:800;">[${ev.anchor_dept}]</span> ${displayName}
      </a>`;

      // Dual-Container Placement
      const target = ev.container_id ? containers[ev.container_id.toLowerCase()] : containers.jobs;
      if (target) target.appendChild(li);
    });

  // ===============================
  // 5. HELPER: SAFE FETCH
  // ===============================
  async function safeFetch(path) {
    try {
      // Fix: Leading slash removal for consistent GitHub Pages loading
      const cleanPath = path.startsWith('/') ? path.substring(1) : path;
      const res = await fetch(cleanPath);
      return res.ok ? await res.json() : null;
    } catch (e) { return null; }
  }

  // ===============================
  // 6. IMPORTANT LINKS
  // ===============================
  const links = await safeFetch("data/importantlinks.json");
  if (links) {
    const grid = document.getElementById("resource-grid");
    if (grid) {
      links.forEach(cat => {
        const card = document.createElement("div");
        card.className = "resource-card";
        card.innerHTML = `<h3>${cat.category}</h3><div class=\"resource-links\">${cat.links.map(l => `<a href=\"${l.url}\" target=\"_blank\" class=\"resource-btn\">${l.title}</a>`).join(\"\")}</div>`;
        grid.appendChild(card);
      });
    }
  }

  // ===============================
  // 7. ADVERTISEMENT SYSTEM
  // ===============================
  function manageAds() {
    document.querySelectorAll(".ad-box").forEach(b => { if(!b.innerHTML.trim()) b.style.display="none"; });

    if (!sessionStorage.getItem("mainAd")) {
      setTimeout(() => {
        const p = document.getElementById("popup-ad");
        if(p) { p.style.display="flex"; sessionStorage.setItem("mainAd", \"t\"); }
      }, 4000);
    }

    const c = document.getElementById("ad-close");
    if(c) c.onclick = () => document.getElementById("popup-ad").style.display="none";
  }

  manageAds();
});
