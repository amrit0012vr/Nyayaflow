from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# Auth Schemas (AUTH-03, AUTH-04)
class UserLogin(BaseModel):
    email: str
    password: str
    persona: str = Field(..., description="Selected persona: judge, clerk, lawyer, police, citizen, auditor, admin")

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    org: str
    court: Optional[str] = None
    registry: Optional[str] = None
    permissions: List[str] = []

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 1800 # 30 minutes (AUTH-04)
    user: UserOut

# Case Schemas
class CaseCreate(BaseModel):
    case_number: str
    title: str
    court: str = "Chief Judicial Magistrate, Patiala House Courts"
    court_id: Optional[str] = "DL-PHC-CJM-01"
    courtroom: Optional[str] = "Courtroom 3"
    case_type: str
    filing_date: str
    custody_flag: bool = False
    custody_since: Optional[str] = None
    statutory_deadline: Optional[str] = None
    max_sentence_months: Optional[int] = None
    first_time_offender: Optional[bool] = None
    vulnerable_party: bool = False
    vulnerability_reason: Optional[str] = None
    complainant: str = "State of Delhi"
    accused: Optional[str] = None
    related_case_ids: List[str] = []

class CaseOut(BaseModel):
    id: str
    case_number: str
    title: str
    court: str
    court_id: Optional[str] = None
    courtroom: Optional[str] = None
    case_type: str
    status: str
    filing_date: str
    custody_flag: bool
    custody_since: Optional[str]
    statutory_deadline: Optional[str]
    max_sentence_months: Optional[int] = None
    vulnerable_party: bool
    vulnerability_reason: Optional[str]
    complainant: Optional[str]
    accused: Optional[str]
    triage_score: Optional[int] = None
    triage_tier: Optional[str] = None
    triage_review_state: Optional[str] = "pending_review"
    summary_review_state: Optional[str] = "pending_review"
    document_count: int = 0

# Citizen Public Status Schema (DATA-03)
# Plain language, strict isolation: NO triage score, factors, internal notes, documents, entities
class CaseStatusPublic(BaseModel):
    case_number: str
    court: str
    stage_label: str
    next_hearing: Optional[str] = None
    courtroom: Optional[str] = None
    status_explanation: str
    legal_aid_hint: str = "Free legal aid is available under the Legal Services Authorities Act. Call 15100."

# AI Review Schema (DATA-04)
class ReviewAction(BaseModel):
    review_state: str = Field(..., description="approved or rejected")
    review_note: Optional[str] = None

# Document Schemas
class DocumentVersionOut(BaseModel):
    id: str
    version_no: int
    file_name: str
    sha256: str
    size_bytes: int
    encrypted_key_ref: Optional[str] = None
    created_at: str

class DocumentOut(BaseModel):
    id: str
    case_id: str
    title: str
    doc_type: str
    language: str
    uploaded_by: str
    classification_level: str
    created_at: str
    versions: List[DocumentVersionOut] = []

# Triage Schemas
class TriageFactor(BaseModel):
    name: str
    value: str
    points: int
    max_points: int
    source: Optional[Dict[str, Any]] = None

class TriageResponse(BaseModel):
    case_id: str
    score: int
    tier: str # critical, high, normal, low
    factors: List[TriageFactor]
    reasons: List[str]
    needs_human_review: bool
    review_state: str = "pending_review"
    reviewed_by: Optional[str] = None
    overridden_by: Optional[str] = None
    override_reason: Optional[str] = None

class TriageOverrideRequest(BaseModel):
    new_tier: str
    reason: str = Field(..., min_length=10, description="Mandatory reason of at least 10 characters (TRI-04)")

# Summary Schemas
class SourceCitation(BaseModel):
    document_id: str
    page: int
    span: List[int]
    excerpt: Optional[str] = None

class TimelineEvent(BaseModel):
    date: str
    event: str
    source: Optional[SourceCitation] = None

class DeadlineItem(BaseModel):
    what: str
    due: str
    source: Optional[SourceCitation] = None

class SummaryResponse(BaseModel):
    case_id: str
    variant: str
    brief: str
    timeline: List[TimelineEvent]
    issues: List[str]
    positions: Dict[str, str]
    pending_deadlines: List[DeadlineItem]
    citations_verified: bool
    review_state: str = "pending_review"
    reviewed_by: Optional[str] = None
    generated_by: str = "rules" # rules or llm (AI-04)

# Schedule Schemas
class ScheduleSlotSuggestion(BaseModel):
    slot_start: str
    slot_end: str
    courtroom: str
    judge_id: str
    score: float
    reasons: List[str]

class ScheduleResponse(BaseModel):
    case_id: str
    suggestions: List[ScheduleSlotSuggestion]
    conflicts: List[str]
    solver: str = "cp-sat" # cp-sat or greedy-fallback (SCH-01)

class ScheduleAcceptRequest(BaseModel):
    case_id: str
    slot_start: str
    slot_end: str
    courtroom: str
    judge_id: str

# Citizen & Legal Aid Schemas (LA-01, LA-02)
class LegalAidChatRequest(BaseModel):
    message: str
    language: str = "en"
    session_id: Optional[str] = None
    case_number: Optional[str] = None

class LegalAidChatResponse(BaseModel):
    session_id: str
    reply: str
    language: str
    eligible_for_aid: Optional[bool] = None
    schemes_referred: List[str] = []
    contact_info: Dict[str, str] = {}
    disclaimer: str = "This is general informational guidance under the Legal Services Authorities Act, 1987, not legal advice."

class EligibilityCheckRequest(BaseModel):
    annual_income: float
    state: str = "Delhi"
    court_level: str = "district" # district, high_court, supreme_court
    is_sc_st: bool = False # 12(a)
    is_victim_of_trafficking_or_begar: bool = False # 12(b)
    is_woman_or_child: bool = False # 12(c)
    has_disability_or_mental_illness: bool = False # 12(d)
    is_victim_of_disaster_or_ethnic_violence: bool = False # 12(e)
    is_industrial_workman: bool = False # 12(f)
    in_custody: bool = False # 12(g)

class EligibilityCheckResponse(BaseModel):
    is_eligible: bool
    clause: str
    scheme: str
    legal_basis: str
    state_income_limit: float
    notes: str
    next_steps: List[str]
    helpline: str = "NALSA Toll-Free 15100 / DLSA Helpdesk"

# Audit Schemas
class AuditLogOut(BaseModel):
    id: int
    ts: str
    actor_id: str
    actor_name: str
    action: str
    object_type: str
    object_id: str
    details: Dict[str, Any]
    prev_hash: str
    entry_hash: str

class AuditVerifyResponse(BaseModel):
    is_valid: bool
    total_entries_checked: int
    broken_at_id: Optional[int] = None
    message: str

class TamperSimulateRequest(BaseModel):
    entry_id: int
    tampered_action: str

# Admin Schemas (UI-09, SEC-14)
class UserAdminCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str
    org: str = "District Court"
    court: Optional[str] = "Chief Judicial Magistrate, Patiala House Courts"
    registry: Optional[str] = "Patiala House Courts Registry"

class UserAdminUpdate(BaseModel):
    status: Optional[str] = None # active, disabled
    role: Optional[str] = None
    court: Optional[str] = None
    registry: Optional[str] = None
    password: Optional[str] = None
