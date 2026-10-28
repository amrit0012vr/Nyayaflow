from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db, Case, ChatSession, ChatMessage
from app.schemas.schemas import (
    LegalAidChatRequest, LegalAidChatResponse,
    EligibilityCheckRequest, EligibilityCheckResponse
)
from app.agents.legal_aid import LegalAidAgent

router = APIRouter(prefix="/legal-aid", tags=["Legal Aid & Citizen Access"])

@router.post("/chat", response_model=LegalAidChatResponse)
def citizen_chat(payload: LegalAidChatRequest, db: Session = Depends(get_db)):
    case = None
    if payload.case_number:
        case = db.query(Case).filter(Case.case_number.ilike(f"%{payload.case_number}%")).first()

    chat_res = LegalAidAgent.chat(
        message=payload.message,
        language=payload.language,
        case=case
    )

    session_id = payload.session_id
    if not session_id:
        session = ChatSession(language=payload.language)
        db.add(session)
        db.commit()
        db.refresh(session)
        session_id = session.session_id

    # Record message log
    db.add(ChatMessage(session_id=session_id, role="user", message=payload.message))
    db.add(ChatMessage(session_id=session_id, role="assistant", message=chat_res["reply"]))
    db.commit()

    return LegalAidChatResponse(
        session_id=session_id,
        reply=chat_res["reply"],
        language=chat_res["language"],
        eligible_for_aid=chat_res["eligible_for_aid"],
        schemes_referred=chat_res["schemes_referred"],
        contact_info=chat_res["contact_info"],
        disclaimer=chat_res["disclaimer"]
    )

@router.post("/check-eligibility", response_model=EligibilityCheckResponse)
def check_eligibility(payload: EligibilityCheckRequest):
    res = LegalAidAgent.check_eligibility(
        annual_income=payload.annual_income,
        is_woman_or_child=payload.is_woman_or_child,
        is_sc_st=payload.is_sc_st,
        in_custody=payload.in_custody,
        has_disability=payload.has_disability,
        is_victim_of_trafficking_or_disaster=payload.is_victim_of_trafficking_or_disaster
    )
    return EligibilityCheckResponse(
        is_eligible=res["is_eligible"],
        scheme=res["scheme"],
        legal_basis=res["legal_basis"],
        next_steps=res["next_steps"],
        helpline=res["helpline"]
    )

