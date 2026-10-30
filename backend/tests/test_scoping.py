import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.database import SessionLocal, User, Case, CaseParticipant

client = TestClient(app)

def get_token(email: str, persona: str) -> str:
    resp = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "NyayaDemo@2026",
        "persona": persona
    })
    assert resp.status_code == 200, f"Login failed for {email}: {resp.text}"
    return resp.json()["access_token"]

def test_advocate_isolation():
    token_adv1 = get_token("advocate1@nyayaflow.demo", "lawyer")
    token_adv2 = get_token("advocate2@nyayaflow.demo", "lawyer")

    # Get cases visible to advocate1
    r1 = client.get("/api/v1/cases", headers={"Authorization": f"Bearer {token_adv1}"})
    assert r1.status_code == 200
    adv1_cases = r1.json()
    assert len(adv1_cases) > 0
    adv1_case_ids = {c["id"] for c in adv1_cases}

    # Get cases visible to advocate2
    r2 = client.get("/api/v1/cases", headers={"Authorization": f"Bearer {token_adv2}"})
    assert r2.status_code == 200
    adv2_cases = r2.json()
    adv2_case_ids = {c["id"] for c in adv2_cases}

    # Advocate 2's cases should not overlap with Advocate 1's non-assigned cases
    # Advocate 1 attempting to read Advocate 2's specific case must return 404
    for c2_id in adv2_case_ids:
        if c2_id not in adv1_case_ids:
            resp = client.get(f"/api/v1/cases/{c2_id}", headers={"Authorization": f"Bearer {token_adv1}"})
            assert resp.status_code == 404, f"Advocate 1 accessed Advocate 2's case {c2_id}!"
            break

def test_police_isolation():
    token_io1 = get_token("io1@nyayaflow.demo", "police")
    token_io2 = get_token("io2@nyayaflow.demo", "police")

    r1 = client.get("/api/v1/cases", headers={"Authorization": f"Bearer {token_io1}"})
    assert r1.status_code == 200
    io1_case_ids = {c["id"] for c in r1.json()}

    r2 = client.get("/api/v1/cases", headers={"Authorization": f"Bearer {token_io2}"})
    assert r2.status_code == 200
    io2_case_ids = {c["id"] for c in r2.json()}

    for c2_id in io2_case_ids:
        if c2_id not in io1_case_ids:
            resp = client.get(f"/api/v1/cases/{c2_id}", headers={"Authorization": f"Bearer {token_io1}"})
            assert resp.status_code == 404, f"IO 1 accessed IO 2's case {c2_id}!"
            break

def test_citizen_isolation_and_cant_view_full_dossier():
    token_cit1 = get_token("citizen1@nyayaflow.demo", "citizen")
    token_cit2 = get_token("citizen2@nyayaflow.demo", "citizen")

    # Citizen accessing /cases should be 403 Forbidden (RBAC)
    r = client.get("/api/v1/cases", headers={"Authorization": f"Bearer {token_cit1}"})
    assert r.status_code == 403

    # Citizen accessing their public status
    r_status1 = client.get("/api/v1/me/cases", headers={"Authorization": f"Bearer {token_cit1}"})
    assert r_status1.status_code == 200
    cit1_cases = r_status1.json()

    r_status2 = client.get("/api/v1/me/cases", headers={"Authorization": f"Bearer {token_cit2}"})
    assert r_status2.status_code == 200
    cit2_cases = r_status2.json()

    cit1_case_numbers = {c["case_number"] for c in cit1_cases}
    cit2_case_numbers = {c["case_number"] for c in cit2_cases}
    # Check tenant boundary
    assert cit1_case_numbers.isdisjoint(cit2_case_numbers)

