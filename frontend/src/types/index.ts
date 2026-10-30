export interface User {
  id: string;
  name: string;
  email: string;
  role: 'judge' | 'clerk' | 'lawyer' | 'police' | 'citizen' | 'auditor' | 'admin';
  org: string;
  court?: string;
  registry?: string;
  permissions: string[];
}

export interface Case {
  id: string;
  case_number: string;
  title: string;
  court: string;
  court_id?: string;
  courtroom?: string;
  case_type: string;
  status: string;
  filing_date: string;
  custody_flag: boolean;
  custody_since?: string;
  statutory_deadline?: string;
  max_sentence_months?: number;
  vulnerable_party: boolean;
  vulnerability_reason?: string;
  complainant?: string;
  accused?: string;
  triage_score?: number;
  triage_tier?: 'critical' | 'high' | 'normal' | 'low' | 'unranked';
  triage_review_state?: string;
  summary_review_state?: string;
  document_count: number;
}

export interface CaseStatusPublic {
  case_number: string;
  court: string;
  stage_label: string;
  next_hearing?: string;
  courtroom?: string;
  status_explanation: string;
  legal_aid_hint: string;
}

export interface TriageFactor {
  name: string;
  value: string;
  points: number;
  max_points: number;
  source?: any;
}

export interface TriageResponse {
  case_id: string;
  score: number;
  tier: 'critical' | 'high' | 'normal' | 'low';
  factors: TriageFactor[];
  reasons: string[];
  needs_human_review: boolean;
  review_state?: string;
  reviewed_by?: string;
  overridden_by?: string;
  override_reason?: string;
}

export interface SourceCitation {
  document_id: string;
  page: number;
  span: number[];
  excerpt?: string;
}

export interface TimelineEvent {
  date: string;
  event: string;
  source?: SourceCitation;
}

export interface SummaryResponse {
  case_id: string;
  variant: string;
  brief: string;
  timeline: TimelineEvent[];
  issues: string[];
  positions: { [key: string]: string };
  pending_deadlines: { what: string; due: string; source?: SourceCitation }[];
  citations_verified: boolean;
  review_state?: string;
  reviewed_by?: string;
  generated_by?: string;
}

export interface ScheduleSlot {
  slot_start: string;
  slot_end: string;
  courtroom: string;
  judge_id: string;
  score: number;
  reasons: string[];
}

export interface AuditEntry {
  id: number;
  ts: string;
  actor_id: string;
  actor_name: string;
  action: string;
  object_type: string;
  object_id: string;
  details: any;
  prev_hash: string;
  entry_hash: string;
}

export interface EligibilityResult {
  is_eligible: boolean;
  clause: string;
  scheme: string;
  legal_basis: string;
  state_income_limit: number;
  notes: string;
  next_steps: string[];
  helpline: string;
}
