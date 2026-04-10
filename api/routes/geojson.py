"""GeoJSON data endpoints for map layers."""

import logging
import math
import random

import requests
from fastapi import APIRouter, Query

from api.constants import MARKET_DATA

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/boundaries")
async def get_boundaries(market: str = Query(default="austin"), geo_type: str = "zip"):
    """Get submarket boundary polygons as GeoJSON."""
    return {
        "type": "FeatureCollection",
        "features": [],
        "metadata": {"market": market, "geo_type": geo_type},
    }


def _resolve_market(market: str) -> dict | None:
    """Resolve a market key to its config dict."""
    key = market.lower().strip().replace(" ", "-")
    if key in MARKET_DATA:
        return MARKET_DATA[key]
    for k, v in MARKET_DATA.items():
        if key in k or k in key:
            return v
    return None


def _generate_rent_heatmap(config: dict, market_key: str) -> list[dict]:
    """Generate a realistic rent-price heatmap for a city.

    Models rent as highest near city center (downtown premium)
    with additional high-rent clusters (trendy neighborhoods),
    tapering off toward suburbs.
    """
    center_lat = config["lat"]
    center_lng = config["lon"]
    random.seed(hash(market_key + "-rent"))

    points = []

    # ── Dense downtown core: highest rents ──
    for _ in range(200):
        angle = random.uniform(0, 2 * math.pi)
        r = abs(random.gauss(0, 0.012))
        lat = center_lat + r * math.cos(angle)
        lng = center_lng + r * math.sin(angle)
        # Weight 3.5-5.0 near center (expensive downtown)
        dist = math.sqrt((lat - center_lat) ** 2 + (lng - center_lng) ** 2)
        weight = max(3.0, 5.0 - dist * 40 + random.gauss(0, 0.4))
        points.append({"lat": round(lat, 6), "lng": round(lng, 6), "weight": round(min(weight, 5.0), 2)})

    # ── 2-4 high-rent neighborhood clusters ──
    num_clusters = random.randint(2, 4)
    for _ in range(num_clusters):
        c_lat = center_lat + random.uniform(-0.06, 0.06)
        c_lng = center_lng + random.uniform(-0.06, 0.06)
        cluster_rent = random.uniform(2.5, 4.5)

        for _ in range(random.randint(50, 90)):
            angle = random.uniform(0, 2 * math.pi)
            r = abs(random.gauss(0, 0.01))
            lat = c_lat + r * math.cos(angle)
            lng = c_lng + r * math.sin(angle)
            weight = max(1.0, cluster_rent + random.gauss(0, 0.5))
            points.append({"lat": round(lat, 6), "lng": round(lng, 6), "weight": round(min(weight, 5.0), 2)})

    # ── Suburban spread: lower rents ──
    for _ in range(150):
        angle = random.uniform(0, 2 * math.pi)
        r = random.uniform(0.03, 0.12)
        lat = center_lat + r * math.cos(angle)
        lng = center_lng + r * math.sin(angle)
        weight = max(0.5, 2.0 - r * 10 + random.gauss(0, 0.3))
        points.append({"lat": round(lat, 6), "lng": round(lng, 6), "weight": round(min(weight, 3.0), 2)})

    return points


def _generate_permit_heatmap(config: dict, market_key: str) -> list[dict]:
    """Generate cluster-based permit density heatmap."""
    center_lat = config["lat"]
    center_lng = config["lon"]
    random.seed(hash(market_key + "-permits"))

    points = []
    num_clusters = random.randint(3, 5)
    for _ in range(num_clusters):
        c_lat = center_lat + random.uniform(-0.08, 0.08)
        c_lng = center_lng + random.uniform(-0.08, 0.08)
        size = random.randint(40, 120)
        w = random.uniform(1.0, 4.0)
        for _ in range(size):
            angle = random.uniform(0, 2 * math.pi)
            r = random.gauss(0, 0.015)
            lat = c_lat + r * math.cos(angle)
            lng = c_lng + r * math.sin(angle)
            weight = max(0.3, w + random.gauss(0, 0.8))
            points.append({"lat": round(lat, 6), "lng": round(lng, 6), "weight": round(weight, 2)})
    return points


@router.get("/heatmap")
async def get_heatmap_data(market: str = Query(default="austin"), metric: str = "rent"):
    """Get weighted lat/lng points for heatmap rendering for a specific market."""
    market_key = market.lower().strip().replace(" ", "-")
    points = await _get_market_heatmap_points(market_key, metric)
    return {"market": market, "metric": metric, "points": points}


@router.get("/heatmap/all")
async def get_all_heatmap_data(metric: str = "rent"):
    """Aggregate heatmap data for ALL supported markets."""
    all_points = []
    
    # Process markets concurrently for speed
    import asyncio
    
    async def process_market(m_key):
        try:
            return await _get_market_heatmap_points(m_key, metric)
        except Exception:
            return []

    tasks = [process_market(m_key) for m_key in MARKET_DATA.keys()]
    results = await asyncio.gather(*tasks)
    
    for pts in results:
        all_points.extend(pts)
        
    return {
        "metric": metric,
        "count": len(all_points),
        "markets_count": len(MARKET_DATA),
        "points": all_points
    }


async def _get_market_heatmap_points(market_key: str, metric: str) -> list[dict]:
    """Helper to fetch or generate heatmap points for a single market."""
    
    # Austin permits — use real Socrata data
    if metric == "permits" and market_key in ("austin", "austin-round-rock-tx"):
        try:
            url = "https://data.austintexas.gov/resource/3syk-w9eu.json"
            params = {
                "$limit": 1000,
                "$order": "issue_date DESC",
                "$where": "latitude IS NOT NULL",
            }
            # Use non-async requests for now to match existing pattern, 
            # or could use httpx for better performance in the "all" endpoint
            r = requests.get(url, params=params, timeout=10)
            r.raise_for_status()
            records = r.json()

            points = []
            for rec in records:
                try:
                    lat = float(rec["latitude"])
                    lng = float(rec["longitude"])
                    val = float(rec.get("total_job_valuation", 0))
                    weight = min(val / 500000 + 0.3, 5.0)
                    # Add metadata for frontend filtering
                    month = rec.get("issue_date", "")[:7] # YYYY-MM
                    p_type = rec.get("permit_class_mapped", "Other")
                    points.append({
                        "lat": lat, 
                        "lng": lng, 
                        "weight": weight,
                        "month": month,
                        "type": p_type
                    })
                except (KeyError, ValueError, TypeError):
                    continue
            return points
        except Exception:
            logger.exception("Error fetching permit heatmap data")

    # Resolve market config
    config = _resolve_market(market_key)
    if not config:
        return []

    # Generate heatmap based on metric type
    if metric == "rent":
        return _generate_rent_heatmap(config, market_key)
    else:
        return _generate_permit_heatmap(config, market_key)
