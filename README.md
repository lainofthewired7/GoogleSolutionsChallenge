# Indicium

Real-estate data ingestion engine & geospatial dashboard for many places in the United States.

## Quick Start

```bash
# 1. Setup environment
cp .env.example .env           # Add your API keys
docker-compose up -d db        # Start PostGIS
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# 2. Ingest data
python -m ingestion.runner --market austin

# 3. Start the API
uvicorn api.main:app --reload --port 8000

# 4. Open dashboard
# Navigate to http://localhost:8000
```

## Architecture

```
Public APIs → Ingestion (Python) → PostgreSQL/PostGIS → FastAPI → Google Maps Dashboard
```

## Data Sources

| Source | Data | Frequency |
|--------|------|-----------|
| FRED | Employment, population | Monthly/Annual |
| Census ACS | Vacancy, income, demographics | Annual |
| HUD | Fair market rents | Annual |
| Zillow/Redfin | Rent index, home values | Monthly |
| City of Austin | Building permits | Ongoing |
| Google Trends | Search interest | Weekly |

## Project Structure

```
ingestion/       # Data source API clients
etl/             # Normalization & quality checks
db/              # Database models & migrations
api/             # FastAPI REST endpoints
dashboard/       # HTML/CSS/JS + Google Maps frontend
tests/           # Unit, API, and integration tests
docs/            # Detailed design documents
```

## Development

```bash
pytest tests/ -v               # Run tests
pytest tests/ --cov             # With coverage
docker-compose up --build       # Full stack
```

## License

MIT
