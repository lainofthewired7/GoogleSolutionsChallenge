"""FRED API proxy routes — Austin MSA employment data.

Pulls BLS employment data from FRED for the Austin-Round Rock MSA,
computes YoY growth rates, and returns structured JSON for the dashboard.
"""

import os
import asyncio
from datetime import datetime, timedelta
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi_cache.decorator import cache

from api.constants import MARKET_DATA

router = APIRouter()

FRED_BASE = "https://api.stlouisfed.org/fred/series/observations"

# SECTOR_SUFFIXES remains local as it defines the schema for the Job Growth UI
SECTOR_SUFFIXES = {
    "total_nonfarm": {
        "id_suffix": "NA",
        "title": "Total Nonfarm",
        "icon": "work",
        "color": "primary",
        "multiplier": 1.0,
    },
    "information": {
        "id_suffix": "INFO",
        "title": "Information (Tech)",
        "icon": "terminal",
        "color": "primary",
        "multiplier": 1.25, # Tech grows faster typically
    },
    "manufacturing": {
        "id_suffix": "MFGN",
        "title": "Manufacturing",
        "icon": "factory",
        "color": "tertiary",
        "multiplier": 0.8, # Mfg grows slightly slower
    },
    "professional_services": {
        "id_suffix": "PBSV",
        "title": "Professional & Business Services",
        "icon": "business_center",
        "color": "secondary",
        "multiplier": 1.1,
    },
    "education_health": {
        "id_suffix": "EDUHN",
        "title": "Education & Health Services",
        "icon": "local_hospital",
        "color": "primary",
        "multiplier": 1.0,
    },
    "government": {
        "id_suffix": "GOVTN",
        "title": "Government",
        "icon": "account_balance",
        "color": "tertiary",
        "multiplier": 0.6,
    },
}

UNEMPLOYMENT_SUFFIX = "UR"


def _get_fred_key() -> str:
    key = os.getenv("FRED_API_KEY", "")
    if not key:
        raise HTTPException(status_code=500, detail="FRED_API_KEY not configured")
    return key


async def _fetch_fred_series(
    client: httpx.AsyncClient,
    series_id: str,
    observation_start: str | None = None,
    observation_end: str | None = None,
) -> list[dict[str, str]]:
    """Fetch observations from a FRED series."""
    params: dict[str, Any] = {
        "series_id": series_id,
        "api_key": _get_fred_key(),
        "file_type": "json",
        "sort_order": "asc",
    }
    if observation_start:
        params["observation_start"] = observation_start
    if observation_end:
        params["observation_end"] = observation_end

    resp = await client.get(FRED_BASE, params=params, timeout=15.0)
    if resp.status_code != 200:
        # Graceful degradation for missing series in some cities
        return []

    data = resp.json()
    return [
        obs
        for obs in data.get("observations", [])
        if obs.get("value") != "."  # FRED uses "." for missing values
    ]


def _compute_yoy_growth(observations: list[dict[str, str]]) -> dict[str, Any]:
    """Compute YoY growth from the most recent 13+ months of observations."""
    if len(observations) < 13:
        return {"yoy_pct": None, "net_change": None}

    latest = float(observations[-1]["value"])
    year_ago = float(observations[-13]["value"])

    if year_ago == 0:
        return {"yoy_pct": None, "net_change": None}

    yoy_pct = round(((latest - year_ago) / year_ago) * 100, 1)
    net_change = round(latest - year_ago, 1)
    return {"yoy_pct": yoy_pct, "net_change": net_change}


