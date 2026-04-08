"""Authentication endpoints — register, login, profile, and OAuth2 social login."""

import os
from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from api.auth import (
    create_user, authenticate_user, create_access_token,
    create_or_get_oauth_user, update_user
)
from api.deps import get_current_user
from db.models import User
from api.schemas import UserCreate, UserUpdate, UserResponse, TokenResponse

router = APIRouter()

# === OAuth2 providers ===
oauth = OAuth()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Google
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
if GOOGLE_CLIENT_ID:
    oauth.register(
        name="google",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )

# GitHub
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
if GITHUB_CLIENT_ID:
    oauth.register(
        name="github",
        client_id=GITHUB_CLIENT_ID,
        client_secret=GITHUB_CLIENT_SECRET,
        authorize_url="https://github.com/login/oauth/authorize",
        access_token_url="https://github.com/login/oauth/access_token",
        api_base_url="https://api.github.com/",
        client_kwargs={"scope": "user:email"},
    )


# === Email / Password endpoints ===

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate):
    """Create a new user account."""
    try:
        user = create_user(
            email=data.email,
            password=data.password,
            display_name=data.display_name,
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    return UserResponse(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        is_active=user.is_active,
        created_at=user.created_at,
    )


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Authenticate a user and return a JWT access token."""
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(data={"sub": user.email})
    return TokenResponse(access_token=token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the authenticated user's profile."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        display_name=current_user.display_name,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
    )


@router.put("/update", response_model=UserResponse)
async def update_profile(data: UserUpdate, current_user: User = Depends(get_current_user)):
    """Update the authenticated user's profile."""
    user = update_user(current_user.email, data.display_name)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        is_active=user.is_active,
        created_at=user.created_at,
    )


# === Google OAuth ===

@router.get("/google")
async def google_login(request: Request):
    """Redirect to Google OAuth consent screen."""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Google OAuth not configured")
    redirect_uri = str(request.url_for("google_callback"))
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request):
    """Handle Google OAuth callback — exchange code, create/get user, redirect with JWT."""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Google OAuth not configured")
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get("userinfo")
        if not user_info:
            user_info = await oauth.google.userinfo(token=token)
    except Exception:
        return RedirectResponse(f"{FRONTEND_URL}/?auth_error=google_failed")

    email = user_info.get("email", "")
    name = user_info.get("name", "") or user_info.get("given_name", "")
    if not email:
        return RedirectResponse(f"{FRONTEND_URL}/?auth_error=no_email")

    user = create_or_get_oauth_user(email=email, display_name=name, provider="google")
    jwt_token = create_access_token(data={"sub": user.email})
    return RedirectResponse(f"{FRONTEND_URL}/?token={jwt_token}")


# === GitHub OAuth ===

@router.get("/github")
async def github_login(request: Request):
    """Redirect to GitHub OAuth consent screen."""
    if not GITHUB_CLIENT_ID:
        raise HTTPException(status_code=501, detail="GitHub OAuth not configured")
    redirect_uri = str(request.url_for("github_callback"))
    return await oauth.github.authorize_redirect(request, redirect_uri)


@router.get("/github/callback")
async def github_callback(request: Request):
    """Handle GitHub OAuth callback — exchange code, fetch user email, redirect with JWT."""
    if not GITHUB_CLIENT_ID:
        raise HTTPException(status_code=501, detail="GitHub OAuth not configured")
    try:
        token = await oauth.github.authorize_access_token(request)
        resp = await oauth.github.get("user", token=token)
        profile = resp.json()
    except Exception:
        return RedirectResponse(f"{FRONTEND_URL}/?auth_error=github_failed")

    email = profile.get("email", "")
    # GitHub may not return email in profile; fetch from /user/emails
    if not email:
        try:
            emails_resp = await oauth.github.get("user/emails", token=token)
            emails = emails_resp.json()
            primary = next((e for e in emails if e.get("primary")), None)
            email = primary["email"] if primary else ""
        except Exception:
            pass
    if not email:
        return RedirectResponse(f"{FRONTEND_URL}/?auth_error=no_email")

    name = profile.get("name", "") or profile.get("login", "")
    user = create_or_get_oauth_user(email=email, display_name=name, provider="github")
    jwt_token = create_access_token(data={"sub": user.email})
    return RedirectResponse(f"{FRONTEND_URL}/?token={jwt_token}")
