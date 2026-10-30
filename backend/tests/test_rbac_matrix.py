import pytest
from fastapi import HTTPException
from app.models.database import SessionLocal, User
from app.core.rbac import require_permission, get_current_user
from app.api.cases import list_cases

ROLES = ["judge", "clerk", "lawyer", "police", "citizen", "auditor", "admin"]

def test_admin_users_endpoint_matrix():
    db = SessionLocal()
    try:
        check = require_permission("users:manage")
        for role in ROLES:
            u = db.query(User).filter(User.role == role).first()
            if role == "admin":
                res = check(current_user=u, db=db)
                assert res.id == u.id
            else:
                with pytest.raises(HTTPException) as exc_info:
                    check(current_user=u, db=db)
                assert exc_info.value.status_code == 403, f"Role {role} was able to access users:manage"
    finally:
        db.close()

def test_audit_logs_endpoint_matrix():
    db = SessionLocal()
    try:
        check = require_permission("audit:read")
        for role in ROLES:
            u = db.query(User).filter(User.role == role).first()
            if role in ("auditor", "admin"):
                res = check(current_user=u, db=db)
                assert res.id == u.id
            else:
                with pytest.raises(HTTPException) as exc_info:
                    check(current_user=u, db=db)
                assert exc_info.value.status_code == 403, f"Role {role} unexpectedly accessed audit:read"
    finally:
        db.close()

def test_cases_list_endpoint_matrix():
    # Judge, Clerk, Lawyer, Police have case:list permission
    # Citizen, Auditor, Admin do not have case:list
    db = SessionLocal()
    try:
        check = require_permission("case:list")
        for role in ROLES:
            u = db.query(User).filter(User.role == role).first()
            if role in ("judge", "clerk", "lawyer", "police"):
                valid_u = check(current_user=u, db=db)
                cases = list_cases(tier=None, status=None, search=None, db=db, current_user=valid_u)
                assert isinstance(cases, list)
            else:
                with pytest.raises(HTTPException) as exc_info:
                    check(current_user=u, db=db)
                assert exc_info.value.status_code == 403
    finally:
        db.close()

def test_unauthenticated_requests_fail():
    db = SessionLocal()
    try:
        with pytest.raises(HTTPException) as exc_info:
            get_current_user(token=None, db=db)
        assert exc_info.value.status_code == 401
    finally:
        db.close()
