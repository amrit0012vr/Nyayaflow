from typing import List, Optional, Dict, Any
from pydantic import BaseModel

# Auth Schemas
class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    org: str

# Case Schemas
class CaseCreate(BaseModel):
    case_number: str
    title: str
    court: str = "Chief Judicial Magistrate, Patiala House Courts"
    case_type: str
    filing_date: str
    custody_flag: bool = False
    custody_since: Optional[str] = None
    statutory_deadline: Optional[str] = None
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
    case_type: str
    status: str
    filing_date: str
    custody_flag: bool
    custody_since: Optional[str]
    statutory_deadline: Optional[str]
    vulnerable_party: bool
    vulnerability_reason: Optional[str]
    complainant: Optional[str]
    accused: Optional[str]
    triage_score: Optional[int] = None
    triage_tier: Optional[str] = None
    document_count: int = 0

# Document Schemas
class DocumentVersionOut(BaseModel):
    id: str
    version_no: int
    file_name: str
    sha256: str
    size_bytes: int
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
    overridden_by: Optional[str] = None
    override_reason: Optional[str] = None

class TriageOverrideRequest(BaseModel):
    new_tier: str
    reason: str

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

class ScheduleAcceptRequest(BaseModel):
    case_id: str
    slot_start: str
    slot_end: str
    courtroom: str
    judge_id: str

# Citizen & Legal Aid Schemas
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
    disclaimer: str

class EligibilityCheckRequest(BaseModel):
    annual_income: float
    is_woman_or_child: bool = False
    is_sc_st: bool = False
    in_custody: bool = False
    has_disability: bool = False
    is_victim_of_trafficking_or_disaster: bool = False

class EligibilityCheckResponse(BaseModel):
    is_eligible: bool
    scheme: str
    legal_basis: str # Legal Services Authorities Act, 1987 (Section 12)
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

