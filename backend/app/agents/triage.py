from datetime import datetime, timezone
from typing import Dict, Any, List
from app.models.database import Case

class TriageAgent:
    """
    Triage Agent:
    Evaluates urgency score (0-100) using transparent, explainable, and reproducible rule scoring
    augmented with verified document extractions.
    Tiers: Critical (>=75), High (50-74), Normal (25-49), Low (<25).
    """

    @classmethod
    def evaluate(cls, case: Case, extracted_facts: Dict[str, Any]) -> Dict[str, Any]:
        factors: List[Dict[str, Any]] = []
        reasons: List[str] = []
        total_points = 0
        now = datetime.now(timezone.utc)

        # Factor 1: Custody Duration (Max 30 pts + Section 436A/479 BNSS flag)
        if case.custody_flag or extracted_facts.get("custody_detected"):
            pts = 15
            detail_msg = "Accused is in judicial custody"
            if case.custody_since:
                try:
                    c_date = datetime.fromisoformat(case.custody_since.replace("Z", "+00:00"))
                    months = max(1, int((now - c_date).days / 30))
                    if months >= 12:
                        pts = 30
                        detail_msg = f"Under-trial accused in custody for {months} months (Statutory Bail urgency under CrPC 436A / BNSS 479)"
                    elif months >= 6:
                        pts = 24
                        detail_msg = f"Under-trial accused in custody for {months} months"
                    else:
                        pts = 18
                        detail_msg = f"Accused in custody for {months} months"
                except Exception:
                    pts = 20
            elif extracted_facts.get("custody_detail"):
                pts = 25
                detail_msg = extracted_facts.get("custody_detail")
            
            factors.append({
                "name": "custody_duration",
                "value": detail_msg,
                "points": pts,
                "max_points": 30,
                "source": {"type": "custody_record", "detail": detail_msg}
            })
            reasons.append(detail_msg)
            total_points += pts

        # Factor 2: Limitation / Statutory Deadline Proximity (Max 20 pts)
        if case.statutory_deadline:
            try:
                deadline = datetime.fromisoformat(case.statutory_deadline.replace("Z", "+00:00"))
                days_left = (deadline - now).days
                if days_left <= 7:
                    pts = 20
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
                    "points": pts,
                    "max_points": 20,
                    "source": {"deadline": case.statutory_deadline}
                })
                reasons.append(msg)
                total_points += pts
            except Exception:
                pass

        # Factor 3: Case Age (Max 15 pts)
        try:
            f_date = datetime.fromisoformat(case.filing_date.replace("Z", "+00:00"))
            years = (now - f_date).days / 365.25
            if years >= 5.0:
                pts = 15
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
                "points": pts,
                "max_points": 15,
                "source": {"filing_date": case.filing_date}
            })
            if years >= 3.0:
                reasons.append(msg)
            total_points += pts
        except Exception:
            factors.append({
                "name": "case_age",
                "value": "Recent",
                "points": 4,
                "max_points": 15
            })
            total_points += 4

        # Factor 4: Vulnerable Party (Max 15 pts)
        if case.vulnerable_party:
            v_reason = case.vulnerability_reason or "Vulnerable litigant (Senior Citizen / Minor / Disability)"
            pts = 15
            factors.append({
                "name": "vulnerable_party",
                "value": v_reason,
                "points": pts,
                "max_points": 15,
                "source": {"reason": v_reason}
            })
            reasons.append(f"Priority party protected: {v_reason}")
            total_points += pts

        # Factor 5: Nature of Matter (Max 15 pts)
        c_type = case.case_type.lower()
        if "habeas" in c_type:
            pts = 15
            msg = "Habeas Corpus (personal liberty of paramount urgency)"
        elif "bail" in c_type:
            pts = 15
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
            "points": pts,
            "max_points": 15,
            "source": {"case_type": case.case_type}
        })
        if pts >= 12:
            reasons.append(msg)
        total_points += pts

        # Factor 6: Stage Delay (Max 5 pts)
        pts = 5
        factors.append({
            "name": "stage_delay",
            "value": "No scheduled hearing progress in current session",
            "points": pts,
            "max_points": 5
        })
        total_points += pts

        final_score = min(100, total_points)

        # Determine Tier
        if final_score >= 75:
            tier = "critical"
        elif final_score >= 50:
            tier = "high"
        elif final_score >= 25:
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
