/* ==========================
   MAIN PORTAL JS
========================== */

async function loadPortal() {
    try {
        console.log("Portal loading...");

        // 1. Fetch index.json
        const manifest = await fetch("./data/index.json").then(r => r.json());

        // ==========================
        // EVENTS
        // ==========================
        const eventPaths = manifest.events.map(p => "./data/" + p);
        const eventFiles = await Promise.allSettled(eventPaths.map(p => fetch(p).then(r => r.json())));
        let events = [];

        eventFiles.forEach(res => {
            if (res.status === "fulfilled") {
                const file = res.value;
                if (file.data) {
                    Object.values(file.data).forEach(job => {
                        // Merge child events with parent for simplified handling
                        if (job.child_events) {
                            Object.values(job.child_events).forEach(ev => {
                                // fallback URL if missing
                                if (!ev.url && job.url) ev.url = job.url;
                                ev.master = job.master; // reference master
                                ev.jobId = job.id;
                                events.push(ev);
                            });
                        } else {
                            // Unknown type goes to latest jobs
                            ev = { ...job, type: job.type || "job", jobId: job.id, master: job.master };
                            events.push(ev);
                        }
                    });
                }
            }
        });

        // Sort by date (latest first)
        events.sort((a, b) => new Date(b.date || b.updated || b.opening_date || 0) - new Date(a.date || a.updated || a.opening_date || 0));

        // ==========================
        // JOBSDATA
        // ==========================
        const jobPaths = manifest.jobsdata.map(p => "./data/" + p);
        const jobFiles = await Promise.allSettled(jobPaths.map(p => fetch(p).then(r => r.json())));
        let tableJobs = [];

        jobFiles.forEach(res => {
            if (res.status === "fulfilled") {
                const file = res.value;
                if (file.data) {
                    Object.values(file.data).forEach(job => {
                        tableJobs.push(job);
                    });
                }
            }
        });

        // Sort jobs by latest opening_date
        tableJobs.sort((a, b) => new Date(b.opening_date || 0) - new Date(a.opening_date || 0));

        // ==========================
        // DAILY POSTS
        // ==========================
        const dailyPaths = await fetch("./data/dailyposts/index.json").then(r => r.json());
        const dailyFiles = await Promise.allSettled(dailyPaths.map(p => fetch("./data/dailyposts/" + p).then(r => r.json())));
        let dailyPosts = [];
        dailyFiles.forEach(res => {
            if (res.status === "fulfilled") {
                const post = res.value;
                dailyPosts.push(post);
            }
        });
        // Sort posts by post date (latest first)
        dailyPosts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

        // ==========================
        // IMPORTANT LINKS
        // ==========================
        const links = await fetch("./data/" + manifest.importantlinks).then(r => r.json());

        // ==========================
        // STATIC PORTALS
        // ==========================
        const portals = await fetch("./data/" + manifest.staticportals).then(r => r.json());

        // ==========================
        // POPULATE UI
        // ==========================
        populateLatestJobs(events);
        populateJobsTable(tableJobs);
        populateImportantLinks(links);
        populateStaticPortals(portals);
        populateDailyPosts(dailyPosts);

    } catch (e) {
        console.error("Portal error:", e);
    }
}

document.addEventListener("DOMContentLoaded", loadPortal);

/* ==========================
   UI FUNCTIONS
========================== */

function populateLatestJobs(events) {
    const list = document.getElementById("latestjobs");
    if (!list) return;
    list.innerHTML = "";

    events.forEach(job => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="details.html?id=${job.jobId || job.id}">${job.master || job.title || "Untitled"}</a>`;
        list.appendChild(li);
    });
}

function populateJobsTable(jobs) {
    const table = document.getElementById("jobsdata");
    if (!table) return;
    table.innerHTML = "";

    jobs.forEach(job => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${job.master || job.title || "Untitled Job"}</td>
            <td><a href="${job.apply || job.url || '#'}">Apply</a></td>
            <td><a href="${job.admit || job.url || '#'}">Admit</a></td>
            <td><a href="${job.result || job.url || '#'}">Result</a></td>
        `;
        table.appendChild(row);
    });
}

function populateImportantLinks(links) {
    const container = document.getElementById("importantlinks");
    if (!container) return;
    container.innerHTML = "";

    links.forEach(cat => {
        if (!cat.links) return;
        cat.links.forEach(link => {
            const li = document.createElement("li");
            li.innerHTML = `<a href="${link.url || '#'}">${link.title || link.name || "Untitled"}</a>`;
            container.appendChild(li);
        });
    });
}

function populateStaticPortals(portals) {
    const container = document.getElementById("staticportals");
    if (!container) return;
    container.innerHTML = "";

    portals.forEach(portal => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="${portal.url || '#'}">${portal.title || portal.name || "Untitled Portal"}</a>`;
        container.appendChild(li);
    });
}

// Horizontal scroll container for daily posts
function populateDailyPosts(posts) {
    const container = document.getElementById("dailyposts");
    if (!container) return;
    container.innerHTML = "";

    const scrollWrapper = document.createElement("div");
    scrollWrapper.style.display = "flex";
    scrollWrapper.style.overflowX = "auto";
    scrollWrapper.style.gap = "10px";
    scrollWrapper.style.padding = "10px";

    posts.forEach(post => {
        const card = document.createElement("div");
        card.style.minWidth = "250px";
        card.style.background = "#f1f5f9";
        card.style.border = "1px solid #cbd5e1";
        card.style.borderRadius = "6px";
        card.style.padding = "10px";
        card.style.flex = "0 0 auto";

        card.innerHTML = `
            <h4>${post.title || "Untitled Post"}</h4>
            <p>${post.description || ""}</p>
            <a href="${post.url || '#'}">Read More</a>
        `;
        scrollWrapper.appendChild(card);
    });

    container.appendChild(scrollWrapper);
}
