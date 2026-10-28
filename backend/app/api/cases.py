from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.models.database import get_db, Case, Document, TriageResult, Summary
from app.schemas.schemas import CaseCreate, CaseOut
from app.core.rbac import get_current_user_payload
from app.services.audit import log_audit_action
from app.agents.orchestrator import OrchestratorAgent

router = APIRouter(prefix="/cases", tags=["Cases & Cause List"])

@router.get("", response_model=List[CaseOut])
def list_cases(
    tier: Optional[str] = Query(None, description="Filter by triage tier: critical, high, normal, low"),
    status: Optional[str] = Query(None, description="Filter by status: pending, scheduled, disposed"),
    search: Optional[str] = Query(None, description="Search case number or title"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_payload)
):
    query = db.query(Case)
    
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
        t_score = triage.score if triage else None
        t_tier = triage.tier if triage else "unranked"
        
        if tier and t_tier != tier:
            continue

        doc_count = db.query(Document).filter(Document.case_id == c.id).count()
        results.append(CaseOut(
            id=c.id,
            case_number=c.case_number,
            title=c.title,
            court=c.court,
            case_type=c.case_type,
            status=c.status,
            filing_date=c.filing_date,
            custody_flag=c.custody_flag,
            custody_since=c.custody_since,
            statutory_deadline=c.statutory_deadline,
            vulnerable_party=c.vulnerable_party,
            vulnerability_reason=c.vulnerability_reason,
            complainant=c.complainant,
            accused=c.accused,
            triage_score=t_score,
            triage_tier=t_tier,
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
    current_user: dict = Depends(get_current_user_payload)
):
    existing = db.query(Case).filter(Case.case_number == payload.case_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Case number already exists")

    new_case = Case(
        case_number=payload.case_number,
        title=payload.title,
        court=payload.court,
        case_type=payload.case_type,
        filing_date=payload.filing_date,
        custody_flag=payload.custody_flag,
        custody_since=payload.custody_since,
        statutory_deadline=payload.statutory_deadline,
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
        actor_id=current_user.get("user_id", "clerk"),
        actor_name=current_user.get("name", "Registry Clerk"),
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
        case_type=new_case.case_type,
        status=new_case.status,
        filing_date=new_case.filing_date,
        custody_flag=new_case.custody_flag,
        custody_since=new_case.custody_since,
        statutory_deadline=new_case.statutory_deadline,
        vulnerable_party=new_case.vulnerable_party,
        vulnerability_reason=new_case.vulnerability_reason,
        complainant=new_case.complainant,
        accused=new_case.accused,
        triage_score=None,
        triage_tier="unranked",
        document_count=0
    )

@router.get("/{id}")
def get_case_detail(
    id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_payload)
):
    case = db.query(Case).filter(Case.id == id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    triage = db.query(TriageResult).filter(TriageResult.case_id == case.id).first()
    summary = db.query(Summary).filter(Summary.case_id == case.id, Summary.variant == "judge").first()
    docs = db.query(Document).filter(Document.case_id == case.id).all()

    return {
        "case": {
            "id": case.id,
            "case_number": case.case_number,
            "title": case.title,
            "court": case.court,
            "case_type": case.case_type,
            "status": case.status,
            "filing_date": case.filing_date,
            "custody_flag": case.custody_flag,
            "custody_since": case.custody_since,
            "statutory_deadline": case.statutory_deadline,
            "vulnerable_party": case.vulnerable_party,
            "vulnerability_reason": case.vulnerability_reason,
            "complainant": case.complainant,
            "accused": case.accused,
            "related_case_ids": case.related_case_ids
        },
        "triage": triage,
        "summary": summary,
        "documents": [{"id": d.id, "title": d.title, "doc_type": d.doc_type, "created_at": str(d.created_at)} for d in docs]
    }

@router.post("/{id}/process")
def process_case(
    id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_payload)
):
    """Triggers the full multi-agent pipeline: OCR -> Redaction -> Intake -> Triage -> Summarisation -> Verification."""
    try:
        result = OrchestratorAgent.process_case_pipeline(
            db=db,
            case_id=id,
            actor_id=current_user.get("user_id", "clerk"),
            actor_name=current_user.get("name", "User")
        )
        return {"status": "success", "pipeline_results": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline processing failed: {str(e)}")
