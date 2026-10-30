import sys
from pathlib import Path
from datetime import datetime, timezone, timedelta

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

from app.config import settings
from app.models.database import SessionLocal, ChatMessage, ChatSession

def purge_old_chats(retention_days: int = None):
    days = retention_days or settings.CHAT_RETENTION_DAYS
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    db = SessionLocal()
    try:
        deleted_msgs = db.query(ChatMessage).filter(ChatMessage.created_at < cutoff).delete()
        deleted_sessions = db.query(ChatSession).filter(ChatSession.created_at < cutoff).delete()
        db.commit()
        print(f"SEC-12: Purged {deleted_msgs} chat messages and {deleted_sessions} sessions older than {days} days.")
        return deleted_msgs
    finally:
        db.close()

if __name__ == "__main__":
    purge_old_chats()

