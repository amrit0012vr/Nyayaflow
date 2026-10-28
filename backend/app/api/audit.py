from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Body
from sqlalchemy.orm import Session
from app.models.database import get_db, AuditLog
from app.schemas.schemas import AuditLogOut, AuditVerifyResponse
from app.core.rbac import get_current_user_payload
from app.services.audit import verify_audit_chain, simulate_tampering_for_demo

router = APIRouter(prefix="/audit", tags=["Audit & Integrity Chain"])

@router.get("", response_model=List[AuditLogOut])
def get_audit_logs(
    object_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_payload)
):
    query = db.query(AuditLog)
    if object_id:
        query = query.filter(AuditLog.object_id == object_id)
    if action:
        query = query.filter(AuditLog.action == action)
    
    entries = query.order_by(AuditLog.id.desc()).limit(limit).all()
    return [
        AuditLogOut(
            id=e.id,
            ts=e.ts,
            actor_id=e.actor_id,
            actor_name=e.actor_name,
            action=e.action,
            object_type=e.object_type,
            object_id=e.object_id,
            details=e.details or {},
            prev_hash=e.prev_hash,
            entry_hash=e.entry_hash
        )
        for e in entries
    ]

@router.post("/verify", response_model=AuditVerifyResponse)
def verify_chain(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_payload)
):
    """
    Verifies every cryptographic link and SHA-256 hash in the audit chain.
    Returns 100% verification pass or isolates the exact altered record.
    """
    res = verify_audit_chain(db)
    return AuditVerifyResponse(
        is_valid=res["is_valid"],
        total_entries_checked=res["total_entries_checked"],
        broken_at_id=res["broken_at_id"],
        message=res["message"]
    )

@router.post("/simulate-tamper")
def simulate_tamper(
    entry_id: int = Body(..., embed=True),
    fake_action: str = Body("unauthorized_evidence_tamper", embed=True),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_payload)
):
    """
    Interactive demonstration tool:
    Simulates a rogue database update. When the auditor clicks 'Verify Chain',
    NyayaFlow immediately flags the broken cryptographic hash.
    """
    res = simulate_tampering_for_demo(db, entry_id, fake_action)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error"))
    return res
