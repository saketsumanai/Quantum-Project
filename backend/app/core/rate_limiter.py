"""
Rate Limiting — Quantum Leap Backend Security Layer
====================================================
Provides a thread-safe, in-memory sliding-window rate limiter.

Auth endpoints:  5 attempts per 15 minutes per IP  (brute-force protection)
General API:    60 requests per 60 seconds per IP  (abuse protection)

Usage (FastAPI dependency):
    from backend.app.core.rate_limiter import auth_rate_limit, general_rate_limit

    @router.post("/login")
    def login(request: Request, _: None = Depends(auth_rate_limit)):
        ...
"""

import time
import threading
from collections import defaultdict, deque
from typing import Deque, Dict, Tuple

from fastapi import Depends, HTTPException, Request, status


# ─── Configuration ────────────────────────────────────────────────────────────

# Auth routes: max 5 attempts per 15 minutes
AUTH_MAX_REQUESTS: int = 5
AUTH_WINDOW_SECONDS: int = 15 * 60  # 900 seconds

# General API routes: max 60 requests per 60 seconds
GENERAL_MAX_REQUESTS: int = 60
GENERAL_WINDOW_SECONDS: int = 60


# ─── Sliding-Window Store ─────────────────────────────────────────────────────

class SlidingWindowLimiter:
    """
    Thread-safe in-memory sliding-window request counter.
    Each IP address maintains a deque of timestamps for the current window.
    """

    def __init__(self, max_requests: int, window_seconds: int) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._lock = threading.Lock()
        # ip -> deque of unix timestamps (float)
        self._store: Dict[str, Deque[float]] = defaultdict(deque)

    def is_allowed(self, ip: str) -> Tuple[bool, int]:
        """
        Returns (allowed: bool, retry_after_seconds: int).
        Prunes timestamps outside the current window before checking.
        """
        now = time.monotonic()
        cutoff = now - self.window_seconds

        with self._lock:
            dq = self._store[ip]

            # Remove expired timestamps
            while dq and dq[0] < cutoff:
                dq.popleft()

            if len(dq) >= self.max_requests:
                # Seconds until the oldest request expires from window
                retry_after = int(dq[0] - cutoff) + 1
                return False, retry_after

            dq.append(now)
            return True, 0

    def reset(self, ip: str) -> None:
        """Clears rate-limit state for an IP (e.g. after successful login)."""
        with self._lock:
            self._store.pop(ip, None)


# ─── Shared Limiter Instances ─────────────────────────────────────────────────

_auth_limiter = SlidingWindowLimiter(AUTH_MAX_REQUESTS, AUTH_WINDOW_SECONDS)
_general_limiter = SlidingWindowLimiter(GENERAL_MAX_REQUESTS, GENERAL_WINDOW_SECONDS)


# ─── IP Extraction Helper ─────────────────────────────────────────────────────

def _get_client_ip(request: Request) -> str:
    """
    Extracts the real client IP, honouring X-Forwarded-For (set by Vercel / Nginx).
    Falls back to the direct connection IP.
    """
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        # Take the first (leftmost) IP — the original client
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# ─── FastAPI Dependencies ─────────────────────────────────────────────────────

def auth_rate_limit(request: Request) -> None:
    """
    Dependency for auth endpoints.
    Enforces: max 5 attempts per 15 minutes per IP.
    Raises HTTP 429 with Retry-After header on violation.
    """
    ip = _get_client_ip(request)
    allowed, retry_after = _auth_limiter.is_allowed(ip)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Too many login attempts. "
                f"Please wait {retry_after} seconds before trying again."
            ),
            headers={"Retry-After": str(retry_after)},
        )


def general_rate_limit(request: Request) -> None:
    """
    Dependency for general API endpoints.
    Enforces: max 60 requests per 60 seconds per IP.
    Raises HTTP 429 with Retry-After header on violation.
    """
    ip = _get_client_ip(request)
    allowed, retry_after = _general_limiter.is_allowed(ip)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Rate limit exceeded. "
                f"Please wait {retry_after} seconds before making more requests."
            ),
            headers={"Retry-After": str(retry_after)},
        )


def reset_auth_limit_for_ip(ip: str) -> None:
    """
    Call this after a *successful* login to clear the auth rate-limit counter
    for the given IP, so legitimate users are not locked out after success.
    """
    _auth_limiter.reset(ip)
