import re
from pathlib import Path
from typing import Tuple
from sqlalchemy.orm import Session
from app.config import settings
from app.models.database import Document, DocumentVersion
from app.core.encryption import (
    encrypt_bytes, decrypt_bytes,
    generate_document_data_key, wrap_data_key, unwrap_data_key
)
from app.core.hashing import compute_sha256
from app.services.audit import log_audit_action

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".tif", ".docx", ".txt"}

def validate_uploaded_file(file_name: str, file_bytes: bytes) -> None:
    """SEC-07: Upload validation: allow-list of types, magic bytes, max size, sanitisation."""
    # 1. Size check
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    if len(file_bytes) == 0:
        raise ValueError("Uploaded file is empty (0 bytes)")
    if len(file_bytes) > max_bytes:
        raise ValueError(f"File size exceeds maximum permitted limit of {settings.MAX_UPLOAD_MB} MB")

    # 2. Path traversal & filename sanitisation
    if ".." in file_name or "/" in file_name or "\\" in file_name:
        raise ValueError("Invalid filename: path traversal characters detected")
    sanitized_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', Path(file_name).name)
    ext = Path(sanitized_name).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file type '{ext}'. Allowed types: {', '.join(sorted(ALLOWED_EXTENSIONS))}")

    # 3. Magic byte check
    if ext == ".pdf":
        if not file_bytes.startswith(b"%PDF"):
            raise ValueError("File content does not match valid PDF format")
    elif ext == ".png":
        if not file_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
            raise ValueError("File content does not match valid PNG image format")
    elif ext in (".jpg", ".jpeg"):
        if not file_bytes.startswith(b"\xff\xd8\xff"):
            raise ValueError("File content does not match valid JPEG image format")
    elif ext in (".tiff", ".tif"):
        if not (file_bytes.startswith(b"II*\x00") or file_bytes.startswith(b"MM\x00*")):
            raise ValueError("File content does not match valid TIFF image format")
    elif ext == ".docx":
        if not file_bytes.startswith(b"PK\x03\x04"):
            raise ValueError("File content does not match valid DOCX archive format")
    elif ext == ".txt":
        try:
            file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            raise ValueError("Text file contains invalid non-UTF8 binary characters")

def store_case_document(
    db: Session,
    case_id: str,
    file_name: str,
    file_bytes: bytes,
    uploaded_by: str,
    doc_type: str = "other",
    classification_level: str = "restricted",
    language: str = "en"
) -> DocumentVersion:
    """
    SEC-03: Encrypts file with per-document AES-256-GCM data key wrapped by master key.
    Stores in secure object vault, computes SHA-256, creates versioned DB record, and logs audit.
    """
    validate_uploaded_file(file_name, file_bytes)

    # 1. Compute SHA-256 of original plaintext for integrity verification
    plaintext_sha256 = compute_sha256(file_bytes)
    
    # 2. Generate per-document data key and wrap it with master key
    doc_data_key = generate_document_data_key()
    wrapped_key_ref = wrap_data_key(doc_data_key)
    
    # 3. Encrypt file with document data key using AES-256-GCM
    encrypted_payload = encrypt_bytes(file_bytes, key=doc_data_key)
    
    # 4. Save encrypted file in storage vault with sanitised name
    safe_file_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', Path(file_name).name)
    safe_name = f"{case_id}_{plaintext_sha256[:16]}_{safe_file_name}.enc"
    storage_path = settings.STORAGE_DIR / safe_name
    with open(storage_path, "wb") as f:
        f.write(encrypted_payload)
        
    # 5. Check if document entity already exists or create new
    doc = db.query(Document).filter(Document.case_id == case_id, Document.title == file_name).first()
    if not doc:
        doc = Document(
            case_id=case_id,
            title=file_name,
            doc_type=doc_type,
            language=language,
            uploaded_by=uploaded_by,
            classification_level=classification_level
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        version_no = 1
    else:
        version_no = len(doc.versions) + 1

    # 6. Create immutable DocumentVersion record with wrapped key reference
    doc_version = DocumentVersion(
        document_id=doc.id,
        version_no=version_no,
        file_name=file_name,
        object_key=str(storage_path),
        sha256=plaintext_sha256,
        size_bytes=len(file_bytes),
        encrypted_key_ref=wrapped_key_ref
    )
    db.add(doc_version)
    db.commit()
    db.refresh(doc_version)

    # 7. Append audit log
    log_audit_action(
        db=db,
        actor_id=uploaded_by,
        actor_name=uploaded_by,
        action="upload_document",
        object_type="document",
        object_id=doc.id,
        details={
            "file_name": file_name,
            "version_no": version_no,
            "sha256": plaintext_sha256,
            "size_bytes": len(file_bytes),
            "doc_type": doc_type
        }
    )

    return doc_version

def retrieve_and_decrypt_document(
    db: Session,
    version_id: str,
    accessor_id: str,
    accessor_name: str
) -> Tuple[bytes, DocumentVersion]:
    """
    Retrieves encrypted object, validates integrity, decrypts bytes, and logs audit access.
    Supports both wrapped per-document keys and legacy master-key ciphertexts.
    """
    version = db.query(DocumentVersion).filter(DocumentVersion.id == version_id).first()
    if not version:
        raise ValueError("Document version not found")

    storage_path = Path(version.object_key)
    if not storage_path.exists():
        raise FileNotFoundError(f"Encrypted object at {storage_path} is missing")

    with open(storage_path, "rb") as f:
        encrypted_data = f.read()

    # Determine decryption key
    if version.encrypted_key_ref and version.encrypted_key_ref != "MASTER-AES-256-GCM":
        try:
            doc_data_key = unwrap_data_key(version.encrypted_key_ref)
            decrypted_bytes = decrypt_bytes(encrypted_data, key=doc_data_key)
        except Exception:
            # Fallback to master decryption if unwrapping fails
            decrypted_bytes = decrypt_bytes(encrypted_data)
    else:
        decrypted_bytes = decrypt_bytes(encrypted_data)
    
    # Verify SHA-256 matches recorded hash
    calculated_hash = compute_sha256(decrypted_bytes)
    if calculated_hash != version.sha256:
        raise ValueError("Cryptographic tamper warning: Decrypted content SHA-256 does not match recorded digest!")

    # Log secure access in audit chain
    log_audit_action(
        db=db,
        actor_id=accessor_id,
        actor_name=accessor_name,
        action="decrypt_and_download",
        object_type="document_version",
        object_id=version.id,
        details={
            "file_name": version.file_name,
            "sha256": version.sha256,
            "version_no": version.version_no
        }
    )

    return decrypted_bytes, version
