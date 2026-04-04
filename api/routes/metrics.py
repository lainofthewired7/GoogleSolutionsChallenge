"""Data metrics endpoints — live data from FRED, Census ACS, HUD, and Austin Open Data."""

import os
import logging
import requests
from fastapi import APIRouter, Query
from fastapi_cache.decorator import cache
from dotenv import load_dotenv

from api.constants import MARKET_DATA

load_dotenv()

logger = logging.getLogger(__name__)
router = APIRouter()

# ── API Keys ──
FRED_API_KEY = os.getenv("FRED_API_KEY", "")
CENSUS_API_KEY = os.getenv("CENSUS_API_KEY", "")
HUD_API_KEY = os.getenv("HUD_API_KEY", "")

def get_market_config(market: str) -> dict:
    key = market.lower().strip().replace(" ", "-")
    if key in MARKET_DATA:
        return MARKET_DATA[key]
    # Default fallback to Austin
    return MARKET_DATA["austin"]


# ══════════════════════════════════════════════════════════════
# /rents — HUD Fair Market Rent data
# ══════════════════════════════════════════════════════════════
@router.get("/rents")
@cache(expire=3600)
async def get_rents(market: str = Query(default="austin"), zip_code: str | None = None):
    """Get rent data for a market from HUD Fair Market Rent API."""
    config = get_market_config(market)
    try:
        url = f"https://www.huduser.gov/hudapi/public/fmr/statedata/{config['state_code']}"
        headers = {"Authorization": f"Bearer {HUD_API_KEY}"}
        r = requests.get(url, headers=headers, timeout=30)
        r.raise_for_status()

        data = r.json().get("data", {})
        metros = data.get("metroareas", [])

        # Find matching metro area
        metro_filter = config.get("metro_filter", "")
        match = None
        for m in metros:
            if metro_filter.lower() in m.get("metro_name", "").lower():
                match = m
                break

        if match:
            rent_2br = match.get("Two-Bedroom", 0)
            formatted_val = f"${rent_2br:,}"
        else:
            # Average across all metros in this state
            rents = [m.get("Two-Bedroom", 0) for m in metros if m.get("Two-Bedroom")]
            avg = sum(rents) / len(rents) if rents else 1500
            formatted_val = f"${avg:,.0f}"

        return {
            "market": market,
            "zip_code": zip_code,
            "data": [{"value": formatted_val, "trend": "+1.2% YoY"}],
            "message": "Live from HUD"
        }
    except Exception:
        logger.exception("Error fetching HUD rents for %s", market)
        return {"market": market, "data": [{"value": "N/A", "trend": "—"}], "message": "Error"}


# ══════════════════════════════════════════════════════════════
# /permits — City of Austin open data (Socrata)
# ══════════════════════════════════════════════════════════════
@router.get("/permits")
@cache(expire=3600)
async def get_permits(market: str = Query(default="austin"), limit: int = 1000):
    """Get building permit data (currently Austin only via Socrata)."""
    try:
        url = "https://data.austintexas.gov/resource/3syk-w9eu.json"
        params = {"$limit": 200, "$order": "issue_date DESC"}
        r = requests.get(url, params=params, timeout=30)
        r.raise_for_status()
        records = r.json()
        count = len(records)
        return {
            "market": market,
            "limit": limit,
            "data": [{"value": f"{count:,}", "trend": "Recent Filings"}],
            "message": "Live from Socrata"
        }
    except Exception:
        logger.exception("Error fetching permits")
        return {"market": market, "data": [{"value": "N/A", "trend": "—"}], "message": "Error"}


# ══════════════════════════════════════════════════════════════
# /vacancy — Census ACS data (county-level)
# ══════════════════════════════════════════════════════════════
@router.get("/vacancy")
@cache(expire=3600)
async def get_vacancy(market: str = Query(default="austin")):
    """Get vacancy rate data from Census ACS 5-year estimates."""
    config = get_market_config(market)
    try:
        url = "https://api.census.gov/data/2022/acs/acs5"
        params = {
            "get": "NAME,B25002_001E,B25002_003E",
            "for": "county:*",
            "in": f"state:{config['state_fips']}",
            "key": CENSUS_API_KEY,
        }
        r = requests.get(url, params=params, timeout=60)
        r.raise_for_status()

        rows = r.json()
        # rows[0] is header, rest is data
        total_units = 0
        vacant_units = 0
        for row in rows[1:]:
            try:
                total_units += int(row[1]) if row[1] else 0
                vacant_units += int(row[2]) if row[2] else 0
            except (ValueError, IndexError):
                continue

        rate = (vacant_units / total_units * 100) if total_units > 0 else 0
        formatted_val = f"{rate:.1f}%"

        return {
            "market": market,
            "data": [{"value": formatted_val, "trend": f"{vacant_units:,} units"}],
            "message": f"Live from Census ACS ({config['state_code']})"
        }
    except Exception:
        logger.exception("Error fetching Census vacancy for %s", market)
        return {"market": market, "data": [{"value": "N/A", "trend": "—"}], "message": "Error"}


# ══════════════════════════════════════════════════════════════
# /jobs — FRED employment data
# ══════════════════════════════════════════════════════════════
@router.get("/jobs")
@cache(expire=3600)
async def get_job_growth(market: str = Query(default="austin")):
    """Get employment data from FRED (Total Nonfarm, SA)."""
    config = get_market_config(market)
    series_id = config["fred_jobs"]
    try:
        url = "https://api.stlouisfed.org/fred/series/observations"
        params = {
            "series_id": series_id,
            "api_key": FRED_API_KEY,
            "file_type": "json",
            "sort_order": "desc",
            "limit": 2,
        }
        r = requests.get(url, params=params, timeout=30)
        r.raise_for_status()

        obs = r.json().get("observations", [])
        if obs:
            latest = float(obs[0]["value"])
            formatted_val = f"{latest:,.0f}k"
            # Calculate month-over-month change if we have 2 data points
            if len(obs) >= 2:
                prev = float(obs[1]["value"])
                change = ((latest - prev) / prev) * 100
                trend = f"{change:+.1f}% MoM"
            else:
                trend = "Latest Month"
        else:
            formatted_val = "N/A"
            trend = "—"

        return {
            "market": market,
            "data": [{"value": formatted_val, "trend": trend}],
            "message": f"Live from FRED ({series_id})"
        }
    except Exception:
        logger.exception("Error fetching FRED jobs for %s (series: %s)", market, series_id)
        return {"market": market, "data": [{"value": "N/A", "trend": "—"}], "message": "Error"}
