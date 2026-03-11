async function loadPortal(){
  try{
    console.log("Portal loading...");

    // INDEX
    const manifest = await fetch("./data/index.json").then(r=>r.json());

    /* ---------- EVENTS ---------- */
    const eventPaths = manifest.events.map(p=>"./data/"+p);
    const eventFiles = await Promise.allSettled(eventPaths.map(p=>fetch(p).then(r=>r.json())));
    let jobs=[];
    eventFiles.forEach(res=>{
      if(res.status==="fulfilled"){
        const file=res.value;
        if(file.data){
          Object.values(file.data).forEach(job=> jobs.push(job) );
        }
      }
    });

    /* ---------- JOBS DATA ---------- */
    const jobPaths = manifest.jobsdata.map(p=>"./data/"+p);
    const jobFiles = await Promise.allSettled(jobPaths.map(p=>fetch(p).then(r=>r.json())));
    let tableJobs=[];
    jobFiles.forEach(res=>{
      if(res.status==="fulfilled"){
        const file=res.value;
        if(file.data || file.jobs){
          // handle both types
          tableJobs.push(...(file.jobs || Object.values(file.data)));
        }
      }
    });

    /* ---------- IMPORTANT LINKS ---------- */
    const links = await fetch("./data/"+manifest.importantlinks).then(r=>r.json());

    /* ---------- STATIC PORTALS ---------- */
    const portals = await fetch("./data/"+manifest.staticportals).then(r=>r.json());

    /* ---------- DAILY POSTS ---------- */
    const dailyPostFile = await fetch("./data/dailyposts/01-01-2026-post.json").then(r=>r.json());

    populateLatestJobs(jobs);
    populateJobsTable(tableJobs);
    populateImportantLinks(links);
    populateStaticPortals(portals);
    populateDailyPosts(dailyPostFile);

  }catch(e){
    console.error("Portal error:",e);
  }
}

document.addEventListener("DOMContentLoaded",loadPortal);

/* ------------------ UI ------------------ */
function populateLatestJobs(jobs){
  const list=document.getElementById("latestjobs"); if(!list) return;
  list.innerHTML="";
  jobs.forEach(job=>{
    const li=document.createElement("li");
    li.innerHTML=`<a href="details.html?id=${job.id}">${job.master || job.title || 'Untitled Job'}</a>`;
    list.appendChild(li);
  });
}

function populateJobsTable(jobs){
  const table=document.getElementById("jobsdata"); if(!table) return;
  table.innerHTML="";
  jobs.forEach(job=>{
    const row=document.createElement("tr");
    row.innerHTML=`
      <td>${job.title || job.master || 'Untitled'}</td>
      <td><a href="${job.apply || '#'}">Apply</a></td>
      <td><a href="${job.admit || '#'}">Admit</a></td>
      <td><a href="${job.result || '#'}">Result</a></td>
    `;
    table.appendChild(row);
  });
}

function populateImportantLinks(links){
  const container=document.getElementById("importantlinks"); if(!container) return;
  container.innerHTML="";
  links.forEach(cat=>{
    if(cat.links && cat.links.length){
      cat.links.forEach(link=>{
        const a=document.createElement("a");
        a.href=link.url || '#';
        a.textContent = link.title || link.name || 'Untitled';
        container.appendChild(a);
      });
    }
  });
}

function populateStaticPortals(portals){
  const container=document.getElementById("staticportals"); if(!container) return;
  container.innerHTML="";
  portals.forEach(p=>{
    const a=document.createElement("a");
    a.href=p.url || '#';
    a.textContent=p.title || p.name || 'Untitled';
    container.appendChild(a);
  });
}

function populateDailyPosts(file){
  const container=document.getElementById("dailyposts"); if(!container) return;
  container.innerHTML="";
  if(file.data){
    Object.values(file.data).forEach(post=>{
      const a=document.createElement("a");
      a.href=post.url || '#';
      a.textContent = post.title || post.master || 'Untitled';
      container.appendChild(a);
    });
  }
}
