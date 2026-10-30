# Persona Workflows & Role Scoping Matrix — NyayaFlow

NyayaFlow implements a 7-persona judicial access control and scoping model designed around the statutory operational needs of the Indian subordinate judiciary (District Courts, Sessions, and CJM Benches).

---

## 1. Judge / Judicial Bench (`judge`)
- **Primary Goal:** Rapid review of daily urgency cause lists, instant comprehension of matters via 1-page bench briefs, verification of cited assertions, and human-in-the-loop approval of scheduled hearing dockets.
- **Assigned Pages:**
  - `/cases`: Urgency-ranked cause list filtered by custody duration, statutory deadlines, and vulnerability factors.
  - `/cases/:id`: Complete case dossier, AI brief, clickable citation verifier, and Human-in-the-Loop approval/rejection banner.
  - `/schedule`: Visual CP-SAT calendar of recommended hearing dates.
  - `/evaluation`: Official benchmark accuracy and pilot throughput metrics.
- **Permissions:** `case:list`, `case:read`, `case:process`, `doc:download`, `triage:read`, `summary:read:judge`, `summary:read:lawyer`, `review:write`, `schedule:suggest`, `schedule:accept`, `hearing:read`, `evaluation:read`.
- **Demo Scenario:** Justice Sengupta logs in to review the 10:30 AM bail list, opens an urgent custody case (*State vs. Vikram Singh*), clicks a highlighted bail citation to verify page 3 of the Charge Sheet, and approves the proposed hearing date.

---

## 2. Court Registry Clerk (`clerk`)
- **Primary Goal:** Digital filing intake, automated DPDP Act PII redaction and token vault generation, file attachment validation, and scheduling assistance.
- **Assigned Pages:**
  - `/intake`: Case registration and document upload with magic byte checking and real-time PII sanitization preview.
  - `/cases`: All cases filed in the registry for administrative status oversight.
  - `/cases/:id`: Dossier review and review state management.
  - `/schedule`: Managing courtroom slot availability.
- **Permissions:** `case:list`, `case:read`, `case:create`, `case:process`, `doc:upload`, `doc:download`, `triage:read`, `triage:override`, `summary:read:judge`, `summary:read:lawyer`, `review:write`, `schedule:suggest`, `schedule:accept`, `hearing:read`, `redaction:reveal`.
- **Demo Scenario:** Clerk Sharma uploads an e-FIR PDF; the system validates magic bytes, masks Aadhaar and witness numbers with cryptographic tokens, and indexes chunks for the bench brief.

---

## 3. Advocate / Legal Counsel (`lawyer`)
- **Primary Goal:** Track assigned court matters, inspect procedural orders, and review timelines without accessing unassigned confidential matters.
- **Assigned Pages:**
  - `/my-cases`: List restricted strictly to matters where the advocate is enrolled as legal counsel.
  - `/cases/:id`: Case dossier for assigned matters only (attempts to access unassigned matters return HTTP 404).
- **Permissions:** `case:list`, `case:read`, `doc:upload`, `doc:download`, `triage:read`, `summary:read:lawyer`, `hearing:read`.
- **Demo Scenario:** Advocate 1 reviews their assigned custody matter; attempting to navigate to Advocate 2's case URL triggers a clean 404 "Case not found" without leaking the existence of other records.

---

## 4. Police / Investigating Officer (`police`)
- **Primary Goal:** Secure deposition of charge sheets and forensic seizure memos with SHA-256 digital seals; inspect evidentiary chain-of-custody logs.
- **Assigned Pages:**
  - `/evidence`: Police Evidence Vault showing cryptographic chain-of-custody, SHA-256 seals, and upload interface.
  - `/my-cases`: List restricted to FIR matters investigated by the officer's police station.
  - `/cases/:id`: Assigned matter investigation files.
- **Permissions:** `case:list`, `case:read`, `doc:upload`, `doc:download`, `evidence:read`, `triage:read`, `summary:read:lawyer`.
- **Demo Scenario:** IO Verma uploads a forensic chemical report; NyayaFlow hashes the file on ingestion, appends the seal to the Merkle audit chain, and grants immediate access to the CJM bench.

---

## 5. Citizen / Litigant (`citizen`)
- **Primary Goal:** Multi-lingual procedural empowerment, Section 12 free legal aid qualification check, and plain-language tracking of their case.
- **Assigned Pages (Strictly Isolated):**
  - `/citizen`: Citizen Home portal with Article 39A guidance and DLSA toll-free hotline (15100).
  - `/citizen/chat`: Multilingual conversational legal assistant with safety guardrails (English, Hindi, Odia).
  - `/citizen/eligibility`: Section 12 Legal Services Authorities Act (clauses a–h) calculator with state-specific income thresholds.
  - `/citizen/status`: Plain-language progress view for their assigned matter (`CaseStatusPublic` schema — internal notes, triage scores, and judge deliberations are completely omitted).
- **Permissions:** `me:cases`, `summary:read:citizen`, `legalaid:chat`, `legalaid:eligibility`.
- **Demo Scenario:** Litigant Ramesh visits the portal, asks in Hindi about bail application steps, verifies 100% eligibility under Section 12(g), and views their scheduled hearing date in simple Hindi/English.

---

## 6. Auditor / Vigilance Officer (`auditor`)
- **Primary Goal:** Verify the cryptographic integrity of the immutable audit chain, detect unauthorized modifications, and export chain anchors.
- **Assigned Pages:**
  - `/audit`: Real-time cryptographic ledger with "Verify Ledger" integrity button and gated tamper simulator.
  - `/evaluation`: Systemic compliance and performance dashboard.
- **Permissions:** `audit:read`, `audit:verify`, `audit:simulate` (gated to demo mode), `evaluation:read`.
- **Demo Scenario:** Auditor Patel runs "Verify Ledger", validating all chained SHA-256 hashes. In demo mode, she runs the tamper simulation to demonstrate instant fraud detection.

---

## 7. Court Administrator (`admin`)
- **Primary Goal:** Provision and manage user accounts, assign judicial roles, enforce password policies, and inspect global audit telemetry.
- **Assigned Pages:**
  - `/admin/users`: User management interface (create, activate, disable, reset password).
  - `/audit`: Global audit ledger.
  - `/evaluation`: Pilot throughput and system analytics.
- **Permissions:** `users:manage`, `audit:read`, `audit:verify`, `audit:simulate`, `evaluation:read`.
- **Demo Scenario:** Admin provisions a newly appointed Metropolitan Magistrate, assigning appropriate bench permissions and court registries.

