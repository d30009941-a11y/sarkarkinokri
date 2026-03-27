/**
 * main.js — THE FINAL SELF-CLEANING POWER ENGINE
 */

document.addEventListener("DOMContentLoaded", async () => {
  console.log("=== ULTRA ENGINE START ===");

  try {
    await Loader.init("data/index.json");
  } catch (e) {
    console.error("Loader Init Failed", e);
    return;
  }

  const BASE = window.location.pathname.includes("sarkarkinokri") ? "/sarkarkinokri/" : "/";

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
      
      const liId = `li-${ev.master_id}-${labelStr.replace(/\s+/g, '')}`;
      return `<li id="${liId}">
                <a href="${BASE}details.html?id=${ev.master_id}">${baseName} - ${phaseStr}${labelStr}</a>
              </li>`;
    }).join("");

    data.forEach(async (ev) => {
      try {
        const jobsData = await Loader.fetchByMaster(ev.master_id, "jobsdata");
        if (jobsData) {
          const entry = Array.isArray(jobsData) ? jobsData.find(j => j.master_id === ev.master_id) : jobsData;
          const finalTitle = entry?.title || ev.file_title;
          
          if (finalTitle) {
            const labelStr = ev.label || ev.stage || "View Info";
            const phaseStr = ev.phase ? `${ev.phase}: ` : "";
            const liElement = document.getElementById(`li-${ev.master_id}-${labelStr.replace(/\s+/g, '')}`);
            if (liElement) {
              liElement.querySelector('a').innerText = `${finalTitle} - ${phaseStr}${labelStr}`;
            }
          }
        }
      } catch (err) {}
    });
  }

  render(containers.jobs, Array.from(latestJobs.values()));
  render(containers.result, buckets.result);
  render(containers.admit, buckets.admit);
  render(containers.answer, buckets.answer);
  render(containers.interview, buckets.interview);
  render(containers.dv, buckets.dv);

  async function safeFetch(p) {
    try {
      const r = await fetch(p.startsWith("http") ? p : BASE + p);
      return r.ok ? await r.json() : null;
    } catch(e) { return null; }
  }

  const portals = await safeFetch("data/staticportals.json");
  if (portals) {
    const listTop = document.getElementById("list-top");
    const gridAll = document.getElementById("all-portal-grid");
    const pCats = { police: document.getElementById("list-police"), teaching: document.getElementById("list-teaching"), state: document.getElementById("list-state") };
    
    const colors = ["#fef2f2","#fff7ed","#fffbeb","#ecfdf5","#eff6ff","#f5f3ff","#fdf2f8"];

    portals.forEach(p => {
      const url = p.url.startsWith("http") ? p.url : BASE + p.url.replace(/^\/+/, '');
      const anchor = `<a href="${url}" target="_blank">${p.icon} ${p.name}</a>`;

      if (p.priority === "top" && listTop) {
        listTop.innerHTML += `<div class="recruit-box"><a href="${url}" target="_blank" class="recruit-btn-main">${p.icon} ${p.name}</a></div>`;
      }
      if (pCats[p.category]) pCats[p.category].innerHTML += anchor;
      if (gridAll) {
        const bg = colors[Math.floor(Math.random()*colors.length)];
        gridAll.innerHTML += `<a href="${url}" target="_blank" class="portal-item2" style="background:${bg}">${p.icon} ${p.name}</a>`;
      }
    });
  }

  const links = await safeFetch("data/importantlinks.json");
  if (links) {
    const grid = document.getElementById("resource-grid");
    if (grid) {
      links.forEach(cat => {
        const card = document.createElement("div");
        card.className = "resource-card";
        card.innerHTML = `<h3>${cat.category}</h3><div class="resource-links">${cat.links.map(l => {
          const url = l.url.startsWith("http") ? l.url : BASE + l.url.replace(/^\/+/, '');
          return `<a href="${url}" target="_blank" class="resource-btn">${l.title}</a>`;
        }).join("")}</div>`;
        grid.appendChild(card);
      });
    }
  }

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
      a.addEventListener("click", () => {
        const p = document.getElementById("popup-ad");
        if(p) p.style.display="flex";
      });
    });
  }

  manageAds();

  // ✅ GLOBAL LINK SAFETY (final protection)
  document.addEventListener("click", function(e) {
    const a = e.target.closest("a");
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("#")) return;

    if (href.startsWith(BASE)) return;

    e.preventDefault();
    window.location.href = BASE + href.replace(/^\/+/, '');
  });

  console.log("=== ENGINE FULLY OPERATIONAL (300+ LINES) ===");
});