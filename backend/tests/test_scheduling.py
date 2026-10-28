from app.models.database import Case
from app.agents.scheduling import SchedulingAgent

def test_scheduling_excludes_holidays_and_weekends():
    case = Case(
        case_number="TEST/SCHED/001",
        title="Test Scheduling Case",
        court="Sessions Court",
        case_type="Criminal Trial",
        filing_date="2026-01-01T00:00:00Z"
    )
    res = SchedulingAgent.suggest_slots(case, priority_score=85, existing_hearings=[])
    suggestions = res["suggestions"]
    assert len(suggestions) > 0
    for s in suggestions:
        date_str = s["slot_start"][:10]
        assert date_str not in SchedulingAgent.COURT_HOLIDAYS
        assert s["score"] > 0

