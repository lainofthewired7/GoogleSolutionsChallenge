"""JWT authentication utilities and in-memory user store.

This module provides password hashing, JWT token creation/verification,
and a temporary in-memory user store until the PostGIS database (Phase 1) is connected.
"""

import os
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from jose import JWTError, jwt
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# === Configuration ===
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))


# === Password hashing (direct bcrypt — passlib is incompatible with bcrypt>=5) ===

def hash_password(plain: str) -> str:
    """Hash a plaintext password with bcrypt."""
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


# === JWT tokens ===

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token.

    Args:
        data: Payload to encode (must include 'sub' key with user email).
        expires_delta: Custom expiration time; defaults to JWT_EXPIRE_MINUTES.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=JWT_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT access token.

    Returns:
        Decoded payload dict, or None if the token is invalid/expired.
    """
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError:
        logger.warning("Failed to decode JWT token.")
        return None


# === In-memory user store (placeholder until DB Phase 1 is done) ===

class UserRecord:
    """In-memory representation of a user."""

    def __init__(self, user_id: int, email: str, hashed_password: str,
                 display_name: str, auth_provider: str = "local"):
        self.id = user_id
        self.email = email
        self.hashed_password = hashed_password
        self.display_name = display_name
        self.auth_provider = auth_provider
        self.is_active = True
        self.created_at = datetime.now(timezone.utc).isoformat()


class WatchlistRecord:
    """In-memory representation of a watchlist item."""

    def __init__(self, item_id: int, user_id: int, market_code: str,
                 geo_code: str = "", geo_type: str = "msa"):
        self.id = item_id
        self.user_id = user_id
        self.market_code = market_code
        self.geo_code = geo_code
        self.geo_type = geo_type
        self.created_at = datetime.now(timezone.utc).isoformat()


# Stores: email → UserRecord
users_db: dict[str, UserRecord] = {}
_next_user_id = 1

# Stores: item_id → WatchlistRecord
watchlist_db: dict[int, WatchlistRecord] = {}
_next_watchlist_id = 1


def create_user(email: str, password: str, display_name: str) -> UserRecord:
    """Register a new user in the in-memory store."""
    global _next_user_id
    if email in users_db:
        raise ValueError("Email already registered")
    user = UserRecord(
        user_id=_next_user_id,
        email=email,
        hashed_password=hash_password(password),
        display_name=display_name,
    )
    users_db[email] = user
    _next_user_id += 1
    return user


def update_user(email: str, display_name: str) -> Optional[UserRecord]:
    """Update user profile."""
    user = users_db.get(email)
    if user:
        user.display_name = display_name
    return user


def create_or_get_oauth_user(email: str, display_name: str, provider: str) -> UserRecord:
    """Find an existing user by email, or create a new one for OAuth sign-in.

    For OAuth users, a random placeholder password is set (never used for login).
    If the user already exists, their auth_provider is updated.
    """
    global _next_user_id
    existing = users_db.get(email)
    if existing:
        existing.auth_provider = provider
        return existing
    import secrets
    user = UserRecord(
        user_id=_next_user_id,
        email=email,
        hashed_password=hash_password(secrets.token_hex(32)),
        display_name=display_name or email.split("@")[0],
        auth_provider=provider,
    )
    users_db[email] = user
    _next_user_id += 1
    return user


def get_user_by_email(email: str) -> Optional[UserRecord]:
    """Look up a user by email."""
    return users_db.get(email)


def authenticate_user(email: str, password: str) -> Optional[UserRecord]:
    """Verify credentials and return the user, or None."""
    user = get_user_by_email(email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def add_watchlist_item(user_id: int, market_code: str,
                       geo_code: str = "", geo_type: str = "msa") -> WatchlistRecord:
    """Add a market/geo to the user's watchlist."""
    global _next_watchlist_id
    item = WatchlistRecord(
        item_id=_next_watchlist_id,
        user_id=user_id,
        market_code=market_code,
        geo_code=geo_code,
        geo_type=geo_type,
    )
    watchlist_db[_next_watchlist_id] = item
    _next_watchlist_id += 1
    return item


def get_user_watchlist(user_id: int) -> list[WatchlistRecord]:
    """Get all watchlist items for a user."""
    return [w for w in watchlist_db.values() if w.user_id == user_id]


def remove_watchlist_item(item_id: int, user_id: int) -> bool:
    """Remove a watchlist item if it belongs to the user."""
    item = watchlist_db.get(item_id)
    if item and item.user_id == user_id:
        del watchlist_db[item_id]
        return True
    return False
