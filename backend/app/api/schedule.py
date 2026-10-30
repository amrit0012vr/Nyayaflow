from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.models.database import get_db, Case, Hearing, TriageResult, User
from app.schemas.schemas import ScheduleResponse, ScheduleAcceptRequest
from app.core.rbac import require_permission
from app.core.scope import get_scoped_case_or_404, visible_cases
from app.agents.scheduling import SchedulingAgent
from app.services.audit import log_audit_action

router = APIRouter(prefix="/schedule", tags=["Court Scheduling"])

@router.post("/suggest", response_model=ScheduleResponse)
def suggest_schedule(
    case_id: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("schedule:suggest"))
):
    """
    SCH-01 / SCH-02: Generates conflict-free scheduling slots using CP-SAT constraint solver.
    """
    case = get_scoped_case_or_404(case_id, current_user, db)

    triage = db.query(TriageResult).filter(TriageResult.case_id == case.id).first()
    priority_score = triage.score if triage else 50

    existing_hearings = db.query(Hearing).filter(Hearing.status == "scheduled").all()
    suggestions_data = SchedulingAgent.suggest_slots(case, priority_score, existing_hearings)

    return ScheduleResponse(
        case_id=case.id,
        suggestions=suggestions_data["suggestions"],
        conflicts=suggestions_data["conflicts"],
        solver=suggestions_data.get("solver", "cp-sat")
    )

@router.post("/accept")
def accept_schedule(
    payload: ScheduleAcceptRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("schedule:accept"))
):
    """SCH-04: Confirms hearing slot and logs audited scheduling event."""
    case = get_scoped_case_or_404(payload.case_id, current_user, db)

    hearing = Hearing(
        case_id=case.id,
        slot_start=payload.slot_start,
        slot_end=payload.slot_end,
        courtroom=payload.courtroom,
        judge_id=payload.judge_id,
        status="scheduled"
    )
    db.add(hearing)
    case.status = "scheduled"
    db.commit()
    db.refresh(hearing)

    # Log schedule confirmation in audit chain
    log_audit_action(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="schedule_hearing",
        object_type="hearing",
        object_id=hearing.id,
        details={
            "case_id": case.id,
            "case_number": case.case_number,
            "slot_start": payload.slot_start,
            "courtroom": payload.courtroom,
            "judge": payload.judge_id
        }
    )

    return {
        "status": "success",
        "message": f"Hearing scheduled in {payload.courtroom} on {payload.slot_start[:10]}.",
        "hearing_id": hearing.id
    }

@router.get("/hearings")
def list_hearings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("hearing:read"))
):
    """Returns hearings scoped to cases visible to caller (Judge, Clerk, or Advocate)."""
    scoped_cases = visible_cases(db.query(Case), current_user, db).all()
    case_ids = {c.id for c in scoped_cases}

    hearings = db.query(Hearing).order_by(Hearing.slot_start.asc()).all()
    results = []
    for h in hearings:
        if current_user.role != "admin" and h.case_id not in case_ids:
            continue
        case = next((c for c in scoped_cases if c.id == h.case_id), None)
        results.append({
            "id": h.id,
            "case_id": h.case_id,
            "case_number": case.case_number if case else "N/A",
            "title": case.title if case else "N/A",
            "slot_start": h.slot_start,
            "slot_end": h.slot_end,
            "courtroom": h.courtroom,
            "judge_id": h.judge_id,
            "status": h.status
        })
    return results
