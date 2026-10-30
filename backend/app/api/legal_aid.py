from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.config import settings
from app.models.database import get_db, Case, ChatSession, ChatMessage, User, CaseParticipant, Hearing
from app.schemas.schemas import (
    LegalAidChatRequest, LegalAidChatResponse,
    EligibilityCheckRequest, EligibilityCheckResponse,
    CaseStatusPublic
)
from app.agents.legal_aid import LegalAidAgent
from app.core.rbac import get_current_user, oauth2_scheme
from app.core.security import decode_access_token

router = APIRouter(prefix="", tags=["Legal Aid & Citizen Access"])

def get_citizen_or_guest(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """AUTH-14: Enforces authentication unless ALLOW_GUEST_LEGAL_AID is explicitly enabled."""
    if not token:
        if settings.ALLOW_GUEST_LEGAL_AID:
            return None
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required for legal aid services"
        )
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    user_id = payload.get("user_id") or payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.status != "active":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account disabled")
    return user

@router.post("/legal-aid/chat", response_model=LegalAidChatResponse)
def citizen_chat(
    payload: LegalAidChatRequest,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_citizen_or_guest)
):
    """
    LA-03, LA-04, LA-05: Grounded QA assistant with multi-lingual templates,
    urgent safety detection, and plain-language assistance.
    """
    case = None
    if payload.case_number:
        # If user is a logged-in citizen, scope to their case
        if user and isinstance(user, User) and user.role == "citizen":
            case = db.query(Case).join(CaseParticipant).filter(
                Case.case_number.ilike(f"%{payload.case_number}%"),
                CaseParticipant.user_id == user.id
            ).first()
        else:
            case = db.query(Case).filter(Case.case_number.ilike(f"%{payload.case_number}%")).first()

    chat_res = LegalAidAgent.chat(
        message=payload.message,
        language=payload.language,
        case=case
    )

    actual_user_id = user.id if (user and isinstance(user, User)) else None
    session_id = payload.session_id
    if not session_id:
        session = ChatSession(
            user_id=actual_user_id,
            language=payload.language
        )
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

@router.post("/legal-aid/check-eligibility", response_model=EligibilityCheckResponse)
def check_eligibility(
    payload: EligibilityCheckRequest,
    user: Optional[User] = Depends(get_citizen_or_guest)
):
    """
    LA-01 / LA-02: Evaluates Section 12 criteria for all statutory categories (a through h).
    """
    res = LegalAidAgent.check_eligibility(
        annual_income=payload.annual_income,
        state=payload.state,
        court_level=payload.court_level,
        is_sc_st=payload.is_sc_st,
        is_victim_of_trafficking_or_begar=payload.is_victim_of_trafficking_or_begar,
        is_woman_or_child=payload.is_woman_or_child,
        has_disability_or_mental_illness=payload.has_disability_or_mental_illness,
        is_victim_of_disaster_or_ethnic_violence=payload.is_victim_of_disaster_or_ethnic_violence,
        is_industrial_workman=payload.is_industrial_workman,
        in_custody=payload.in_custody
    )
    return EligibilityCheckResponse(
        is_eligible=res["is_eligible"],
        clause=res["clause"],
        scheme=res["scheme"],
        legal_basis=res["legal_basis"],
        state_income_limit=res["state_income_limit"],
        notes=res["notes"],
        next_steps=res["next_steps"],
        helpline=res["helpline"]
    )

@router.get("/me/cases", response_model=List[CaseStatusPublic])
def get_my_cases_public_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    DATA-03 / LA-06: Citizen's own cases under strict plain-language public schema.
    Strictly excludes triage score, factors, internal notes, documents, or other parties' data.
    """
    if current_user.role != "citizen" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Endpoint restricted to Citizen persona"
        )

    # Find cases where citizen is participant
    participations = db.query(CaseParticipant).filter(
        CaseParticipant.user_id == current_user.id,
        CaseParticipant.participant_role == "litigant"
    ).all()
    case_ids = [p.case_id for p in participations]

    cases = db.query(Case).filter(Case.id.in_(case_ids)).all() if case_ids else []
    results = []

    for c in cases:
        next_hearing = db.query(Hearing).filter(Hearing.case_id == c.id, Hearing.status == "scheduled").order_by(Hearing.slot_start.asc()).first()
        stage_label = "Pre-Trial Scrutiny" if c.status == "pending" else "Hearing Scheduled" if c.status == "scheduled" else "Under Review"

        explanation = (
            f"Your case is currently at the {stage_label} stage before the {c.court}. "
            f"If you need an advocate to represent you, you may apply for Free Legal Aid under Section 12 of the Legal Services Authorities Act."
        )

        results.append(CaseStatusPublic(
            case_number=c.case_number,
            court=c.court,
            stage_label=stage_label,
            next_hearing=next_hearing.slot_start[:10] if next_hearing else None,
            courtroom=next_hearing.courtroom if next_hearing else c.courtroom,
            status_explanation=explanation,
            legal_aid_hint="Free legal aid is available under the Legal Services Authorities Act. Call 15100."
        ))

    return results
