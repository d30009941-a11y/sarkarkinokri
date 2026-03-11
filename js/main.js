async function loadPortal() {
  try {
    console.log("Portal loading...");

    const manifest = await fetch("./data/index.json").then(r => r.json());

    /* ---------- EVENTS ---------- */
    const eventPaths = manifest.events.map(p => "./data/" + p);
    const eventFiles = await Promise.allSettled(
      eventPaths.map(p => fetch(p).then(r => r.json()))
    );

    let events = [];
    eventFiles.forEach(res => {
      if (res.status === "fulfilled") {
        const file = res.value;
        if (file.data) {
          Object.values(file.data).forEach(job => events.push(job));
        }
      }
    });

    /* ---------- JOBSDATA ---------- */
    const jobPaths = manifest.jobsdata.map(p => "./data/" + p);
    const jobFiles = await Promise.allSettled(
      jobPaths.map(p => fetch(p).then(r => r.json()))
    );

    let jobsData = [];
    jobFiles.forEach(res => {
      if (res.status === "fulfilled") {
        const file = res.value;
        if (file.data) jobsData.push(...Object.values(file.data));
      }
    });

    /* ---------- DAILY POSTS ---------- */
    const dailyPosts = await fetch("./data/dailyposts/index.json")
      .then(r => r.json())
      .then(arr => arr.map(p => "./data/dailyposts/" + p));

    const dailyFiles = await Promise.allSettled(
      dailyPosts.map(p => fetch(p).then(r => r.json()))
    );

    let dailyData = [];
    dailyFiles.forEach(res => {
      if (res.status === "fulfilled") {
        const file = res.value;
        if (file.data) dailyData.push(...Object.values(file.data));
      }
    });

    /* ---------- IMPORTANT LINKS ---------- */
    const links = await fetch("./data/" + manifest.importantlinks).then(r => r.json());

    /* ---------- STATIC PORTALS ---------- */
    const portals = await fetch("./data/" + manifest.staticportals).then(r => r.json());

    /* ---------- SORTING BY LAST UPDATED ---------- */
    function sortByDate(arr) {
      return arr.sort((a, b) => {
        const dateA = a.date || a.closing_date || a.opening_date || "";
        const dateB = b.date || b.closing_date || b.opening_date || "";
        return new Date(dateB) - new Date(dateA);
      });
    }

    events = sortByDate(events);
    jobsData = sortByDate(jobsData);
    dailyData = sortByDate(dailyData);

    /* ---------- POPULATE CONTAINERS ---------- */
    populateLatestJobs(events.concat(jobsData));
    populateJobsTable(jobsData);
    populateDailyPosts(dailyData);
    populateImportantLinks(links);
    populateStaticPortals(portals);

  } catch (e) {
    console.error("Portal error:", e);
  }
}

document.addEventListener("DOMContentLoaded", loadPortal);

/* ===========================
   UI POPULATION FUNCTIONS
=========================== */

function populateLatestJobs(jobs) {
  const list = document.getElementById("latestjobs");
  if (!list) return;
  list.innerHTML = "";

  jobs.forEach(job => {
    const li = document.createElement("li");
    const url = job.url || (job.child_events ? Object.values(job.child_events)[0].url : "#");
    li.innerHTML = `<a href="details.html?id=${job.id || ''}" target="_blank">${job.master || job.title || 'Latest Job'}</a>`;
    list.appendChild(li);
  });
}

function populateJobsTable(jobs) {
  const table = document.getElementById("jobsdata");
  if (!table) return;
  table.innerHTML = "";

  jobs.forEach(job => {
    const row = document.createElement("tr");
    const applyUrl = job.url || "#";
    row.innerHTML = `
      <td>${job.master || job.title || 'Job Title'}</td>
      <td><a href="${applyUrl}">Apply</a></td>
      <td><a href="${applyUrl}">Admit</a></td>
      <td><a href="${applyUrl}">Result</a></td>
    `;
    table.appendChild(row);
  });
}

function populateDailyPosts(posts) {
  const container = document.getElementById("dailyposts");
  if (!container) return;
  container.innerHTML = "";
  container.style.display = "flex";
  container.style.overflowX = "auto";
  container.style.gap = "12px";

  posts.forEach(post => {
    const div = document.createElement("div");
    div.style.minWidth = "220px";
    div.style.background = "#f1f5f9";
    div.style.padding = "12px";
    div.style.borderRadius = "6px";
    div.style.border = "1px solid #cbd5e1";
    const url = post.url || "#";
    div.innerHTML = `<a href="${url}" target="_blank">${post.master || post.title || 'Daily Post'}</a>`;
    container.appendChild(div);
  });
}

function populateImportantLinks(links) {
  const list = document.getElementById("importantlinks");
  if (!list) return;
  list.innerHTML = "";

  links.forEach(linkGroup => {
    linkGroup.links.forEach(link => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${link.url}" target="_blank">${link.title || link.name}</a>`;
      list.appendChild(li);
    });
  });
}

function populateStaticPortals(portals) {
  const list = document.getElementById("staticportals");
  if (!list) return;
  list.innerHTML = "";

  portals.forEach(portal => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${portal.url}" target="_blank">${portal.title || portal.name}</a>`;
    list.appendChild(li);
  });
}
