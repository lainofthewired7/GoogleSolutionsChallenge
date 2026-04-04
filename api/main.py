"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from api.routes import markets, metrics, geojson

app = FastAPI(
    title="Projectr Analytics API",
    description="Real-estate data API for the geospatial dashboard",
    version="0.1.0",
)

# CORS — allow dashboard frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes
app.include_router(markets.router, prefix="/api/markets", tags=["Markets"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["Metrics"])
app.include_router(geojson.router, prefix="/api/geojson", tags=["GeoJSON"])

# Serve dashboard static files
app.mount("/", StaticFiles(directory="dashboard", html=True), name="dashboard")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "projectr-analytics"}
