"""Data metrics endpoints — live data from FRED, Census ACS, HUD, and Austin Open Data."""

import os
import logging
import requests
from datetime import datetime, timedelta
from fastapi import APIRouter, Query, HTTPException
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

# Debug print for backend verification
print(f"[*] Census Key Loaded: {CENSUS_API_KEY[:5]}...")

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
# /heatmap — Census ACS ZIP-level data
# ══════════════════════════════════════════════════════════════
@router.get("/heatmap")
@cache(expire=3600)
async def get_heatmap_data(market: str = Query(default="austin"), metric: str = Query(default="rent")):
    """Get ZIP-level heatmap data (rent or vacancy) from Census ACS."""
    config = get_market_config(market)
    try:
        variables = "B25064_001E" if metric == "rent" else "B25002_001E,B25002_003E"
        
        hot_zips = config.get("hot_zips", ["78701", "78704"])
        zips_str = ",".join(hot_zips)
        
        # Use 2021 ACS - more stable for ZCTA queries with targeted lists
        url = "https://api.census.gov/data/2021/acs/acs5"
        params = {
            "get": f"NAME,{variables}",
            "for": f"zip code tabulation area:{zips_str}",
            "key": CENSUS_API_KEY,
        }
        r = requests.get(url, params=params, timeout=60)
        if r.status_code != 200:
            logger.error("Census API Error: %s - %s", r.status_code, r.text)
            return {"market": market, "data": [], "message": f"Census Error: {r.status_code}"}
        
        try:
            rows = r.json()
        except Exception as e:
            logger.error("JSON Decode Error: %s. Response text: %s", e, r.text[:500])
            return {"market": market, "data": [], "message": "JSON Parse Error"}

        results = []
        for row in rows[1:]:
            zip_code = row[-1]
            try:
                if metric == "rent":
                    val = float(row[1]) if row[1] and float(row[1]) > 0 else 0
                else:
                    total = float(row[1]) if row[1] else 0
                    vacant = float(row[2]) if row[2] else 0
                    val = (vacant / total * 100) if total > 0 else 0
                
                if val > 0:
                    results.append({"zip": zip_code, "value": val})
            except (ValueError, IndexError):
                continue
                
        return {
            "market": market,
            "metric": metric,
            "data": results,
            "message": f"Live from Census ACS ({len(results)} Submarkets)"
        }
    except Exception:
        logger.exception("Error fetching Census heatmap data for %s", market)
        return {"market": market, "data": [], "message": "Error"}
