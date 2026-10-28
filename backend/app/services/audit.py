from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.models.database import AuditLog
from app.core.hashing import compute_audit_entry_hash

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

def log_audit_action(
    db: Session,
    actor_id: str,
    actor_name: str,
    action: str,
    object_type: str,
    object_id: str,
    details: Optional[Dict[str, Any]] = None
) -> AuditLog:
    """
    Append an entry to the tamper-evident hash-chained audit log.
    Formula: entry_hash_n = SHA256( prev_hash_(n-1) || timestamp || actor_id || action || object_type || object_id || details_json )
    """
    latest_entry = db.query(AuditLog).order_by(AuditLog.id.desc()).first()
    prev_hash = latest_entry.entry_hash if latest_entry else GENESIS_HASH
    
    ts_iso = datetime.now(timezone.utc).isoformat()
    entry_hash = compute_audit_entry_hash(
        prev_hash=prev_hash,
        timestamp_iso=ts_iso,
        actor_id=actor_id,
        action=action,
        object_type=object_type,
        object_id=object_id,
        details=details or {}
    )
    
    audit_entry = AuditLog(
        ts=ts_iso,
        actor_id=actor_id,
        actor_name=actor_name,
        action=action,
        object_type=object_type,
        object_id=object_id,
        details=details or {},
        prev_hash=prev_hash,
        entry_hash=entry_hash
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry

def verify_audit_chain(db: Session) -> Dict[str, Any]:
    """
    Verify the cryptographic integrity of the audit log chain from Genesis to latest.
    Returns whether the chain is unbroken or reports the exact entry where tampering was detected.
    """
    entries: List[AuditLog] = db.query(AuditLog).order_by(AuditLog.id.asc()).all()
    if not entries:
        return {
            "is_valid": True,
            "total_entries_checked": 0,
            "broken_at_id": None,
            "message": "Audit log is empty. Chain is clean."
        }
    
    current_expected_prev = GENESIS_HASH
    for entry in entries:
        # Check linkage to previous entry
        if entry.prev_hash != current_expected_prev:
            return {
                "is_valid": False,
                "total_entries_checked": len(entries),
                "broken_at_id": entry.id,
                "message": f"Linkage broken at entry #{entry.id}: prev_hash does not match predecessor hash!"
            }
        
        # Recompute entry hash
        recomputed_hash = compute_audit_entry_hash(
            prev_hash=entry.prev_hash,
            timestamp_iso=entry.ts,
            actor_id=entry.actor_id,
            action=entry.action,
            object_type=entry.object_type,
            object_id=entry.object_id,
            details=entry.details or {}
        )
        
        if recomputed_hash != entry.entry_hash:
            return {
                "is_valid": False,
                "total_entries_checked": len(entries),
                "broken_at_id": entry.id,
                "message": f"Tampering detected at entry #{entry.id}! Payload does not match cryptographic hash."
            }
        
        current_expected_prev = entry.entry_hash

    return {
        "is_valid": True,
        "total_entries_checked": len(entries),
        "broken_at_id": None,
        "message": f"Cryptographic integrity verified! All {len(entries)} entries are untampered and chained."
    }

def simulate_tampering_for_demo(db: Session, entry_id: int, fake_action: str = "unauthorized_tampered_action") -> Dict[str, Any]:
    """
    Simulate an attacker altering a record in the database directly.
    Demonstrates that NyayaFlow's hash chain immediately catches the fraud.
    """
    entry = db.query(AuditLog).filter(AuditLog.id == entry_id).first()
    if not entry:
        return {"success": False, "error": f"Entry #{entry_id} not found"}
    
    # Intentionally corrupt the action without updating the cryptographic hash
    entry.action = fake_action
    db.commit()
    return {"success": True, "message": f"Corrupted entry #{entry_id} with fake action '{fake_action}'."}
