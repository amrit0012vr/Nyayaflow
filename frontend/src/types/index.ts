export interface Case {
  id: string;
  case_number: string;
  title: string;
  court: string;
  case_type: string;
  status: string;
  filing_date: string;
  custody_flag: boolean;
  custody_since?: string;
  statutory_deadline?: string;
  vulnerable_party: boolean;
  vulnerability_reason?: string;
  complainant?: string;
  accused?: string;
  triage_score?: number;
  triage_tier?: 'critical' | 'high' | 'normal' | 'low' | 'unranked';
  document_count: number;
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

