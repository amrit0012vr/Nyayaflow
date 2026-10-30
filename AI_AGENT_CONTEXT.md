# NyayaFlow — Comprehensive Architecture & Codebase Specification
> **For AI Coding Agents & Human Core Maintainers**
> **Repository:** `.` (Root) | **Licence:** Apache-2.0  
> **Hackathon Track:** Bharat Agentic-AI Hackathon 2026 — Track 07: *Timely Justice: Legal Backlog*

---

## 1. System Overview & Core Philosophy

**NyayaFlow** is an open-source, secure, multi-agent AI system built to eliminate judicial delays in India's court system (addressing **50.4+ Million pending cases** and an **under-trial population exceeding 75%**).

### The Two-Layer Architecture
1. **Layer A — Secure Document Core (The Foundation):**
   - Enforces **AES-256-GCM envelope encryption** with HKDF-SHA256 derived data keys and domain context separation (`nyayaflow-document-storage-v1`).
   - Maintains an **append-only, cryptographic SHA-256 hash-chained audit trail** with re-entrant mutex serialization (`_audit_lock`) where every view, decryption, triage scoring, and scheduling event is mathematically tamper-evident.
   - Automates **reversible PII redaction** across 12 statutory identifier categories conforming to India's *Digital Personal Data Protection (DPDP) Act, 2023*.
   - Implements **Role-Based Access Control (RBAC)** and strict **tenant data scoping (`visible_cases`)** across 7 distinct personas: *Judge*, *Court Registry Clerk*, *Advocate*, *Police / Investigating Officer (IO)*, *Citizen / Litigant*, *Auditor / Vigilance*, and *Court Administrator*.

2. **Layer B — Agentic Decision Support (The Differentiator):**
   - **Intake Agent:** Classifies legal documents, extracts statutory sections (IPC, BNS 2023, CrPC, BNSS 2023, NDPS, POCSO), parties, and critical dates.
   - **Triage Agent:** Transparent heuristic weights (`triage_config.yaml`) computing urgency scores ($0\text{--}100$) prioritizing under-trial detention (>50% max sentence under 436A CrPC / 479 BNSS), statutory limitation proximity, case age, and vulnerable litigants into 4 tiers (*Critical*, *High*, *Medium*, *Standard*).
   - **Summarisation Agent:** Constructs structured 1-page Bench Briefs ($\le 250$ words) for judges, chronological timelines, and framed legal issues.
   - **Citation Verifier:** An anti-hallucination guardrail validating that every factual claim links to exact ground-truth character spans (`{document_id, page, span}`) in source chunks. Rejected excerpts are withheld from cause lists.
   - **Scheduling Agent:** A constraint optimization engine using Google OR-Tools CP-SAT with priority-score weighted objective maximization, gazetted holiday exclusions (`data/court_holidays.json`), and deterministic greedy fallback.
   - **Legal Aid Agent:** A multilingual citizen assistant (English, हिन्दी, ଓଡ଼ିଆ) providing case status explication and statutory eligibility determination under Section 12 of the *Legal Services Authorities Act, 1987*.

---

## 2. Complete Repository File Map

