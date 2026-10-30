from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.models.database import get_db, Case, Document, TriageResult, Summary, User, Hearing
from app.schemas.schemas import CaseCreate, CaseOut, ReviewAction, CaseStatusPublic
from app.core.rbac import get_current_user, require_permission
from app.core.scope import visible_cases, get_scoped_case_or_404
from app.services.audit import log_audit_action
from app.agents.orchestrator import OrchestratorAgent

router = APIRouter(prefix="/cases", tags=["Cases & Cause List"])

@router.get("", response_model=List[CaseOut])
def list_cases(
    tier: Optional[str] = Query(None, description="Filter by triage tier: critical, high, normal, low"),
    status: Optional[str] = Query(None, description="Filter by status: pending, scheduled, disposed"),
    search: Optional[str] = Query(None, description="Search case number or title"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("case:list"))
):
    """
    DATA-02: Returns cases within caller's data scope:
    - Judge: court-scoped cases
    - Clerk: registry-scoped cases
    - Advocate / Police: only cases where they are participants
    """
    query = db.query(Case)
    query = visible_cases(query, current_user, db)
    
    if status:
        query = query.filter(Case.status == status)
    if search:
        query = query.filter(
            (Case.case_number.ilike(f"%{search}%")) | (Case.title.ilike(f"%{search}%"))
        )
    
    cases = query.all()
    results = []
    
    for c in cases:
        triage = db.query(TriageResult).filter(TriageResult.case_id == c.id).first()
        summary = db.query(Summary).filter(Summary.case_id == c.id, Summary.variant == "judge").first()
        t_score = triage.score if triage else None
        t_tier = triage.tier if triage else "unranked"
        t_review = triage.review_state if triage else "pending_review"
        s_review = summary.review_state if summary else "pending_review"
        
        if tier and t_tier != tier:
            continue

        doc_count = db.query(Document).filter(Document.case_id == c.id).count()
        results.append(CaseOut(
            id=c.id,
            case_number=c.case_number,
            title=c.title,
            court=c.court,
            court_id=c.court_id,
            courtroom=c.courtroom,
            case_type=c.case_type,
            status=c.status,
            filing_date=c.filing_date,
            custody_flag=c.custody_flag,
            custody_since=c.custody_since,
            statutory_deadline=c.statutory_deadline,
            max_sentence_months=c.max_sentence_months,
            vulnerable_party=c.vulnerable_party,
            vulnerability_reason=c.vulnerability_reason,
            complainant=c.complainant,
            accused=c.accused,
            triage_score=t_score,
            triage_tier=t_tier,
            triage_review_state=t_review,
            summary_review_state=s_review,
            document_count=doc_count
        ))

    # Sort prioritized cases: critical -> high -> normal -> low -> unranked, then by score desc
    tier_order = {"critical": 4, "high": 3, "normal": 2, "low": 1, "unranked": 0}
    results.sort(key=lambda x: (tier_order.get(x.triage_tier, 0), x.triage_score or 0), reverse=True)
    return results

