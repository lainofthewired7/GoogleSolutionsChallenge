/**
 * UI controls — layer toggles, market selector, theme toggle.
 */

function initControls() {
    // Layer toggles
    document.getElementById('toggle-heatmap').addEventListener('change', (e) => {
        toggleHeatmap(e.target.checked);
    });

    document.getElementById('toggle-boundaries').addEventListener('change', (e) => {
        toggleBoundaries(e.target.checked);
    });

    document.getElementById('toggle-permits').addEventListener('change', (e) => {
        // TODO: Toggle permit markers layer
        console.log('Permits layer:', e.target.checked);
    });

    document.getElementById('toggle-vacancy').addEventListener('change', (e) => {
        // TODO: Toggle vacancy choropleth
        console.log('Vacancy layer:', e.target.checked);
    });

    document.getElementById('toggle-jobs').addEventListener('change', (e) => {
        // TODO: Toggle job growth overlay
        console.log('Jobs layer:', e.target.checked);
    });

    // Market selector
    document.getElementById('market-selector').addEventListener('change', async (e) => {
        const marketCode = e.target.value;
        await loadMarket(marketCode);
    });

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const btn = document.getElementById('theme-toggle');
        btn.textContent = document.body.classList.contains('light-theme') ? '☀️' : '🌙';
    });
}

async function loadMarket(marketCode) {
    const metricsEl = document.getElementById('metrics-content');
    metricsEl.innerHTML = '<p class="loading">Loading market data...</p>';

    try {
        const market = await api.getMarket(marketCode);
        recenterMap(market.lat, market.lon);

        // Load boundaries
        const boundaries = await api.getBoundaries(marketCode);
        loadBoundaries(boundaries);

        // Load heatmap
        const heatmap = await api.getHeatmapData(marketCode, 'rent');
        setHeatmapData(heatmap.points || []);
        if (document.getElementById('toggle-heatmap').checked) {
            toggleHeatmap(true);
        }

        // Update metrics panel
        updateMetricsPanel(marketCode);
    } catch (err) {
        metricsEl.innerHTML = '<p class="loading">Error loading market data.</p>';
        console.error('Failed to load market:', err);
    }
}

async function updateMetricsPanel(marketCode) {
    const el = document.getElementById('metrics-content');

    // TODO: Replace with real API data
    el.innerHTML = `
        <div class="metric-card">
            <span class="metric-label">Median Rent</span>
            <span class="metric-value">—</span>
        </div>
        <div class="metric-card">
            <span class="metric-label">Permits YTD</span>
            <span class="metric-value">—</span>
        </div>
        <div class="metric-card">
            <span class="metric-label">Vacancy Rate</span>
            <span class="metric-value">—</span>
        </div>
        <div class="metric-card">
            <span class="metric-label">Job Growth</span>
            <span class="metric-value">—</span>
        </div>
    `;
}
