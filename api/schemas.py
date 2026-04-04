"""Pydantic request/response schemas."""

from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional


class MarketInfo(BaseModel):
    code: str
    name: str
    state: str
    lat: float
    lon: float


class MetricPoint(BaseModel):
    date: date
    value: float
    metric: str
    geography: str
    source: str


class MetricsResponse(BaseModel):
    market: str
    metric: str
    data: list[MetricPoint]
    count: int


# === Auth schemas ===

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: str


class UserUpdate(BaseModel):
    display_name: str


class UserResponse(BaseModel):
    id: int
    email: str
    display_name: str
    is_active: bool
    created_at: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


# === Watchlist schemas ===

class WatchlistItemCreate(BaseModel):
    market_code: str
    geo_code: Optional[str] = None
    geo_type: Optional[str] = "msa"


class WatchlistItemResponse(BaseModel):
    id: int
    market_code: str
    geo_code: str
    geo_type: str
    created_at: str
