async function loadPortal(){

try{

console.log("Portal loading...");

const manifest = await fetch("./data/index.json").then(r=>r.json());

/* EVENTS */

const eventPaths = manifest.events.map(p=>"./data/"+p);

const eventFiles = await Promise.allSettled(
eventPaths.map(p=>fetch(p).then(r=>r.json()))
);

let jobs=[];

eventFiles.forEach(res=>{

if(res.status==="fulfilled"){

const file=res.value;

if(file.data){

Object.values(file.data).forEach(job=>{
jobs.push(job);
});

}

}

});


/* JOBSDATA */

const jobPaths = manifest.jobsdata.map(p=>"./data/"+p);

const jobFiles = await Promise.allSettled(
jobPaths.map(p=>fetch(p).then(r=>r.json()))
);

let tableJobs=[];

jobFiles.forEach(res=>{

if(res.status==="fulfilled"){

const file=res.value;

if(file.jobs){
tableJobs.push(...file.jobs);
}

}

});


/* IMPORTANT LINKS */

const links = await fetch("./data/"+manifest.importantlinks)
.then(r=>r.json());


/* STATIC PORTALS */

const portals = await fetch("./data/"+manifest.staticportals)
.then(r=>r.json());


populateLatestJobs(jobs);
populateJobsTable(tableJobs);
populateImportantLinks(links);
populateStaticPortals(portals);

}catch(e){

console.error("Portal error:",e);

}

}

document.addEventListener("DOMContentLoaded",loadPortal);


/* ---------- UI ---------- */

function populateLatestJobs(jobs){

const list=document.getElementById("latestjobs");

if(!list) return;

list.innerHTML="";

jobs.forEach(job=>{

const li=document.createElement("li");

li.innerHTML=`<a href="details.html?id=${job.id}">${job.master}</a>`;

list.appendChild(li);

});

}


function populateJobsTable(jobs){

const table=document.getElementById("jobsdata");

if(!table) return;

table.innerHTML="";

jobs.forEach(job=>{

const row=document.createElement("tr");

row.innerHTML=`
<td>${job.title}</td>
<td><a href="${job.apply}">Apply</a></td>
<td><a href="${job.admit}">Admit</a></td>
<td><a href="${job.result}">Result</a></td>
`;

table.appendChild(row);

});

}


function populateImportantLinks(links){

const list=document.getElementById("importantlinks");

if(!list) return;

list.innerHTML="";

links.forEach(link=>{

const title = link.title || link.name;

const li=document.createElement("li");

li.innerHTML=`<a href="${link.url}">${title}</a>`;

list.appendChild(li);

});

}


function populateStaticPortals(portals){

const list=document.getElementById("staticportals");

if(!list) return;

list.innerHTML="";

portals.forEach(portal=>{

const title = portal.title || portal.name;

const li=document.createElement("li");

li.innerHTML=`<a href="${portal.url}">${title}</a>`;

list.appendChild(li);

});

}
