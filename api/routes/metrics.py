"""Data metrics endpoints."""

from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/rents")
async def get_rents(market: str = Query(default="austin"), zip_code: str | None = None):
    """Get rent data for a market, optionally filtered by zip."""
    # TODO: Query from database
    return {"market": market, "zip_code": zip_code, "data": [], "message": "Not yet implemented"}


@router.get("/permits")
async def get_permits(market: str = Query(default="austin"), limit: int = 1000):
    """Get building permit data."""
    # TODO: Query from database
    return {"market": market, "limit": limit, "data": [], "message": "Not yet implemented"}


@router.get("/vacancy")
async def get_vacancy(market: str = Query(default="austin")):
    """Get vacancy rate data."""
    # TODO: Query from database
    return {"market": market, "data": [], "message": "Not yet implemented"}


@router.get("/jobs")
async def get_job_growth(market: str = Query(default="austin")):
    """Get employment/job growth data."""
    # TODO: Query from database
    return {"market": market, "data": [], "message": "Not yet implemented"}
