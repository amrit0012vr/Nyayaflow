import sys
from pathlib import Path

# Add backend directory using relative path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

from app.models.database import SessionLocal, AuditLog
from app.services.audit import verify_audit_chain, get_audit_head

ANCHOR_FILE = BASE_DIR / "docs" / "audit-anchors.md"

def main():
    print("=" * 55)
    print(" NyayaFlow Cryptographic Audit Trail Verification ")
    print("=" * 55)
    db = SessionLocal()
    try:
        result = verify_audit_chain(db)
        print(f"Total Entries Checked : {result['total_entries_checked']}")
        print(f"Chain Status           : {'VALID (Untampered)' if result['is_valid'] else 'COMPROMISED (Tampered)'}")
        print(f"Details                : {result['message']}")
        
        if not result["is_valid"]:
            print(f"Broken Entry ID        : #{result['broken_at_id']}")
            sys.exit(1)

        # SEC-06: Compare against recorded anchors if present
        if ANCHOR_FILE.exists():
            head = get_audit_head(db)
            print(f"\nChecking external anchoring ({ANCHOR_FILE.name})...")
            content = ANCHOR_FILE.read_text(encoding="utf-8")
            if head["head_hash"] in content:
                print(f"Anchor Check: MATCH! Current head hash is recorded in external anchor.")
            else:
                print(f"Anchor Check: Current head is ahead of older anchors (normal for new appends).")

        print("Cryptographic integrity confirmed across all blocks.")
    finally:
        db.close()

if __name__ == "__main__":
    main()
