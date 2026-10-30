from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response, status
from sqlalchemy.orm import Session
from app.models.database import get_db, Document, DocumentVersion, User
from app.schemas.schemas import DocumentVersionOut
from app.core.rbac import get_current_user, require_permission
from app.core.scope import get_scoped_case_or_404, visible_cases
from app.services.documents import store_case_document, retrieve_and_decrypt_document
from app.agents.orchestrator import OrchestratorAgent

router = APIRouter(prefix="", tags=["Documents & Vault"])

@router.post("/cases/{case_id}/documents")
async def upload_document(
    case_id: str,
    file: UploadFile = File(...),
    doc_type: str = Form("other"),
    classification_level: str = Form("restricted"),
    language: str = Form("en"),
    auto_process: bool = Form(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("doc:upload"))
):
    """
    DATA-02 / SEC-07: Validates file type and size, enforces case scope,
    encrypts payload using per-document key, and uploads to secure vault.
    """
    case = get_scoped_case_or_404(case_id, current_user, db)

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty (0 bytes)")

    try:
        doc_version = store_case_document(
            db=db,
            case_id=case.id,
            file_name=file.filename or "uploaded_document.pdf",
            file_bytes=file_bytes,
            uploaded_by=current_user.name,
            doc_type=doc_type,
            classification_level=classification_level,
            language=language
        )
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))

    pipeline_result = None
    if auto_process:
        try:
            pipeline_result = OrchestratorAgent.process_case_pipeline(
                db=db,
                case_id=case.id,
                actor_id=current_user.id,
                actor_name=current_user.name
            )
        except Exception:
            pass

    return {
        "status": "success",
        "document_version": {
            "id": doc_version.id,
            "document_id": doc_version.document_id,
            "version_no": doc_version.version_no,
            "file_name": doc_version.file_name,
            "sha256": doc_version.sha256,
            "size_bytes": doc_version.size_bytes,
            "created_at": str(doc_version.created_at)
        },
        "pipeline_executed": auto_process,
        "pipeline_result": pipeline_result
    }

@router.get("/documents/{id}/versions", response_model=List[DocumentVersionOut])
def get_document_versions(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("doc:download"))
):
    """Returns versions of a document, validating that the case is in caller's scope."""
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Scope check
    get_scoped_case_or_404(doc.case_id, current_user, db)

    versions = db.query(DocumentVersion).filter(DocumentVersion.document_id == id).order_by(DocumentVersion.version_no.desc()).all()
    return [
        DocumentVersionOut(
            id=v.id,
            version_no=v.version_no,
            file_name=v.file_name,
            sha256=v.sha256,
            size_bytes=v.size_bytes,
            encrypted_key_ref=v.encrypted_key_ref,
            created_at=str(v.created_at)
        )
        for v in versions
    ]

@router.get("/documents/version/{version_id}/download")
def download_document(
    version_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("doc:download"))
):
    """Decrypts and serves document version, verifying scope and cryptographic integrity."""
    version = db.query(DocumentVersion).filter(DocumentVersion.id == version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Document version not found")

    doc = db.query(Document).filter(Document.id == version.document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Associated document not found")

    # Scope check
    get_scoped_case_or_404(doc.case_id, current_user, db)

    try:
        decrypted_bytes, version = retrieve_and_decrypt_document(
            db=db,
            version_id=version_id,
            accessor_id=current_user.id,
            accessor_name=current_user.name
        )
        return Response(
            content=decrypted_bytes,
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename=\"{version.file_name}\""}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/evidence")
def list_police_evidence(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("evidence:read"))
):
    """
    POLICE PERSONA (§4.4): List evidence deposits with cryptographic SHA-256 fingerprints,
    IO timestamps, and chain-of-custody metadata for cases assigned to this officer.
    """
    from app.models.database import Case
    scoped_cases = visible_cases(db.query(Case), current_user, db).all()
    case_ids = [c.id for c in scoped_cases]

    docs = db.query(Document).filter(Document.case_id.in_(case_ids)).all() if case_ids else []
    results = []
    for d in docs:
        case = next((c for c in scoped_cases if c.id == d.case_id), None)
        latest_ver = db.query(DocumentVersion).filter(DocumentVersion.document_id == d.id).order_by(DocumentVersion.version_no.desc()).first()
        results.append({
            "id": d.id,
            "case_id": d.case_id,
            "case_number": case.case_number if case else "N/A",
            "case_title": case.title if case else "N/A",
            "title": d.title,
            "doc_type": d.doc_type,
            "uploaded_by": d.uploaded_by,
            "classification_level": d.classification_level,
            "created_at": str(d.created_at),
            "sha256": latest_ver.sha256 if latest_ver else "N/A",
            "size_bytes": latest_ver.size_bytes if latest_ver else 0,
            "version_no": latest_ver.version_no if latest_ver else 1
        })
    return results
