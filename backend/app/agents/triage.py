from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List
import yaml
from app.models.database import Case

CONFIG_PATH = Path(__file__).resolve().parent / "triage_config.yaml"

def load_triage_config() -> Dict[str, Any]:
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                return yaml.safe_load(f) or {}
        except Exception:
            pass
    return {
        "tier_thresholds": {"critical": 75, "high": 50, "normal": 25, "low": 0},
        "weights": {
            "custody_max": 30,
            "deadline_max": 20,
            "case_age_max": 15,
            "vulnerable_party_max": 15,
            "matter_nature_max": 15,
            "stage_delay_max": 5
        }
    }

class TriageAgent:
    """
    Triage Agent (TRI-01, TRI-02, TRI-03):
    Evaluates urgency score (0-100) using transparent, explainable, and reproducible rule scoring
    augmented with verified document extractions.
    Excludes religion, caste, gender, political affiliation.
    """

    @classmethod
    def evaluate(cls, case: Case, extracted_facts: Dict[str, Any]) -> Dict[str, Any]:
        cfg = load_triage_config()
        weights = cfg.get("weights", {})
        thresholds = cfg.get("tier_thresholds", {"critical": 75, "high": 50, "normal": 25})

        factors: List[Dict[str, Any]] = []
        reasons: List[str] = []
        total_points = 0
        now = datetime.now(timezone.utc)

        # Factor 1: Custody Duration (TRI-02: fraction of max sentence heuristic or duration buckets)
        custody_max = weights.get("custody_max", 30)
        if case.custody_flag or extracted_facts.get("custody_detected"):
            pts = 15
            detail_msg = "Accused is in judicial custody (priority heuristic — legal review required)"

            # Check custody duration
            months_in_custody = 0
            if case.custody_since:
                try:
                    c_date = datetime.fromisoformat(case.custody_since.replace("Z", "+00:00"))
                    months_in_custody = max(1, int((now - c_date).days / 30))
                except Exception:
                    months_in_custody = 6

            # TRI-02: Check fraction of max sentence if max_sentence_months is available
            if getattr(case, "max_sentence_months", None) and case.max_sentence_months and case.max_sentence_months > 0:
                fraction = months_in_custody / case.max_sentence_months
                if fraction >= 0.5:
                    pts = custody_max
                    detail_msg = f"Incarceration {months_in_custody} mo >= 50% max sentence ({case.max_sentence_months} mo) — statutory bail priority heuristic (CrPC 436A / BNSS 479) — legal review required"
                elif fraction >= 0.33 and getattr(case, "first_time_offender", False):
                    pts = 25
                    detail_msg = f"First-time offender served {months_in_custody} mo >= 1/3 max sentence ({case.max_sentence_months} mo) under BNSS 479 priority heuristic — legal review required"
                elif fraction >= 0.25:
                    pts = 20
                    detail_msg = f"Incarceration {months_in_custody} mo >= 25% max sentence ({case.max_sentence_months} mo) priority heuristic — legal review required"
                else:
                    pts = 15
                    detail_msg = f"Under-trial in custody {months_in_custody} mo of {case.max_sentence_months} mo max sentence — priority heuristic — legal review required"
            elif months_in_custody > 0:
                if months_in_custody >= 12:
                    pts = custody_max
                    detail_msg = f"Under-trial accused in custody for {months_in_custody} months (priority heuristic — statutory bail review recommended)"
                elif months_in_custody >= 6:
                    pts = 24
                    detail_msg = f"Under-trial accused in custody for {months_in_custody} months (priority heuristic — legal review required)"
                else:
                    pts = 18
                    detail_msg = f"Accused in custody for {months_in_custody} months (priority heuristic — legal review required)"
            elif extracted_facts.get("custody_detail"):
                pts = 25
                detail_msg = f"{extracted_facts.get('custody_detail')} (priority heuristic — legal review required)"

            factors.append({
                "name": "custody_duration",
                "value": detail_msg,
                "points": min(pts, custody_max),
                "max_points": custody_max,
                "source": {"type": "custody_record", "detail": detail_msg}
            })
            reasons.append(detail_msg)
            total_points += min(pts, custody_max)

        # Factor 2: Limitation / Statutory Deadline Proximity
        deadline_max = weights.get("deadline_max", 20)
        if case.statutory_deadline:
            try:
                deadline = datetime.fromisoformat(case.statutory_deadline.replace("Z", "+00:00"))
                days_left = (deadline - now).days
                if days_left <= 7:
                    pts = deadline_max
                    msg = f"Statutory limitation deadline expires in {max(0, days_left)} days"
                elif days_left <= 15:
                    pts = 15
                    msg = f"Statutory deadline pending in {days_left} days"
                elif days_left <= 30:
                    pts = 10
                    msg = f"Statutory deadline within 30 days ({days_left} days left)"
                else:
                    pts = 4
                    msg = f"Statutory deadline: {days_left} days remaining"

                factors.append({
                    "name": "limitation_deadline",
                    "value": msg,
                    "points": min(pts, deadline_max),
                    "max_points": deadline_max,
                    "source": {"deadline": case.statutory_deadline}
                })
                reasons.append(msg)
                total_points += min(pts, deadline_max)
            except Exception:
                pass

        # Factor 3: Case Age
        age_max = weights.get("case_age_max", 15)
        try:
            f_date = datetime.fromisoformat(case.filing_date.replace("Z", "+00:00"))
            years = (now - f_date).days / 365.25
            if years >= 5.0:
                pts = age_max
                msg = f"Chronic case backlog: Pending for {years:.1f} years (> 5 years old)"
            elif years >= 3.0:
                pts = 12
                msg = f"Case pending for {years:.1f} years"
            elif years >= 1.0:
                pts = 8
                msg = f"Case pending for {years:.1f} years"
            else:
                pts = 3
                msg = "Recent filing (< 1 year old)"

            factors.append({
                "name": "case_age",
                "value": f"{years:.1f} years",
                "points": min(pts, age_max),
                "max_points": age_max,
                "source": {"filing_date": case.filing_date}
            })
            if years >= 3.0:
                reasons.append(msg)
            total_points += min(pts, age_max)
        except Exception:
            factors.append({
                "name": "case_age",
                "value": "Recent",
                "points": 4,
                "max_points": age_max
            })
            total_points += 4

        # Factor 4: Vulnerable Party (TRI-03: statutory categories only: age, minor, disability)
        vuln_max = weights.get("vulnerable_party_max", 15)
        if case.vulnerable_party:
            v_reason = case.vulnerability_reason or "Statutory vulnerable litigant (Senior Citizen / Minor / Disability)"
            pts = vuln_max
            factors.append({
                "name": "vulnerable_party",
                "value": v_reason,
                "points": pts,
                "max_points": vuln_max,
                "source": {"reason": v_reason}
            })
            reasons.append(f"Priority party protected: {v_reason}")
            total_points += pts

        # Factor 5: Nature of Matter
        matter_max = weights.get("matter_nature_max", 15)
        c_type = case.case_type.lower()
        if "habeas" in c_type:
            pts = matter_max
            msg = "Habeas Corpus (personal liberty of paramount urgency)"
        elif "bail" in c_type:
            pts = matter_max
            msg = "Bail Plea (time-critical right to personal liberty)"
        elif "interim" in c_type or "stay" in c_type or "maintenance" in c_type:
            pts = 12
            msg = f"{case.case_type} (Urgent interim relief requested)"
        elif "criminal" in c_type:
            pts = 9
            msg = "Criminal matter"
        else:
            pts = 5
            msg = f"Standard matter ({case.case_type})"

        factors.append({
            "name": "nature_of_matter",
            "value": msg,
            "points": min(pts, matter_max),
            "max_points": matter_max,
            "source": {"case_type": case.case_type}
        })
        if pts >= 12:
            reasons.append(msg)
        total_points += min(pts, matter_max)

        # Factor 6: Stage Delay
        stage_max = weights.get("stage_delay_max", 5)
        factors.append({
            "name": "stage_delay",
            "value": "No scheduled hearing progress in current session",
            "points": stage_max,
            "max_points": stage_max
        })
        total_points += stage_max

        final_score = min(100, total_points)

        # Determine Tier
        if final_score >= thresholds.get("critical", 75):
            tier = "critical"
        elif final_score >= thresholds.get("high", 50):
            tier = "high"
        elif final_score >= thresholds.get("normal", 25):
            tier = "normal"
        else:
            tier = "low"

        return {
            "case_id": case.id,
            "score": final_score,
            "tier": tier,
            "factors": factors,
            "reasons": reasons if reasons else ["Standard listing in routine course"],
            "needs_human_review": True
        }