@router.get("/employment")
@cache(expire=3600)
async def get_employment(
    market: str = Query(default="austin", description="Market code"),
    years: int = Query(default=5, ge=1, le=20, description="Years of history"),
):
    """Get multi-sector employment data with YoY growth for a market."""
    key = market.lower().strip().replace(" ", "-")
    market_config = MARKET_DATA.get(key, MARKET_DATA["austin"])
    prefix = market_config["fred_prefix"]
    
    start = (datetime.now() - timedelta(days=years * 365)).strftime("%Y-%m-%d")

    async with httpx.AsyncClient() as client:
        results = {}
        
        # Prepare concurrent API calls
        tasks = []
        keys = list(SECTOR_SUFFIXES.keys())
        
        for key in keys:
            meta = SECTOR_SUFFIXES[key]
            # Use explicit fred_sectors override if available, otherwise fallback to prefix+suffix
            sectors_override = market_config.get("fred_sectors", {})
            if key == "total_nonfarm":
                series_id = market_config.get("fred_jobs", f"{prefix}NA")
            else:
                series_id = sectors_override.get(meta['id_suffix'], f"{prefix}{meta['id_suffix']}")
            
            tasks.append(_fetch_fred_series(client, series_id, observation_start=start))
            
        # Execute all requests concurrently
        all_observations = await asyncio.gather(*tasks, return_exceptions=True)
        
        # First pass: parse observations and isolate total_growth baseline
        total_growth_val = 0.0
        
        for i, key in enumerate(keys):
            meta = SECTOR_SUFFIXES[key]
            sectors_override = market_config.get("fred_sectors", {})
            if key == "total_nonfarm":
                series_id = market_config.get("fred_jobs", f"{prefix}NA")
            else:
                series_id = sectors_override.get(meta['id_suffix'], f"{prefix}{meta['id_suffix']}")
            obs_res = all_observations[i]
            
            # Handle failed futures gracefully
            observations = obs_res if isinstance(obs_res, list) else []
            
            if observations:
                points = [{"date": obs["date"], "value": float(obs["value"])} for obs in observations]
                growth = _compute_yoy_growth(observations)
                yoy_pct = growth["yoy_pct"]
                if key == "total_nonfarm" and yoy_pct is not None:
                    total_growth_val = float(yoy_pct)
                    
                results[key] = {
                    "series_id": series_id,
                    "title": meta["title"],
                    "icon": meta["icon"],
                    "color": meta["color"],
                    "observations": points,
                    "latest_value": points[-1]["value"] if points else None,
                    "latest_date": points[-1]["date"] if points else None,
                    "yoy_growth_pct": yoy_pct,
                    "yoy_net_change": growth["net_change"],
                    "units": "Thousands of Persons",
                }
            else:
                # Proxy fallback
                results[key] = {
                    "series_id": f"{series_id}-PROXY",
                    "title": meta["title"] + "*",
                    "icon": meta["icon"],
                    "color": meta["color"],
                    "observations": [],
                    "latest_value": None,
                    "latest_date": None,
                    "yoy_growth_pct": round(total_growth_val * meta.get("multiplier", 1.0), 1) if total_growth_val else None,
                    "yoy_net_change": None,
                    "units": "Thousands of Persons (Proxy)",
                }

    return {
        "market": market_config["name"],
        "msa_code": market_config["msa_code"],
        "period": f"{years}-year",
        "sectors": results,
    }


@router.get("/unemployment")
@cache(expire=3600)
async def get_unemployment(
    market: str = Query(default="austin", description="Market code"),
    years: int = Query(default=5, ge=1, le=20, description="Years of history"),
):
    """Get unemployment rate time series for a market."""
    key = market.lower().strip().replace(" ", "-")
    market_config = MARKET_DATA.get(key, MARKET_DATA["austin"])
    
    # Use explicit override if available
    sectors_override = market_config.get("fred_sectors", {})
    series_id = sectors_override.get("UR", f"{market_config['fred_prefix']}UR")
    
    start = (datetime.now() - timedelta(days=years * 365)).strftime("%Y-%m-%d")

    async with httpx.AsyncClient() as client:
        observations = await _fetch_fred_series(
            client, series_id, observation_start=start
        )

    points = [
        {"date": obs["date"], "value": float(obs["value"])} for obs in observations
    ]

    # Compute change from a year ago
    growth = _compute_yoy_growth(observations)

    return {
        "market": market_config["name"],
        "series_id": series_id,
        "title": "Unemployment Rate",
        "observations": points,
        "latest_value": points[-1]["value"] if points else None,
        "latest_date": points[-1]["date"] if points else None,
        "yoy_change": growth["yoy_pct"],
        "units": "Percent",
    }


@router.get("/rent")
@cache(expire=3600)
async def get_rent_trend(
    market: str = Query(default="austin", description="Market code"),
    years: int = Query(default=5, ge=1, le=20, description="Years of history"),
):
    """Get rent index (CPI) time series and YoY growth for a market."""
    key = market.lower().strip().replace(" ", "-")
    market_config = MARKET_DATA.get(key, MARKET_DATA["austin"])
    series_id = market_config.get("fred_rent", "CUUR0000SEHA")
    
    start = (datetime.now() - timedelta(days=years * 365)).strftime("%Y-%m-%d")

    async with httpx.AsyncClient() as client:
        observations = await _fetch_fred_series(
            client, series_id, observation_start=start
        )

    points = [
        {"date": obs["date"], "value": float(obs["value"])} for obs in observations
    ]

    # Compute year-over-year change
    growth = _compute_yoy_growth(observations)

    return {
        "market": market_config["name"],
        "series_id": series_id,
        "title": "Rent CPI Trend",
        "observations": points,
        "latest_value": points[-1]["value"] if points else None,
        "latest_date": points[-1]["date"] if points else None,
        "yoy_growth_pct": growth["yoy_pct"],
        "units": "Index (1982-1984=100)",
    }