```
nyayaflow/
├── README.md                          # Quickstart, architecture summary, benchmark table
├── PROJECT.md                         # Official hackathon track specification
├── AI_AGENT_CONTEXT.md                # Full deep-dive architectural context
├── LICENSE                            # Apache-2.0 legal license
├── SECURITY.md                        # Threat model, crypto details, responsible disclosure
├── CONTRIBUTING.md                    # Contributor guide and coding standards
├── docker-compose.yml                 # Multi-container orchestration (DB, MinIO, API, Web)
├── Dockerfile                         # Python 3.12 pinned backend image
├── .env.example                       # Reference environment variables
├── .gitignore                         # Git exclusion rules
├── pyrightconfig.json                 # Pinned Python 3.12 type checker configuration
├── docs/
│   ├── architecture.md                # System diagrams & agent state machines
│   ├── security.md                    # Cryptographic model, threat mitigations, DPDP Act
│   ├── decisions.md                   # Architecture Decision Records (ADRs 001-008)
│   ├── personas.md                    # 7-Persona operational workflows & permissions
│   ├── api.md                         # Complete REST API reference
│   ├── demo-script.md                 # 3-Minute and 5-Minute presentation scripts
│   ├── submission-checklist.md        # Track 07 requirements cross-check
│   ├── evaluation.md                  # Benchmark test results across all 6 track metrics
│   ├── pilot-report.md                # Real-world practitioner pilot results
│   ├── audit-anchors.md               # Cryptographic audit head anchor registry
│   └── credits.md                     # Third-party notices and licenses
├── data/
│   ├── court_holidays.json            # 14 gazetted court holidays for 2026
│   ├── kb/section12_rules.yaml        # Section 12 LSAA 1987 rules (clauses a-h) & state limits
│   ├── eval/ground_truth.json         # 30 documents, 20 cases, 30 grounded QA pairs
│   ├── eval/expert_triage_ranking.json# Judicial benchmark ranking ground truth
│   ├── stats/backlog_stats.json       # Official NJDG and NCRB backlog data
│   └── pilot/pilot_data.csv           # Baseline vs. NyayaFlow timing logs
├── scripts/
│   ├── seed_demo_data.py              # Seeds 11 personas and 6 scoped cases
│   ├── anchor_audit_head.py           # Anchors chain head to docs/audit-anchors.md
│   ├── purge_chat_history.py          # Data retention compliance tool
│   ├── build_pilot_report.py          # Generates pilot statistical report
│   └── run_eval.py                    # Dynamic evaluation benchmark script
├── backend/
│   ├── Dockerfile                     # Python 3.12 image
│   ├── requirements.txt               # Pinned backend dependencies
│   ├── app/
│   │   ├── main.py                    # FastAPI entrypoint, security headers, routers
│   │   ├── config.py                  # Settings, validate_security()
│   │   ├── core/
│   │   │   ├── permissions.py         # 7-role permission matrix
│   │   │   ├── security.py            # PBKDF2 password hashing & JWT handling
│   │   │   ├── encryption.py          # HKDF-SHA256 & AES-256-GCM envelope encryption
│   │   │   ├── hashing.py             # SHA-256 computation
│   │   │   ├── scope.py               # visible_cases() tenant scoping
│   │   │   └── rbac.py                # require_permission, lockout enforcement
│   │   ├── models/database.py         # SQLAlchemy 2.0 ORM schemas
│   │   ├── schemas/schemas.py         # Pydantic schemas (including CaseStatusPublic)
│   │   ├── services/
│   │   │   ├── audit.py               # _audit_lock, verify_audit_chain, get_audit_head
│   │   │   ├── documents.py           # validate_uploaded_file (magic bytes, 25MB)
│   │   │   ├── redaction.py           # 12 PII categories + POCSO masking
│   │   │   └── verification.py        # CitationVerifier negative excerpt matcher
│   │   ├── agents/
│   │   │   ├── triage.py              # TriageAgent with sentence fraction heuristic
│   │   │   ├── triage_config.yaml     # Configurable urgency scoring weights
│   │   │   ├── scheduling.py          # SchedulingAgent (OR-Tools CP-SAT)
│   │   │   └── legal_aid.py           # LegalAidAgent (Section 12 calculator & chat)
│   │   └── llm/client.py              # Pluggable LLM client with <document_data> boundary
│   └── tests/                         # 55 passing unit and integration tests
└── frontend/
    ├── package.json                   # React 18, React Router 7, Vite 5, Vitest
    ├── vite.config.ts                 # Dev server configuration
    └── src/
        ├── App.tsx                    # React Router with role guards
        ├── components/                # Modular UI widgets
        ├── pages/                     # Protected persona pages
        ├── context/AuthContext.tsx     # In-memory access token & idle timeout
        ├── lib/api.ts                 # Axios-like typed client with silent refresh
        ├── lib/permissions.ts         # hasPermission & getRoleHomeRoute
        ├── lib/routes.ts              # Route registry & navigation permissions
        └── tests/                     # Vitest unit & guard test suites
```

---

## 3. Test & Evaluation Execution

```bash
# 1. Run Complete Backend Pytest Suite (55 tests)
python -m pytest backend/tests -v

# 2. Run Track 07 System Evaluation Benchmark
python scripts/run_eval.py

# 3. Run Frontend Vitest Unit & Guard Suite
cd frontend && npm test

# 4. Compile Frontend Production Bundle
cd frontend && npm run build
```
