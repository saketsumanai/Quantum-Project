"""
Firebase Google Authentication Router for Quantum Leap.
POST /api/v1/auth/google — Verifies Firebase ID token, upserts user in SQLite, returns internal JWT.
GET  /api/v1/auth/me     — Returns current user profile.
POST /api/v1/auth/logout — Revokes session.
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import uuid

from backend.app.db.database import get_db
from backend.app.db.models import User, UserSession
from backend.app.core.security import (
    verify_firebase_token,
    create_access_token,
    get_current_user_payload,
    require_auth,
    hash_password,
    verify_password,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from backend.app.core.rate_limiter import auth_rate_limit, reset_auth_limit_for_ip
from backend.app.core.sanitize import (
    sanitize_email,
    validate_password,
    sanitize_display_name,
    sanitize_topic_name,
    sanitize_text,
    MAX_DISPLAY_NAME_LEN,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ─── Schemas ──────────────────────────────────────────────────────────────────

class GoogleAuthRequest(BaseModel):
    firebase_id_token: str

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    display_name: Optional[str] = None
    age: Optional[int] = None

class UpdateProfileRequest(BaseModel):
    display_name: Optional[str] = None
    age: Optional[int] = None
    topics_covered: Optional[str] = None

class TopicProgressRequest(BaseModel):
    topic: Optional[str] = None
    topic_name: Optional[str] = None
    lesson_id: Optional[str] = None
    progress_percent: Optional[float] = 100.0

class TestCountRequest(BaseModel):
    test_id: Optional[str] = None
    score_percentage: Optional[float] = None
    topic: Optional[str] = None

class UserProfileResponse(BaseModel):
    uid: str
    email: str
    display_name: Optional[str]
    photo_url: Optional[str]
    age: Optional[int] = None
    topics_covered: Optional[str] = "[]"
    tests_count: int = 0
    total_xp: int
    role: str
    created_at: str

class AuthResponse(BaseModel):
    success: bool
    access_token: str
    token_type: str = "bearer"
    expires_in_seconds: int
    user: UserProfileResponse


def _user_to_profile_response(user: User) -> UserProfileResponse:
    return UserProfileResponse(
        uid=user.id,
        email=user.email,
        display_name=user.display_name or "",
        photo_url=user.photo_url,
        age=user.age,
        topics_covered=user.topics_covered or "[]",
        tests_count=user.tests_count or 0,
        total_xp=user.total_xp or 0,
        role=user.role,
        created_at=user.created_at.isoformat() if user.created_at else datetime.utcnow().isoformat(),
    )


def _seed_demo_users_if_needed(db: Session):
    """Seed reliable demo accounts for immediate hackathon / review login."""
    demos = [
        {
            "email": "researcher@quantumleap.edu",
            "name": "Dr. Ananya Sharma",
            "password": "QuantumLeap#2026",
            "role": "researcher",
            "age": 29,
            "xp": 850,
            "topics": '["Superposition", "Entanglement", "Grover Search", "Quantum Teleportation", "Surface Codes"]',
            "tests": 8,
        },
        {
            "email": "student@quantumleap.edu",
            "name": "Arjun Patel",
            "password": "QuantumLeap#2026",
            "role": "student",
            "age": 21,
            "xp": 320,
            "topics": '["Superposition", "Entanglement", "Bell States"]',
            "tests": 3,
        }
    ]
    for d in demos:
        existing = db.query(User).filter(User.email == d["email"]).first()
        if not existing:
            u = User(
                id=f"demo_{uuid.uuid4().hex[:10]}",
                email=d["email"],
                display_name=d["name"],
                password_hash=hash_password(d["password"]),
                provider="email",
                role=d["role"],
                age=d["age"],
                topics_covered=d["topics"],
                tests_count=d["tests"],
                total_xp=d["xp"],
            )
            db.add(u)
            try:
                db.commit()
            except Exception:
                db.rollback()


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/login", response_model=AuthResponse)
def login_with_credentials(
    request: Request,
    req_body: LoginRequest,
    db: Session = Depends(get_db),
    _rl: None = Depends(auth_rate_limit),
):
    """
    Authenticates a user with email and password credentials.
    Returns a signed session JWT and user profile.
    Rate-limited: max 5 attempts per 15 minutes per IP.
    """
    _seed_demo_users_if_needed(db)

    # ── Sanitize & validate inputs ───────────────────────────────────────────
    email = sanitize_email(req_body.email)
    password = validate_password(req_body.password)

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials or register a new account."
        )

    # If user has a password_hash, verify it
    if user.password_hash:
        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )
    else:
        user.password_hash = hash_password(password)
        db.commit()

    user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(user)

    # Clear rate-limit counter for this IP after a successful login
    reset_auth_limit_for_ip(request.client.host if request.client else "unknown")

    token_payload = {
        "sub": user.id,
        "email": user.email,
        "display_name": user.display_name or user.email.split("@")[0],
        "role": user.role,
    }
    access_token = create_access_token(token_payload)
    expires_in = ACCESS_TOKEN_EXPIRE_MINUTES * 60

    return AuthResponse(
        success=True,
        access_token=access_token,
        token_type="bearer",
        expires_in_seconds=expires_in,
        user=_user_to_profile_response(user),
    )


@router.post("/register", response_model=AuthResponse)
def register_with_credentials(
    request: Request,
    req_body: RegisterRequest,
    db: Session = Depends(get_db),
    _rl: None = Depends(auth_rate_limit),
):
    """
    Registers a new student or researcher account with email, password, and optional age.
    Rate-limited: max 5 attempts per 15 minutes per IP.
    """
    # ── Sanitize & validate inputs ───────────────────────────────────────────
    email = sanitize_email(req_body.email)
    password = validate_password(req_body.password)
    raw_name = sanitize_display_name(req_body.display_name or "")
    display_name = raw_name or email.split("@")[0]

    # Validate age
    if req_body.age is not None and (req_body.age < 5 or req_body.age > 120):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Age must be between 5 and 120.",
        )

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please sign in instead."
        )

    user = User(
        id=f"usr_{uuid.uuid4().hex[:12]}",
        email=email,
        display_name=display_name,
        password_hash=hash_password(password),
        age=req_body.age,
        provider="email",
        role="student",
        topics_covered="[]",
        tests_count=0,
        total_xp=50,  # Welcome bonus XP
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token_payload = {
        "sub": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "role": user.role,
    }
    access_token = create_access_token(token_payload)
    expires_in = ACCESS_TOKEN_EXPIRE_MINUTES * 60

    return AuthResponse(
        success=True,
        access_token=access_token,
        token_type="bearer",
        expires_in_seconds=expires_in,
        user=_user_to_profile_response(user),
    )


@router.post("/google", response_model=AuthResponse)
def authenticate_with_google(
    request: Request,
    req_body: GoogleAuthRequest,
    db: Session = Depends(get_db),
    _rl: None = Depends(auth_rate_limit),
):
    """
    Verifies a Firebase Google ID token and returns a signed internal session JWT.
    Creates or updates the user record in the local SQLite database.
    Rate-limited: max 5 attempts per 15 minutes per IP.
    """
    # Validate token is not empty / suspiciously short
    token = (req_body.firebase_id_token or "").strip()
    if len(token) < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token format.",
        )

    claims = verify_firebase_token(token)
    if not claims:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase ID token."
        )

    uid = claims.get("uid") or claims.get("user_id")
    email = claims.get("email", "")
    raw_name = claims.get("name", email.split("@")[0])
    # Sanitize name coming from external token claims
    display_name = sanitize_display_name(raw_name)[:MAX_DISPLAY_NAME_LEN]
    photo_url = claims.get("picture", None)

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
            topics_covered="[]",
            tests_count=0,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.email = email
        user.display_name = display_name or user.display_name
        user.photo_url = photo_url or user.photo_url
        user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(user)

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
        user=_user_to_profile_response(user),
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

    return _user_to_profile_response(user)


@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    request: UpdateProfileRequest,
    payload: dict = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Updates user name, age, or topics covered in their profile."""
    uid = payload.get("sub")
    user = db.query(User).filter(User.id == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found.")

    if request.display_name is not None and request.display_name.strip():
        user.display_name = request.display_name.strip()
    if request.age is not None:
        user.age = request.age
    if request.topics_covered is not None:
        user.topics_covered = request.topics_covered

    db.commit()
    db.refresh(user)
    return _user_to_profile_response(user)


@router.post("/progress/topic", response_model=UserProfileResponse)
def record_topic_progress(
    request: TopicProgressRequest,
    payload: dict = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Records that a user has studied/covered a quantum topic."""
    import json
    uid = payload.get("sub")
    user = db.query(User).filter(User.id == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    try:
        current_topics = json.loads(user.topics_covered or "[]")
    except Exception:
        current_topics = []

    target_topic = (request.topic or request.topic_name or "").strip()
    if target_topic and target_topic not in current_topics:
        current_topics.append(target_topic)
        user.topics_covered = json.dumps(current_topics)
        user.total_xp = (user.total_xp or 0) + 30
        db.commit()
        db.refresh(user)

    return _user_to_profile_response(user)


@router.post("/progress/test", response_model=UserProfileResponse)
def record_test_completed(
    request: TestCountRequest,
    payload: dict = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Increments the count of diagnostic tests the user has taken."""
    uid = payload.get("sub")
    user = db.query(User).filter(User.id == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.tests_count = (user.tests_count or 0) + 1
    user.total_xp = (user.total_xp or 0) + 60
    db.commit()
    db.refresh(user)
    return _user_to_profile_response(user)


@router.post("/logout")
def logout(payload: dict = Depends(require_auth)):
    """Client-side logout — instruct frontend to clear the stored token."""
    return {"success": True, "message": "Logged out successfully. Clear your local session token."}

