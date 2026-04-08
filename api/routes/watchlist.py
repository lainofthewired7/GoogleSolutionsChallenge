"""Watchlist endpoints — CRUD for user-watched markets and geographies."""

from fastapi import APIRouter, HTTPException, status, Depends
from api.auth import add_watchlist_item, get_user_watchlist, remove_watchlist_item
from db.models import User
from api.deps import get_current_user
from api.schemas import WatchlistItemCreate, WatchlistItemResponse

router = APIRouter()


@router.get("/", response_model=list[WatchlistItemResponse])
async def list_watchlist(current_user: User = Depends(get_current_user)):
    """List all watchlist items for the authenticated user."""
    items = get_user_watchlist(current_user.id)
    return [
        WatchlistItemResponse(
            id=item.id,
            market_code=item.market_code,
            geo_code=item.geo_code,
            geo_type=item.geo_type,
            created_at=item.created_at,
        )
        for item in items
    ]


@router.post("/", response_model=WatchlistItemResponse, status_code=status.HTTP_201_CREATED)
async def add_to_watchlist(
    data: WatchlistItemCreate,
    current_user: User = Depends(get_current_user),
):
    """Add a market/geography to the user's watchlist."""
    item = add_watchlist_item(
        user_id=current_user.id,
        market_code=data.market_code,
        geo_code=data.geo_code or "",
        geo_type=data.geo_type or "msa",
    )
    return WatchlistItemResponse(
        id=item.id,
        market_code=item.market_code,
        geo_code=item.geo_code,
        geo_type=item.geo_type,
        created_at=item.created_at,
    )


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_from_watchlist(
    item_id: int,
    current_user: User = Depends(get_current_user),
):
    """Remove an item from the user's watchlist."""
    removed = remove_watchlist_item(item_id, current_user.id)
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist item not found",
        )
