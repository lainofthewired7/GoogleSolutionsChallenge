"""Pydantic request/response schemas."""

from pydantic import BaseModel
from datetime import date


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
