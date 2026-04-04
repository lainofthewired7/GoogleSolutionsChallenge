"""GeoJSON data endpoints for map layers."""

from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/boundaries")
async def get_boundaries(market: str = Query(default="austin"), geo_type: str = "zip"):
    """Get submarket boundary polygons as GeoJSON.

    Args:
        market: Market identifier.
        geo_type: Geographic level — 'zip', 'tract', or 'msa'.
    """
    # TODO: Query PostGIS and return GeoJSON FeatureCollection
    return {
        "type": "FeatureCollection",
        "features": [],
        "metadata": {"market": market, "geo_type": geo_type},
    }


@router.get("/heatmap")
async def get_heatmap_data(market: str = Query(default="austin"), metric: str = "rent"):
    """Get weighted lat/lng points for heatmap rendering.

    Args:
        market: Market identifier.
        metric: Heatmap metric — 'rent', 'permits', 'vacancy'.
    """
    # TODO: Query database and return point array
    return {"market": market, "metric": metric, "points": []}
