from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db, Case, TriageResult
from app.schemas.schemas import TriageResponse, TriageOverrideRequest
from app.core.rbac import get_current_user_payload
from app.services.audit import log_audit_action

router = APIRouter(prefix="/cases", tags=["Triage"])

@router.get("/{id}/triage", response_model=TriageResponse)
def get_triage(
    id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_payload)
):
    case = db.query(Case).filter(Case.id == id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    triage = db.query(TriageResult).filter(TriageResult.case_id == case.id).first()
    if not triage:
        raise HTTPException(status_code=404, detail="Triage has not been run for this case")

    return TriageResponse(
        case_id=case.id,
        score=triage.score,
        tier=triage.tier,
        factors=triage.factors or [],
        reasons=triage.reasons or [],
        needs_human_review=triage.needs_human_review,
        overridden_by=triage.overridden_by,
        override_reason=triage.override_reason
    )

@router.post("/{id}/triage/override")
def override_triage(
    id: str,
    payload: TriageOverrideRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_payload)
):
    if not payload.reason.strip():
        raise HTTPException(status_code=400, detail="Mandatory justification reason required for judicial override")

    case = db.query(Case).filter(Case.id == id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    triage = db.query(TriageResult).filter(TriageResult.case_id == case.id).first()
    if not triage:
        raise HTTPException(status_code=404, detail="Triage record not found")

    old_tier = triage.tier
    triage.tier = payload.new_tier
    triage.overridden_by = current_user.get("name", "Court Clerk")
    triage.override_reason = payload.reason
    triage.needs_human_review = False
    db.commit()

    # Log human-in-the-loop override in append-only audit trail
    log_audit_action(
        db=db,
        actor_id=current_user.get("user_id", "clerk"),
        actor_name=current_user.get("name", "Court Clerk"),
        action="override_triage",
        object_type="triage",
        object_id=triage.id,
        details={
            "case_id": case.id,
            "case_number": case.case_number,
            "previous_tier": old_tier,
            "new_tier": payload.new_tier,
            "justification": payload.reason
        }
    )

    return {
        "status": "success",
        "message": f"Triage tier successfully overridden from '{old_tier}' to '{payload.new_tier}'.",
        "triage": {
            "tier": triage.tier,
            "score": triage.score,
            "overridden_by": triage.overridden_by,
            "override_reason": triage.override_reason
        }
    }

