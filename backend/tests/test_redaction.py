import pytest
from app.services.redaction import RedactionService

def test_aadhaar_redaction():
    text = "The complainant Aadhaar number is 2345 6789 0123."
    redacted, items = RedactionService.redact_text(text)
    assert "[AADHAAR_" in redacted
    assert "2345 6789 0123" not in redacted

def test_pan_redaction():
    text = "The PAN card submitted is ABCDE1234F."
    redacted, items = RedactionService.redact_text(text)
    assert "[PAN_" in redacted
    assert "ABCDE1234F" not in redacted

def test_phone_redaction():
    text = "Call witness on 9876543210 immediately."
    redacted, items = RedactionService.redact_text(text)
    assert "[PHONE_" in redacted
    assert "9876543210" not in redacted

def test_email_redaction():
    text = "Contact petitioner at justice.seeker@example.com for notice."
    redacted, items = RedactionService.redact_text(text)
    assert "[EMAIL_" in redacted
    assert "justice.seeker@example.com" not in redacted

def test_pocso_minor_protection():
    text = "Victim: Meena Kumari, aged 14 years, was rescued."
    redacted, items = RedactionService.redact_text(text)
    # Victim identification should be masked
    assert "[VICTIM_" in redacted
    assert "Meena Kumari" not in redacted
