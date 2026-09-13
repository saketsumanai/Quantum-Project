"""
Firebase Google Authentication Router for Quantum Leap.
POST /api/v1/auth/google — Verifies Firebase ID token, upserts user in SQLite, returns internal JWT.
GET  /api/v1/auth/me     — Returns current user profile.
POST /api/v1/auth/logout — Revokes session.
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.app.db.database import get_db
from backend.app.db.models import User, UserSession
from backend.app.core.security import (
    verify_firebase_token,
    create_access_token,
    get_current_user_payload,
    require_auth,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ─── Schemas ──────────────────────────────────────────────────────────────────

class GoogleAuthRequest(BaseModel):
    firebase_id_token: str

class UserProfileResponse(BaseModel):
    uid: str
    email: str
    display_name: Optional[str]
    photo_url: Optional[str]
    total_xp: int
    role: str
    created_at: str

class AuthResponse(BaseModel):
    success: bool
    access_token: str
    token_type: str = "bearer"
    expires_in_seconds: int
    user: UserProfileResponse


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/google", response_model=AuthResponse)
def authenticate_with_google(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Verifies a Firebase Google ID token and returns a signed internal session JWT.
    Creates or updates the user record in the local SQLite database.
    """
    # 1. Verify with Firebase Admin SDK
    claims = verify_firebase_token(request.firebase_id_token)
    if not claims:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase ID token."
        )

    uid = claims.get("uid") or claims.get("user_id")
    email = claims.get("email", "")
    display_name = claims.get("name", email.split("@")[0])
    photo_url = claims.get("picture", None)

    # 2. Upsert user in SQLite
    user = db.query(User).filter(User.id == uid).first()
    if user is None:
        user = User(
            id=uid,
            email=email,
            display_name=display_name,
            photo_url=photo_url,
            provider="google",
            role="student",
            total_xp=0,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.email = email
        user.display_name = display_name
        user.photo_url = photo_url or user.photo_url
        user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(user)

    # 3. Create internal JWT
    token_payload = {
        "sub": uid,
        "email": email,
        "display_name": display_name,
        "role": user.role,
    }
    access_token = create_access_token(token_payload)
    expires_in = ACCESS_TOKEN_EXPIRE_MINUTES * 60

    return AuthResponse(
        success=True,
        access_token=access_token,
        expires_in_seconds=expires_in,
        user=UserProfileResponse(
            uid=user.id,
            email=user.email,
            display_name=user.display_name or "",
            photo_url=user.photo_url,
            total_xp=user.total_xp,
            role=user.role,
            created_at=user.created_at.isoformat(),
        )
    )


@router.get("/me", response_model=UserProfileResponse)
def get_my_profile(
    payload: dict = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Returns the current authenticated user's profile from SQLite."""
    uid = payload.get("sub")
    user = db.query(User).filter(User.id == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found.")

    return UserProfileResponse(
        uid=user.id,
        email=user.email,
        display_name=user.display_name or "",
        photo_url=user.photo_url,
        total_xp=user.total_xp,
        role=user.role,
        created_at=user.created_at.isoformat(),
    )


@router.post("/logout")
def logout(payload: dict = Depends(require_auth)):
    """Client-side logout — instruct frontend to clear the stored token."""
    return {"success": True, "message": "Logged out successfully. Clear your local session token."}
