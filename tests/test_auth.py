"""Authentication and watchlist endpoint tests."""

import pytest
from fastapi.testclient import TestClient
from api.main import app
from api.auth import users_db, watchlist_db

import api.auth as _auth_module

client = TestClient(app)


@pytest.fixture(autouse=True)
def clear_stores():
    """Clear in-memory stores between tests."""
    users_db.clear()
    watchlist_db.clear()
    _auth_module._next_user_id = 1
    _auth_module._next_watchlist_id = 1
    yield
    users_db.clear()
    watchlist_db.clear()
    _auth_module._next_user_id = 1
    _auth_module._next_watchlist_id = 1


def _register(email="test@example.com", password="testpass123", display_name="Test User"):
    """Helper: register a user."""
    return client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "display_name": display_name,
    })


def _login(email="test@example.com", password="testpass123"):
    """Helper: login and return the token."""
    resp = client.post("/api/auth/login", data={
        "username": email,
        "password": password,
    })
    return resp.json().get("access_token")


def _auth_header(token):
    """Helper: build Authorization header."""
    return {"Authorization": f"Bearer {token}"}


class TestRegister:
    def test_register_success(self):
        resp = _register()
        assert resp.status_code == 201
        data = resp.json()
        assert data["email"] == "test@example.com"
        assert data["display_name"] == "Test User"
        assert "id" in data

    def test_register_duplicate_email(self):
        _register()
        resp = _register()
        assert resp.status_code == 409


class TestLogin:
    def test_login_success(self):
        _register()
        resp = client.post("/api/auth/login", data={
            "username": "test@example.com",
            "password": "testpass123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self):
        _register()
        resp = client.post("/api/auth/login", data={
            "username": "test@example.com",
            "password": "wrongpass",
        })
        assert resp.status_code == 401

    def test_login_nonexistent_user(self):
        resp = client.post("/api/auth/login", data={
            "username": "nobody@example.com",
            "password": "testpass123",
        })
        assert resp.status_code == 401


class TestMe:
    def test_get_me_authenticated(self):
        _register()
        token = _login()
        resp = client.get("/api/auth/me", headers=_auth_header(token))
        assert resp.status_code == 200
        assert resp.json()["email"] == "test@example.com"

    def test_get_me_no_token(self):
        resp = client.get("/api/auth/me")
        assert resp.status_code == 401

    def test_get_me_invalid_token(self):
        resp = client.get("/api/auth/me", headers=_auth_header("invalid.token.here"))
        assert resp.status_code == 401


class TestWatchlist:
    def test_add_to_watchlist(self):
        _register()
        token = _login()
        resp = client.post(
            "/api/watchlist/",
            json={"market_code": "austin", "geo_type": "msa"},
            headers=_auth_header(token),
        )
        assert resp.status_code == 201
        assert resp.json()["market_code"] == "austin"

    def test_list_watchlist(self):
        _register()
        token = _login()
        h = _auth_header(token)
        client.post("/api/watchlist/", json={"market_code": "austin"}, headers=h)
        client.post("/api/watchlist/", json={"market_code": "nashville"}, headers=h)
        resp = client.get("/api/watchlist/", headers=h)
        assert resp.status_code == 200
        assert len(resp.json()) == 2

    def test_delete_from_watchlist(self):
        _register()
        token = _login()
        h = _auth_header(token)
        add_resp = client.post("/api/watchlist/", json={"market_code": "austin"}, headers=h)
        item_id = add_resp.json()["id"]
        del_resp = client.delete(f"/api/watchlist/{item_id}", headers=h)
        assert del_resp.status_code == 204
        # Verify it's gone
        list_resp = client.get("/api/watchlist/", headers=h)
        assert len(list_resp.json()) == 0

    def test_watchlist_requires_auth(self):
        resp = client.get("/api/watchlist/")
        assert resp.status_code == 401
