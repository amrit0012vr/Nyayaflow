from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.models.database import get_db, Case, Summary
from app.schemas.schemas import SummaryResponse
from app.core.rbac import get_current_user_payload

router = APIRouter(prefix="/cases", tags=["Summarisation"])

@router.get("/{id}/summary", response_model=SummaryResponse)
def get_summary(
    id: str,
    variant: str = Query("judge", description="Summary variant: judge, lawyer, citizen"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_payload)
):
    case = db.query(Case).filter(Case.id == id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    summary = db.query(Summary).filter(Summary.case_id == case.id, Summary.variant == variant).first()
    if not summary:
        # Fallback to any existing variant
        summary = db.query(Summary).filter(Summary.case_id == case.id).first()

    if not summary:
        raise HTTPException(status_code=404, detail="Summary not generated yet for this case")

    return SummaryResponse(
        case_id=case.id,
        variant=summary.variant,
        brief=summary.brief,
        timeline=summary.timeline or [],
        issues=summary.issues or [],
        positions=summary.positions or {},
        pending_deadlines=summary.pending_deadlines or [],
        citations_verified=summary.citations_verified
    )
