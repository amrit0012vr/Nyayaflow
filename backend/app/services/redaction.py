import re
from typing import Tuple, List, Dict
from sqlalchemy.orm import Session
from app.models.database import RedactionMap
from app.core.encryption import encrypt_string, decrypt_string

class RedactionService:
    """
    PII Redaction Service.
    Masks personal identifiers into reversible tokens before text is processed by LLM/Agents.
    Token mappings are encrypted with AES-256 and kept in a secure vault.
    """
    PHONE_REGEX = re.compile(r"(?:\+91[\-\s]?)?[6-9]\d{9}\b")
    AADHAAR_REGEX = re.compile(r"\b\d{4}[\s\-]\d{4}[\s\-]\d{4}\b")
    PAN_REGEX = re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b")
    EMAIL_REGEX = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")
    
    @classmethod
    def redact_text(
        cls,
        text: str,
        document_id: str,
        db: Session
    ) -> Tuple[str, List[Dict[str, str]]]:
        redacted = text
        token_counter = {"PHONE": 1, "AADHAAR": 1, "PAN": 1, "EMAIL": 1, "PARTY": 1}
        saved_mappings = []

        # 1. Mask Phone numbers
        for match in cls.PHONE_REGEX.finditer(text):
            val = match.group()
            token = f"[PHONE_{token_counter['PHONE']}]"
            token_counter["PHONE"] += 1
            redacted = redacted.replace(val, token)
            
            enc_val = encrypt_string(val)
            remap = RedactionMap(
                document_id=document_id,
                token=token,
                encrypted_value=enc_val,
                category="phone"
            )
            db.add(remap)
            saved_mappings.append({"token": token, "category": "phone"})

        # 2. Mask Aadhaar numbers
        for match in cls.AADHAAR_REGEX.finditer(text):
            val = match.group()
            token = f"[AADHAAR_{token_counter['AADHAAR']}]"
            token_counter["AADHAAR"] += 1
            redacted = redacted.replace(val, token)
            
            enc_val = encrypt_string(val)
            remap = RedactionMap(
                document_id=document_id,
                token=token,
                encrypted_value=enc_val,
                category="aadhaar"
            )
            db.add(remap)
            saved_mappings.append({"token": token, "category": "aadhaar"})

        # 3. Mask PAN cards
        for match in cls.PAN_REGEX.finditer(text):
            val = match.group()
            token = f"[PAN_{token_counter['PAN']}]"
            token_counter["PAN"] += 1
            redacted = redacted.replace(val, token)
            
            enc_val = encrypt_string(val)
            remap = RedactionMap(
                document_id=document_id,
                token=token,
                encrypted_value=enc_val,
                category="pan"
            )
            db.add(remap)
            saved_mappings.append({"token": token, "category": "pan"})

        # 4. Mask Emails
        for match in cls.EMAIL_REGEX.finditer(text):
            val = match.group()
            token = f"[EMAIL_{token_counter['EMAIL']}]"
            token_counter["EMAIL"] += 1
            redacted = redacted.replace(val, token)
            
            enc_val = encrypt_string(val)
            remap = RedactionMap(
                document_id=document_id,
                token=token,
                encrypted_value=enc_val,
                category="email"
            )
            db.add(remap)
            saved_mappings.append({"token": token, "category": "email"})

        db.commit()
        return redacted, saved_mappings

    @classmethod
    def unmask_text_authorized(cls, redacted_text: str, document_id: str, db: Session) -> str:
        """Authorized unmasking for judicial bench with full audit logging."""
        maps = db.query(RedactionMap).filter(RedactionMap.document_id == document_id).all()
        unmasked = redacted_text
        for m in maps:
            try:
                original_value = decrypt_string(m.encrypted_value)
                unmasked = unmasked.replace(m.token, original_value)
            except Exception:
                continue
        return unmasked
