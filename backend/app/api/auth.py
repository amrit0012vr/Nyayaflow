import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, Cookie
from sqlalchemy.orm import Session
from app.models.database import get_db, User, RefreshToken
from app.schemas.schemas import UserLogin, TokenResponse, UserOut
from app.core.security import (
    verify_password, create_access_token, hash_password,
    generate_refresh_token, hash_refresh_token
)
from app.core.permissions import get_role_permissions
from app.core.rbac import get_current_user
from app.services.audit import log_audit_action

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(
    creds: UserLogin,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    AUTH-03 / AUTH-06: Authenticates user against credentials AND persona.
    Prevents brute force by locking account for 15 mins after 5 consecutive failures.
    Returns generic 401 with no user enumeration on mismatch.
    """
    now = datetime.now(timezone.utc)
    client_ip = request.client.host if request.client else "127.0.0.1"
    ua = request.headers.get("user-agent", "Unknown")

    user = db.query(User).filter(User.email == creds.email).first()

    # Check lockout
    if user and user.locked_until:
        locked_dt = user.locked_until.replace(tzinfo=timezone.utc) if user.locked_until.tzinfo is None else user.locked_until
        if locked_dt > now:
            retry_seconds = int((locked_dt - now).total_seconds())
            response.headers["Retry-After"] = str(max(retry_seconds, 1))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Account temporarily locked due to consecutive failed attempts. Retry in {retry_seconds}s.",
                headers={"Retry-After": str(max(retry_seconds, 1))}
            )

    # Validate credentials and role/persona
    is_valid = False
    needs_upgrade = False
    if user and user.status == "active":
        is_pwd_ok, needs_upgrade = verify_password(creds.password, user.password_hash)
        role_matches = (user.role.lower() == creds.persona.lower())
        # Admin can sign in if persona is admin
        if creds.persona.lower() == "admin" and user.role.lower() == "admin":
            role_matches = True
        is_valid = is_pwd_ok and role_matches

    if not is_valid:
        # Handle failure & brute-force counter
        if user:
            user.failed_attempts = (user.failed_attempts or 0) + 1
            if user.failed_attempts >= 5:
                user.locked_until = now + timedelta(minutes=15)
                log_audit_action(
                    db=db,
                    actor_id=user.id,
                    actor_name=user.name,
                    action="account_locked",
                    object_type="user",
                    object_id=user.id,
                    details={"ip": client_ip, "user_agent": ua, "reason": "5 consecutive failed logins"}
                )
            db.commit()

        # Audit failure (NO password in details)
        log_audit_action(
            db=db,
            actor_id="anonymous",
            actor_name="Anonymous Attempt",
            action="login_failure",
            object_type="auth",
            object_id=creds.email,
            details={"persona": creds.persona, "ip": client_ip, "user_agent": ua}
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials for the selected role",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Reset failure tracking & upgrade hash if legacy
    user.failed_attempts = 0
    user.locked_until = None
    user.last_login_at = now
    if needs_upgrade:
        user.password_hash = hash_password(creds.password)
    db.commit()

    # Create Access Token (30 mins)
    permissions = get_role_permissions(user.role)
    token_payload = {
        "sub": user.id,
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "org": user.org
    }
    access_token = create_access_token(token_payload)

    # Create Refresh Token & Session Family (AUTH-05)
    raw_refresh, token_hash = generate_refresh_token()
    family_id = str(uuid.uuid4())
    refresh_record = RefreshToken(
        user_id=user.id,
        token_hash=token_hash,
        family_id=family_id,
        expires_at=now + timedelta(days=7),
        revoked=False
    )
    db.add(refresh_record)
    db.commit()

    is_https = (
        request.url.scheme == "https"
        or request.headers.get("x-forwarded-proto") == "https"
    )

    # Deliver refresh token via HttpOnly Secure cookie
    # Over HTTPS (Render / production), samesite="none" & secure=True are required for cross-origin fetch
    response.set_cookie(
        key="nyayaflow_refresh",
        value=raw_refresh,
        httponly=True,
        samesite="none" if is_https else "lax",
        secure=is_https,
        max_age=7 * 24 * 3600
    )

    # Audit success
    log_audit_action(
        db=db,
        actor_id=user.id,
        actor_name=user.name,
        action="login_success",
        object_type="user",
        object_id=user.id,
        details={"role": user.role, "ip": client_ip, "user_agent": ua}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 1800,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "org": user.org,
            "court": user.court,
            "registry": getattr(user, "court_registry", "Patiala House Courts Registry"),
            "permissions": permissions
        }
    }

@router.post("/refresh", response_model=TokenResponse)
def refresh_session(
    request: Request,
    response: Response,
    nyayaflow_refresh: Optional[str] = Cookie(None),
    db: Session = Depends(get_db)
):
    """
    AUTH-05: Refresh access token with rotation and session family reuse detection.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    raw_token = nyayaflow_refresh or request.headers.get("x-refresh-token")
    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required"
        )

    t_hash = hash_refresh_token(raw_token)
    token_record = db.query(RefreshToken).filter(RefreshToken.token_hash == t_hash).first()

    now = datetime.now(timezone.utc)

    if not token_record:
        log_audit_action(
            db=db,
            actor_id="anonymous",
            actor_name="Unknown",
            action="token_refresh_failure",
            object_type="auth",
            object_id="unknown_token",
            details={"reason": "not_found", "ip": client_ip}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    # Reuse detection: if already revoked, revoke entire family!
    if token_record.revoked:
        db.query(RefreshToken).filter(RefreshToken.family_id == token_record.family_id).update({"revoked": True})
        db.commit()
        log_audit_action(
            db=db,
            actor_id=token_record.user_id,
            actor_name="System",
            action="token_refresh_failure",
            object_type="auth",
            object_id=token_record.family_id,
            details={"reason": "token_reuse_detected", "ip": client_ip}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token revoked due to reuse detection"
        )

    exp_dt = token_record.expires_at.replace(tzinfo=timezone.utc) if token_record.expires_at.tzinfo is None else token_record.expires_at
    if exp_dt < now:
        token_record.revoked = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired"
        )

    user = db.query(User).filter(User.id == token_record.user_id).first()
    if not user or user.status != "active":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account disabled")

    # Rotate: Revoke current token and issue next in family
    token_record.revoked = True

    new_raw_refresh, new_token_hash = generate_refresh_token()
    new_refresh = RefreshToken(
        user_id=user.id,
        token_hash=new_token_hash,
        family_id=token_record.family_id,
        expires_at=now + timedelta(days=7),
        revoked=False
    )
    db.add(new_refresh)
    db.commit()

    is_https = (
        request.url.scheme == "https"
        or request.headers.get("x-forwarded-proto") == "https"
    )

    # Set new cookie
    response.set_cookie(
        key="nyayaflow_refresh",
        value=new_raw_refresh,
        httponly=True,
        samesite="none" if is_https else "lax",
        secure=is_https,
        max_age=7 * 24 * 3600
    )

    permissions = get_role_permissions(user.role)
    token_payload = {
        "sub": user.id,
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "org": user.org
    }
    access_token = create_access_token(token_payload)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 1800,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "org": user.org,
            "court": user.court,
            "registry": getattr(user, "court_registry", "Patiala House Courts Registry"),
            "permissions": permissions
        }
    }

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    request: Request,
    response: Response,
    nyayaflow_refresh: Optional[str] = Cookie(None),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AUTH-05: Revoke refresh token and clear cookie.
    """
    raw_token = nyayaflow_refresh or request.headers.get("x-refresh-token")
    if raw_token:
        t_hash = hash_refresh_token(raw_token)
        token_record = db.query(RefreshToken).filter(RefreshToken.token_hash == t_hash).first()
        if token_record:
            token_record.revoked = True
            db.commit()

    is_https = (
        request.url.scheme == "https"
        or request.headers.get("x-forwarded-proto") == "https"
    )
    response.delete_cookie(
        "nyayaflow_refresh",
        samesite="none" if is_https else "lax",
        secure=is_https
    )

    if current_user:
        log_audit_action(
            db=db,
            actor_id=current_user.id,
            actor_name=current_user.name,
            action="logout",
            object_type="user",
            object_id=current_user.id,
            details={"ip": request.client.host if request.client else "127.0.0.1"}
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get("/me")
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """
    AUTH-04: Returns current authenticated user profile and permissions list.
    """
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "org": current_user.org,
        "court": current_user.court,
        "registry": getattr(current_user, "court_registry", "Patiala House Courts Registry"),
        "permissions": get_role_permissions(current_user.role)
    }
