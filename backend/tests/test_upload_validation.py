import pytest
from app.services.documents import validate_uploaded_file

def test_valid_pdf_file_passes():
    pdf_bytes = b"%PDF-1.4\n%Fake PDF content for test"
    # Valid PDF should pass with no exception raised
    validate_uploaded_file("charge_sheet.pdf", pdf_bytes)

def test_valid_txt_file_passes():
    txt_bytes = b"This is plain text legal petition."
    validate_uploaded_file("petition.txt", txt_bytes)

def test_executable_extension_rejected():
    exe_bytes = b"MZ\x90\x00\x03\x00\x00\x00"
    with pytest.raises(ValueError, match="Unsupported file type"):
        validate_uploaded_file("malware.exe", exe_bytes)

def test_magic_byte_mismatch_rejected():
    spoofed_bytes = b"This is not a PDF header at all."
    with pytest.raises(ValueError, match="does not match valid PDF"):
        validate_uploaded_file("fake.pdf", spoofed_bytes)

def test_file_size_exceeded_rejected():
    large_payload = b"A" * (26 * 1024 * 1024) # 26 MB
    with pytest.raises(ValueError, match="exceeds maximum"):
        validate_uploaded_file("large.pdf", large_payload)
