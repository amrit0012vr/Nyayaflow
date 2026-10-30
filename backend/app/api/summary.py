from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.models.database import get_db, Summary, User
from app.schemas.schemas import SummaryResponse
from app.core.rbac import get_current_user
from app.core.permissions import has_permission
from app.core.scope import get_scoped_case_or_404

router = APIRouter(prefix="/cases", tags=["Summarisation"])

@router.get("/{id}/summary", response_model=SummaryResponse)
def get_summary(
    id: str,
    variant: str = Query("judge", description="Summary variant: judge, lawyer, citizen"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    SUM-01 / DATA-04: Returns variant-appropriate summary brief.
    Enforces permission:
    - judge variant: requires summary:read:judge
    - lawyer variant: requires summary:read:lawyer
    - citizen variant: requires summary:read:citizen and must be approved by judge/clerk
    """
    case = get_scoped_case_or_404(id, current_user, db)

    # Permission check for requested variant
    perm_needed = f"summary:read:{variant}"
    if not has_permission(current_user.role, perm_needed):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: Role '{current_user.role}' lacks permission '{perm_needed}'"
        )

    summary = db.query(Summary).filter(Summary.case_id == case.id, Summary.variant == variant).first()
    if not summary:
        raise HTTPException(status_code=404, detail=f"Summary variant '{variant}' not found for this case")

    # DATA-04: Citizen variant is only accessible when approved
    if variant == "citizen" and summary.review_state != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Citizen brief is pending judicial approval and not yet published"
        )

    return SummaryResponse(
        case_id=case.id,
        variant=summary.variant,
        brief=summary.brief,
        timeline=summary.timeline or [],
        issues=summary.issues or [],
        positions=summary.positions or {},
        pending_deadlines=summary.pending_deadlines or [],
        citations_verified=summary.citations_verified,
        review_state=summary.review_state or "pending_review",
        reviewed_by=summary.reviewed_by,
        generated_by="rules" # or llm (AI-04)
    )
