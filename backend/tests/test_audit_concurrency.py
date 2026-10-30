import pytest
import concurrent.futures
from app.models.database import SessionLocal
from app.services.audit import log_audit_action, verify_audit_chain

def append_single_log(idx: int):
    db = SessionLocal()
    try:
        log_audit_action(
            db=db,
            actor_id="benchmark-runner",
            actor_name="Concurrency Tester",
            action="CONCURRENT_BENCHMARK",
            object_type="case",
            object_id=f"CONC-CASE-{idx}",
            details={"thread_index": idx}
        )
    finally:
        db.close()

def test_fifty_concurrent_audit_appends_preserve_chain():
    # Run 50 parallel appends
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(append_single_log, i) for i in range(50)]
        for f in concurrent.futures.as_completed(futures):
            f.result()

    # Verify that the entire chain remains 100% valid with zero hash breaks
    db = SessionLocal()
    try:
        verification = verify_audit_chain(db)
        assert verification["is_valid"] is True, f"Audit chain broke during concurrency: {verification}"
        assert verification["total_entries_checked"] >= 50
    finally:
        db.close()
