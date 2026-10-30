from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.database import get_db, TriageResult, User
from app.schemas.schemas import TriageResponse, TriageOverrideRequest
from app.core.rbac import require_permission
from app.core.scope import get_scoped_case_or_404
from app.services.audit import log_audit_action

router = APIRouter(prefix="/cases", tags=["Triage"])

@router.get("/{id}/triage", response_model=TriageResponse)
def get_triage(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("triage:read"))
):
    """DATA-02 / RBAC-01: Scoped triage record fetch."""
    case = get_scoped_case_or_404(id, current_user, db)

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
        review_state=triage.review_state or "pending_review",
        reviewed_by=triage.reviewed_by,
        overridden_by=triage.overridden_by,
        override_reason=triage.override_reason
    )

@router.post("/{id}/triage/override")
def override_triage(
    id: str,
    payload: TriageOverrideRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("triage:override"))
):
    """
    TRI-04: Human-in-the-loop override by Clerk.
    Requires justification reason of at least 10 chars, retains original score,
    and logs immutable audit event.
    """
    if len(payload.reason.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mandatory justification reason must be at least 10 characters long (TRI-04)"
        )

    case = get_scoped_case_or_404(id, current_user, db)

    triage = db.query(TriageResult).filter(TriageResult.case_id == case.id).first()
    if not triage:
        raise HTTPException(status_code=404, detail="Triage record not found")

    old_tier = triage.tier
    triage.tier = payload.new_tier.lower()
    triage.overridden_by = current_user.name
    triage.override_reason = payload.reason
    triage.needs_human_review = False
    db.commit()

    # Log override into audit ledger
    log_audit_action(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="override_triage",
        object_type="triage",
        object_id=str(triage.id),
        details={
            "case_number": case.case_number,
            "old_tier": old_tier,
            "new_tier": triage.tier,
            "reason": payload.reason
        }
    )

    return {
        "status": "success",
        "case_id": case.id,
        "old_tier": old_tier,
        "new_tier": triage.tier,
        "overridden_by": current_user.name,
        "override_reason": payload.reason
    }
