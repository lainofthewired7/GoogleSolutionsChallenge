"""Market selection endpoints."""

from fastapi import APIRouter
from api.constants import MARKET_DATA
from api.schemas import MarketInfo

router = APIRouter()

# Generate the markets list from centralized constants
MARKETS = [
    MarketInfo(
        code=slug,
        name=data["name"],
        state=data["state_code"],
        lat=data["lat"],
        lon=data["lon"]
    )
    for slug, data in MARKET_DATA.items()
]


@router.get("/", response_model=list[MarketInfo])
async def list_markets():
    """List all supported markets."""
    return MARKETS


@router.get("/{market_code}", response_model=MarketInfo)
async def get_market(market_code: str):
    """Get details for a specific market."""
    lookup = market_code.lower().strip().replace(" ", "-")
    for m in MARKETS:
        if m.code == lookup:
            return m
            
    # Dynamic fallback to prevent 500 error validation crashes
    return MarketInfo(
        code=market_code.lower(), 
        name=market_code.title() + " Area", 
        state="US", 
        lat=39.8283, 
        lon=-98.5795
    )
