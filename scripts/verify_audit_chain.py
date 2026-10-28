import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.models.database import SessionLocal
from app.services.audit import verify_audit_chain

def main():
    print("==================================================")
    print(" NyayaFlow Cryptographic Audit Trail Verification ")
    print("==================================================")
    db = SessionLocal()
    try:
        result = verify_audit_chain(db)
        print(f"Total Entries Checked : {result['total_entries_checked']}")
        print(f"Chain Status           : {'VALID (Untampered)' if result['is_valid'] else 'COMPROMISED (Tampered)'}")
        print(f"Details                : {result['message']}")
        if not result["is_valid"]:
            print(f"Broken Entry ID        : #{result['broken_at_id']}")
            sys.exit(1)
        print("Cryptographic integrity confirmed across all actions.")
    finally:
        db.close()

if __name__ == "__main__":
    main()

