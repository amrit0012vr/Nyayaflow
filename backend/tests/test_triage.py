from datetime import datetime, timezone, timedelta
from app.models.database import Case
from app.agents.triage import TriageAgent

def test_triage_critical_custody_case():
    now = datetime.now(timezone.utc)
    case = Case(
        case_number="TEST/BAIL/001",
        title="Test Under-trial Bail Case",
        court="CJM Court",
        case_type="Bail Application",
        filing_date=(now - timedelta(days=380)).isoformat(), # Case pending for over a year
        custody_flag=True,
        custody_since=(now - timedelta(days=400)).isoformat(), # > 12 months custody
        statutory_deadline=(now + timedelta(days=5)).isoformat()
    )
    
    triage = TriageAgent.evaluate(case, {"custody_detected": True})
    assert triage["score"] >= 75
    assert triage["tier"] == "critical"
    assert any(f["name"] == "custody_duration" and f["points"] == 30 for f in triage["factors"])
    assert any(f["name"] == "limitation_deadline" and f["points"] == 20 for f in triage["factors"])

def test_triage_low_routine_case():
    now = datetime.now(timezone.utc)
    case = Case(
        case_number="TEST/MISC/002",
        title="Test Routine Inspection",
        court="District Court",
        case_type="Miscellaneous Administrative",
        filing_date=(now - timedelta(days=5)).isoformat(),
        custody_flag=False
    )
    
    triage = TriageAgent.evaluate(case, {})
    assert triage["score"] < 25
    assert triage["tier"] == "low"
