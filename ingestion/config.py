"""Ingestion configuration — API keys, endpoints, and settings."""

import os
from dotenv import load_dotenv

load_dotenv()


# === API Keys ===
FRED_API_KEY = os.getenv("FRED_API_KEY", "")
CENSUS_API_KEY = os.getenv("CENSUS_API_KEY", "")
HUD_API_KEY = os.getenv("HUD_API_KEY", "")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")

# === Database ===
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://indicium:indicium@localhost:5432/indicium")

# === Target Market ===
DEFAULT_MARKET = os.getenv("DEFAULT_MARKET", "austin-round-rock-tx")
DEFAULT_MSA_CODE = os.getenv("DEFAULT_MSA_CODE", "12420")

# === API Endpoints ===
FRED_BASE_URL = "https://api.stlouisfed.org/fred"
CENSUS_BASE_URL = "https://api.census.gov/data"
HUD_BASE_URL = "https://www.huduser.gov/hudapi/public"

# === Rate Limiting ===
REQUEST_DELAY_SECONDS = 1.0
MAX_RETRIES = 3
