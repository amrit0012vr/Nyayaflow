import { Case, TriageResponse, SummaryResponse, ScheduleSlot, AuditEntry, User, CaseStatusPublic, EligibilityResult } from '../types';

const API_BASE = ((import.meta as any).env?.VITE_API_BASE_URL || '') + '/api/v1';

// AUTH-05: In-memory token storage (NEVER in localStorage/sessionStorage)
let accessToken: string | null = null;
let isRefreshing = false;
let sessionExpiredCallback: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function onSessionExpired(callback: () => void) {
  sessionExpiredCallback = callback;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // Include credentials for HttpOnly refresh cookie
  options.credentials = 'include';
  options.headers = headers;

  let res = await fetch(url, options);

  // AUTH-05 / UI-03: Silent refresh on 401
  if (res.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh') && !isRefreshing) {
    isRefreshing = true;
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        accessToken = refreshData.access_token;
        headers.set('Authorization', `Bearer ${accessToken}`);
        res = await fetch(url, options);
      } else {
        accessToken = null;
        if (sessionExpiredCallback) sessionExpiredCallback();
      }
    } catch {
      accessToken = null;
      if (sessionExpiredCallback) sessionExpiredCallback();
    } finally {
      isRefreshing = false;
    }
  }

  if (!res.ok) {
    let errorDetail = 'Request failed';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    }
    const err = new Error(errorDetail);
    (err as any).status = res.status;
    throw err;
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export const api = {
  // Authentication (AUTH-03, AUTH-04, AUTH-05)
  async login(creds: { email: string; password: string; persona: string }): Promise<{ access_token: string; user: User }> {
    const data = await request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds)
    });
    setAccessToken(data.access_token);
    return data;
  },

  async refresh(): Promise<{ access_token: string; user: User }> {
    const data = await request<{ access_token: string; user: User }>('/auth/refresh', {
      method: 'POST'
    });
    setAccessToken(data.access_token);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      setAccessToken(null);
    }
  },

  async getMe(): Promise<User> {
    return request<User>('/auth/me');
  },

  // Cases (DATA-02, DATA-04)
  async getCases(tier?: string, status?: string, search?: string): Promise<Case[]> {
    const params = new URLSearchParams();
    if (tier) params.append('tier', tier);
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    return request<Case[]>(`/cases?${params.toString()}`);
  },

  async getCaseDetail(id: string): Promise<any> {
    return request<any>(`/cases/${id}`);
  },

  async createCase(caseData: any): Promise<Case> {
    return request<Case>('/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caseData)
    });
  },

  async processCase(id: string): Promise<any> {
    return request<any>(`/cases/${id}/process`, {
      method: 'POST'
    });
  },

  async reviewCase(id: string, reviewState: 'approved' | 'rejected', reviewNote?: string): Promise<any> {
    return request<any>(`/cases/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review_state: reviewState, review_note: reviewNote })
    });
  },

  // Citizen Portal (DATA-03, LA-01, LA-06)
  async getMyCases(): Promise<CaseStatusPublic[]> {
    return request<CaseStatusPublic[]>('/me/cases');
  },

  async sendCitizenChat(message: string, language: string = 'en', caseNumber?: string): Promise<any> {
    return request<any>('/legal-aid/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, language, case_number: caseNumber })
    });
  },

  async checkEligibility(params: any): Promise<EligibilityResult> {
    return request<EligibilityResult>('/legal-aid/check-eligibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
  },

  // Triage (TRI-01, TRI-04)
  async getTriage(id: string): Promise<TriageResponse> {
    return request<TriageResponse>(`/cases/${id}/triage`);
  },

  async overrideTriage(id: string, newTier: string, reason: string): Promise<any> {
    return request<any>(`/cases/${id}/triage/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_tier: newTier, reason })
    });
  },

  // Summaries (SUM-01)
  async getSummary(id: string, variant: string = 'judge'): Promise<SummaryResponse> {
    return request<SummaryResponse>(`/cases/${id}/summary?variant=${variant}`);
  },

  // Scheduling (SCH-01, SCH-04)
  async getScheduleSuggestions(caseId: string): Promise<{ suggestions: ScheduleSlot[]; conflicts: string[]; solver: string }> {
    return request<{ suggestions: ScheduleSlot[]; conflicts: string[]; solver: string }>('/schedule/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: caseId })
    });
  },

  async acceptSchedule(caseId: string, slot: ScheduleSlot): Promise<any> {
    return request<any>('/schedule/accept', {
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
  },

  async getHearings(): Promise<any[]> {
    return request<any[]>('/schedule/hearings');
  },

  // Documents & Police Evidence (SEC-03, SEC-07, POLICE)
  async uploadDocument(caseId: string, file: File, docType: string = 'other'): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);
    formData.append('auto_process', 'true');
    return request<any>(`/cases/${caseId}/documents`, {
      method: 'POST',
      body: formData
    });
  },

  async getPoliceEvidence(): Promise<any[]> {
    return request<any[]>('/evidence');
  },

  // Audit (SEC-04, SEC-05)
  async getAuditLogs(): Promise<AuditEntry[]> {
    return request<AuditEntry[]>('/audit?limit=50');
  },

  async verifyAuditChain(): Promise<{ is_valid: boolean; total_entries_checked: number; broken_at_id?: number; message: string }> {
    return request<any>('/audit/verify', {
      method: 'POST'
    });
  },

  async simulateTamper(entryId: number): Promise<any> {
    return request<any>('/audit/simulate-tamper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry_id: entryId, fake_action: 'unauthorized_evidence_tamper' })
    });
  },

  // Evaluation & Backlog Stats (EVAL-01, PIL-04)
  async getEvaluationSummary(): Promise<any> {
    return request<any>('/evaluation/summary');
  },

  // Admin User Management (UI-09, SEC-14)
  async getAdminUsers(): Promise<any[]> {
    return request<any[]>('/admin/users');
  },

  async createAdminUser(userData: any): Promise<any> {
    return request<any>('/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
  },

  async updateAdminUser(userId: string, updateData: any): Promise<any> {
    return request<any>(`/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
  }
};
