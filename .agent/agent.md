# Projectr Analytics — Agent Configuration

## Project Identity

**Projectr Analytics** is a real-estate data ingestion engine and geospatial dashboard targeting the Austin–Round Rock, TX MSA. It pulls from multiple public data APIs, normalizes the data into PostgreSQL + PostGIS, and renders interactive Google Maps visualizations.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Ingestion** | Python 3.11+ (`requests`, `pandas`, `geopandas`) |
| **Storage** | PostgreSQL 15 + PostGIS 3.3 |
| **Backend API** | FastAPI (uvicorn) |
| **Frontend** | Vanilla HTML/CSS/JS + Google Maps JavaScript API |
| **Containerization** | Docker + docker-compose |
| **Scheduling** | cron (dev) / Apache Airflow (prod) |
| **Testing** | pytest, unittest.mock |

## Project Structure

```
projectr-analytics/
├── .agent/                    # Agent configuration
│   ├── agent.md               # This file
│   └── workflows/             # Workflow definitions
│       ├── setup.md           # Environment setup
│       ├── ingest.md          # Run data ingestion
│       ├── serve.md           # Start API + dashboard
│       └── test.md            # Run test suite
├── ingestion/                 # Data ingestion layer
│   ├── __init__.py
│   ├── config.py              # API keys, endpoints, settings
│   ├── fred.py                # FRED API client
│   ├── census_acs.py          # Census ACS API client
│   ├── hud.py                 # HUD API client
│   ├── zillow.py              # Zillow/Redfin data client
│   ├── permits.py             # Local building permit data
│   ├── google_trends.py       # Google Trends via pytrends
│   └── runner.py              # Orchestrates all ingestion jobs
├── etl/                       # ETL & normalization
│   ├── __init__.py
│   ├── normalize.py           # Raw → normalized transforms
│   ├── merge.py               # Cross-source data merging
│   └── quality.py             # Data quality checks
├── db/                        # Database layer
│   ├── __init__.py
│   ├── models.py              # SQLAlchemy/PostGIS models
│   ├── connection.py          # DB connection management
│   └── migrations/            # Schema migrations (Alembic)
│       └── env.py
├── api/                       # Backend REST API
│   ├── __init__.py
│   ├── main.py                # FastAPI app entry point
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── markets.py         # Market selection endpoints
│   │   ├── metrics.py         # Data metrics endpoints
│   │   └── geojson.py         # GeoJSON data endpoints
│   └── schemas.py             # Pydantic request/response models
├── dashboard/                 # Frontend dashboard
│   ├── index.html             # Main dashboard page
│   ├── css/
│   │   └── style.css          # Dashboard styles
│   ├── js/
│   │   ├── app.js             # Main application logic
│   │   ├── map.js             # Google Maps initialization & layers
│   │   ├── controls.js        # UI controls (market selector, toggles)
│   │   └── api.js             # API client for fetching data
│   └── assets/
│       └── favicon.ico
├── tests/                     # Test suite
│   ├── __init__.py
│   ├── conftest.py            # Shared fixtures
│   ├── test_ingestion.py      # Ingestion unit tests
│   ├── test_etl.py            # ETL unit tests
│   ├── test_api.py            # API endpoint tests
│   └── test_integration.py   # Full pipeline integration test
├── data/                      # Local data cache (gitignored)
│   └── .gitkeep
├── docs/                      # Project documentation
│   ├── data_sources_and_ingestion.md
│   ├── data_normalization_and_storage.md
│   ├── geospatial_dashboard_google_maps.md
│   ├── dynamic_market_selection_bonus.md
│   ├── deployment_and_operations.md
│   └── sample_data_and_testing.md
├── .env.example               # Environment variable template
├── .gitignore
├── docker-compose.yml         # Full stack: API + PostGIS + dashboard
├── Dockerfile                 # Backend container
├── requirements.txt           # Python dependencies
├── pyproject.toml             # Project metadata
└── README.md                  # Project overview & quickstart
```

## Coding Conventions

- **Python**: Follow PEP 8. Use type hints on all function signatures.
- **Naming**: `snake_case` for files, functions, variables. `PascalCase` for classes.
- **Docstrings**: Google-style docstrings on all public functions and classes.
- **Imports**: Group as stdlib → third-party → local. Use absolute imports.
- **Error handling**: Never silently swallow exceptions. Log with `logging` module.
- **Environment**: All secrets via environment variables — never hardcode API keys.

## Key Data Sources

| Source | Module | API Docs |
|--------|--------|----------|
| FRED | `ingestion/fred.py` | https://fred.stlouisfed.org/docs/api/ |
| Census ACS | `ingestion/census_acs.py` | https://www.census.gov/data/developers.html |
| HUD | `ingestion/hud.py` | https://www.huduser.gov/portal/dataset/fmr-api.html |
| Zillow/Redfin | `ingestion/zillow.py` | CSV downloads / scraping |
| Local Permits | `ingestion/permits.py` | City of Austin Open Data |
| Google Trends | `ingestion/google_trends.py` | pytrends library |

## Database Tables

| Table | Description |
|-------|-------------|
| `submarket_boundaries` | GeoJSON polygons for MSA/zip/tract boundaries |
| `rents` | Time-series rent data by geography |
| `permits` | Building permit records with point geometry |
| `job_growth` | Employment data by MSA |
| `vacancy` | Vacancy rates by zip/tract |
| `migration` | Net migration data |

## Development Commands

```bash
# Setup
cp .env.example .env           # Configure API keys
docker-compose up -d db        # Start PostGIS
pip install -r requirements.txt

# Ingest data
python -m ingestion.runner --market austin

# Start API
uvicorn api.main:app --reload --port 8000

# Open dashboard
open dashboard/index.html      # Or serve via API

# Run tests
pytest tests/ -v
```
