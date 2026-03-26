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

if(!this.root) return;

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

render(){

this.root.innerHTML=`

${this.header()}

<div class="ad-box ad-top"></div>

${this.redirectButtons()}

${this.examPhases()}

<div class="ad-box ad-after-phase"></div>

${this.trend()}

${this.subjects()}

<div class="ad-box ad-after-subject"></div>

${this.mentorship()}

<div class="ad-box ad-after-mentor"></div>

<div class="ad-box ad-before-faq"></div>

${this.faq()}

<div class="ad-box ad-bottom"></div>

`;

this.stickyFooterAd();

},

header(){

const d=this.data;

return `
<div class="syllabus-header">
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