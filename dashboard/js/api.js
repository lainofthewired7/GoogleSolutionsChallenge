/**
 * API client — fetches data from the FastAPI backend.
 */

const API_BASE = window.location.origin + '/api';

const api = {
    async getMarkets() {
        const res = await fetch(`${API_BASE}/markets/`);
        return res.json();
    },

    async getMarket(code) {
        const res = await fetch(`${API_BASE}/markets/${code}`);
        return res.json();
    },

    async getRents(market, zipCode) {
        const params = new URLSearchParams({ market });
        if (zipCode) params.append('zip_code', zipCode);
        const res = await fetch(`${API_BASE}/metrics/rents?${params}`);
        return res.json();
    },

    async getPermits(market, limit = 1000) {
        const res = await fetch(`${API_BASE}/metrics/permits?market=${market}&limit=${limit}`);
        return res.json();
    },

    async getVacancy(market) {
        const res = await fetch(`${API_BASE}/metrics/vacancy?market=${market}`);
        return res.json();
    },

    async getJobGrowth(market) {
        const res = await fetch(`${API_BASE}/metrics/jobs?market=${market}`);
        return res.json();
    },

    async getBoundaries(market, geoType = 'zip') {
        const res = await fetch(`${API_BASE}/geojson/boundaries?market=${market}&geo_type=${geoType}`);
        return res.json();
    },

    async getHeatmapData(market, metric = 'rent') {
        const res = await fetch(`${API_BASE}/geojson/heatmap?market=${market}&metric=${metric}`);
        return res.json();
    },
};
