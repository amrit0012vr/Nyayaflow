from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.models.database import get_db, User
from app.schemas.schemas import UserAdminCreate, UserAdminUpdate
from app.core.rbac import require_permission
from app.core.security import hash_password, validate_password_policy
from app.services.audit import log_audit_action

router = APIRouter(prefix="/admin", tags=["System Administration"])

@router.get("/users")
def list_users(
    role: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_permission("users:manage"))
):
    """UI-09 / SEC-14: Administrative user list and search."""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if status_filter:
        query = query.filter(User.status == status_filter)
    if search:
        query = query.filter((User.name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%")))

    users = query.order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "org": u.org,
            "court": u.court,
            "registry": getattr(u, "court_registry", "Patiala House Courts Registry"),
            "status": u.status,
            "failed_attempts": u.failed_attempts,
            "last_login_at": str(u.last_login_at) if u.last_login_at else None,
            "created_at": str(u.created_at)
        }
        for u in users
    ]

@router.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserAdminCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_permission("users:manage"))
):
    """UI-09: Create new user with password policy check and audit trail."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Validate password policy
    is_valid, err_msg = validate_password_policy(payload.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=err_msg)

    pwd_hash = hash_password(payload.password)
    new_user = User(
        name=payload.name,
        email=payload.email,
        password_hash=pwd_hash,
        role=payload.role.lower(),
        org=payload.org,
        court=payload.court,
        court_registry=payload.registry,
        status="active"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # SEC-14: Audit user creation
    log_audit_action(
        db=db,
        actor_id=admin_user.id,
        actor_name=admin_user.name,
        action="admin_create_user",
        object_type="user",
        object_id=new_user.id,
        details={
            "created_email": new_user.email,
            "role": new_user.role,
            "org": new_user.org
        }
    )

    return {
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "role": new_user.role,
        "org": new_user.org,
        "court": new_user.court,
        "registry": new_user.registry,
        "status": new_user.status
    }

@router.patch("/users/{user_id}")
def update_user(
    user_id: str,
    payload: UserAdminUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_permission("users:manage"))
):
    """UI-09: Modify user status (active/disabled), role, court, or reset password."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    before_state = {
        "role": target_user.role,
        "status": target_user.status,
        "court": target_user.court,
        "registry": target_user.registry
    }

    if payload.status:
        target_user.status = payload.status
    if payload.role:
        target_user.role = payload.role.lower()
    if payload.court is not None:
        target_user.court = payload.court
    if payload.registry is not None:
        target_user.court_registry = payload.registry
    if payload.password:
        is_valid, err_msg = validate_password_policy(payload.password)
        if not is_valid:
            raise HTTPException(status_code=400, detail=err_msg)
        target_user.password_hash = hash_password(payload.password)
        target_user.failed_attempts = 0
        target_user.locked_until = None

    db.commit()

    after_state = {
        "role": target_user.role,
        "status": target_user.status,
        "court": target_user.court,
        "registry": target_user.registry,
        "password_reset": bool(payload.password)
    }

    # SEC-14: Audit before/after state without secrets
    log_audit_action(
        db=db,
        actor_id=admin_user.id,
        actor_name=admin_user.name,
        action="admin_update_user",
        object_type="user",
        object_id=target_user.id,
        details={
            "user_email": target_user.email,
            "before": before_state,
            "after": after_state
        }
    )

    return {
        "status": "success",
        "id": target_user.id,
        "email": target_user.email,
        "updated": after_state
    }
