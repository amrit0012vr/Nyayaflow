import hashlib
import os
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple
import jwt
from app.config import settings

COMMON_PASSWORDS = {
    "password", "password123", "admin12345", "qwerty12345", "welcome123",
    "1234567890", "letmein123", "courtadmin", "nyayaflow123", "justice2026"
}

def validate_password_policy(password: str) -> Tuple[bool, Optional[str]]:
    """AUTH-12: Min 10 chars, not in common weak passwords list."""
    if len(password) < 10:
        return False, "Password must be at least 10 characters long"
    if password.lower() in COMMON_PASSWORDS:
        return False, "Password is too common or easily guessable"
    return True, None

def hash_password(password: str, iterations: int = 600_000) -> str:
    """AUTH-12: PBKDF2-HMAC-SHA256 with >= 600,000 iterations and per-user salt."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return f"{iterations}${salt.hex()}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> Tuple[bool, bool]:
    """
    Verify plain password against PBKDF2 hashed password.
    Returns: (is_valid, needs_upgrade)
    Supports both legacy 100,000-iteration format and new 600,000 format.
    """
    try:
        parts = hashed_password.split("$")
        if len(parts) == 3:
            iter_count = int(parts[0])
            salt = bytes.fromhex(parts[1])
            expected_key = bytes.fromhex(parts[2])
        elif len(parts) == 2:
            iter_count = 100_000 # Legacy format
            salt = bytes.fromhex(parts[0])
            expected_key = bytes.fromhex(parts[1])
        else:
            return False, False
            
        actual_key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, iter_count)
        is_valid = hmac.compare_digest(expected_key, actual_key)
        needs_upgrade = is_valid and (iter_count < 600_000)
        return is_valid, needs_upgrade
    except Exception:
        return False, False

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """AUTH-04: Create a signed JWT access token expiring in <= 30 mins."""
    to_encode = data.copy()
    expire_minutes = min(settings.ACCESS_TOKEN_EXPIRE_MINUTES, 30)
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=expire_minutes))
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify a signed JWT access token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "access":
            return None
        return payload
    except Exception:
        return None

def generate_refresh_token() -> Tuple[str, str]:
    """Generate a high-entropy random refresh token and its SHA-256 hash."""
    raw_token = secrets.token_urlsafe(64)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    return raw_token, token_hash

def hash_refresh_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
