"""FastAPI application entry point."""

import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from api.routes import markets, metrics, geojson, auth, watchlist, fred

# === Rate limiter ===
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

app = FastAPI(
    title="Projectr Analytics API",
    description="Real-estate data API for the geospatial dashboard",
    version="0.3.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Session middleware (required by authlib OAuth for CSRF state)
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("JWT_SECRET_KEY", "dev-secret-change-in-production"),
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
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(watchlist.router, prefix="/api/watchlist", tags=["Watchlist"])
app.include_router(fred.router, prefix="/api/fred", tags=["FRED Data"])

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "projectr-analytics"}

# Serve dashboard static files (Vite production build)
# NOTE: This must be LAST — it catches all unmatched routes.
if os.path.exists("dashboard/dist"):
    app.mount("/", StaticFiles(directory="dashboard/dist", html=True), name="dashboard")
