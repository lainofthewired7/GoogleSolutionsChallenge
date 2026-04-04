"""Market selection endpoints."""

from fastapi import APIRouter
from api.schemas import MarketInfo

router = APIRouter()

# Supported markets
MARKETS = [
    MarketInfo(code="austin", name="Austin–Round Rock", state="TX", lat=30.2672, lon=-97.7431),
]


@router.get("/", response_model=list[MarketInfo])
async def list_markets():
    """List all supported markets."""
    return MARKETS


@router.get("/{market_code}", response_model=MarketInfo)
async def get_market(market_code: str):
    """Get details for a specific market."""
    for m in MARKETS:
        if m.code == market_code:
            return m
    return {"error": "Market not found"}
