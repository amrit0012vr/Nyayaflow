import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

ROLE_CREDENTIALS = {
    "judge": ("judge1@nyayaflow.demo", "judge"),
    "clerk": ("clerk1@nyayaflow.demo", "clerk"),
    "lawyer": ("advocate1@nyayaflow.demo", "lawyer"),
    "police": ("io1@nyayaflow.demo", "police"),
    "citizen": ("citizen1@nyayaflow.demo", "citizen"),
    "auditor": ("auditor1@nyayaflow.demo", "auditor"),
    "admin": ("admin@nyayaflow.demo", "admin"),
}

@pytest.fixture(scope="module")
def tokens():
    tokens_map = {}
    for role, (email, persona) in ROLE_CREDENTIALS.items():
        res = client.post("/api/v1/auth/login", json={
            "email": email,
            "password": "NyayaDemo@2026",
            "persona": persona
        })
        assert res.status_code == 200, f"Login failed for {role}: {res.text}"
        tokens_map[role] = res.json()["access_token"]
    return tokens_map

def test_admin_users_endpoint_matrix(tokens):
    # Only Admin can access /api/v1/admin/users
    for role, token in tokens.items():
        res = client.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {token}"})
        if role == "admin":
            assert res.status_code == 200
        else:
            assert res.status_code == 403, f"Role {role} was able to access /api/v1/admin/users"

def test_audit_logs_endpoint_matrix(tokens):
    # Only Auditor and Admin can access /api/v1/audit
    for role, token in tokens.items():
        res = client.get("/api/v1/audit", headers={"Authorization": f"Bearer {token}"})
        if role in ("auditor", "admin"):
            assert res.status_code == 200
        else:
            assert res.status_code == 403, f"Role {role} unexpectedly accessed /api/v1/audit"

def test_cases_list_endpoint_matrix(tokens):
    # Judge, Clerk, Lawyer, Police have case:list permission
    # Citizen, Auditor, Admin do not have case:list
    for role, token in tokens.items():
        res = client.get("/api/v1/cases", headers={"Authorization": f"Bearer {token}"})
        if role in ("judge", "clerk", "lawyer", "police"):
            assert res.status_code == 200
        else:
            assert res.status_code == 403

def test_unauthenticated_requests_fail():
    endpoints = [
        "/api/v1/cases",
        "/api/v1/audit",
        "/api/v1/admin/users",
        "/api/v1/me/cases"
    ]
    for ep in endpoints:
        res = client.get(ep)
        assert res.status_code == 401
