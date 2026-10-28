from app.models.database import SessionLocal, AuditLog
from app.services.audit import log_audit_action, verify_audit_chain, simulate_tampering_for_demo

def test_audit_hash_chain_integrity():
    db = SessionLocal()
    try:
        # Check chain is valid
        res = verify_audit_chain(db)
        assert res["is_valid"] is True
        assert res["total_entries_checked"] > 0
    finally:
        db.close()

def test_tamper_detection_in_audit_chain():
    db = SessionLocal()
    try:
        entry = db.query(AuditLog).first()
        assert entry is not None
        
        # Tamper with action
        original_action = entry.action
        simulate_tampering_for_demo(db, entry.id, fake_action="MALICIOUS_UNAUTHORIZED_CHANGE")
        
        # Verify immediately detects tampering
        tamper_check = verify_audit_chain(db)
        assert tamper_check["is_valid"] is False
        assert tamper_check["broken_at_id"] == entry.id
        
        # Restore entry
        entry.action = original_action
        db.commit()
        
        # Confirm restored
        restored_check = verify_audit_chain(db)
        assert restored_check["is_valid"] is True
    finally:
        db.close()

