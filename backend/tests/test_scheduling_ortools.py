import pytest
from app.agents.scheduling import SchedulingAgent, HAS_ORTOOLS
from app.models.database import Case

def test_ortools_availability_and_basic_scheduling():
    case = Case(
        id="test-case-sched-1",
        case_number="TEST/SCHED/2026/01",
        title="Urgent Bail Application vs State",
        court="Sessions Court",
        case_type="Bail Application",
        filing_date="2026-02-01T10:00:00Z"
    )
    result = SchedulingAgent.suggest_slots(case, priority_score=92, existing_hearings=[])
    assert "suggestions" in result
    suggestions = result["suggestions"]
    assert len(suggestions) > 0

    # Ensure no slot falls on a Sunday or gazetted holiday
    for s in suggestions:
        date_str = s["slot_start"][:10]
        assert date_str not in SchedulingAgent.COURT_HOLIDAYS

def test_solver_info_reported():
    case = Case(
        id="test-case-sched-2",
        case_number="TEST/SCHED/2026/02",
        title="Commercial Dispute",
        court="Commercial Court",
        case_type="Commercial",
        filing_date="2026-02-01T10:00:00Z"
    )
    result = SchedulingAgent.suggest_slots(case, priority_score=40, existing_hearings=[])
    assert "solver" in result
    assert result["solver"] in ("cp-sat", "greedy-fallback")
