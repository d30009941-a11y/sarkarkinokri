(async () => {
  const BASE = window.location.pathname.includes('/') 
    ? window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1)
    : './';

  if (!Loader.indexManifest) await Loader.init(BASE + "data/index.json");
  const el = document.getElementById("ticker-content");
  if (!el) return;

  const today = new Date();
  let tickerItems = [];

  // 1. SCAN ALL ENTRIES BY DATE
  for (const entry of Loader.indexManifest.entries) {
    
    // --- PART A: SCAN DAILYPOSTS ---
    if (entry.type === "dailypost") {
      const dailyData = await Loader._fetchJSON(entry.file);
      if (Array.isArray(dailyData)) {
        dailyData.forEach(post => {
          if (isRecent(post)) {
            tickerItems.push({
              display: post.title,
              link: post.url || `${BASE}details.html?id=${post.master_id}`,
              date: new Date(post.date),
              type: "dailypost"
            });
          }
        });
      }
    }

    // --- PART B: SCAN EVENTS ---
    if (entry.type === "events") {
      const eventData = await Loader._fetchJSON(entry.file);
      if (eventData?.events) {
        const parentName = eventData.title || entry.master_id.replace(/-/g, ' ').toUpperCase();
        eventData.events.forEach(ev => {
          if (isRecent(ev)) {
            tickerItems.push({
              display: `${parentName}: ${ev.label}`,
              link: `${BASE}details.html?id=${entry.master_id}`,
              date: new Date(ev.start_date),
              type: ev.stage
            });
          }
        });
      }
    }
  }

  function isRecent(item) {
    const start = new Date(item.start_date || item.date);
    if (isNaN(start) || today < start) return false;
    
    const diffHours = (today - start) / (1000 * 60 * 60);
    const stage = (item.stage || "dailypost").toLowerCase();
    
    return (stage === "apply" || stage === "notification") ? diffHours <= 120 : diffHours <= 48;
  }

  tickerItems.sort((a, b) => b.date - a.date);
  const finalItems = tickerItems.slice(0, 15);

  if (finalItems.length === 0) {
    el.innerHTML = `<span class="ticker-item">No new updates in the last 48 hours.</span>`;
    return;
  }

  const html = finalItems.map(i => {
    let cls = "tag-recent"; 
    let txt = "📢 Update";
    if (i.type === "apply") { cls = "tag-hot"; txt = "🔥 Apply"; }
    if (i.type === "dailypost") { cls = "tag-new"; txt = "🆕 News"; }
    
    return `<span class="ticker-item">
              <span class="ticker-badge ${cls}">${txt}</span>
              <a href="${i.link}">${i.display}</a>
            </span>`;
  }).join("");

  el.innerHTML = html + html; 
})();