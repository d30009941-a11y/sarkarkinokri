async function loadPortal(){

try{

const res = await fetch("data/index.json");

const manifest = await res.json();



/* EVENTS */

const eventPaths = manifest.events.map(p=>"data/"+p);

const eventFiles = await Promise.allSettled(

eventPaths.map(url=>fetch(url).then(r=>r.json()))

);

const events = eventFiles

.filter(r=>r.status==="fulfilled")

.flatMap(r=>Array.isArray(r.value)?r.value:[r.value]);



/* JOBS */

const jobPaths = manifest.jobsdata.map(p=>"data/"+p);

const jobFiles = await Promise.allSettled(

jobPaths.map(url=>fetch(url).then(r=>r.json()))

);

const jobs = jobFiles

.filter(r=>r.status==="fulfilled")

.flatMap(r=>Array.isArray(r.value)?r.value:[r.value]);



/* IMPORTANT LINKS */

const linkRes = await fetch("data/"+manifest.importantlinks);

const links = await linkRes.json();



/* DAILY POSTS */

const daily = await loadDaily();



/* UI POPULATE */

populateJobs(jobs);

populateEvents(events);

populateLinks(links);

populateDaily(daily);



}catch(e){

console.error("Portal error",e);

}

}



/* DAILY LOADER */

async function loadDaily(){

try{

const today = new Date();

const dd = String(today.getDate()).padStart(2,'0');

const mm = String(today.getMonth()+1).padStart(2,'0');

const yyyy = today.getFullYear();

const file = `data/dailypost/${dd}-${mm}-${yyyy}-post.json`;

const r = await fetch(file);

if(!r.ok) return [];

return await r.json();

}catch{

return [];

}

}




function populateJobs(jobs){

const ul = document.getElementById("list-jobs");

if(!ul) return;

jobs.slice(0,20).forEach(job=>{

const li = document.createElement("li");

li.innerHTML =

`<a href="${job.url}" target="_blank">

${job.title || job.id}

</a>`;

ul.appendChild(li);

});

}




function populateEvents(events){

events.forEach(e=>{

if(e.type==="Admit Card") add("list-admit",e);

if(e.type==="Answer Key") add("list-answer",e);

if(e.type==="Result") add("list-result",e);

if(e.type==="Interview") add("list-interview",e);

if(e.type==="Document Verification") add("list-dv",e);

});

}



function populateLinks(data){

const grid=document.getElementById("resource-grid");

if(!grid) return;

data.forEach(cat=>{

const box=document.createElement("div");

box.className="resource-box";

box.innerHTML=`<h4>${cat.category}</h4>`;

cat.links.forEach(l=>{

const a=document.createElement("a");

a.href=l.url;

a.target="_blank";

a.textContent=l.title;

box.appendChild(a);

});

grid.appendChild(box);

});

}




function populateDaily(posts){

const ul=document.getElementById("list-daily");

if(!ul) return;

posts.forEach(p=>{

const li=document.createElement("li");

li.innerHTML=

`<a href="${p.url}" target="_blank">

${p.title || p.id}

</a>`;

ul.appendChild(li);

});

}




function add(id,data){

const ul=document.getElementById(id);

if(!ul) return;

const li=document.createElement("li");

li.innerHTML=

`<a href="${data.url}" target="_blank">

${data.title || data.id}

</a>`;

ul.appendChild(li);

}



document.addEventListener("DOMContentLoaded",loadPortal);