(async () => {
  if (!Loader.indexManifest) await Loader.init("data/index.json");
  const el = document.getElementById("ticker-content");
  if (!el) return;

  const today = new Date();
  let tickerItems = [];

  // 1. SCAN ALL ENTRIES BY DATE
  for (const entry of Loader.indexManifest.entries) {
    
    // --- PART A: SCAN DAILYPOSTS (e.g., 21-03-26.json) ---
    if (entry.type === "dailypost") {
      const dailyData = await Loader._fetchJSON(entry.file);
      if (Array.isArray(dailyData)) {
        dailyData.forEach(post => {
          if (isRecent(post)) {
            tickerItems.push({
              display: post.title,
              link: post.url || `details.html?id=${post.master_id}`,
              date: new Date(post.date),
              type: "dailypost"
            });
          }
        });
      }
    }

    // --- PART B: SCAN EVENTS (Lifecycle Child Events) ---
    if (entry.type === "events") {
      const eventData = await Loader._fetchJSON(entry.file);
      if (eventData?.events) {
        const parentName = eventData.title || entry.master_id.replace(/-/g, ' ').toUpperCase();
        eventData.events.forEach(ev => {
          if (isRecent(ev)) {
            tickerItems.push({
              display: `${parentName}: ${ev.label}`,
              link: `details.html?id=${entry.master_id}`,
              date: new Date(ev.start_date),
              type: ev.stage
            });
          }
        });
      }
    }
  }

  // 2. RECENCY LOGIC (5 days for apply/notification, 48h for others)
  function isRecent(item) {
    const start = new Date(item.start_date || item.date);
    if (isNaN(start) || today < start) return false;
    
    const diffHours = (today - start) / (1000 * 60 * 60);
    const stage = (item.stage || "dailypost").toLowerCase();
    
    return (stage === "apply" || stage === "notification") ? diffHours <= 120 : diffHours <= 48;
  }

  // 3. SORT & RENDER
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

  // CRITICAL: Double the content for a seamless infinite loop
  el.innerHTML = html + html; 
})();
