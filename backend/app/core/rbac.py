from enum import Enum
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.models.database import get_db, User
from app.core.security import decode_access_token
from app.core.permissions import has_permission, get_role_permissions
from app.services.audit import log_audit_action

class UserRole(str, Enum):
    JUDGE = "judge"
    CLERK = "clerk"
    LAWYER = "lawyer"
    POLICE = "police"
    CITIZEN = "citizen"
    ADMIN = "admin"
    AUDITOR = "auditor"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    AUTH-01/AUTH-04: Authenticate caller via signed JWT access token in memory.
    Rejects anonymous access with 401. Validates account status and lockout.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user_id = payload.get("user_id") or payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been disabled. Contact court administrator."
        )

    if user.locked_until:
        now = datetime.now(timezone.utc)
        locked_dt = user.locked_until.replace(tzinfo=timezone.utc) if user.locked_until.tzinfo is None else user.locked_until
        if locked_dt > now:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Account is temporarily locked due to consecutive failed attempts"
            )

    return user

def require_permission(perm: str):
    """
    RBAC-05 / RBAC-07: Enforces permission on endpoint.
    If unauthorized -> raises 403 Forbidden and audits access_denied.
    """
    def permission_checker(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ) -> User:
        if not has_permission(current_user.role, perm):
            # RBAC-07: Audit 403 as access_denied
            log_audit_action(
                db=db,
                actor_id=current_user.id,
                actor_name=current_user.name,
                action="access_denied",
                object_type="permission",
                object_id=perm,
                details={
                    "role": current_user.role,
                    "attempted_permission": perm
                }
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Role '{current_user.role}' lacks required permission '{perm}'"
            )
        return current_user
    return permission_checker

def require_roles(allowed_roles: List[UserRole]):
    """Role-based endpoint guard."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role = (current_user.role or "").lower()
        allowed_str = [r.value for r in allowed_roles]
        if user_role not in allowed_str and user_role != UserRole.ADMIN.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted for role '{user_role}'. Required roles: {allowed_str}"
            )
        return current_user
    return role_checker
