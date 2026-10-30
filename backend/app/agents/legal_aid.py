from pathlib import Path
from typing import Dict, Any, List, Optional
import yaml
from app.models.database import Case

RULES_PATH = Path(__file__).resolve().parent.parent.parent.parent / "data" / "kb" / "section12_rules.yaml"

def load_section12_rules() -> Dict[str, Any]:
    if RULES_PATH.exists():
        try:
            with open(RULES_PATH, "r", encoding="utf-8") as f:
                return yaml.safe_load(f) or {}
        except Exception:
            pass
    return {
        "verified_on": "2026-10-25",
        "source_url": "https://nalsa.gov.in/acts-rules/the-legal-services-authorities-act-1987",
        "state_income_limits": {
            "Delhi": {"district_court": 300000, "high_court": 300000, "needs_verification": False},
            "default": {"limit": 300000, "needs_verification": True}
        }
    }

class LegalAidAgent:
    """
    Legal Aid Agent (LA-01 - LA-06):
    Multilingual citizen assistant empowering underrepresented litigants with plain-language guidance
    and automated Free Legal Aid eligibility assessment under the Legal Services Authorities Act, 1987 (Section 12).
    """

    DISCLAIMER = "Disclaimer: This automated guidance provides general legal literacy and procedural information under NALSA guidelines. It does not constitute formal legal advice. Never predict case outcomes or advise on pleas."

    RESPONSES = {
        "en": {
            "greeting": "Namaste! I am NyayaFlow's Legal Aid Assistant. How can I assist you with your case, court procedures, or free legal aid today?",
            "eligible": "Good news: You are eligible for 100% Free Legal Aid provided by the State Legal Services Authority (DLSA/SLSA). You do not need to pay any lawyer fees.",
            "not_eligible": "Based on standard criteria, you may exceed the annual income threshold for free court-appointed counsel in your forum. However, you can still access Lok Adalat, mediation, and legal counseling free of cost.",
            "urgent_safety": "EMERGENCY SAFETY ASSISTANCE:\nIf you are in immediate danger, facing violence, trafficking, or crisis:\n- National Emergency: 112\n- Women Helpline: 1091 / 181\n- Child Helpline: 1098\n- Anti-Human Trafficking: 15100 / Local Police\nPlease reach a safe location immediately.",
            "unknown": "I don't know the exact answer to this specific legal matter. Please contact your nearest District Legal Services Authority (DLSA) office or call the NALSA 24x7 Toll-Free Helpline at 15100 for verified official assistance.",
            "next_steps": [
                "1. Visit your local District Legal Services Authority (DLSA) office located in the court complex.",
                "2. Carry your identity proof (Aadhaar/Voter ID) and case documents.",
                "3. Alternatively, dial the National Legal Services Toll-Free Helpline: 15100 (24x7)."
            ],
            "helpline": "NALSA National Toll-Free Helpline: 15100 | Delhi State Legal Services: 1800-419-0234"
        },
        "hi": {
            "greeting": "नमस्ते! मैं न्यायफ्लो (NyayaFlow) का विधिक सहायता सहायक हूँ। मैं आपके मामले, अदालती प्रक्रिया या निःशुल्क कानूनी सहायता में आपकी क्या मदद कर सकता हूँ?",
            "eligible": "अच्छी खबर: आप विधिक सेवा प्राधिकरण अधिनियम (धारा 12) के तहत जिला विधिक सेवा प्राधिकरण (DLSA) द्वारा 100% निःशुल्क कानूनी सहायता (मुफ्त वकील) के पात्र हैं।",
            "not_eligible": "मानक आय सीमा के आधार पर आप निःशुल्क वकील के पात्र नहीं हो सकते हैं, लेकिन आप लोक अदालत, मध्यस्थता और कानूनी परामर्श सेवाओं का निःशुल्क उपयोग कर सकते हैं।",
            "urgent_safety": "आपातकालीन सुरक्षा सहायता:\nयदि आप खतरे, हिंसा या संकट में हैं:\n- राष्ट्रीय आपातकाल: 112\n- महिला हेल्पलाइन: 181 / 1091\n- चाइल्डलाइन: 1098\n- विधिक सहायता हेल्पलाइन: 15100",
            "unknown": "मुझे इस विशिष्ट कानूनी प्रश्न का सटीक उत्तर ज्ञात नहीं है। कृपया अपने निकटतम जिला विधिक सेवा प्राधिकरण (DLSA) से संपर्क करें या 24x7 टोल-फ्री हेल्पलाइन 15100 पर कॉल करें।",
            "next_steps": [
                "1. न्यायालय परिसर में स्थित अपने निकटतम जिला विधिक सेवा प्राधिकरण (DLSA) कार्यालय जाएं।",
                "2. अपना पहचान पत्र (आधार कार्ड) और मामले से संबंधित कागजात साथ ले जाएं।",
                "3. या सीधे राष्ट्रीय कानूनी सहायता टोल-फ्री नंबर 15100 पर 24 घंटे कभी भी कॉल करें।"
            ],
            "helpline": "राष्ट्रीय विधिक सेवा प्राधिकरण (NALSA) टोल-फ्री हेल्पलाइन: 15100"
        },
        "or": {
            "greeting": "ନମସ୍କାର! ମୁଁ ନ୍ୟାୟଫ୍ଲୋ ର ମାଗଣା ଆଇନ ସହାୟକ। ଆପଣଙ୍କ ମାମଲା ବା ମାଗଣା ଓକିଲ ସହାୟତା ବିଷୟରେ ମୁଁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?",
            "eligible": "ଆପଣ ଜିଲ୍ଲା ଆଇନ ସେବା ପ୍ରାଧିକରଣ (DLSA) ଅଧୀନରେ ୧୦୦% ମାଗଣା ଆଇନ ସହାୟତା ପାଇବାକୁ ଯୋଗ୍ୟ ଅଟନ୍ତି।",
            "not_eligible": "ଆପଣ ଲୋକ ଅଦାଲତ ଏବଂ ମଧ୍ୟସ୍ଥତା ସେବାର ସୁବିଧା ନେଇପାରିବେ।",
            "urgent_safety": "ଜରୁରୀକାଳୀନ ସୁରକ୍ଷା ସହାୟତା:\nଯଦି ଆପଣ ବିପଦରେ ଅଛନ୍ତି:\n- ଜରୁରୀକାଳୀନ: 112\n- ମହିଳା ହେଲ୍ପଲାଇନ୍: 181\n- ଶିଶୁ ହେଲ୍ପଲାଇନ୍: 1098\n- ଆଇନ ସହାୟତା: 15100",
            "unknown": "ମୋତେ ଏହି ବିଷୟରେ ନିର୍ଦ୍ଦିଷ୍ଟ ଉତ୍ତର ଜଣାନାହିଁ। ଦୟାକରି ନିକଟସ୍ଥ DLSA କାର୍ଯ୍ୟାଳୟ କିମ୍ବା ୧୫୧୦୦ (15100) କୁ କଲ୍ କରନ୍ତୁ।",
            "next_steps": [
                "1. ଆପଣଙ୍କ ସ୍ଥାନୀୟ ଜିଲ୍ଲା କୋର୍ଟ ପରିସରରେ ଥିବା DLSA କାର୍ଯ୍ୟାଳୟକୁ ଯାଆନ୍ତୁ।",
                "2. ଆଧାର କାର୍ଡ ଏବଂ କେସ କାଗଜପତ୍ର ସାଙ୍ଗରେ ନିଅନ୍ତୁ।",
                "3. ମାଗଣା ହେଲ୍ପଲାଇନ୍ ୧୫୧୦୦ (15100) କୁ କଲ୍ କରନ୍ତୁ।"
            ],
            "helpline": "ଜାତୀୟ ଆଇନ ସେବା ହେଲ୍ପଲାଇନ: 15100"
        }
    }

    @classmethod
    def evaluate_eligibility(cls, req: Any) -> Dict[str, Any]:
        """LA-01: Wrapper for EligibilityCheckRequest schema or kwargs."""
        if hasattr(req, "annual_income"):
            return cls.check_eligibility(
                annual_income=req.annual_income,
                state=getattr(req, "state", "Delhi"),
                court_level=getattr(req, "court_level", "district"),
                is_sc_st=getattr(req, "is_sc_st", False),
                is_victim_of_trafficking_or_begar=getattr(req, "is_victim_of_trafficking_or_begar", False),
                is_woman_or_child=getattr(req, "is_woman_or_child", False),
                has_disability_or_mental_illness=getattr(req, "has_disability_or_mental_illness", False),
                is_victim_of_disaster_or_ethnic_violence=getattr(req, "is_victim_of_disaster_or_ethnic_violence", False),
                is_industrial_workman=getattr(req, "is_industrial_workman", False),
                in_custody=getattr(req, "in_custody", False)
            )
        return cls.check_eligibility(**req)

    @classmethod
    def check_eligibility(
        cls,
        annual_income: float,
        state: str = "Delhi",
        court_level: str = "district",
        is_sc_st: bool = False, # 12(a)
        is_victim_of_trafficking_or_begar: bool = False, # 12(b)
        is_woman_or_child: bool = False, # 12(c)
        has_disability_or_mental_illness: bool = False, # 12(d)
        is_victim_of_disaster_or_ethnic_violence: bool = False, # 12(e)
        is_industrial_workman: bool = False, # 12(f)
        in_custody: bool = False # 12(g)
    ) -> Dict[str, Any]:
        """
        LA-01 / LA-02: Complete Section 12 criteria evaluation against official statutory clauses.
        """
        rules = load_section12_rules()
        state_limits = rules.get("state_income_limits", {})

        # Determine state limit
        limit_entry = state_limits.get(state, state_limits.get("default", {"limit": 300000, "needs_verification": True}))
        if court_level == "supreme_court":
            sc_entry = state_limits.get("Supreme Court", {"limit": 500000})
            limit_val = float(sc_entry.get("limit", 500000))
        elif court_level == "high_court":
            limit_val = float(limit_entry.get("high_court", limit_entry.get("limit", 300000)))
        else:
            limit_val = float(limit_entry.get("district_court", limit_entry.get("limit", 300000)))

        is_eligible = False
        clause = "None"
        scheme = "NALSA / State Legal Services Authority Free Legal Services Scheme"
        legal_basis = f"Legal Services Authorities Act, 1987 (Verified: {rules.get('verified_on', '2026-10-25')})"
        notes = "Statutory criteria applied per NALSA regulations."

        # Statutory exempt categories (a through g)
        if is_sc_st:
            is_eligible = True
            clause = "Section 12(a)"
            notes = "Scheduled Castes / Scheduled Tribes members are entitled to free legal aid irrespective of income."
        elif is_victim_of_trafficking_or_begar:
            is_eligible = True
            clause = "Section 12(b)"
            notes = "Victims of human trafficking or begar (Article 23) qualify for free legal aid regardless of income."
        elif is_woman_or_child:
            is_eligible = True
            clause = "Section 12(c)"
            notes = "Women and children are entitled to free legal aid regardless of financial status."
        elif has_disability_or_mental_illness:
            is_eligible = True
            clause = "Section 12(d)"
            notes = "Persons with disabilities (RPwD Act) or mental illness qualify for free legal aid."
        elif is_victim_of_disaster_or_ethnic_violence:
            is_eligible = True
            clause = "Section 12(e)"
            notes = "Victims of mass disasters, ethnic violence, flood, earthquake, or caste atrocity qualify."
        elif is_industrial_workman:
            is_eligible = True
            clause = "Section 12(f)"
            notes = "Industrial workmen under the Industrial Disputes Act qualify for free legal services."
        elif in_custody:
            is_eligible = True
            clause = "Section 12(g)"
            notes = "Under-trials and individuals in custody, juvenile homes, or psychiatric facilities qualify."
        elif annual_income <= limit_val:
            is_eligible = True
            clause = "Section 12(h)"
            notes = f"Annual income (₹{annual_income:,.0f}) is within the statutory ceiling of ₹{limit_val:,.0f} for {state} ({court_level})."
        else:
            is_eligible = False
            clause = "Section 12(h)"
            notes = f"Annual income (₹{annual_income:,.0f}) exceeds the statutory limit (₹{limit_val:,.0f}). Limits vary by State — confirm with your DLSA."

        return {
            "is_eligible": is_eligible,
            "clause": clause,
            "scheme": scheme,
            "legal_basis": legal_basis,
            "state_income_limit": limit_val,
            "notes": notes,
            "next_steps": cls.RESPONSES["en"]["next_steps"],
            "helpline": "NALSA Toll-Free 15100 / DLSA Helpdesk"
        }

    @classmethod
    def chat(
        cls,
        message: str,
        language: str = "en",
        case: Optional[Case] = None
    ) -> Dict[str, Any]:
        """
        LA-03, LA-04, LA-05: Grounded QA with urgent safety detection and safe refusal.
        """
        lang = language if language in cls.RESPONSES else "en"
        msg_lower = message.lower()
        t = cls.RESPONSES[lang]

        # LA-05: Urgent Safety Check
        safety_keywords = [
            "suicide", "kill myself", "harm myself", "domestic violence", "marpeet",
            "trafficking", "kidnap", "danger", "emergency", "beaten", "threat to life",
            "khudkushi", "aatmahatya", "sahayata emergency"
        ]
        if any(w in msg_lower for w in safety_keywords):
            return {
                "reply": t["urgent_safety"],
                "language": lang,
                "eligible_for_aid": True,
                "schemes_referred": ["Emergency Police Response 112", "NALSA Urgent Protective Custody"],
                "contact_info": {"emergency": "112", "women_helpline": "1091", "nalsa": "15100"},
                "disclaimer": cls.DISCLAIMER
            }

        schemes = ["NALSA Free Legal Aid", "DLSA Front Office Legal Representation", "Lok Adalat Dispute Resolution"]

        # Case status lookup
        if case and any(w in msg_lower for w in ["status", "case", "hearing", "date", "tarikh", "tariq"]):
            reply = (
                f"**Case Status for {case.case_number}** ({case.title}):\n"
                f"- Current Status: {case.status.upper()}\n"
                f"- Court: {case.court}\n"
                f"- Filed on: {case.filing_date[:10]}\n"
                f"- Custody Status: {'In Custody' if case.custody_flag else 'Bail / Regular'}\n\n"
                f"For further hearing dates or certified copies, contact your DLSA Legal Aid Defense Counsel or visit the Registry."
            )
            return {
                "reply": reply,
                "language": lang,
                "eligible_for_aid": None,
                "schemes_referred": schemes,
                "contact_info": {"nalsa_helpline": "15100"},
                "disclaimer": cls.DISCLAIMER
            }

        # Legal Aid Inquiry
        if any(w in msg_lower for w in ["aid", "lawyer", "free", "sahayata", "vakil", "vakeel", "madad", "section 12", "dhara 12", "eligib"]):
            reply = (
                f"{t['eligible']}\n\n"
                f"Under Section 12 of the Legal Services Authorities Act, 1987, you may receive a free court-appointed advocate.\n\n"
                f"**{ 'Next Steps' if lang == 'en' else 'अगले कदम' if lang == 'hi' else 'ପରବର୍ତ୍ତୀ ପଦକ୍ଷେପ' }:**\n"
                + "\n".join(t["next_steps"]) + f"\n\n**Helpline:** {t['helpline']}"
            )
            return {
                "reply": reply,
                "language": lang,
                "eligible_for_aid": True,
                "schemes_referred": schemes,
                "contact_info": {"nalsa_helpline": "15100", "portal": "https://nalsa.gov.in"},
                "disclaimer": cls.DISCLAIMER
            }

        # Bail / Under-trial inquiry
        if any(w in msg_lower for w in ["bail", "undertrial", "jail", "arrest", "custody", "jamaant", "jamanaat"]):
            reply = (
                f"Under Indian law (Article 21, Section 436A CrPC / Section 479 BNSS), every undertrial has a statutory right to timely bail consideration. "
                f"If you or your relative cannot afford counsel, the District Legal Services Authority (DLSA) will assign a Legal Aid Defense Counsel (LADC) free of cost.\n\n"
                f"Call Toll-Free **15100** (NALSA) to request immediate free legal defense counsel."
            )
            return {
                "reply": reply,
                "language": lang,
                "eligible_for_aid": True,
                "schemes_referred": schemes,
                "contact_info": {"nalsa_helpline": "15100"},
                "disclaimer": cls.DISCLAIMER
            }

        # General Greetings
        if any(w in msg_lower for w in ["hello", "hi", "namaste", "namaskar", "pranam"]):
            return {
                "reply": t["greeting"],
                "language": lang,
                "eligible_for_aid": None,
                "schemes_referred": schemes,
                "contact_info": {"nalsa_helpline": "15100"},
                "disclaimer": cls.DISCLAIMER
            }

        # Safe Refusal / Unknown Query (LA-03: Grounded KB safe refusal)
        return {
            "reply": t["unknown"],
            "language": lang,
            "eligible_for_aid": None,
            "schemes_referred": schemes,
            "contact_info": {"nalsa_helpline": "15100"},
            "disclaimer": cls.DISCLAIMER
        }
