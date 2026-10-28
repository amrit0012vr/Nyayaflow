from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response
from sqlalchemy.orm import Session
from app.models.database import get_db, Case, Document, DocumentVersion
from app.schemas.schemas import DocumentVersionOut
from app.core.rbac import get_current_user_payload
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
    current_user: dict = Depends(get_current_user_payload)
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    uploader_name = current_user.get("name", "User")
    doc_version = store_case_document(
        db=db,
        case_id=case_id,
        file_name=file.filename or "uploaded_document.pdf",
        file_bytes=file_bytes,
        uploaded_by=uploader_name,
        doc_type=doc_type,
        classification_level=classification_level,
        language=language
    )

    pipeline_result = None
    if auto_process:
        try:
            pipeline_result = OrchestratorAgent.process_case_pipeline(
                db=db,
                case_id=case_id,
                actor_id=current_user.get("user_id", "clerk"),
                actor_name=uploader_name
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
    current_user: dict = Depends(get_current_user_payload)
):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    versions = db.query(DocumentVersion).filter(DocumentVersion.document_id == id).order_by(DocumentVersion.version_no.desc()).all()
    return [
        DocumentVersionOut(
            id=v.id,
            version_no=v.version_no,
            file_name=v.file_name,
            sha256=v.sha256,
            size_bytes=v.size_bytes,
            created_at=str(v.created_at)
        )
        for v in versions
    ]

@router.get("/documents/version/{version_id}/download")
def download_document(
    version_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_payload)
):
    try:
        decrypted_bytes, version = retrieve_and_decrypt_document(
            db=db,
            version_id=version_id,
            accessor_id=current_user.get("user_id", "user"),
            accessor_name=current_user.get("name", "User")
        )
        return Response(
            content=decrypted_bytes,
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename=\"{version.file_name}\""}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

