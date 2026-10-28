import { Case, TriageResponse, SummaryResponse, ScheduleSlot, AuditEntry } from '../types';

const API_BASE = '/api/v1';

export const api = {
  async getCases(tier?: string, status?: string, search?: string): Promise<Case[]> {
    const params = new URLSearchParams();
    if (tier) params.append('tier', tier);
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/cases?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch cases');
    return res.json();
  },

  async getCaseDetail(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/cases/${id}`);
    if (!res.ok) throw new Error('Failed to fetch case detail');
    return res.json();
  },

  async createCase(caseData: any): Promise<Case> {
    const res = await fetch(`${API_BASE}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caseData)
    });
    if (!res.ok) throw new Error('Failed to create case');
    return res.json();
  },

  async processCase(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/cases/${id}/process`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to run pipeline');
    return res.json();
  },

  async getTriage(id: string): Promise<TriageResponse> {
    const res = await fetch(`${API_BASE}/cases/${id}/triage`);
    if (!res.ok) throw new Error('Failed to fetch triage');
    return res.json();
  },

  async overrideTriage(id: string, newTier: string, reason: string): Promise<any> {
    const res = await fetch(`${API_BASE}/cases/${id}/triage/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_tier: newTier, reason })
    });
    if (!res.ok) throw new Error('Failed to override triage');
    return res.json();
  },

  async getSummary(id: string, variant: string = 'judge'): Promise<SummaryResponse> {
    const res = await fetch(`${API_BASE}/cases/${id}/summary?variant=${variant}`);
    if (!res.ok) throw new Error('Failed to fetch summary');
    return res.json();
  },

  async getScheduleSuggestions(caseId: string): Promise<{ suggestions: ScheduleSlot[]; conflicts: string[] }> {
    const res = await fetch(`${API_BASE}/schedule/suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: caseId })
    });
    if (!res.ok) throw new Error('Failed to fetch schedule suggestions');
    return res.json();
  },

  async acceptSchedule(caseId: string, slot: ScheduleSlot): Promise<any> {
    const res = await fetch(`${API_BASE}/schedule/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        case_id: caseId,
        slot_start: slot.slot_start,
        slot_end: slot.slot_end,
        courtroom: slot.courtroom,
        judge_id: slot.judge_id
      })
    });
    if (!res.ok) throw new Error('Failed to accept schedule');
    return res.json();
  },

  async uploadDocument(caseId: string, file: File, docType: string = 'other'): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);
    formData.append('auto_process', 'true');
    const res = await fetch(`${API_BASE}/cases/${caseId}/documents`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to upload document');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditEntry[]> {
    const res = await fetch(`${API_BASE}/audit?limit=50`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async verifyAuditChain(): Promise<{ is_valid: boolean; total_entries_checked: number; broken_at_id?: number; message: string }> {
    const res = await fetch(`${API_BASE}/audit/verify`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to verify audit chain');
    return res.json();
  },

  async simulateTamper(entryId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/audit/simulate-tamper`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry_id: entryId, fake_action: 'unauthorized_evidence_tamper' })
    });
    if (!res.ok) throw new Error('Failed to simulate tampering');
    return res.json();
  },

  async sendCitizenChat(message: string, language: string = 'en', caseNumber?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/legal-aid/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, language, case_number: caseNumber })
    });
    if (!res.ok) throw new Error('Failed to send citizen chat');
    return res.json();
  },

  async checkEligibility(params: any): Promise<any> {
    const res = await fetch(`${API_BASE}/legal-aid/check-eligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to check eligibility');
    return res.json();
  }
};
