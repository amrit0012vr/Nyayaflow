# Bharat Agentic-AI Hackathon 2026 — Track 07 Submission Checklist

| Category | Requirement | Specification | Implementation File(s) | Status |
|---|---|---|---|:---:|
| **Authentication** | AUTH-01 | Public `/login` page with 6 public personas + Admin mode | `frontend/src/pages/LoginPage.tsx` |  VERIFIED |
| | AUTH-02 | Generic 401 on bad password / bad email / persona mismatch (no enumeration) | `backend/app/api/auth.py` |  VERIFIED |
| | AUTH-03 | 15-minute account lockout after 5 consecutive failed attempts (429) | `backend/app/api/auth.py`, `backend/tests/test_auth.py` |  VERIFIED |
| | AUTH-04 | In-memory access token storage (no localStorage/sessionStorage) | `frontend/src/lib/api.ts`, `frontend/src/tests/api.test.ts` |  VERIFIED |
| | AUTH-05 | HttpOnly refresh token rotation and session family reuse revocation | `backend/app/api/auth.py`, `backend/tests/test_auth.py` |  VERIFIED |
| **RBAC & Scoping** | RBAC-01 | 7 distinct personas (Judge, Clerk, Lawyer, Police, Citizen, Auditor, Admin) | `backend/app/core/permissions.py` |  VERIFIED |
| | RBAC-02 | React Router route guards with `RequireAuth` and `RequirePermission` | `frontend/src/components/RequireAuth.tsx`, `RequirePermission.tsx` |  VERIFIED |
| | RBAC-03 | Removal of demo persona-switcher navbar | `frontend/src/components/Navbar.tsx` |  VERIFIED |
| | RBAC-04 | Strict data scoping (`visible_cases`): Advocate A cannot see Advocate B's cases (404) | `backend/app/core/scope.py`, `backend/tests/test_scoping.py` |  VERIFIED |
| | RBAC-05 | Citizen isolated strictly to Chat, Eligibility, and Public Status | `frontend/src/App.tsx`, `backend/tests/test_scoping.py` |  VERIFIED |
| | RBAC-06 | `CaseStatusPublic` strictly excludes triage scores, factors, internal notes | `backend/app/schemas/schemas.py`, `backend/tests/test_citizen_contract.py` |  VERIFIED |
| **Security** | SEC-01 | `.gitignore` prevents committing secrets, SQLite DB, storage, logs | `.gitignore` |  VERIFIED |
| | SEC-02 | Fail-fast validation in non-development mode (`validate_security()`) | `backend/app/config.py`, `backend/tests/test_security_config.py` |  VERIFIED |
| | SEC-03 | HKDF-SHA256 key derivation with per-document wrapped data keys | `backend/app/core/encryption.py`, `backend/tests/test_encryption.py` |  VERIFIED |
| | SEC-04 | Gated `/audit/simulate-tamper` (`DEMO_MODE=true` only) | `backend/app/api/audit.py`, `backend/app/config.py` |  VERIFIED |
| | SEC-05 | Concurrency serialization lock on audit appends | `backend/app/services/audit.py`, `backend/tests/test_audit_concurrency.py` |  VERIFIED |
| | SEC-06 | External audit head anchoring utility | `scripts/anchor_audit_head.py`, `docs/audit-anchors.md` |  VERIFIED |
| | SEC-07 | File upload validation (magic bytes, size <= 25MB, extension allowlist) | `backend/app/services/documents.py`, `backend/tests/test_upload_validation.py` |  VERIFIED |
| **AI / Agent Layer** | AI-01 | Pluggable LLM interface (`none`, `ollama`, `openai_compatible`) | `backend/app/llm/client.py`, `backend/tests/test_llm_fallback.py` |  VERIFIED |
| | AI-02 | Prompt-injection defense using `<document_data>` XML isolation | `backend/app/llm/client.py`, `backend/tests/test_llm_fallback.py` |  VERIFIED |
| | AI-03 | Transparent triage weights in YAML with sentence fraction heuristic | `backend/app/agents/triage_config.yaml`, `backend/app/agents/triage.py` |  VERIFIED |
| | AI-04 | Section 12 LSAA 1987 rules (clauses a–h) with state income limits | `data/kb/section12_rules.yaml`, `backend/tests/test_legal_aid_rules.py` |  VERIFIED |
| | AI-05 | Google OR-Tools CP-SAT scheduler with holiday exclusions & greedy fallback | `backend/app/agents/scheduling.py`, `backend/tests/test_scheduling_ortools.py` |  VERIFIED |
| | AI-06 | Strict negative citation verifier rejecting fabricated/altered citations | `backend/app/services/verification.py`, `backend/tests/test_citation_negative.py` |  VERIFIED |
| **Evaluation & Pilot** | EVAL-01 | Ground truth dataset (30 docs, 20 cases, 30 QA) & expert triage ranking | `data/eval/ground_truth.json`, `data/eval/expert_triage_ranking.json` |  VERIFIED |
| | EVAL-02 | Official NJDG/NCRB judicial backlog stats | `data/stats/backlog_stats.json` |  VERIFIED |
| | EVAL-03 | Pilot throughput model & protocol | `data/pilot/pilot_data.csv`, `scripts/build_pilot_report.py`, `docs/pilot-report.md` |  VERIFIED |
| | EVAL-04 | Dynamic evaluation script computing metrics from scratch | `scripts/run_eval.py`, `docs/evaluation.md` |  VERIFIED |
| **Tests & DevOps** | OPS-01 | Pin Python to **3.12** in Docker, CI, pyright, and documentation | `Dockerfile`, `docker-compose.yml`, `pyrightconfig.json` |  VERIFIED |
| | OPS-02 | Backend pytest test suite (55 tests passing) | `backend/tests/` |  VERIFIED |
| | OPS-03 | Frontend Vitest test suite (5 tests passing) & production build | `frontend/src/tests/`, `npm run build` |  VERIFIED |
| | OPS-04 | Docker Compose configuration with demo profile and seeding | `docker-compose.yml`, `Dockerfile` |  VERIFIED |

