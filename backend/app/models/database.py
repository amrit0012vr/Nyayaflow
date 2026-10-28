import uuid
from datetime import datetime, timezone
from typing import Generator
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, DateTime, JSON, ForeignKey, create_engine
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker, Session
from app.config import settings

Base = declarative_base()

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(128), nullable=False)
    email = Column(String(128), unique=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    role = Column(String(32), nullable=False) # judge, clerk, lawyer, police, citizen, admin, auditor
    org = Column(String(128), default="District Court")
    status = Column(String(32), default="active")
    mfa_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

class Case(Base):
    __tablename__ = "cases"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_number = Column(String(64), unique=True, nullable=False)
    title = Column(String(256), nullable=False)
    court = Column(String(128), default="Chief Judicial Magistrate, Patiala House Courts")
    case_type = Column(String(64), nullable=False) # Bail, Criminal Trial, Civil Suit, Habeas Corpus, Maintenance
    status = Column(String(32), default="pending") # pending, scheduled, disposed, under_review
    filing_date = Column(String(32), nullable=False)
    custody_flag = Column(Boolean, default=False)
    custody_since = Column(String(32), nullable=True) # ISO Date or null
    statutory_deadline = Column(String(32), nullable=True) # ISO Date or null
    vulnerable_party = Column(Boolean, default=False) # Senior Citizen, minor, disability, woman
    vulnerability_reason = Column(String(256), nullable=True)
    complainant = Column(String(128), default="State of Delhi")
    accused = Column(String(128), nullable=True)
    related_case_ids = Column(JSON, default=list) # Clubbing related cases
    created_at = Column(DateTime, default=utc_now)

    documents = relationship("Document", back_populates="case", cascade="all, delete-orphan")
    triage = relationship("TriageResult", back_populates="case", uselist=False, cascade="all, delete-orphan")
    summaries = relationship("Summary", back_populates="case", cascade="all, delete-orphan")
    hearings = relationship("Hearing", back_populates="case", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("cases.id"), nullable=False)
    title = Column(String(256), nullable=False)
    doc_type = Column(String(64), default="other") # fir, charge_sheet, bail_application, order, petition, medical_report
    language = Column(String(16), default="en")
    uploaded_by = Column(String(128), nullable=False)
    classification_level = Column(String(32), default="restricted") # public, restricted, confidential
    created_at = Column(DateTime, default=utc_now)

    case = relationship("Case", back_populates="documents")
    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")
    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")
    redactions = relationship("RedactionMap", back_populates="document", cascade="all, delete-orphan")

class DocumentVersion(Base):
    __tablename__ = "document_versions"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False)
    version_no = Column(Integer, default=1)
    file_name = Column(String(256), nullable=False)
    object_key = Column(String(256), nullable=False) # Encrypted local or S3 path
    sha256 = Column(String(64), nullable=False) # Content integrity digest
    size_bytes = Column(Integer, default=0)
    encrypted_key_ref = Column(String(128), default="MASTER-AES-256-GCM")
    created_at = Column(DateTime, default=utc_now)

    document = relationship("Document", back_populates="versions")

class Chunk(Base):
    __tablename__ = "chunks"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False)
    page = Column(Integer, default=1)
    span_start = Column(Integer, default=0)
    span_end = Column(Integer, default=0)
    text_redacted = Column(Text, nullable=False)
    embedding_json = Column(JSON, nullable=True) # Lightweight embedding vector for semantic search
    created_at = Column(DateTime, default=utc_now)

    document = relationship("Document", back_populates="chunks")

class RedactionMap(Base):
    __tablename__ = "redaction_map"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False)
    token = Column(String(64), nullable=False) # e.g. [PERSON_1], [PHONE_1]
    encrypted_value = Column(Text, nullable=False) # AES-256 encrypted original PII
    category = Column(String(32), default="pii") # name, phone, aadhaar, minor, address
    created_at = Column(DateTime, default=utc_now)

    document = relationship("Document", back_populates="redactions")

class TriageResult(Base):
    __tablename__ = "triage_results"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("cases.id"), unique=True, nullable=False)
    score = Column(Integer, nullable=False) # 0 to 100
    tier = Column(String(32), nullable=False) # critical, high, normal, low
    factors = Column(JSON, default=list) # List of factor breakdown objects
    reasons = Column(JSON, default=list) # Plain language explanations
    needs_human_review = Column(Boolean, default=True)
    overridden_by = Column(String(128), nullable=True)
    override_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    case = relationship("Case", back_populates="triage")

class Summary(Base):
    __tablename__ = "summaries"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("cases.id"), nullable=False)
    variant = Column(String(32), default="judge") # judge, lawyer, citizen
    brief = Column(Text, nullable=False)
    timeline = Column(JSON, default=list) # Chronological events with dates and citations
    issues = Column(JSON, default=list) # Key legal issues
    positions = Column(JSON, default=dict) # {"petitioner": "...", "respondent": "..."}
    pending_deadlines = Column(JSON, default=list)
    citations_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    case = relationship("Case", back_populates="summaries")

class Hearing(Base):
    __tablename__ = "hearings"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("cases.id"), nullable=False)
    slot_start = Column(String(32), nullable=False) # ISO 8601
    slot_end = Column(String(32), nullable=False)
    courtroom = Column(String(64), default="Courtroom 3")
    judge_id = Column(String(128), default="Hon'ble Justice K. Sharma")
    status = Column(String(32), default="scheduled") # scheduled, adjourned, completed
    created_at = Column(DateTime, default=utc_now)

    case = relationship("Case", back_populates="hearings")

class ScheduleSuggestion(Base):
    __tablename__ = "schedule_suggestions"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), nullable=False)
    suggestions = Column(JSON, default=list)
    conflicts = Column(JSON, default=list)
    run_id = Column(String(64), default=generate_uuid)
    created_at = Column(DateTime, default=utc_now)

class AgentRun(Base):
    __tablename__ = "agent_runs"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), nullable=True)
    agent = Column(String(64), nullable=False)
    model = Column(String(64), default="hybrid-rule-llm")
    prompt_version = Column(String(32), default="v1.0")
    input_hash = Column(String(64), nullable=False)
    output_hash = Column(String(64), nullable=False)
    latency_ms = Column(Integer, default=0)
    tokens = Column(Integer, default=0)
    status = Column(String(32), default="success")
    created_at = Column(DateTime, default=utc_now)

class AuditLog(Base):
    __tablename__ = "audit_log"
    id = Column(Integer, primary_key=True, autoincrement=True)
    ts = Column(String(32), nullable=False) # ISO 8601
    actor_id = Column(String(128), nullable=False)
    actor_name = Column(String(128), default="System")
    action = Column(String(64), nullable=False) # upload, view, decrypt, triage, override, schedule, verify
    object_type = Column(String(64), nullable=False) # document, case, schedule, audit
    object_id = Column(String(128), nullable=False)
    details = Column(JSON, default=dict)
    prev_hash = Column(String(64), nullable=False)
    entry_hash = Column(String(64), nullable=False)

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    session_id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(128), nullable=True)
    language = Column(String(16), default="en") # en, hi, or
    created_at = Column(DateTime, default=utc_now)

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), nullable=False)
    role = Column(String(32), nullable=False) # user, assistant, system
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)

class KnowledgeBaseDoc(Base):
    __tablename__ = "kb_documents"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(256), nullable=False)
    category = Column(String(64), default="legal_aid") # legal_aid, rights, procedure
    language = Column(String(16), default="en")
    content = Column(Text, nullable=False)
    source_url = Column(String(256), nullable=True)
    created_at = Column(DateTime, default=utc_now)

# Database Engine Setup
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
