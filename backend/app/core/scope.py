from typing import Optional
from sqlalchemy.orm import Session, Query
from fastapi import HTTPException, status
from app.models.database import Case, CaseParticipant, User

ROLE_PARTICIPANT_MAP = {
    "lawyer": ["advocate", "lawyer"],
    "advocate": ["advocate", "lawyer"],
    "police": ["investigating_officer", "police"],
    "citizen": ["litigant", "citizen"],
    "judge": ["judge"],
    "clerk": ["clerk"]
}

def visible_cases(query: Query, user: User, db: Session) -> Query:
    """
    DATA-02: Applies tenant/data scoping filter to Case queries based on user role and assignments.
    - Judge: cases in their court or assigned
    - Clerk: cases in their registry/court
    - Advocate/Police/Citizen: ONLY cases where they are assigned participants with matching role
    - Admin: all cases
    - Auditor: no case dossiers (auditors inspect audit logs, not case dossiers)
    """
    role = (user.role or "").lower()

    if role == "admin":
        return query

    if role == "judge":
        if user.court:
            return query.filter((Case.court == user.court) | (Case.court_id == user.court))
        return query

    if role == "clerk":
        if getattr(user, "court_registry", None) or user.court:
            target = getattr(user, "court_registry", None) or user.court
            return query.filter((Case.court == target) | (Case.court_id == target) | (Case.court.like(f"%{target}%")))
        return query

    if role in ("lawyer", "police", "citizen"):
        allowed_roles = ROLE_PARTICIPANT_MAP.get(role, [role])
        # Join on CaseParticipant
        return query.join(
            CaseParticipant, Case.id == CaseParticipant.case_id
        ).filter(
            CaseParticipant.user_id == user.id,
            CaseParticipant.participant_role.in_(allowed_roles)
        )

    # For any other role (e.g. auditor)
    return query.filter(Case.id == "__NONE__")

def get_scoped_case_or_404(case_id: str, user: User, db: Session) -> Case:
    """
    DATA-02 / RBAC-05: Returns case if user is authorized to view it within their scope.
    Returns 404 (does NOT leak existence of unauthorized cases).
    """
    query = db.query(Case).filter(Case.id == case_id)
    scoped = visible_cases(query, user, db).first()
    if not scoped:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found or access not permitted"
        )
    return scoped
