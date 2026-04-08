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


import secrets
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from db.models import User, WatchlistItem
from db.connection import SessionLocal

# ... (Keeping hash/jwt functions unchanged) ...

# === Database Helpers ===

def create_user(email: str, password: str, display_name: str) -> User:
    """Register a new user in the persistent database."""
    session = SessionLocal()
    try:
        user = User(
            email=email,
            hashed_password=hash_password(password),
            display_name=display_name,
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        return user
    except IntegrityError:
        session.rollback()
        raise ValueError("Email already registered")
    finally:
        session.close()


def update_user(email: str, display_name: str) -> Optional[User]:
    """Update user profile."""
    session = SessionLocal()
    try:
        user = session.query(User).filter(User.email == email).first()
        if user:
            user.display_name = display_name
            session.commit()
            session.refresh(user)
        return user
    finally:
        session.close()


def create_or_get_oauth_user(email: str, display_name: str, provider: str) -> User:
    """Find an existing user by email, or create a new one for OAuth sign-in."""
    session = SessionLocal()
    try:
        user = session.query(User).filter(User.email == email).first()
        if user:
            # We don't have a provider field in the current model, but we could add it
            # For now just return the user
            return user
        
        user = User(
            email=email,
            hashed_password=hash_password(secrets.token_hex(32)),
            display_name=display_name or email.split("@")[0],
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        return user
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_user_by_email(email: str) -> Optional[User]:
    """Look up a user by email."""
    session = SessionLocal()
    try:
        return session.query(User).filter(User.email == email).first()
    finally:
        session.close()


def authenticate_user(email: str, password: str) -> Optional[User]:
    """Verify credentials and return the user, or None."""
    user = get_user_by_email(email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def add_watchlist_item(user_id: int, market_code: str,
                       geo_code: str = "", geo_type: str = "msa") -> WatchlistItem:
    """Add a market/geo to the user's watchlist."""
    session = SessionLocal()
    try:
        item = WatchlistItem(
            user_id=user_id,
            market_code=market_code,
            geo_code=geo_code,
            geo_type=geo_type,
        )
        session.add(item)
        session.commit()
        session.refresh(item)
        return item
    finally:
        session.close()


def get_user_watchlist(user_id: int) -> list[WatchlistItem]:
    """Get all watchlist items for a user."""
    session = SessionLocal()
    try:
        return session.query(WatchlistItem).filter(WatchlistItem.user_id == user_id).all()
    finally:
        session.close()


def remove_watchlist_item(item_id: int, user_id: int) -> bool:
    """Remove a watchlist item if it belongs to the user."""
    session = SessionLocal()
    try:
        item = session.query(WatchlistItem).filter(
            WatchlistItem.id == item_id,
            WatchlistItem.user_id == user_id
        ).first()
        if item:
            session.delete(item)
            session.commit()
            return True
        return False
    finally:
        session.close()
