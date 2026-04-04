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
3. Install frontend dependencies (if needed)
```bash
cd dashboard && npm install && cd ..
```

// turbo
4. Start the Vite dev server (runs on port 5173)
```bash
cd dashboard && npm run dev &
```

// turbo
5. Start the FastAPI backend (runs on port 8000)
```bash
uvicorn api.main:app --reload --port 8000
```

6. Open the dashboard in a browser
Navigate to `http://localhost:5173` (Vite dev server with API proxy)
Or `http://localhost:8000` after running `cd dashboard && npm run build` for production mode.

## Full Stack via Docker

// turbo
1. Build the frontend first
```bash
cd dashboard && npm ci && npm run build && cd ..
```

// turbo
2. Start all services
```bash
docker-compose up --build
```

This starts:
- PostGIS on port 5432
- FastAPI on port 8000
- Dashboard served at http://localhost:8000
