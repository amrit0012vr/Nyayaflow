import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.database import SessionLocal, User
from app.core.security import hash_password

client = TestClient(app)

def test_login_success():
    resp = client.post("/api/v1/auth/login", json={
        "email": "judge1@nyayaflow.demo",
        "password": "NyayaDemo@2026",
        "persona": "judge"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["role"] == "judge"
    assert "nyayaflow_refresh" in resp.cookies

def test_login_generic_error_on_bad_password():
    resp = client.post("/api/v1/auth/login", json={
        "email": "judge1@nyayaflow.demo",
        "password": "WrongPassword@123",
        "persona": "judge"
    })
    assert resp.status_code == 401
    assert "Invalid credentials" in resp.json()["detail"]

def test_login_generic_error_on_persona_mismatch():
    resp = client.post("/api/v1/auth/login", json={
        "email": "judge1@nyayaflow.demo",
        "password": "NyayaDemo@2026",
        "persona": "citizen"
    })
    assert resp.status_code == 401
    assert "Invalid credentials" in resp.json()["detail"]

def test_login_lockout_after_five_failed_attempts():
    db = SessionLocal()
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
    db.close()

    for _ in range(5):
        resp = client.post("/api/v1/auth/login", json={
            "email": "test_lockout@nyayaflow.demo",
            "password": "WrongPassword!",
            "persona": "clerk"
        })
        assert resp.status_code == 401

    resp = client.post("/api/v1/auth/login", json={
        "email": "test_lockout@nyayaflow.demo",
        "password": "CorrectPass@123",
        "persona": "clerk"
    })
    assert resp.status_code == 429
    assert "Retry-After" in resp.headers

def test_refresh_token_rotation():
    c = TestClient(app)
    login_resp = c.post("/api/v1/auth/login", json={
        "email": "clerk1@nyayaflow.demo",
        "password": "NyayaDemo@2026",
        "persona": "clerk"
    })
    assert login_resp.status_code == 200
    old_cookie = login_resp.cookies.get("nyayaflow_refresh")
    assert old_cookie is not None

    refresh_resp = c.post("/api/v1/auth/refresh")
    assert refresh_resp.status_code == 200
    data = refresh_resp.json()
    assert "access_token" in data
    new_cookie = refresh_resp.cookies.get("nyayaflow_refresh")
    assert new_cookie is not None
    assert new_cookie != old_cookie

def test_logout_revokes_token():
    c = TestClient(app)
    login_resp = c.post("/api/v1/auth/login", json={
        "email": "clerk1@nyayaflow.demo",
        "password": "NyayaDemo@2026",
        "persona": "clerk"
    })
    token = login_resp.json()["access_token"]

    logout_resp = c.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert logout_resp.status_code in (200, 204)

    refresh_after_logout = c.post("/api/v1/auth/refresh")
    assert refresh_after_logout.status_code == 401
