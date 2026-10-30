import json
from pathlib import Path
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db, User
from app.core.rbac import require_permission
from app.services.audit import verify_audit_chain

router = APIRouter(prefix="/evaluation", tags=["Evaluation & Impact"])

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

@router.get("/summary")
def get_evaluation_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("evaluation:read"))
):
    """
    EVAL-01 / PIL-02 / PIL-04:
    Returns honest, computed metrics from ground truth datasets, pilot trial summaries,
    and official backlog statistics.
    """
    # 1. Backlog stats
    stats_path = BASE_DIR / "data" / "stats" / "backlog_stats.json"
    stats_data = {}
    if stats_path.exists():
        try:
            with open(stats_path, "r", encoding="utf-8") as f:
                stats_data = json.load(f)
        except Exception:
            pass

    # 2. Pilot study summary
    pilot_path = BASE_DIR / "data" / "pilot" / "summary.json"
    pilot_data = {
        "status": "not_collected",
        "method_description": "Field pilot observation data not yet collected."
    }
    if pilot_path.exists():
        try:
            with open(pilot_path, "r", encoding="utf-8") as f:
                pilot_data = json.load(f)
        except Exception:
            pass

    # 3. Model & Agent Benchmark results
    eval_path = BASE_DIR / "data" / "eval" / "results.json"
    benchmark_data = {}
    if eval_path.exists():
        try:
            with open(eval_path, "r", encoding="utf-8") as f:
                benchmark_data = json.load(f)
        except Exception:
            pass

    # 4. Live audit chain verification
    chain_status = verify_audit_chain(db)

    return {
        "backlog_statistics": stats_data.get("statistics", []),
        "pilot_summary": pilot_data,
        "benchmark_results": benchmark_data,
        "live_audit_integrity": chain_status
    }

