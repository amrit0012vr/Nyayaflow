import os
from pathlib import Path
from typing import Tuple, Optional
from sqlalchemy.orm import Session
from app.config import settings
from app.models.database import Document, DocumentVersion
from app.core.encryption import encrypt_bytes, decrypt_bytes
from app.core.hashing import compute_sha256
from app.services.audit import log_audit_action

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
    Encrypts file with AES-256-GCM, stores it in the secure object vault,
    computes SHA-256 for integrity check, creates versioned DB record, and logs audit.
    """
    # 1. Compute SHA-256 of original plaintext for integrity verification
    plaintext_sha256 = compute_sha256(file_bytes)
    
    # 2. Encrypt file with military-grade AES-256-GCM
    encrypted_payload = encrypt_bytes(file_bytes)
    
    # 3. Save encrypted file in storage vault
    safe_name = f"{case_id}_{plaintext_sha256[:16]}_{file_name}.enc"
    storage_path = settings.STORAGE_DIR / safe_name
    with open(storage_path, "wb") as f:
        f.write(encrypted_payload)
        
    # 4. Check if document entity already exists or create new
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

    # 5. Create immutable DocumentVersion record
    doc_version = DocumentVersion(
        document_id=doc.id,
        version_no=version_no,
        file_name=file_name,
        object_key=str(storage_path),
        sha256=plaintext_sha256,
        size_bytes=len(file_bytes),
        encrypted_key_ref="MASTER-AES-256-GCM"
    )
    db.add(doc_version)
    db.commit()
    db.refresh(doc_version)

    # 6. Append audit log
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
    Retrieves encrypted object, validates integrity, decrypts AES-256 bytes, and logs audit access.
    """
    version = db.query(DocumentVersion).filter(DocumentVersion.id == version_id).first()
    if not version:
        raise ValueError("Document version not found")

    storage_path = Path(version.object_key)
    if not storage_path.exists():
        raise FileNotFoundError(f"Encrypted object at {storage_path} is missing")

    with open(storage_path, "rb") as f:
        encrypted_data = f.read()

    # Decrypt AES-256-GCM
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
