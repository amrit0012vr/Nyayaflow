import re
from typing import Tuple, List, Dict, Optional
from sqlalchemy.orm import Session
from app.models.database import RedactionMap
from app.core.encryption import encrypt_string, decrypt_string

class RedactionService:
    """
    RED-01, RED-02, RED-03: PII Redaction Service.
    Comprehensive masking of statutory identifiers before agent or LLM processing.
    Reversible cryptographic token vault encrypted with AES-256-GCM.
    """
    PHONE_REGEX = re.compile(r"(?:\+91[\-\s]?)?[6-9]\d{9}\b")
    AADHAAR_REGEX = re.compile(r"\b\d{4}[\s\-]\d{4}[\s\-]\d{4}\b")
    PAN_REGEX = re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b")
    EMAIL_REGEX = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")
    
    # Financial & Registration
    IFSC_REGEX = re.compile(r"\b[A-Z]{4}0[A-Z0-9]{6}\b")
    BANK_ACC_REGEX = re.compile(r"\b(?:A/C|Account(?:\s+No)?\.?)[:\s]*([0-9]{9,18})\b", re.IGNORECASE)
    VEHICLE_REGEX = re.compile(r"\b[A-Z]{2}[-\s]?[0-9]{1,2}[-\s]?[A-Z]{1,3}[-\s]?[0-9]{4}\b")
    VOTER_ID_REGEX = re.compile(r"\b[A-Z]{3}[0-9]{7}\b")
    PASSPORT_REGEX = re.compile(r"\b[A-PR-WYa-pr-wy][1-9][0-9]{7}\b")

    # Name, Address & Parentage Patterns (RED-01)
    HONORIFIC_NAME_REGEX = re.compile(r"\b(?:Shri|Smt|Mr|Mrs|Ms|Dr)\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b")
    PARENTAGE_REGEX = re.compile(r"\b(?:S/o|D/o|W/o)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b")
    ADDRESS_PIN_REGEX = re.compile(r"\b(?:R/o|H-No|House No|Village|Sector|Road|Nagar|Colony|Street)[^,\n]+(?:,\s*[A-Za-z\s]+)?,\s*(\d{6})\b", re.IGNORECASE)

    # POCSO / Sexual Offence Victim & Minor Protection (RED-02: Mandatory Masking)
    VICTIM_REGEX = re.compile(r"\b(?:victim|prosecutrix|survivor)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b", re.IGNORECASE)
    MINOR_REGEX = re.compile(r"\b(?:minor|child)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b", re.IGNORECASE)

    @classmethod
    def redact_text(
        cls,
        text: str,
        document_id: str = "temp-doc",
        db: Optional[Session] = None
    ) -> Tuple[str, List[Dict[str, str]]]:
        redacted = text
        counters: Dict[str, int] = {
            "PHONE": 1, "AADHAAR": 1, "PAN": 1, "EMAIL": 1,
            "IFSC": 1, "BANK": 1, "VEHICLE": 1, "VOTER": 1, "PASSPORT": 1,
            "PERSON": 1, "PARENT": 1, "ADDRESS": 1, "VICTIM": 1, "MINOR": 1
        }
        saved_mappings = []

        def _replace_and_record(pattern: re.Pattern, cat: str, prefix: str, group_idx: int = 0):
            nonlocal redacted
            for match in pattern.finditer(redacted):
                val = match.group(group_idx).strip()
                if not val or len(val) < 2 or val.startswith("["):
                    continue
                token = f"[{prefix}_{counters[prefix]}]"
                counters[prefix] += 1
                redacted = redacted.replace(val, token)
                
                if db is not None:
                    enc_val = encrypt_string(val, context="nyayaflow-redaction-v1")
                    remap = RedactionMap(
                        document_id=document_id,
                        token=token,
                        encrypted_value=enc_val,
                        category=cat
                    )
                    db.add(remap)
                saved_mappings.append({"token": token, "category": cat})

        # RED-02: 1. Strict Victim & Minor Masking First
        _replace_and_record(cls.VICTIM_REGEX, "victim", "VICTIM", 1)
        _replace_and_record(cls.MINOR_REGEX, "minor", "MINOR", 1)

        # 2. Statutory Identifiers
        _replace_and_record(cls.AADHAAR_REGEX, "aadhaar", "AADHAAR", 0)
        _replace_and_record(cls.PAN_REGEX, "pan", "PAN", 0)
        _replace_and_record(cls.PHONE_REGEX, "phone", "PHONE", 0)
        _replace_and_record(cls.EMAIL_REGEX, "email", "EMAIL", 0)
        _replace_and_record(cls.IFSC_REGEX, "ifsc", "IFSC", 0)
        _replace_and_record(cls.BANK_ACC_REGEX, "bank", "BANK", 1)
        _replace_and_record(cls.VEHICLE_REGEX, "vehicle", "VEHICLE", 0)
        _replace_and_record(cls.VOTER_ID_REGEX, "voter_id", "VOTER", 0)
        _replace_and_record(cls.PASSPORT_REGEX, "passport", "PASSPORT", 0)

        # 3. Person Names and Parentage
        _replace_and_record(cls.HONORIFIC_NAME_REGEX, "person_name", "PERSON", 1)
        _replace_and_record(cls.PARENTAGE_REGEX, "parentage", "PARENT", 1)
        _replace_and_record(cls.ADDRESS_PIN_REGEX, "address", "ADDRESS", 0)

        if db is not None:
            db.commit()
        return redacted, saved_mappings

    @classmethod
    def unmask_text_authorized(cls, redacted_text: str, document_id: str, db: Session) -> str:
        """RED-03: Authorized de-redaction for judicial bench."""
        maps = db.query(RedactionMap).filter(RedactionMap.document_id == document_id).all()
        unmasked = redacted_text
        for m in maps:
            try:
                original_value = decrypt_string(m.encrypted_value, context="nyayaflow-redaction-v1")
                unmasked = unmasked.replace(m.token, original_value)
            except Exception:
                continue
        return unmasked