@router.post("", response_model=CaseOut)
def create_case(
    payload: CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("case:create"))
):
    """Clerk registration of new case (DATA-01)."""
    existing = db.query(Case).filter(Case.case_number == payload.case_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Case number already exists")

    new_case = Case(
        case_number=payload.case_number,
        title=payload.title,
        court=payload.court,
        court_id=payload.court_id or "DL-PHC-CJM-01",
        courtroom=payload.courtroom or "Courtroom 3",
        case_type=payload.case_type,
        filing_date=payload.filing_date,
        custody_flag=payload.custody_flag,
        custody_since=payload.custody_since,
        statutory_deadline=payload.statutory_deadline,
        max_sentence_months=payload.max_sentence_months,
        first_time_offender=payload.first_time_offender,
        vulnerable_party=payload.vulnerable_party,
        vulnerability_reason=payload.vulnerability_reason,
        complainant=payload.complainant,
        accused=payload.accused,
        related_case_ids=payload.related_case_ids
    )
    db.add(new_case)
    db.commit()
    db.refresh(new_case)

    # Log action in tamper-evident audit trail
    log_audit_action(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="create_case",
        object_type="case",
        object_id=new_case.id,
        details={"case_number": new_case.case_number, "case_type": new_case.case_type}
    )

    return CaseOut(
        id=new_case.id,
        case_number=new_case.case_number,
        title=new_case.title,
        court=new_case.court,
        court_id=new_case.court_id,
        courtroom=new_case.courtroom,
        case_type=new_case.case_type,
        status=new_case.status,
        filing_date=new_case.filing_date,
        custody_flag=new_case.custody_flag,
        custody_since=new_case.custody_since,
        statutory_deadline=new_case.statutory_deadline,
        max_sentence_months=new_case.max_sentence_months,
        vulnerable_party=new_case.vulnerable_party,
        vulnerability_reason=new_case.vulnerability_reason,
        complainant=new_case.complainant,
        accused=new_case.accused,
        triage_score=None,
        triage_tier="unranked",
        triage_review_state="pending_review",
        summary_review_state="pending_review",
        document_count=0
    )

@router.get("/{id}")
def get_case_detail(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("case:read"))
):
    """
    DATA-02: Scoped Case Dossier lookup. Returns 404 for cases outside user's scope.
    """
    case = get_scoped_case_or_404(id, current_user, db)

    triage = db.query(TriageResult).filter(TriageResult.case_id == case.id).first()
    
    # Return variant appropriate for user's role
    variant = "lawyer" if current_user.role in ("lawyer", "police") else "judge"
    summary = db.query(Summary).filter(Summary.case_id == case.id, Summary.variant == variant).first()
    if not summary:
        summary = db.query(Summary).filter(Summary.case_id == case.id, Summary.variant == "judge").first()
        
    docs = db.query(Document).filter(Document.case_id == case.id).all()

    return {
        "case": {
            "id": case.id,
            "case_number": case.case_number,
            "title": case.title,
            "court": case.court,
            "court_id": case.court_id,
            "courtroom": case.courtroom,
            "case_type": case.case_type,
            "status": case.status,
            "filing_date": case.filing_date,
            "custody_flag": case.custody_flag,
            "custody_since": case.custody_since,
            "statutory_deadline": case.statutory_deadline,
            "max_sentence_months": case.max_sentence_months,
            "vulnerable_party": case.vulnerable_party,
            "vulnerability_reason": case.vulnerability_reason,
            "complainant": case.complainant,
            "accused": case.accused,
            "related_case_ids": case.related_case_ids
        },
        "triage": triage,
        "summary": summary,
        "documents": [
            {
                "id": d.id,
                "title": d.title,
                "doc_type": d.doc_type,
                "created_at": str(d.created_at),
                "versions": [{"id": v.id, "version_no": v.version_no, "file_name": v.file_name, "sha256": v.sha256} for v in d.versions]
            }
            for d in docs
        ]
    }

@router.post("/{id}/process")
def process_case(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("case:process"))
):
    """Triggers the multi-agent pipeline: OCR -> Redaction -> Intake -> Triage -> Summarisation -> Verification."""
    case = get_scoped_case_or_404(id, current_user, db)
    try:
        result = OrchestratorAgent.process_case_pipeline(
            db=db,
            case_id=case.id,
            actor_id=current_user.id,
            actor_name=current_user.name
        )
        return {"status": "success", "pipeline_results": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline processing failed: {str(e)}")

@router.post("/{id}/review")
def review_ai_output(
    id: str,
    action: ReviewAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("review:write"))
):
    """
    DATA-04: Human-in-the-loop review of AI outputs (triage and summaries).
    Allows Judge or Clerk to approve or reject outputs before publication.
    """
    case = get_scoped_case_or_404(id, current_user, db)
    now = datetime.now(timezone.utc)

    if action.review_state not in ("approved", "rejected", "pending_review"):
        raise HTTPException(status_code=400, detail="Invalid review state. Must be 'approved' or 'rejected'.")

    # Update triage review state
    triage = db.query(TriageResult).filter(TriageResult.case_id == case.id).first()
    if triage:
        triage.review_state = action.review_state
        triage.reviewed_by = current_user.name
        triage.reviewed_at = now
        triage.review_note = action.review_note

    # Update summaries review state
    summaries = db.query(Summary).filter(Summary.case_id == case.id).all()
    for s in summaries:
        s.review_state = action.review_state
        s.reviewed_by = current_user.name
        s.reviewed_at = now
        s.review_note = action.review_note

    db.commit()

    # Audit the review decision
    log_audit_action(
        db=db,
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="review_ai_output",
        object_type="case",
        object_id=case.id,
        details={
            "case_number": case.case_number,
            "decision": action.review_state,
            "note": action.review_note
        }
    )

    return {
        "status": "success",
        "case_id": case.id,
        "review_state": action.review_state,
        "reviewed_by": current_user.name
    }
