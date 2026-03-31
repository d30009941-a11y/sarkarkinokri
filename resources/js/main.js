/* ===== UNIVERSAL ID DETECTION (STATIC + DYNAMIC) ===== */

const params = new URLSearchParams(window.location.search);

const examId =
params.get("exam") ||          // /detail.html?exam=rrb-je
params.get("id") ||            // /detail.html?id=rrb-je
document.body?.dataset?.exam;  // static page <body data-exam="rrb-je">

// if still no id, do nothing (prevents breaking static HTML)
if (!examId) {
  console.warn("No exam ID detected — static mode");
}
/*
SARKARKINOKRI SYLLABUS ENGINE
FINAL PRODUCTION VERSION
STATIC + ROUTER + DETAILS HANDSHAKE
*/

const SyllabusEngine = {

config:{},
data:null,
root:null,

async init(config){

this.config=config;
this.root=document.getElementById("syllabus-root");

if(!this.root){
console.error("Syllabus root not found");
return;
}

console.log("Syllabus root detected");

this.loader();

try{

const res=await fetch(`./data/${config.masterId}.json`);

if(!res.ok) throw new Error("JSON not found");

this.data=await res.json();

this.render();

this.applySEO();

this.cleanupAds();

this.popup();

}catch(e){

console.error("Syllabus Engine Error:",e);
this.error();

}

},

loader(){
this.root.innerHTML=`<div class="loader-box">Loading syllabus...</div>`;
},
async render(){

this.root.innerHTML = `

${this.header()}

<div class="ad-box ad-top"></div>

${this.redirectButtons()}

${this.examPhases()}

${this.subjects()}

${this.mentorship()}

${this.trend()}

${this.deepRender(this.data)}

${this.faq()}

<div class="ad-box ad-bottom"></div>

`;

this.root.innerHTML += await this.footer();

this.stickyFooterAd();

},

/* ===============================
   ROOT
=============================== */
deepRender(data){

let html="";

Object.entries(data).forEach(([key,val])=>{

if([
"exam_name",
"year",
"redirect_buttons",
"master_id",
"category_name",
"frequently_asked_questions"
].includes(key)) return;

html+=`
<section class="mentor-section">
${this.renderSection(key,val)}
</section>
`;

});

return html;

},

/* ===============================
   SECTION
=============================== */
renderSection(title,data){

return `
<div class="table-container">
<div class="table-header">
<span>${this.formatKey(title)}</span>
</div>
${this.renderAny(data)}
</div>
`;

},

/* ===============================
   UNIVERSAL
=============================== */
renderAny(data){

if(Array.isArray(data))
return this.renderArray(data);

if(typeof data==="object")
return this.renderObject(data);

return `<div class="mentor-box">${data}</div>`;

},

/* ===============================
   ARRAY
=============================== */
renderArray(arr){

// array of strings
if(arr.every(x=>typeof x==="string")){
return `
<div class="mentor-box">
<ul>
${arr.map(i=>`<li>${i}</li>`).join("")}
</ul>
</div>
`;
}

// array of objects
return arr.map(item=>`
<div class="mentor-box">
${this.renderAny(item)}
</div>
`).join("");

},

/* ===============================
   OBJECT
=============================== */
renderObject(obj){

return `
<table class="syllabus-table">

<tbody>

${Object.entries(obj).map(([k,v])=>`

<tr>
<td><strong>${this.formatKey(k)}</strong></td>
<td>${this.renderCell(v)}</td>
</tr>

`).join("")}

</tbody>

</table>
`;

},

/* ===============================
   CELL
=============================== */
renderCell(val){

if(Array.isArray(val))
return this.renderArray(val);

if(typeof val==="object")
return this.renderObject(val);

return val;

},

/* ===============================
   FORMAT KEY
=============================== */
formatKey(txt){

return txt
.replace(/_/g," ")
.replace(/\b\w/g,l=>l.toUpperCase());

},
header(){

const d=this.data;

return `
<div class="syllabus-header">

<div class="nav-top">
<a href="../index.html" class="nav-btn back-btn">← Back</a>
<a href="/" class="nav-btn home-btn">🏠 Home</a>
</div>

<h1>${d.exam_name} ${d.year}</h1>
<p>${d.cen_number || ""}</p>

</div>
`;
},

redirectButtons(){

const d=this.data;

/* SAFE FALLBACKS (no breaking old JSON) */
const hubLabel = d.redirect_buttons?.hub_label || "Railway Hub";
const hubUrl   = d.redirect_buttons?.hub_url   || "/railways/index.html";

return `
<div class="logic-card">

<div>
<strong>Official Recruitment Details</strong>
<p>Check eligibility, vacancy and apply links</p>
</div>

<div class="logic-btn-group">

<a href="${hubUrl}"
class="logic-btn btn-static">
${hubLabel}
</a>

<a href="/details.html?slug=${d.master_id}"
class="logic-btn btn-dynamic">
ONGOING RECRUITMENT
</a>

</div>

</div>
`;
},

examPhases(){

const phases=this.data.exam_phases||[];

if(!phases.length) return "";

return `
<section class="selection-grid">
${phases.map(p=>`
<div class="step-card">
<h3>${p.phase}</h3>
<p>${p.duration}</p>
<p>${p.total_qs} Questions</p>
<p>Negative: ${p.negative}</p>
</div>
`).join("")}
</section>
`;
},

trend(){

const t=this.data.five_year_trend||[];

if(!t.length) return "";

return `
<div class="table-container">
<div class="table-header">
<span>5 Year Trend</span>
</div>

<table class="syllabus-table">
<thead>
<tr>
<th>Year</th>
<th>Cutoff</th>
<th>Difficulty</th>
<th>Key Shift</th>
</tr>
</thead>

<tbody>
${t.map(r=>`
<tr>
<td>${r.year}</td>
<td>${r.cutoff_avg}</td>
<td>${r.difficulty}</td>
<td>${r.key_shift}</td>
</tr>
`).join("")}
</tbody>
</table>

</div>
`;
},

subjects(){

const subs=this.data.subjects||[];

return subs.map((sub,i)=>`

<div class="table-container">

<div class="table-header">
<span>${sub.name}</span>
<span class="count-tag">${sub.total_qs}</span>
</div>

<div style="padding:15px;background:#f8fafc">
${sub.analysis || ""}
</div>

<table class="syllabus-table">

<thead>
<tr>
<th>Topic</th>
<th>Weight</th>
<th>Priority</th>
<th>Sub Topics</th>
</tr>
</thead>

<tbody>

${sub.topics.map(t=>`
<tr>
<td>${t.name}</td>
<td>${t.weight}</td>
<td class="prio-${t.priority.toLowerCase()}">
${t.priority}
</td>
<td>${t.sub_topics || ""}</td>
</tr>
`).join("")}

</tbody>

</table>

</div>

${(i+1)%2===0 ? `<div class="ad-box ad-inline-subject"></div>` : ""}

`).join("");

},

mentorship(){

const m=this.data.mentorship_data||[];

if(!m.length) return "";

return `
<section class="mentor-section">

<h2 class="section-title">
Mentor Strategy
</h2>

${m.map(x=>`
<div class="mentor-box">
<h3>${x.title}</h3>
<p>${x.content}</p>
<div class="stat-box">
${x.stat_box || ""}
</div>
</div>
`).join("")}

</section>
`;
},

faq(){

const f=this.data.frequently_asked_questions||[];

if(!f.length) return "";

return `
<section class="mentor-section">

<h2 class="section-title">
Frequently Asked Questions
</h2>

${f.map(q=>`
<div class="mentor-box">
<h3>${q.q}</h3>
<p>${q.a}</p>
</div>
`).join("")}

</section>
`;
},
async footer(){

try{

const [mapRes, portalRes] = await Promise.all([
fetch("/data/importantlinks.json"),
fetch("/data/staticportals.json")
]);

const sitemap = await mapRes.json();
const portals = await portalRes.json();

/* normalize both json structures */
const normalized = [];

/* importantlinks.json (grouped) */
sitemap.forEach(section=>{
(section.links || []).forEach(link=>{
normalized.push({
name: link.title || link.name,
url: link.url,
category: section.category || "General",
icon: ""
});
});
});

/* staticportals.json (flat) */
portals.forEach(item=>{
normalized.push({
name: item.name || item.title,
url: item.url,
category: item.category || "General",
icon: item.icon || ""
});
});
/* keep only internal html pages */
const filtered = normalized.filter(item =>
item.url &&
item.url.endsWith(".html") &&
!item.url.startsWith("http")
);
const groups = {};

filtered.forEach(item=>{
if(!groups[item.category]) groups[item.category]=[];
groups[item.category].push(item);
});

let html = `<footer class="site-footer">
<div class="footer-grid">`;

Object.keys(groups).forEach(cat=>{

html+=`
<div class="footer-col">
<h4>${this.formatKey(cat)}</h4>
`;

groups[cat].forEach(link=>{
html+=`
<a href="${link.url}">
${link.icon || ""} ${link.name}
</a>
`;
});

html+=`</div>`;

});

html+=`
</div>

<div class="footer-bottom">
© 2026 SarkariNokriEngine • All Rights Reserved
</div>

<div id="sticky-footer-ad"></div>

</footer>
`;

return html;

}catch(e){

return `
<footer class="site-footer">
<div class="footer-bottom">
© 2026 SarkariNokriEngine
</div>
</footer>
`;

}

},
stickyFooterAd(){

const sticky=document.getElementById("sticky-footer-ad");

if(!sticky) return;

sticky.innerHTML=`
<div class="sticky-ad">
Advertisement
</div>
`;

},

applySEO(){

const d=this.data;

document.title =
`${d.exam_name} Syllabus ${d.year}`;

let meta =
document.querySelector('meta[name="description"]');

if(!meta){

meta=document.createElement("meta");
meta.name="description";
document.head.appendChild(meta);

}

meta.content =
`${d.exam_name} syllabus with topic weightage and preparation strategy.`;

},

cleanupAds(){

setTimeout(()=>{

document.querySelectorAll(".ad-box")
.forEach(box=>{

if(box.innerHTML.trim()==="")
box.style.display="none";

});

},2000);

},

popup(){

setTimeout(()=>{

const popup=
document.getElementById("popup-ad-container");

if(!popup) return;

popup.innerHTML=`
<div class="popup-overlay">
<div class="popup-box">
<button class="popup-close">×</button>
<div class="popup-content">
Advertisement
</div>
</div>
</div>`;

popup.style.display="block";

document.querySelector(".popup-close")
.onclick=()=>{
popup.style.display="none";
};

},6000);

},

error(){

this.root.innerHTML=`
<div class="error-box">
Unable to load syllabus
</div>`;

}

};
