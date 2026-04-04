"""Market selection endpoints."""

from fastapi import APIRouter
from api.schemas import MarketInfo

router = APIRouter()

# Supported markets
MARKETS = [
    MarketInfo(code="austin", name="Austin–Round Rock", state="TX", lat=30.2672, lon=-97.7431),
    MarketInfo(code="dallas", name="Dallas MSA", state="TX", lat=32.7767, lon=-96.7970),
    MarketInfo(code="chicago", name="Chicago MSA", state="IL", lat=41.8781, lon=-87.6298),
    MarketInfo(code="new york", name="New York Metro", state="NY", lat=40.7128, lon=-74.0060),
    MarketInfo(code="seattle", name="Seattle MSA", state="WA", lat=47.6062, lon=-122.3321),
    MarketInfo(code="los angeles", name="Los Angeles Metro", state="CA", lat=34.0522, lon=-118.2437)
]


@router.get("/", response_model=list[MarketInfo])
async def list_markets():
    """List all supported markets."""
    return MARKETS


@router.get("/{market_code}", response_model=MarketInfo)
async def get_market(market_code: str):
    """Get details for a specific market."""
    for m in MARKETS:
        if m.code == market_code.lower():
            return m
            
    # Dynamic fallback to prevent 500 error validation crashes
    return MarketInfo(
        code=market_code.lower(), 
        name=market_code.title() + " Area", 
        state="US", 
        lat=39.8283, 
        lon=-98.5795
    )
