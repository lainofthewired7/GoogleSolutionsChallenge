# Indicium — Roadmap

This document outlines the planned future development for **Indicium**.

---

## Phase 1: Database & Persistence (The Foundation)
**Goal:** Transition from in-memory/stubbed data to a fully persistent PostGIS-backed engine.

- [ ] **Docker Stabilization** — Resolve Docker daemon access to run the `postgis/postgis` container.
- [ ] **Alembic Migrations** — Fully implement migrations to manage the 6 primary data tables.
- [ ] **ETL Completion** — Wire the `ingestion.runner` to save normalized data into PostgreSQL.
- [ ] **GeoJSON Serialization** — Update `api/routes/geojson.py` to perform real spatial queries (e.g., finding all permits within a 1-mile radius of a point).

---

## Phase 2: Authentication & Security
**Goal:** Enable personalized experiences and protect sensitive API keys.

- [ ] **Auth Integration** — Implement NextAuth.js (since we moved to React) or FastAPI OAuth2 with JWT.
- [ ] **User Sessions** — Allow users to create accounts and "Watch" specific MSAs or Zip Codes.
- [ ] **API Key Management** — Move from `.env` to a secure Secret Manager (e.g., Google Secret Manager) for production.
- [ ] **Rate Limiting** — Add per-user rate limits to the Backend API to prevent abuse.

---

## Phase 3: Advanced Analytics & Visualization
**Goal:** Move from raw data display to meaningful market insights.

- [ ] **Trend Forecasting** — Add a lightweight predictive model (e.g., Prophet or ARIMA) to forecast rent growth based on permit density and employment.
- [ ] **Choropleth Maps** — Implement color-coded Zip Code layers for metrics like "Rent % Change YOY" or "Vacancy Delta."
- [ ] **Chart.js Integration** — Replace text-based metrics with interactive historical charts for all market data.
- [ ] **Sentiment Analysis** — Use Google Trends and News APIs to gauge market sentiment for specific neighborhoods.

---

## Phase 4: Expanded UI & Pages
**Goal:** Transform the dashboard into a multi-page analytics platform.

- [ ] **Market Comparison Tool** — A side-by-side view to compare two MSAs (e.g., Austin vs. Nashville) across all metrics.
- [ ] **Property Search** — Integrate a Zillow/Redfin search bar to view specific property details overlaid with market context.
- [ ] **PDF Reports** — Generate one-click market analysis PDF reports for investors or developers.
- [ ] **Mobile Optimization** — A highly responsive "Map-First" layout for tablets and smartphones.

---

## Phase 5: Operations & Production
**Goal:** Scale the application and automate the data lifecycle.

- [ ] **Cloud Deployment** — Deploy the FastAPI backend to Google Cloud Run and the React frontend to Vercel/Firebase Hosting.
- [ ] **Data Orchestration** — Move from `cron` to Apache Airflow or Google Cloud Scheduler for daily ingestion jobs.
- [ ] **Monitoring** — Implement Sentry for error tracking and Google Analytics for usage metrics.
- [ ] **CI/CD Pipeline** — Automated testing and deployment via GitHub Actions.
