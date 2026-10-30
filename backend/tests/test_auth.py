import re
import pytest
from fastapi import HTTPException
from starlette.requests import Request
from starlette.responses import Response

from app.models.database import SessionLocal, User
from app.schemas.schemas import UserLogin
from app.core.security import hash_password
from app.api.auth import login, refresh_session, logout

def test_login_success():
    db = SessionLocal()
    try:
        req = Request({"type": "http", "method": "POST", "path": "/api/v1/auth/login", "headers": []})
        resp = Response()
        creds = UserLogin(
            email="judge1@nyayaflow.demo",
            password="NyayaDemo@2026",
            persona="judge"
        )
        data = login(creds=creds, request=req, response=resp, db=db)
        assert "access_token" in data
        assert data["user"]["role"] == "judge"
        assert "nyayaflow_refresh" in resp.headers.get("set-cookie", "")
    finally:
        db.close()

def test_login_generic_error_on_bad_password():
    db = SessionLocal()
    try:
        req = Request({"type": "http", "method": "POST", "path": "/api/v1/auth/login", "headers": []})
        resp = Response()
        creds = UserLogin(
            email="judge1@nyayaflow.demo",
            password="WrongPassword@123",
            persona="judge"
        )
        with pytest.raises(HTTPException) as exc_info:
            login(creds=creds, request=req, response=resp, db=db)
        assert exc_info.value.status_code == 401
        assert "Invalid credentials" in exc_info.value.detail
    finally:
        db.close()

def test_login_generic_error_on_persona_mismatch():
    db = SessionLocal()
    try:
        req = Request({"type": "http", "method": "POST", "path": "/api/v1/auth/login", "headers": []})
        resp = Response()
        creds = UserLogin(
            email="judge1@nyayaflow.demo",
            password="NyayaDemo@2026",
            persona="citizen"
        )
        with pytest.raises(HTTPException) as exc_info:
            login(creds=creds, request=req, response=resp, db=db)
        assert exc_info.value.status_code == 401
        assert "Invalid credentials" in exc_info.value.detail
    finally:
        db.close()

def test_login_lockout_after_five_failed_attempts():
    db = SessionLocal()
    try:
        test_user = db.query(User).filter(User.email == "test_lockout@nyayaflow.demo").first()
        if not test_user:
            test_user = User(
                id="user-lockout-test",
                email="test_lockout@nyayaflow.demo",
                name="Lockout Target",
                password_hash=hash_password("CorrectPass@123"),
                role="clerk",
                failed_attempts=0
            )
            db.add(test_user)
            db.commit()
        else:
            test_user.failed_attempts = 0
            test_user.locked_until = None
            db.commit()

        # 5 consecutive failed attempts
        for _ in range(5):
            req = Request({"type": "http", "method": "POST", "path": "/api/v1/auth/login", "headers": []})
            resp = Response()
            creds = UserLogin(
                email="test_lockout@nyayaflow.demo",
                password="WrongPassword!",
                persona="clerk"
            )
            with pytest.raises(HTTPException) as exc_info:
                login(creds=creds, request=req, response=resp, db=db)
            assert exc_info.value.status_code == 401

        # 6th attempt with correct password should trigger lockout (429)
        req = Request({"type": "http", "method": "POST", "path": "/api/v1/auth/login", "headers": []})
        resp = Response()
        creds = UserLogin(
            email="test_lockout@nyayaflow.demo",
            password="CorrectPass@123",
            persona="clerk"
        )
        with pytest.raises(HTTPException) as exc_info:
            login(creds=creds, request=req, response=resp, db=db)
        assert exc_info.value.status_code == 429
        assert "Retry-After" in exc_info.value.headers
    finally:
        db.close()

def test_refresh_token_rotation():
    db = SessionLocal()
    try:
        req = Request({"type": "http", "method": "POST", "path": "/api/v1/auth/login", "headers": []})
        resp = Response()
        creds = UserLogin(
            email="clerk1@nyayaflow.demo",
            password="NyayaDemo@2026",
            persona="clerk"
        )
        login(creds=creds, request=req, response=resp, db=db)

        cookie_header = resp.headers.get("set-cookie", "")
        match = re.search(r"nyayaflow_refresh=([^;]+)", cookie_header)
        assert match is not None
        old_cookie = match.group(1)

        refresh_req = Request({"type": "http", "method": "POST", "path": "/api/v1/auth/refresh", "headers": []})
        refresh_resp = Response()
        refresh_data = refresh_session(
            request=refresh_req,
            response=refresh_resp,
            nyayaflow_refresh=old_cookie,
            db=db
        )
        assert "access_token" in refresh_data

        new_cookie_header = refresh_resp.headers.get("set-cookie", "")
        new_match = re.search(r"nyayaflow_refresh=([^;]+)", new_cookie_header)
        assert new_match is not None
        assert new_match.group(1) != old_cookie
    finally:
        db.close()

def test_logout_revokes_token():
    db = SessionLocal()
    try:
        req = Request({"type": "http", "method": "POST", "path": "/api/v1/auth/login", "headers": []})
        resp = Response()
        creds = UserLogin(
            email="clerk1@nyayaflow.demo",
            password="NyayaDemo@2026",
            persona="clerk"
        )
        login(creds=creds, request=req, response=resp, db=db)

        match = re.search(r"nyayaflow_refresh=([^;]+)", resp.headers.get("set-cookie", ""))
        assert match is not None
        raw_refresh = match.group(1)

        user = db.query(User).filter(User.email == "clerk1@nyayaflow.demo").first()
        logout_req = Request({"type": "http", "method": "POST", "path": "/api/v1/auth/logout", "headers": []})
        logout_resp = Response()
        logout_res = logout(
            request=logout_req,
            response=logout_resp,
            nyayaflow_refresh=raw_refresh,
            current_user=user,
            db=db
        )
        assert logout_res.status_code in (200, 204)

        with pytest.raises(HTTPException) as exc_info:
            refresh_session(
                request=logout_req,
                response=Response(),
                nyayaflow_refresh=raw_refresh,
                db=db
            )
        assert exc_info.value.status_code == 401
    finally:
        db.close()
