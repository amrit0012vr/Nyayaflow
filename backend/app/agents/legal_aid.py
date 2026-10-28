from typing import Dict, Any, List, Optional
from app.models.database import Case

class LegalAidAgent:
    """
    Legal Aid Agent:
    Multilingual citizen assistant empowering underrepresented litigants with plain-language case status,
    statutory rights guidance, and automated Free Legal Aid eligibility assessment under the
    Legal Services Authorities Act, 1987 (Section 12).
    """

    DISCLAIMER = "Disclaimer: This automated guidance provides general legal literacy and procedural information under NALSA guidelines. It does not constitute formal legal advice."

    # Multilingual response templates
    RESPONSES = {
        "en": {
            "greeting": "Namaste! I am NyayaFlow's Legal Aid Assistant. How can I assist you with your case, court procedures, or free legal aid today?",
            "eligible": "Good news: You are eligible for 100% Free Legal Aid provided by the State Legal Services Authority (DLSA/SLSA). You do not need to pay any lawyer fees.",
            "not_eligible": "Based on standard criteria, you may exceed the annual income threshold for free legal aid, but you can still access mediation and Lok Adalat services.",
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
            "not_eligible": "मानक आय सीमा के आधार पर आप निःशुल्क वकील के पात्र नहीं हो सकते हैं, लेकिन आप लोक अदालत और मध्यस्थता सेवाओं का निःशुल्क उपयोग कर सकते हैं।",
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
            "next_steps": [
                "1. ଆପଣଙ୍କ ସ୍ଥାନୀୟ ଜିଲ୍ଲା କୋର୍ଟ ପରିସରରେ ଥିବା DLSA କାର୍ଯ୍ୟାଳୟକୁ ଯାଆନ୍ତୁ।",
                "2. ଆଧାର କାର୍ଡ ଏବଂ କେସ କାଗଜପତ୍ର ସାଙ୍ଗରେ ନିଅନ୍ତୁ।",
                "3. ମାଗଣା ହେଲ୍ପଲାଇନ୍ ୧୫୧୦୦ (15100) କୁ କଲ୍ କରନ୍ତୁ।"
            ],
            "helpline": "ଜାତୀୟ ଆଇନ ସେବା ହେଲ୍ପଲାଇନ: 15100"
        }
    }

    @classmethod
    def check_eligibility(
        cls,
        annual_income: float,
        is_woman_or_child: bool = False,
        is_sc_st: bool = False,
        in_custody: bool = False,
        has_disability: bool = False,
        is_victim_of_trafficking_or_disaster: bool = False
    ) -> Dict[str, Any]:
        """
        Determines statutory eligibility under Section 12 of the Legal Services Authorities Act, 1987.
        Exempt categories get free aid irrespective of income.
        """
        reasons = []
        is_eligible = False

        if is_woman_or_child:
            is_eligible = True
            reasons.append("Eligible under Section 12(c): Women and children are entitled to free legal aid regardless of income")
        if is_sc_st:
            is_eligible = True
            reasons.append("Eligible under Section 12(a): Members of Scheduled Castes / Scheduled Tribes")
        if in_custody:
            is_eligible = True
            reasons.append("Eligible under Section 12(g): Person in judicial or police custody / under-trial")
        if has_disability:
            is_eligible = True
            reasons.append("Eligible under Section 12(d): Persons with disabilities (under Rights of Persons with Disabilities Act)")
        if is_victim_of_trafficking_or_disaster:
            is_eligible = True
            reasons.append("Eligible under Section 12(b)/(e): Victim of trafficking or mass disaster/calamity")
        
        # Income ceiling: standard ₹3,00,000 per annum (Delhi/state DLSA limit)
        if not is_eligible:
            if annual_income <= 300_000:
                is_eligible = True
                reasons.append(f"Eligible under Section 12(h): Annual income (₹{annual_income:,.0f}) is below statutory threshold (₹3,00,000)")
            else:
                reasons.append(f"Annual income (₹{annual_income:,.0f}) exceeds ₹3,00,000 statutory limit")

        return {
            "is_eligible": is_eligible,
            "scheme": "National Legal Services Authority (NALSA) Free Legal Aid Scheme",
            "legal_basis": "Legal Services Authorities Act, 1987 (Section 12) & Constitution of India (Article 39A)",
            "reasons": reasons,
            "next_steps": cls.RESPONSES["en"]["next_steps"],
            "helpline": cls.RESPONSES["en"]["helpline"]
        }

    @classmethod
    def chat(
        cls,
        message: str,
        language: str = "en",
        case: Optional[Case] = None
    ) -> Dict[str, Any]:
        """
        Processes citizen chat in preferred language, checks for case updates or legal aid queries.
        """
        lang = language if language in cls.RESPONSES else "en"
        msg_lower = message.lower()
        t = cls.RESPONSES[lang]

        schemes = ["NALSA Free Legal Aid", "DLSA Front Office Legal Representation", "Lok Adalat Dispute Resolution"]

        if any(w in msg_lower for w in ["aid", "lawyer", "free", "sahayata", "vakil", "vakeel", "madad"]):
            reply = (
                f"{t['eligible']}\n\n"
                f"**{ 'Next Steps' if lang == 'en' else 'अगले कदम' if lang == 'hi' else 'ପରବର୍ତ୍ତୀ ପଦକ୍ଷେପ' }:**\n"
                + "\n".join(t["next_steps"]) + f"\n\n**Helpline:** {t['helpline']}"
            )
            eligible = True
        elif case and any(w in msg_lower for w in ["status", "case", "hearing", "date", "tarikh", "tariq"]):
            reply = (
                f"**Case Status for {case.case_number}** ({case.title}):\n"
                f"- Current Status: {case.status.upper()}\n"
                f"- Forum: {case.court}\n"
                f"- Filed on: {case.filing_date[:10]}\n"
                f"- Custody Status: {'In Custody' if case.custody_flag else 'Bail / Regular'}\n"
                f"Your matter has been prioritized in the court queue based on legal urgency."
            )
            eligible = None
        elif any(w in msg_lower for w in ["bail", "undertrial", "jail", "arrest"]):
            reply = (
                f"Under Indian law (Article 21 & CrPC Section 436/437/439, BNSS 479/480/483), every undertrial has a fundamental right to timely bail consideration. "
                f"If you or your relative cannot afford counsel, DLSA will appoint a Legal Aid Defense Counsel (LADC) completely free of cost.\n\n"
                f"Call Toll-Free **15100** to request immediate legal aid counsel."
            )
            eligible = True
        else:
            reply = (
                f"{t['greeting']}\n\n"
                f"You can ask about:\n"
                f"1. Whether you qualify for a free court-appointed lawyer (Section 12)\n"
                f"2. Your case status and upcoming hearing dates\n"
                f"3. Rights of undertrial prisoners and bail procedures\n"
                f"4. Contacting your local District Legal Services Authority (DLSA)"
            )
            eligible = None

        return {
            "reply": reply,
            "language": lang,
            "eligible_for_aid": eligible,
            "schemes_referred": schemes,
            "contact_info": {
                "nalsa_helpline": "15100",
                "portal": "https://nalsa.gov.in"
            },
            "disclaimer": cls.DISCLAIMER
        }

