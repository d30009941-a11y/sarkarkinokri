window.SarkarPath = {
    // MATCHING YOUR GITHUB ROOT: /sarkarkinokri/
    base: window.location.hostname.includes('github.io') ? '/sarkarkinokri/' : '/',
    
    rel: function(path) {
        if (!path || path.startsWith('http') || path.startsWith('#')) return path;
        
        // Remove any existing leading slashes to prevent "sarkarkinokri//data"
        const clean = path.replace(/^\/+/, '');
        
        // Returns: /sarkarkinokri/data/index.json on GitHub
        // Returns: /data/index.json on Localhost
        return this.base + clean;
    }
};

window.rel = window.SarkarPath.rel.bind(window.SarkarPath);
console.log(`%c[Commander] Root set to: ${window.SarkarPath.base}`, "color: #8b5cf6; font-weight: bold;");
