import re
from typing import Dict, Any

class IntakeAgent:
    """
    Intake Agent:
    Parses redacted document text, classifies document type, extracts entities,
    legal acts/sections (BNS, IPC, CrPC, BNSS), key dates, and confidence score.
    """
    SECTION_PATTERNS = [
        re.compile(r"(?:Section|Sec\.?|u/s|U/S)\s+([0-9A-Za-z,\s/]+(?:\s+of\s+(?:IPC|BNS|CrPC|BNSS|NI Act|NDPS|POCSO|IPC,\s*1860|BNS,\s*2023))?)", re.IGNORECASE),
        re.compile(r"\b(?:IPC|BNS|CrPC|BNSS)\s+Section\s+([0-9A-Za-z,\s/]+)", re.IGNORECASE)
    ]
    
    DATE_PATTERNS = [
        re.compile(r"\b(?:\d{1,2}[\-\/]\d{1,2}[\-\/]\d{4}|\d{4}[\-\/]\d{1,2}[\-\/]\d{1,2})\b"),
        re.compile(r"\b\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December),?\s+\d{4}\b", re.IGNORECASE)
    ]

    DOC_TYPE_KEYWORDS = {
        "fir": ["first information report", "f.i.r", "police station", "date of occurrence", "u/s", "complainant"],
        "bail_application": ["bail application", "under section 439", "under section 437", "under section 483", "in custody since", "grant of bail", "applicant/accused"],
        "charge_sheet": ["final report", "charge sheet", "under section 173", "investigating officer", "prosecution witnesses"],
        "petition": ["writ petition", "plaint", "memorandum of petition", "petitioner", "respondent"],
        "order": ["order", "judgment", "coram", "hon'ble mr. justice", "decreed", "dismissed", "stand adjourned"],
        "medical_report": ["medical examination report", "medico-legal", "injuries", "casualty", "doctor", "mlc"]
    }

    @classmethod
    def process(cls, document_id: str, text: str, file_name: str) -> Dict[str, Any]:
        lower_text = text.lower()
        
        # 1. Classify Document Type
        scores = {}
        for doc_type, keywords in cls.DOC_TYPE_KEYWORDS.items():
            count = sum(1 for kw in keywords if kw in lower_text)
            if doc_type in file_name.lower():
                count += 3
            scores[doc_type] = count
            
        best_type = max(scores, key=scores.get)
        confidence = 0.85 if scores[best_type] >= 2 else 0.55
        if scores[best_type] == 0:
            best_type = "other"
            confidence = 0.50

        # 2. Extract Sections / Acts
        sections = set()
        for pat in cls.SECTION_PATTERNS:
            for match in pat.finditer(text):
                clean_sec = match.group(0).strip()
                if len(clean_sec) < 60:
                    sections.add(clean_sec)

        # 3. Extract Dates
        dates = []
        for pat in cls.DATE_PATTERNS:
            for match in pat.finditer(text):
                dates.append(match.group(0).strip())

        # 4. Extract Custody mention
        custody_detected = False
        custody_detail = None
        if "custody" in lower_text or "judicial custody" in lower_text or "arrested on" in lower_text:
            custody_detected = True
            for line in text.split("\n"):
                if "custody" in line.lower() or "arrest" in line.lower():
                    custody_detail = line.strip()[:140]
                    break

        return {
            "document_id": document_id,
            "doc_type": best_type,
            "confidence": round(confidence, 2),
            "sections": list(sections)[:8],
            "dates_found": list(set(dates))[:6],
            "custody_detected": custody_detected,
            "custody_detail": custody_detail
        }

