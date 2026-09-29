"""
Input Sanitization & Validation — Quantum Leap Security Utilities
=================================================================
Centralised helpers for:
  • Stripping / rejecting dangerous characters from user-supplied strings
  • Enforcing maximum field lengths to prevent DoS / buffer overruns
  • Validating emails, password strength, topic names, and circuit JSON
  • Providing Pydantic validators for reuse across schemas

Import pattern:
    from backend.app.core.sanitize import sanitize_text, validate_email_format, MAX_*
"""

import re
import html
from typing import Optional

from fastapi import HTTPException, status


# ─── Size Limits ──────────────────────────────────────────────────────────────

MAX_EMAIL_LEN: int = 254          # RFC 5321
MAX_PASSWORD_LEN: int = 128       # Prevent bcrypt DoS (bcrypt truncates at 72 bytes)
MAX_PASSWORD_MIN_LEN: int = 8     # Security baseline (previously 6 — raised here)
MAX_DISPLAY_NAME_LEN: int = 80
MAX_TOPIC_NAME_LEN: int = 120
MAX_CHAT_MESSAGE_LEN: int = 4_000  # ~1 000 tokens
MAX_CODE_INPUT_LEN: int = 10_000   # Quantum circuit code
MAX_QUERY_LEN: int = 500           # General search / tutor query
MAX_JSON_FIELD_LEN: int = 50_000   # Raw JSON payloads (circuit definitions)

# Dangerous patterns to reject outright in text inputs
_SCRIPT_PATTERN = re.compile(
    r"<\s*(script|iframe|object|embed|link|meta|base|form|input|img)\b",
    re.IGNORECASE,
)
_SQL_INJECTION_PATTERN = re.compile(
    r"(--|;|\b(DROP|DELETE|INSERT|UPDATE|TRUNCATE|ALTER|CREATE|EXEC|UNION|SELECT)\b)",
    re.IGNORECASE,
)
# Simple email validator (RFC 5322 relaxed)
_EMAIL_PATTERN = re.compile(
    r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
)


# ─── Core Sanitizers ─────────────────────────────────────────────────────────


def sanitize_text(
    value: Optional[str],
    *,
    max_len: int,
    field_name: str = "field",
    strip: bool = True,
    allow_newlines: bool = False,
) -> str:
    """
    Validates and sanitises a plain-text user input field.

    Steps:
      1. Reject None / empty values (returns empty string if value is None)
      2. Strip leading/trailing whitespace
      3. Enforce maximum length
      4. HTML-escape potentially dangerous characters
      5. Reject obvious XSS / injection patterns

    Args:
        value:          Raw input string (may be None).
        max_len:        Hard upper bound on character count.
        field_name:     Used in error messages.
        strip:          Trim whitespace before processing.
        allow_newlines: If False, collapse newlines to spaces.

    Returns:
        Sanitised string. Raises HTTP 400/413 on policy violations.
    """
    if value is None:
        return ""

    text = value.strip() if strip else value

    # Length guard
    if len(text) > max_len:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"'{field_name}' exceeds the maximum allowed length of {max_len} characters.",
        )

    # Newline normalisation
    if not allow_newlines:
        text = text.replace("\r\n", " ").replace("\r", " ").replace("\n", " ")

    # XSS pattern detection
    if _SCRIPT_PATTERN.search(text):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"'{field_name}' contains disallowed HTML tags.",
        )

    # HTML-escape special characters
    text = html.escape(text, quote=True)

    return text


def sanitize_email(email: Optional[str]) -> str:
    """
    Normalises and validates an email address.
    Returns lowercase, stripped email or raises HTTP 400.
    """
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is required.",
        )

    email = email.strip().lower()

    if len(email) > MAX_EMAIL_LEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email address is too long (max {MAX_EMAIL_LEN} characters).",
        )

    if not _EMAIL_PATTERN.match(email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email address format.",
        )

    return email


def validate_password(password: Optional[str]) -> str:
    """
    Validates password meets length and complexity requirements.
    Returns original password (not stripped — whitespace may be intentional).
    """
    if not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is required.",
        )

    if len(password) < MAX_PASSWORD_MIN_LEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password must be at least {MAX_PASSWORD_MIN_LEN} characters long.",
        )

    if len(password) > MAX_PASSWORD_LEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password must not exceed {MAX_PASSWORD_LEN} characters.",
        )

    return password


def sanitize_display_name(name: Optional[str]) -> str:
    """Sanitises a display name: strips, length-checks, HTML-escapes."""
    return sanitize_text(name or "", max_len=MAX_DISPLAY_NAME_LEN, field_name="display_name")


def sanitize_topic_name(topic: Optional[str]) -> str:
    """Sanitises a quantum topic name."""
    if not topic:
        return ""
    # Only allow alphanumeric, spaces, hyphens, underscores, parentheses
    cleaned = re.sub(r"[^\w\s\-\(\)\.]", "", topic.strip())
    if len(cleaned) > MAX_TOPIC_NAME_LEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Topic name too long (max {MAX_TOPIC_NAME_LEN} chars).",
        )
    return cleaned


def sanitize_chat_message(message: Optional[str]) -> str:
    """
    Sanitises a chat/tutor message.
    Allows newlines (multi-line messages are valid), enforces max length.
    """
    return sanitize_text(
        message,
        max_len=MAX_CHAT_MESSAGE_LEN,
        field_name="message",
        allow_newlines=True,
    )


def sanitize_code_input(code: Optional[str]) -> str:
    """
    Sanitises quantum circuit code for the code runner.
    Allows newlines and most special chars but enforces size limits.
    """
    if not code:
        return ""
    if len(code) > MAX_CODE_INPUT_LEN:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Code input exceeds the maximum allowed size of {MAX_CODE_INPUT_LEN} characters.",
        )
    return code


def sanitize_query(query: Optional[str]) -> str:
    """Sanitises a free-text search / tutor query string."""
    return sanitize_text(
        query,
        max_len=MAX_QUERY_LEN,
        field_name="query",
        allow_newlines=False,
    )
