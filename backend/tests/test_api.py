from app.main import app, health_check
from app.models.database import SessionLocal, User
from app.api.cases import list_cases, get_case_detail
from app.api.triage import get_triage
from app.api.summary import get_summary
from app.api.audit import verify_chain
from app.api.legal_aid import check_eligibility, citizen_chat
from app.schemas.schemas import EligibilityCheckRequest, LegalAidChatRequest

def test_health_check_endpoint():
    res = health_check()
    assert res["status"] == "healthy"
    assert "Timely Justice" in res["track"]

def test_cases_list_returns_triaged_cases():
    db = SessionLocal()
    try:
        judge_user = db.query(User).filter(User.role == "judge").first()
        if not judge_user:
            judge_user = User(id="test-judge", email="judge@demo.in", role="judge", is_active=True)
        cases = list_cases(tier=None, status=None, search=None, db=db, current_user=judge_user)
        assert len(cases) >= 1
        assert cases[0].triage_tier in ["critical", "high", "medium", "standard"]
    finally:
        db.close()

def test_case_detail_and_triage_api():
    db = SessionLocal()
    try:
        judge_user = db.query(User).filter(User.role == "judge").first()
        cases = list_cases(tier=None, status=None, search=None, db=db, current_user=judge_user)
        c_id = cases[0].id
        detail = get_case_detail(id=c_id, db=db, current_user=judge_user)
        assert detail["case"]["id"] == c_id
        
        triage_res = get_triage(id=c_id, db=db, current_user=judge_user)
        assert triage_res.score > 0
        assert len(triage_res.factors) > 0
    finally:
        db.close()

def test_case_summary_variants_api():
    db = SessionLocal()
    try:
        judge_user = db.query(User).filter(User.role == "judge").first()
        cases = list_cases(tier=None, status=None, search=None, db=db, current_user=judge_user)
        c_id = cases[0].id
        judge_sum = get_summary(id=c_id, variant="judge", db=db, current_user=judge_user)
        assert len(judge_sum.brief) > 20
        assert judge_sum.citations_verified is True
    finally:
        db.close()

def test_audit_verify_api():
    db = SessionLocal()
    try:
        auditor_user = db.query(User).filter(User.role == "auditor").first()
        if not auditor_user:
            auditor_user = User(id="test-auditor", email="auditor@demo.in", role="auditor", is_active=True)
        v_res = verify_chain(db=db, current_user=auditor_user)
        assert v_res.is_valid is True
        assert v_res.total_entries_checked > 0
    finally:
        db.close()

def test_legal_aid_eligibility_api():
    req = EligibilityCheckRequest(annual_income=450000, in_custody=True)
    res = check_eligibility(req)
    assert res.is_eligible is True
    assert "Section 12" in (res.clause or res.legal_basis)

def test_legal_aid_chat_api():
    db = SessionLocal()
    try:
        req = LegalAidChatRequest(message="Can I get free legal aid lawyer?", language="en")
        res = citizen_chat(payload=req, db=db, user=None)
        assert "15100" in res.reply or "DLSA" in res.reply or "Free Legal Aid" in res.reply or "Legal Services" in res.reply
        assert res.disclaimer is not None
    finally:
        db.close()
