(async () => {
  const loaderEl = document.getElementById('loader');
  const mainEl = document.getElementById('main-content');

  if (!window.Loader) {
    loaderEl.innerHTML = `<p style="color:red;">Loader System Missing</p>`;
    return;
  }

  // 1. PATH FIX: 'data/index.json' (No leading slash)
  try { await Loader.init('data/index.json'); } catch (e) { return; }

  const params = new URLSearchParams(window.location.search);
  const masterId = params.get("id"); 
  if (!masterId) return;

  /* ===============================
     1. DATA FETCH & FALLBACK
  =============================== */
  let jobsData = await Loader.fetchByMaster(masterId, "jobsdata");
  let eventsData = await Loader.fetchByMaster(masterId, "events");
  let dailyPosts = (await Loader.fetchByMaster(masterId, "dailypost") || []).filter(p => p.master_id === masterId);

  // FIX: Loader already returns JSON objects. Extra parsing can break it.
  if (typeof jobsData === "string") { try { jobsData = JSON.parse(jobsData); } catch(e) { jobsData = null; } }
  if (typeof eventsData === "string") { try { eventsData = JSON.parse(eventsData); } catch(e) { eventsData = null; } }

  let core = eventsData || {};
  
  // LOGIC FIX: Check if jobsData exists and extract the correct entry
  if (jobsData) {
    // Agar jobsdata direct object hai ya array, use handle karne ka stable tarika
    let entry = jobsData;
    if (Array.isArray(jobsData)) {
        entry = jobsData.find(j => j.master_id === masterId) || jobsData[0];
    }
    core = { ...entry, ...core };
  }

  // Final validation
  if (!core.title && !core.job_title && !core.organization) {
    console.error("Data missing for ID:", masterId);
    loaderEl.innerHTML = `<p style="color:red; font-weight:bold;">No data found for: ${masterId}</p>`;
    return;
  }

  /* ===============================
     2. HEADER & META PILLS (Symmetry kept)
  =============================== */
  function renderHeader() {
    const title = core.title || core.job_title || "Recruitment Details";
    const org = core.organization || core.dept || "";
    const advt = core.advt_no || "";
    
    const div = document.createElement("div");
    div.className = "job-header";
    div.innerHTML = `
      <div style="font-size:12px; font-weight:bold; opacity:0.8; text-transform:uppercase; letter-spacing:1px;">${org}</div>
      <h1>${title}</h1>
      <div class="meta-pills">
        ${advt ? `<span class="pill" style="background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.3);">${advt}</span>` : ""}
        <span class="pill" style="background:#10b981; color:white;">VERIFIED</span>
        <span class="pill" style="background:#f59e0b; color:white;">LATEST</span>
      </div>`;
    mainEl.appendChild(div);
  }

  /* ===============================
     3. INFO GRID (Job Summary)
  =============================== */
  function renderInfoGrid() {
    const fields = [
      { label: "Organization", val: core.organization || core.dept },
      { label: "Post Name", val: core.post_name || core.job_title },
      { label: "Total Vacancy", val: core.total_vacancy || core.vacancies },
      { label: "Last Date", val: core.last_date || "As per Notification" },
      { label: "Location", val: core.job_location || "India" },
      { label: "Qualification", val: core.qualification || core.eligibility }
    ].filter(f => f.val);

    if (!fields.length) return;

    const sec = document.createElement("div");
    sec.className = "section-box";
    sec.innerHTML = `<div class="section-title"><i class="fas fa-info-circle"></i> Job Summary</div><div class="generic-grid"></div>`;
    const grid = sec.querySelector(".generic-grid");
    fields.forEach(f => {
      grid.innerHTML += `<div class="grid-card"><label>${f.label}</label><span>${f.val}</span></div>`;
    });
    mainEl.appendChild(sec);
  }

  /* ===============================
     4. IMPORTANT LINKS
  =============================== */
  function renderLinks() {
    if (!core.events || !core.events.length) return;

    const grouped = {};
    core.events.forEach(ev => {
      const p = ev.phase || "Official Links";
      if (!grouped[p]) grouped[p] = [];
      grouped[p].push(ev);
    });

    const sec = document.createElement("div");
    sec.className = "section-box";
    sec.innerHTML = `<div class="section-title"><i class="fas fa-link"></i> Important Links & Portals</div>`;
    const root = sec;

    Object.entries(grouped).forEach(([phase, items]) => {
      const g = document.createElement("div");
      g.style.marginBottom = "25px";
      g.innerHTML = `<div class="phase-label" style="font-size:12px; font-weight:bold; color:#64748b; margin-bottom:10px; text-transform:uppercase;">${phase}</div><div class="link-grid"></div>`;
      const grid = g.querySelector(".link-grid");
      
      items.forEach(ev => {
        const url = ev.official_event_url || ev.url;
        const active = ev.is_active && url;
        grid.innerHTML += `
          <div style="text-align:center">
            <div class="badge ${active ? 'active' : 'expired'}" style="margin-bottom:5px;">${ev.badge_text || (active ? 'LIVE' : 'CLOSED')}</div>
            <a href="${url || '#'}" class="btn ${active ? 'btn-active' : 'btn-inactive'}" ${url ? 'target="_blank"' : ''}>${ev.label}</a>
            ${ev.status_label ? `<small style="display:block; margin-top:5px; color:#2563eb; font-weight:bold;">${ev.status_label}</small>` : ''}
          </div>`;
      });
      root.appendChild(g);
    });
    mainEl.appendChild(sec);
  }

  function renderDailyPosts(posts) {
    const sec = document.createElement("div");
    sec.className = "section-box";
    sec.innerHTML = `<div class="section-title">📰 News & Updates</div>
      <ul style="list-style:none; padding:0;">${posts.map(p => `
        <li style="margin-bottom:15px; border-bottom:1px solid #f1f5f9; padding-bottom:10px;">
          <div style="font-size:12px; font-weight:bold; color:#6366f1;">${p.posted_date}</div>
          <div style="font-weight:600; color:#1e293b; margin:4px 0;">${p.title}</div>
          <div style="font-size:13px; color:#64748b;">${p.content}</div>
        </li>`).join("")}</ul>`;
    mainEl.appendChild(sec);
  }

  /* ===============================
     5. RENDER TRIGGER
  =============================== */
  loaderEl.style.display = 'none';
  mainEl.style.display = 'block';

  renderHeader();
  renderInfoGrid();
  renderLinks();
  if (dailyPosts.length) renderDailyPosts(dailyPosts);

})();
