from enum import Enum
from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.security import decode_access_token

class UserRole(str, Enum):
    JUDGE = "judge"
    CLERK = "clerk"
    LAWYER = "lawyer"
    POLICE = "police"
    CITIZEN = "citizen"
    ADMIN = "admin"
    AUDITOR = "auditor"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_current_user_payload(token: Optional[str] = Depends(oauth2_scheme)) -> dict:
    if not token:
        # Default anonymous demo user if no token provided in demo mode
        return {"sub": "system-demo", "user_id": "demo-clerk-001", "name": "Registry Clerk", "role": "clerk", "org": "District Court"}
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

def require_roles(allowed_roles: List[UserRole]):
    def role_checker(current_user: dict = Depends(get_current_user_payload)) -> dict:
        user_role = current_user.get("role")
        if user_role not in [role.value for role in allowed_roles] and user_role != UserRole.ADMIN.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted for role '{user_role}'. Required roles: {[r.value for r in allowed_roles]}"
            )
        return current_user
    return role_checker
