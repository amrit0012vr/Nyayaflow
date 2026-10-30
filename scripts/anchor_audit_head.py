import sys
from pathlib import Path
from datetime import datetime, timezone

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

from app.models.database import SessionLocal, AuditLog
from app.services.audit import get_audit_head

ANCHOR_FILE = BASE_DIR / "docs" / "audit-anchors.md"

def anchor_audit_head():
    db = SessionLocal()
    try:
        head = get_audit_head(db)
        ts_now = datetime.now(timezone.utc).isoformat()
        
        print("=" * 55)
        print("   NyayaFlow Audit Head Anchoring Tool (SEC-06)")
        print("=" * 55)
        print(f"Total Blocks Count : {head['block_count']}")
        print(f"Chain Head SHA-256 : {head['head_hash']}")
        print(f"Anchor Timestamp   : {ts_now}")
        
        # Append to docs/audit-anchors.md
        ANCHOR_FILE.parent.mkdir(parents=True, exist_ok=True)
        if not ANCHOR_FILE.exists():
            ANCHOR_FILE.write_text(
                "# NyayaFlow — Immutable Audit Head Anchors\n\n"
                "Periodic cryptographic anchors recorded externally to prevent tail truncation or chain rollback attacks.\n\n"
                "| Timestamp (UTC) | Height (Blocks) | Chain Head Hash (SHA-256) | Status |\n"
                "| :--- | :--- | :--- | :--- |\n",
                encoding="utf-8"
            )
            
        with open(ANCHOR_FILE, "a", encoding="utf-8") as f:
            f.write(f"| `{ts_now}` | {head['block_count']} | `{head['head_hash']}` | Anchored |\n")

        print(f"Successfully anchored chain head to {ANCHOR_FILE.relative_to(BASE_DIR)}")
        return head
    finally:
        db.close()

if __name__ == "__main__":
    anchor_audit_head()

