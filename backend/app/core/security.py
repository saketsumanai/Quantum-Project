"""
Security utilities: JWT creation/verification + Firebase token verification.
"""
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from jose import JWTError, jwt
from passlib.context import CryptContext

# ─── Config ───────────────────────────────────────────────────────────────────
JWT_SECRET = os.getenv("SECRET_KEY", "change-me-in-production-quantum-leap-sih-2026")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24h

import hashlib
import secrets

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Securely hashes a password using PBKDF2-HMAC-SHA256 with 100,000 rounds and random salt."""
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()
    return f"{salt}${pwd_hash}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against stored salt$hash in constant time."""
    if not hashed_password or "$" not in hashed_password:
        return False
    try:
        salt, expected_hash = hashed_password.split("$", 1)
        actual_hash = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()
        return secrets.compare_digest(actual_hash, expected_hash)
    except Exception:
        return False

# ─── Internal JWT (returned to frontend after Firebase verification) ──────────

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Creates a signed internal JWT for session management."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates the internal JWT. Returns payload or None."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


# ─── Firebase ID Token Verification ──────────────────────────────────────────

def verify_firebase_token(firebase_id_token: str) -> Optional[Dict[str, Any]]:
    """
    Verifies a Firebase ID token using the Firebase Admin SDK.
    Returns decoded claims dict (uid, email, name, picture, etc.) or None.
    """
    try:
        import firebase_admin.auth as firebase_auth
        decoded = firebase_auth.verify_id_token(firebase_id_token)
        return decoded
    except Exception as exc:
        print(f"[Security] Firebase token verification failed: {exc}")
        return None


# ─── FastAPI Bearer Dependency ────────────────────────────────────────────────

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user_payload(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Optional[Dict[str, Any]]:
    """
    Optional auth dependency: returns JWT payload if token is present and valid.
    If no token is present, returns None (routes that call this can still function
    for anonymous users).
    """
    if credentials is None:
        return None
    payload = decode_access_token(credentials.credentials)
    return payload  # None if expired/invalid


def require_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Dict[str, Any]:
    """
    Strict auth dependency: raises 401 if no valid token present.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in with Google.",
        )
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token. Please sign in again.",
        )
    return payload
