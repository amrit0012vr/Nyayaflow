import csv
import json
from pathlib import Path
from datetime import datetime, timezone

BASE_DIR = Path(__file__).resolve().parent.parent
CSV_PATH = BASE_DIR / "data" / "pilot" / "pilot_data.csv"
SUMMARY_PATH = BASE_DIR / "data" / "pilot" / "summary.json"
REPORT_MD_PATH = BASE_DIR / "docs" / "pilot-report.md"

def build_pilot_report():
    SUMMARY_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_MD_PATH.parent.mkdir(parents=True, exist_ok=True)

    rows = []
    if CSV_PATH.exists():
        with open(CSV_PATH, "r", encoding="utf-8") as f:
            reader = csv.DictReader((line for line in f if not line.startswith("#")))
            for r in reader:
                if r.get("tester_id") and r.get("manual_minutes"):
                    rows.append(r)

    if not rows:
        summary = {
            "status": "not_collected",
            "n_testers": 0,
            "n_tasks": 0,
            "method_description": "Field pilot observation data not yet collected. Run 30-minute pilot sessions following docs/pilot-protocol.md.",
            "date_range": "N/A",
            "as_of_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "metrics": {
                "avg_manual_minutes": None,
                "avg_tool_minutes": None,
                "time_saved_percent": None,
                "avg_omissions_found": None,
                "avg_usefulness": None,
                "avg_trust": None
            }
        }
        with open(SUMMARY_PATH, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2)

        md_content = f"""# NyayaFlow — Pilot Study & Field Evaluation Report

> **Status:** `Not Collected` (Truthful reporting per Hackathon Requirement PIL-02 & PIL-03)
> **As of Date:** {summary['as_of_date']}

## 1. Summary of Field Observations
No empirical field trial data has been recorded in `data/pilot/pilot_data.csv` yet.

To conduct a controlled 30-minute user study:
1. Follow protocol outlined in [`docs/pilot-protocol.md`](./pilot-protocol.md).
2. Engage advocate or legal intern participants using synthetic court records only.
3. Record task times (manual vs tool-assisted) in `data/pilot/pilot_data.csv`.
4. Re-run `python scripts/build_pilot_report.py`.
"""
        with open(REPORT_MD_PATH, "w", encoding="utf-8") as f:
            f.write(md_content)
        print("Pilot report generated: status='not_collected'")
        return summary

    # If rows exist, compute empirical summary
    testers = set(r["tester_id"] for r in rows)
    manual_times = [float(r["manual_minutes"]) for r in rows]
    tool_times = [float(r["tool_minutes"]) for r in rows]
    omissions = [float(r["omissions_found"]) for r in rows]
    usefulness = [float(r["usefulness_1_to_5"]) for r in rows]
    trust = [float(r["trust_1_to_5"]) for r in rows]

    avg_manual = sum(manual_times) / len(manual_times)
    avg_tool = sum(tool_times) / len(tool_times)
    time_saved = ((avg_manual - avg_tool) / avg_manual) * 100 if avg_manual > 0 else 0

    summary = {
        "status": "real",
        "n_testers": len(testers),
        "n_tasks": len(rows),
        "method_description": "Controlled task-based trials comparing manual legal dossier scrutiny vs NyayaFlow AI assistance.",
        "date_range": f"{min(r['date'] for r in rows)} to {max(r['date'] for r in rows)}",
        "as_of_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "metrics": {
            "avg_manual_minutes": round(avg_manual, 1),
            "avg_tool_minutes": round(avg_tool, 1),
            "time_saved_percent": round(time_saved, 1),
            "avg_omissions_found": round(sum(omissions) / len(omissions), 2),
            "avg_usefulness": round(sum(usefulness) / len(usefulness), 2),
            "avg_trust": round(sum(trust) / len(trust), 2)
        }
    }

    with open(SUMMARY_PATH, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"Pilot report generated: {len(rows)} tasks across {len(testers)} testers.")
    return summary

if __name__ == "__main__":
    build_pilot_report()

