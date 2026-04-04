---
description: Start the API server and dashboard for local development
---

# Serve API + Dashboard

## Steps

1. Ensure the database is running
```bash
docker-compose up -d db
```

2. Activate the virtual environment
```bash
source venv/bin/activate
```

// turbo
3. Start the FastAPI backend (runs on port 8000)
```bash
uvicorn api.main:app --reload --port 8000
```

4. Open the dashboard in a browser
```bash
open dashboard/index.html
```
Or navigate to `http://localhost:8000` if serving the dashboard through FastAPI.

## Full Stack via Docker

// turbo
1. Start all services
```bash
docker-compose up --build
```

This starts:
- PostGIS on port 5432
- FastAPI on port 8000
- Dashboard served at http://localhost:8000
