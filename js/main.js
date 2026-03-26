/**
 * main.js — THE FINAL SELF-CLEANING POWER ENGINE
 * ---------------------------------------------------------
 * FIXED: Relative Pathing for GitHub Pages sub-directories.
 */

document.addEventListener("DOMContentLoaded", async () => {
  console.log("=== ULTRA ENGINE START ===");

  // 1. LOADER INITIALIZATION
  try {
    // FIX: Removed leading slash or ensured relative path
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
      const eventsData = await Loader.fetchByMaster(mid, "events");
      
      if (eventsData && eventsData.events) {
        const jobsData = await Loader.fetchByMaster(mid, "jobsdata");
        let jobEntry = null;
        if (jobsData) {
          jobEntry = Array.isArray(jobsData) 
            ? jobsData.find(j => j.master_id === mid) 
            : (jobsData[mid] || Object.values(jobsData)[0]);
        }

        eventsData.events.forEach(ev => {
          allEvents.push({
            ...ev,
            master_id: mid,
            parent_title: eventsData.title || jobEntry?.title || mid.replace(/-/g, ' ').toUpperCase(),
            // Logic preservation: using jobEntry for backup metadata
            job_meta: jobEntry 
          });
        });
      }
    } catch (err) {
      console.warn(`Skipping master_id: ${mid} due to error`, err);
    }
  }

  // ===============================
  // 3. CORE FILTERING LOGIC
  // ===============================
  const now = new Date();
  const fifteenMonthsAgo = new Date();
  fifteenMonthsAgo.setMonth(now.getMonth() - 15);

  const activeByMaster = {};

  allEvents.forEach(ev => {
    const startDate = new Date(ev.start_date);
    if (isNaN(startDate)) return;

    if (!activeByMaster[ev.master_id]) {
      activeByMaster[ev.master_id] = { latest: ev, active: null };
    }

    if (startDate > new Date(activeByMaster[ev.master_id].latest.start_date)) {
      activeByMaster[ev.master_id].latest = ev;
    }

    if (ev.is_active && (!activeByMaster[ev.master_id].active || startDate > new Date(activeByMaster[ev.master_id].active.start_date))) {
      activeByMaster[ev.master_id].active = ev;
    }
  });

  // ===============================
  // 4. RENDERING ENGINE
  // ===============================
  Object.values(activeByMaster).forEach(pair => {
    // A. Anchor in "Latest Jobs" (15 Month Rule)
    if (new Date(pair.latest.start_date) >= fifteenMonthsAgo) {
      renderLink(containers.jobs, pair.latest, true);
    }

    // B. Active Event in Specific Category
    if (pair.active) {
      const targetStack = pair.active.stage?.toLowerCase();
      if (containers[targetStack] && targetStack !== "jobs") {
        renderLink(containers[targetStack], pair.active, false);
      }
    }
  });

  function renderLink(container, ev, isAnchor) {
    if (!container) return;
    const li = document.createElement("li");
    // FIX: Path must be relative to the current folder (details.html instead of /details.html)
    const url = `details.html?id=${ev.master_id}${isAnchor ? '' : '#' + (ev.stage || '')}`;
    
    const displayTitle = isAnchor 
      ? ev.parent_title 
      : `${ev.parent_title} - ${ev.label}`;

    li.innerHTML = `<a href="${url}">${displayTitle}</a>`;
    container.appendChild(li);
  }

  // ===============================
  // 5. HELPER: SAFE FETCH
  // ===============================
  async function safeFetch(path) {
    try {
      // FIX: Ensure path is relative
      const cleanPath = path.startsWith('/') ? `.${path}` : `./${path}`;
      const r = await fetch(cleanPath);
      return r.ok ? await r.json() : null;
    } catch (e) { return null; }
  }

  // ===============================
  // 6. IMPORTANT LINKS
  // ===============================
  // FIX: Relative path for importantlinks
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
  // 7. ADVERTISEMENT SYSTEM (Intact)
  // ===============================
  manageAds();

  function manageAds() {
    document.querySelectorAll(".ad-box").forEach(b => { if(!b.innerHTML.trim()) b.style.display="none"; });

    if (!sessionStorage.getItem("mainAd")) {
      setTimeout(() => {
        const p = document.getElementById("popup-ad");
        if(p) { p.style.display="flex"; sessionStorage.setItem("mainAd", "t"); }
      }, 4000);
    }

    const c = document.getElementById("ad-close");
    if(c) c.onclick = () => document.getElementById("popup-ad").style.display="none";

    document.querySelectorAll(".list a").forEach(a => {
      a.addEventListener("click", (e) => {
        const p = document.getElementById("popup-ad");
        if(p && !sessionStorage.getItem("clickedAd")) {
           // Small logic check: optional popup behavior
        }
      });
    });
  }
});
