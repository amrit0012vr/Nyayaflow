import pytest
from fastapi import HTTPException
from app.models.database import SessionLocal, User
from app.core.rbac import require_permission
from app.api.cases import list_cases, get_case_detail
from app.api.legal_aid import get_my_cases_public_status

def test_advocate_isolation():
    db = SessionLocal()
    try:
        adv1 = db.query(User).filter(User.email == "advocate1@nyayaflow.demo").first()
        adv2 = db.query(User).filter(User.email == "advocate2@nyayaflow.demo").first()
        assert adv1 and adv2

        # Get cases visible to advocate1
        adv1_cases = list_cases(tier=None, status=None, search=None, db=db, current_user=adv1)
        assert len(adv1_cases) > 0
        adv1_case_ids = {c.id for c in adv1_cases}

        # Get cases visible to advocate2
        adv2_cases = list_cases(tier=None, status=None, search=None, db=db, current_user=adv2)
        assert len(adv2_cases) > 0
        adv2_case_ids = {c.id for c in adv2_cases}

        # Advocate 2's cases should not overlap with Advocate 1's non-assigned cases
        # Advocate 1 attempting to read Advocate 2's specific case must return 404
        for c2_id in adv2_case_ids:
            if c2_id not in adv1_case_ids:
                with pytest.raises(HTTPException) as exc_info:
                    get_case_detail(id=c2_id, db=db, current_user=adv1)
                assert exc_info.value.status_code == 404, f"Advocate 1 accessed Advocate 2's case {c2_id}!"
                break
    finally:
        db.close()

def test_police_isolation():
    db = SessionLocal()
    try:
        io1 = db.query(User).filter(User.email == "io1@nyayaflow.demo").first()
        io2 = db.query(User).filter(User.email == "io2@nyayaflow.demo").first()
        assert io1 and io2

        io1_cases = list_cases(tier=None, status=None, search=None, db=db, current_user=io1)
        assert len(io1_cases) > 0
        io1_case_ids = {c.id for c in io1_cases}

        io2_cases = list_cases(tier=None, status=None, search=None, db=db, current_user=io2)
        assert len(io2_cases) > 0
        io2_case_ids = {c.id for c in io2_cases}

        for c2_id in io2_case_ids:
            if c2_id not in io1_case_ids:
                with pytest.raises(HTTPException) as exc_info:
                    get_case_detail(id=c2_id, db=db, current_user=io1)
                assert exc_info.value.status_code == 404, f"IO 1 accessed IO 2's case {c2_id}!"
                break
    finally:
        db.close()

def test_citizen_isolation_and_cant_view_full_dossier():
    db = SessionLocal()
    try:
        cit1 = db.query(User).filter(User.email == "citizen1@nyayaflow.demo").first()
        cit2 = db.query(User).filter(User.email == "citizen2@nyayaflow.demo").first()
        assert cit1 and cit2

        # Citizen accessing /cases should be 403 Forbidden (RBAC)
        with pytest.raises(HTTPException) as exc_info:
            require_permission("case:list")(current_user=cit1, db=db)
        assert exc_info.value.status_code == 403

        # Citizen accessing their public status
        cit1_cases = get_my_cases_public_status(db=db, current_user=cit1)
        cit2_cases = get_my_cases_public_status(db=db, current_user=cit2)

        cit1_case_numbers = {c.case_number for c in cit1_cases}
        cit2_case_numbers = {c.case_number for c in cit2_cases}
        # Check tenant boundary
        assert cit1_case_numbers.isdisjoint(cit2_case_numbers)
    finally:
        db.close()
