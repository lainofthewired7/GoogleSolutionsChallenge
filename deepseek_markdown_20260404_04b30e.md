# Projectr Analytics — Real Estate Data Ingestion Engine & Geospatial Dashboard

## Project Overview

**Goal:** Build a real-estate data ingestion engine for a specific submarket, pull from multiple public data sources, normalize the data, and surface it in an interactive geospatial dashboard (Google Maps) that makes a developer or analyst instantly smarter about that market.

### Key Features

- **Multi-source data pipeline** — Fetches from at least 4 public sources (FRED, Census ACS, HUD, Zillow, local building permits, Google Trends, Redfin, etc.)
- **Normalized storage** — Clean, queryable structure supporting time-series, spatial polygons, and point data
- **Interactive Google Maps dashboard** — Heatmaps (rent prices, permit density), overlays (vacancy rates, job growth), submarket boundaries
- **Dynamic market selection** *(bonus)* — User picks a city/neighborhood, and the engine pulls and renders on the fly

---

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Public APIs │────▶│  Ingestion Layer │────▶│  PostgreSQL +    │
│  FRED, ACS,  │     │  Python scripts   │     │  PostGIS         │
│  HUD, Zillow │     │  (requests/pandas) │     │                  │
└──────────────┘     └──────────────────┘     └────────┬─────────┘
                                                       │
                                                       ▼
                                              ┌──────────────────┐
                                              │  REST API        │
                                              │  Flask / FastAPI  │
                                              └────────┬─────────┘
                                                       │
                                                       ▼
                                              ┌──────────────────┐
                                              │  Google Maps     │
                                              │  Dashboard       │
                                              │  (HTML/CSS/JS)   │
                                              └──────────────────┘
```

---

## Deliverables

Each section below corresponds to a standalone markdown file the team will produce.

---

### 1. `data_sources_and_ingestion.md`

Covers the data pipeline from public APIs to raw storage.

- **Submarket selection** — Choose and justify a target MSA (e.g., Austin–Round Rock, TX)
- **Data source catalog** (minimum 4) — For each source:
  - API endpoint or download method
  - Example request (curl or Python)
  - Key fields to extract (rent, vacancy, permits, job growth, migration, etc.)
  - Update frequency (monthly, quarterly, yearly)
  - Authentication / API key requirements
- **Ingestion script skeleton** — Python using `requests`, `pandas`, `geopandas`
- **Scheduling** — cron, Airflow, or on-demand execution
- **Error handling** — Missing data, rate limits, retries

---

### 2. `data_normalization_and_storage.md`

Covers the ETL pipeline and database schema design.

- **Database choice** — PostgreSQL + PostGIS (recommended)
- **Table definitions** — `rents`, `permits`, `job_growth`, `vacancy`, `migration`, `submarket_boundaries`
- **Schema details** — Data types, indexes, spatial columns (`geometry`, `geography`)
- **ETL pipeline code** — Transform raw API responses into normalized schema
- **Geographic granularity** — Handling tract, zip code, city, and custom polygon levels
- **Data quality checks** — Nulls, outliers, temporal consistency
- **Cross-source merging** — Example: Zillow rent index + ACS vacancy by zip code

---

### 3. `geospatial_dashboard_google_maps.md`

Covers the interactive frontend visualization.

- **Stack** — HTML/CSS/JS with Google Maps JavaScript API
- **Map initialization** — Center on submarket, load boundaries as GeoJSON layers
- **Heatmap layer** — Rent prices or permit density via `google.maps.visualization.HeatmapLayer`
- **Toggleable overlays** — Vacancy, job growth, migration (choropleth or symbol map)
- **Info windows** — Click a submarket to see key metrics (median rent, permits YTD, job growth %)
- **Responsive layout** — Dark/light mode support
- **Backend integration** — Fetch data via REST API (Flask/FastAPI) or static JSON

---

### 4. `dynamic_market_selection_bonus.md`

Covers the bonus feature for on-the-fly market switching.

- **UI controls** — Dropdown or map-click market selector
- **Backend flow** — On selection, check if data exists in DB; if not, trigger ingestion
- **Caching strategy** — Avoid repeated API calls for previously fetched markets
- **UX patterns** — Loading states, error handling, fallback to default market
- **Map updates** — Re-centering, clearing layers, updating charts dynamically

---

### 5. `deployment_and_operations.md`

Covers deployment, configuration, and monitoring.

- **Deployment targets** — Local dev, cloud (Heroku, Render, Google Cloud Run, AWS EC2)
- **Secrets management** — Environment variables for API keys and DB credentials
- **Docker setup** — `Dockerfile` + `docker-compose.yml` for one-command startup (backend + frontend + PostGIS)
- **Google Maps API** — Instructions for obtaining key and enabling required APIs
- **Monitoring** — Log aggregation, health check endpoint
- **Project README** — Installation, configuration, running the pipeline, viewing the dashboard

---

### 6. `sample_data_and_testing.md`

Covers testing strategy and synthetic data generation.

- **Synthetic data script** — Generate or sample real data for testing without hitting production APIs
- **Unit tests** — Mock API responses for ingestion; validate schema for normalization
- **Integration test** — Full pipeline run for a single submarket, verify dashboard loads
- **Performance benchmarks** — Record count expectations, query times, map rendering speed

---

## Target Submarket

**Austin–Round Rock, TX Metropolitan Statistical Area (MSA)**

**Justification:** High growth market with abundant public data, active building permit activity, strong migration trends — ideal for demonstrating a real-estate analytics dashboard.

### Data Sources

| # | Source | Key Data | Frequency | Auth |
|---|--------|----------|-----------|------|
| 1 | **FRED** | Employment, population (`AUSPOP`, `AUSNA`) | Monthly/Annual | API key |
| 2 | **Census ACS** | Vacancy rates, median income, demographics | Annual (1-yr/5-yr) | API key |
| 3 | **HUD** | Fair market rents, housing affordability | Annual | API key |
| 4 | **Zillow / Redfin** | Rent index, home values, inventory | Monthly | CSV / scrape |
| 5 | **Local permits** | Building permit data (City of Austin open data) | Ongoing | Open |
| 6 | **Google Trends** | Search interest for "apartments Austin", etc. | Weekly | API / pytrends |

### Example API Call — FRED

```python
import requests

url = "https://api.stlouisfed.org/fred/series/observations"
params = {
    "series_id": "AUSPOP",
    "api_key": "YOUR_FRED_KEY",
    "file_type": "json"
}
response = requests.get(url, params=params)
data = response.json()
```

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Ingestion | Python (`requests`, `pandas`, `geopandas`) |
| Storage | PostgreSQL + PostGIS |
| Backend API | Flask or FastAPI |
| Frontend | HTML/CSS/JS + Google Maps JavaScript API |
| Containerization | Docker + docker-compose |
| Scheduling | cron or Apache Airflow |
