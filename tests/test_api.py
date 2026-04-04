"""API endpoint tests."""

import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


class TestHealthCheck:
    def test_health_endpoint(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


class TestMarketsAPI:
    def test_list_markets(self):
        response = client.get("/api/markets/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_get_austin_market(self):
        response = client.get("/api/markets/austin")
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == "austin"
        assert data["state"] == "TX"


class TestMetricsAPI:
    def test_get_rents(self):
        response = client.get("/api/metrics/rents?market=austin")
        assert response.status_code == 200

    def test_get_permits(self):
        response = client.get("/api/metrics/permits?market=austin")
        assert response.status_code == 200

    def test_get_vacancy(self):
        response = client.get("/api/metrics/vacancy?market=austin")
        assert response.status_code == 200

    def test_get_jobs(self):
        response = client.get("/api/metrics/jobs?market=austin")
        assert response.status_code == 200


class TestGeoJSONAPI:
    def test_get_boundaries(self):
        response = client.get("/api/geojson/boundaries?market=austin")
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "FeatureCollection"

    def test_get_heatmap(self):
        response = client.get("/api/geojson/heatmap?market=austin&metric=rent")
        assert response.status_code == 200
