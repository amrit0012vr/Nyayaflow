import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_citizen_public_schema_contract():
    resp = client.post("/api/v1/auth/login", json={
        "email": "citizen1@nyayaflow.demo",
        "password": "NyayaDemo@2026",
        "persona": "citizen"
    })
    assert resp.status_code == 200
    token = resp.json()["access_token"]

    r = client.get("/api/v1/me/cases", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    cases = r.json()
    assert len(cases) > 0

    for c in cases:
        # DATA-03: Strict isolation - Must NOT leak internal judicial metrics
        forbidden_fields = [
            "triage_score", "score", "triage_factors", "factors",
            "review_note", "internal_notes", "created_by", "encrypted_key_ref",
            "complainant", "accused"
        ]
        for field in forbidden_fields:
            assert field not in c, f"Citizen contract breached: field '{field}' leaked in citizen API response!"

        assert "case_number" in c
        assert "court" in c
        assert "stage_label" in c
        assert "status_explanation" in c
        assert "legal_aid_hint" in c
