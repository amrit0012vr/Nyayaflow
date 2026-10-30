# NyayaFlow — Official Demonstration Scripts (Track 07: Timely Justice)

This document contains step-by-step presentation scripts for the Bharat Agentic-AI Hackathon 2026.

---

## 3-Minute Rapid Hackathon Demo Flow

| Timing | Persona / Action | Screen / Endpoint | What to Say / Demonstrate |
|---|---|---|---|
| **0:00 - 0:25** | **The Crisis & Problem** | Intro / Slide / Terminal | *"According to official NJDG & NCRB statistics, Indian courts face over 50.4 million pending cases, with 434,000+ undertrials languishing in prisons. 75.8% of our prison population is awaiting trial. Delays compound because judicial staff spend 60% of their day manually parsing petitions, scheduling dates on paper, and checking eligibility."* |
| **0:25 - 0:50** | **Court Clerk** | `/login` ➔ `/intake` | 1. Quick-login as **Court Registry Clerk** (`clerk1@nyayaflow.demo`).<br>2. Upload an e-FIR/Bail Petition (`.pdf`). Magic bytes and size limits are verified.<br>3. Point out DPDP Act compliance: Aadhaar, phone numbers, and witness identities are instantly masked with encrypted tokens (`[AADHAAR_1]`). |
| **0:50 - 1:20** | **Judge / Judicial Bench** | `/cases` ➔ `/cases/:id` | 1. Quick-login as **Judge** (`judge1@nyayaflow.demo`).<br>2. Cause list is dynamically ranked by urgency (undertrial custody duration, 436A CrPC/BNSS thresholds, vulnerable parties).<br>3. Open *State vs. Vikram Singh* (Tier: Critical).<br>4. Review 1-page Bench Brief. Click highlighted citation — source excerpt highlights page 3 of charge sheet.<br>5. Approve CP-SAT recommended hearing date (conflict-free). |
| **1:20 - 1:45** | **Advocate & Scoping** | `/my-cases` | 1. Login as **Advocate 1** (`advocate1@nyayaflow.demo`).<br>2. Show *My Cases* list showing only assigned matters.<br>3. Attempt to navigate directly to Advocate 2's matter (`/cases/case-002`).<br>4. Show **HTTP 404 Not Found** tenant isolation without leaking confidential existence. |
| **1:45 - 2:15** | **Citizen (Nyaya Sahayak)** | `/citizen` ➔ `/citizen/eligibility` | 1. Login as **Citizen Litigant** (`citizen1@nyayaflow.demo`).<br>2. Show strict isolation: Citizen ONLY sees Chat, Section 12 Eligibility, and My Case Status (zero internal judicial scores leaked).<br>3. Run Section 12 calculator: In custody + under state income ceiling ➔ 100% Free Legal Aid eligible.<br>4. Ask chatbot in Hindi (*"Mujhe sarkari vakil kaise milega?"*) ➔ grounded NALSA 15100 guidance. |
| **2:15 - 2:40** | **Auditor & Vigilance** | `/audit` | 1. Login as **Auditor** (`auditor1@nyayaflow.demo`).<br>2. Click **Verify Ledger** ➔ all entries are cryptographically chained with SHA-256.<br>3. Click **Simulate Tamper (Demo)** ➔ modify an entry.<br>4. Re-verify: System instantly detects tampering at the exact entry ID! |
| **2:40 - 3:00** | **Evaluation & Conclusion** | `/evaluation` | 1. Show dynamic evaluation metrics: 93.3% classification accuracy, 83.3% PII recall, 0.998 Spearman rho, 100% citation negative test pass, 75% wait reduction.<br>2. Highlight open-source Apache-2.0 architecture and conclude. |

---

## 5-Minute Deep-Dive Extended Demo Flow

### Phase 1: Security & Governance Ingestion (1 min)
1. Showcase `backend/app/config.py` fail-fast validation (`validate_security()`).
2. Demonstrate how documents are encrypted using HKDF-SHA256 derived data keys wrapped by master keys.
3. Show upload rejection when attempting to submit executable payload (`.exe` / `.sh`) or spoofed file extension.

### Phase 2: Agentic Triage & Mathematical Scheduling (1.5 min)
1. Walk through `backend/app/agents/triage_config.yaml` transparent heuristic weights:
   - Custody over 50% max sentence: +35 points
   - Statutory bail deadline < 7 days: +25 points
   - Vulnerable party / minor: +20 points
2. Inspect Google OR-Tools CP-SAT formulation:
   - Zero double-booking of judge and courtroom
   - Exclusion of 14 gazetted court holidays from `data/court_holidays.json`
   - Earliest-slot objective optimization

### Phase 3: Zero-Hallucination Citation Verification (1 min)
1. Display the Bench Brief with strict source citation verification.
2. Show test output of `test_citation_negative.py`: fabricated citations, altered dates, or mismatched page numbers are 100% rejected.

### Phase 4: Multi-Tenant Role Isolation (1 min)
1. Walk through the 7-role permission matrix in `backend/app/core/permissions.py`.
2. Inspect `backend/app/core/scope.py` query filtering (`visible_cases`).
3. Show that unauthenticated requests to any API return 401; unauthorized access returns 403 with an audited `access_denied` log.

### Phase 5: Verification & External Anchoring (0.5 min)
1. Run `python scripts/anchor_audit_head.py`.
2. Show that the latest SHA-256 chain head is anchored in `docs/audit-anchors.md` for independent external verifiability.

