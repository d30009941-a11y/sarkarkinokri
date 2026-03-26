document.addEventListener("DOMContentLoaded", async () => {
  console.log("=== ULTRA ENGINE START ===");

  try {
    // FIX: No leading slash
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
  const masterIds = Loader.getAllMasterIds();
  
  for (const mid of masterIds) {
    try {
      const eventsData = await Loader.fetchByMaster(mid, \"events\");
      if (eventsData && eventsData.events) {
        const jobsData = await Loader.fetchByMaster(mid, \"jobsdata\");
        let jobEntry = null;
        if (jobsData) {
          jobEntry = Array.isArray(jobsData) ? jobsData.find(j => j.master_id === mid) : (jobsData[mid] || Object.values(jobsData)[0]);
        }
        eventsData.events.forEach(ev => {
          allEvents.push({ ...ev, master_id: mid, parent_title: eventsData.title || jobEntry?.title || mid.replace(/-/g, ' ').toUpperCase() });
        });
      }
    } catch (err) {}
  }

  const now = new Date();
  const fifteenMonthsAgo = new Date();
  fifteenMonthsAgo.setMonth(now.getMonth() - 15);
  const activeByMaster = {};

  allEvents.forEach(ev => {
    const startDate = new Date(ev.start_date);
    if (isNaN(startDate)) return;
    if (!activeByMaster[ev.master_id]) activeByMaster[ev.master_id] = { latest: ev, active: null };
    if (startDate > new Date(activeByMaster[ev.master_id].latest.start_date)) activeByMaster[ev.master_id].latest = ev;
    if (ev.is_active && (!activeByMaster[ev.master_id].active || startDate > new Date(activeByMaster[ev.master_id].active.start_date))) activeByMaster[ev.master_id].active = ev;
  });

  Object.values(activeByMaster).forEach(pair => {
    if (new Date(pair.latest.start_date) >= fifteenMonthsAgo) renderLink(containers.jobs, pair.latest, true);
    if (pair.active) {
      const targetStack = pair.active.stage?.toLowerCase();
      if (containers[targetStack] && targetStack !== \"jobs\") renderLink(containers[targetStack], pair.active, false);
    }
  });

  function renderLink(container, ev, isAnchor) {
    if (!container) return;
    const li = document.createElement(\"li\");
    // FIX: relative link
    const url = `details.html?id=${ev.master_id}${isAnchor ? '' : '#' + (ev.stage || '')}`;
    const displayTitle = isAnchor ? ev.parent_title : `${ev.parent_title} - ${ev.label}`;
    li.innerHTML = `<a href=\"${url}\">${displayTitle}</a>`;
    container.appendChild(li);
  }

  async function safeFetch(path) {
    try {
      // FIX: Ensure relative fetch
      const cleanPath = path.startsWith('/') ? path.substring(1) : path;
      const r = await fetch(cleanPath);
      return r.ok ? await r.json() : null;
    } catch (e) { return null; }
  }

  const links = await safeFetch(\"data/importantlinks.json\");
  if (links) {
    const grid = document.getElementById(\"resource-grid\");
    if (grid) {
      links.forEach(cat => {
        const card = document.createElement(\"div\");
        card.className = \"resource-card\";
        card.innerHTML = `<h3>${cat.category}</h3><div class=\"resource-links\">${cat.links.map(l => `<a href=\"${l.url}\" target=\"_blank\" class=\"resource-btn\">${l.title}</a>`).join(\"\")}</div>`;
        grid.appendChild(card);
      });
    }
  }

  manageAds();
  // ... (Ad functions remain identical to your upload)
});
