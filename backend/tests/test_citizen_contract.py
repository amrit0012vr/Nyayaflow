import pytest
from app.models.database import SessionLocal, User
from app.api.legal_aid import get_my_cases_public_status

def test_citizen_public_schema_contract():
    db = SessionLocal()
    try:
        cit = db.query(User).filter(User.role == "citizen").first()
        assert cit is not None, "Citizen user not found in database"
        cases = get_my_cases_public_status(db=db, current_user=cit)
        assert len(cases) > 0

        for c in cases:
            # DATA-03: Strict isolation - Must NOT leak internal judicial metrics
            c_dict = c.model_dump() if hasattr(c, "model_dump") else c.dict()
            forbidden_fields = [
                "triage_score", "score", "triage_factors", "factors",
                "review_note", "internal_notes", "created_by", "encrypted_key_ref",
                "complainant", "accused"
            ]
            for field in forbidden_fields:
                assert field not in c_dict, f"Citizen contract breached: field '{field}' leaked in citizen API response!"

            assert "case_number" in c_dict
            assert "court" in c_dict
            assert "stage_label" in c_dict
            assert "status_explanation" in c_dict
            assert "legal_aid_hint" in c_dict
    finally:
        db.close()
