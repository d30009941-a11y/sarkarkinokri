(async () => {
  const loaderEl = document.getElementById('loader');
  const mainEl = document.getElementById('main-content');

  if (!window.Loader) {
    loaderEl.innerHTML = `<p style="color:red;">Loader System Missing</p>`;
    return;
  }

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

  if (typeof jobsData === "string") { try { jobsData = JSON.parse(jobsData); } catch(e) { jobsData = null; } }
  if (typeof eventsData === "string") { try { eventsData = JSON.parse(eventsData); } catch(e) { eventsData = null; } }

  let core = eventsData || {};
  if (jobsData) {
    let entry = Array.isArray(jobsData) ? jobsData.find(j => j.master_id === masterId) : (jobsData[masterId] || Object.values(jobsData)[0]);
    core = { ...entry, ...core };
  }

  if (!core.title) {
    const fb = eventsData?.events?.[0] || dailyPosts[0] || {};
    core.title = fb.label || fb.title || "Official Notification";
  }

  loaderEl.style.display = "none";
  mainEl.style.display = "block";
  mainEl.innerHTML = "";

  renderHeader(core);
  
  if (core.recruitment_summary) {
      const sum = document.createElement("div");
      sum.className = "section-box summary-box";
      sum.innerHTML = `<div class="section-title">📢 Summary</div><p>${core.recruitment_summary}</p>`;
      mainEl.appendChild(sum);
  }

  renderDynamic(core);

  if (dailyPosts.length) renderDailyPosts(dailyPosts);
  if (eventsData?.events) renderPhasedButtons(eventsData.events);

  function renderHeader(data) {
    const div = document.createElement("div");
    div.className = "job-header";
    const scope = (data.header_scope || ["Govt Job"]).map(s => `<span class="pill" style="background:rgba(255,255,255,0.2); color:white; border:1px solid rgba(255,255,255,0.3);">${s}</span>`).join("");
    div.innerHTML = `
      <div class="meta-pills">${scope}</div>
      <h1>${data.title || data.exam_name}</h1>
      <div class="meta-pills">
        <span class="pill" style="background:#fff; color:#1e3a8a;">${data.notice_type || "Notice"} ${data.notice_no || ""}</span>
        ${data.status ? `<span class="pill" style="background:#22c55e; color:#fff;">● ${data.status}</span>` : ""}
      </div>`;
    mainEl.appendChild(div);
  }

  function renderDynamic(data) {
    const skip = ["overview", "title", "slug", "master_id", "header_scope", "notice_type", "notice_no", "events", "links", "status", "recruitment_summary"];
    
    if (data.overview) renderGrid(data.overview, "📊 Quick Highlights");

    Object.entries(data).forEach(([key, value]) => {
      if (skip.includes(key) || !value) return;
      const title = key.replace(/_/g, ' ').toUpperCase();

      if (Array.isArray(value)) {
        if (typeof value[0] === 'string') {
          renderList(value, `📝 ${title}`);
        } else {
          renderTable(value, `📋 ${title}`);
        }
      } else if (typeof value === "object") {
        renderGrid(value, `⚙️ ${title}`);
      } else {
        const sec = document.createElement("div");
        sec.className = "section-box";
        sec.innerHTML = `<div class="section-title">${title}</div><div>${value}</div>`;
        mainEl.appendChild(sec);
      }
    });
  }

  function renderList(arr, title) {
    const sec = document.createElement("div");
    sec.className = "section-box";
    sec.innerHTML = `
      <div class="section-title">${title}</div>
      <ul class="clean-list">
        ${arr.map(item => `<li>${item}</li>`).join("")}
      </ul>`;
    mainEl.appendChild(sec);
  }

  function renderGrid(obj, title) {
    const sec = document.createElement("div");
    sec.className = "section-box";
    sec.innerHTML = `<div class="section-title">${title}</div><div class="generic-grid">
      ${Object.entries(obj).map(([k,v]) => {
        let val = typeof v === 'object' ? JSON.stringify(v) : v;
        return `<div class="grid-card"><label>${k.replace(/_/g,' ')}</label><span>${val}</span></div>`
      }).join("")}
    </div>`;
    mainEl.appendChild(sec);
  }

  function renderTable(data, title) {
    const raw = Array.isArray(data) ? data : (data.table || data.rows || []);
    if (!raw.length) return;
    const cols = [...new Set(raw.flatMap(row => Object.keys(row)))];
    
    const sec = document.createElement("div");
    sec.className = "section-box";
    sec.innerHTML = `<div class="section-title">${title}</div><div class="table-wrapper"><table>
      <thead><tr>${cols.map(c => `<th>${c.toUpperCase()}</th>`).join("")}</tr></thead>
      <tbody>
        ${raw.map(row => `<tr>${cols.map(c => {
          let cell = row[c] ?? "-";
          if (typeof cell === 'object' && cell !== null) {
            cell = `<div class="nested-cell-card">${Object.entries(cell).map(([nk, nv]) => `<div><b>${nk}:</b> ${nv}</div>`).join("")}</div>`;
          }
          return `<td>${cell}</td>`;
        }).join("")}</tr>`).join("")}
      </tbody>
    </table></div>`;
    mainEl.appendChild(sec);
  }

  function renderPhasedButtons(events) {
    const sec = document.createElement("div");
    sec.className = "section-box";
    sec.style.borderLeftColor = "#22c55e"; 
    sec.innerHTML = `<div class="section-title">🔗 Important Links</div><div id="btn-root"></div>`;
    const root = sec.querySelector("#btn-root");

    const grouped = events.reduce((acc, ev) => {
      const p = ev.phase || "Direct Links";
      if (!acc[p]) acc[p] = [];
      acc[p].push(ev);
      return acc;
    }, {});

    Object.entries(grouped).forEach(([phase, items]) => {
      const g = document.createElement("div");
      g.style.marginBottom = "20px";
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
        <li style="padding:10px; border-bottom:1px solid #f1f5f9;">
          <a href="${p.url}" target="_blank" style="font-weight:bold;">${p.title}</a>
          <div style="font-size:11px; color:#64748b;">${p.date}</div>
        </li>`).join("")}
      </ul>`;
    mainEl.appendChild(sec);
  }
})();