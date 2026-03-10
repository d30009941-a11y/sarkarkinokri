async function loadPortal() {
    try {
        const results = await Promise.allSettled([
            fetch('data/events/events.json').then(r => r.json()), 
            fetch('data/staticportals.json').then(r => r.json()),
            fetch('data/importantlinks.json').then(r => r.json())
        ]);

        results.forEach((res, index) => {
            if(res.status === "fulfilled") console.log(`Fetch ${index} succeeded`, res.value);
            else console.warn(`Fetch ${index} failed`, res.reason);
        });

        const eventsData = results[0].status === "fulfilled" ? results[0].value : { data: [] };
        const portals = results[1].status === "fulfilled" ? results[1].value : [];
        const important = results[2].status === "fulfilled" ? results[2].value : [];

        // ... rest of your population logic stays the same

    } catch (e) {
        console.error("Unexpected error", e);
    }
}