# Security Architecture, Threat Model & Cryptographic Specifications — NyayaFlow

> [!IMPORTANT]
> **Prototype Disclaimer:** NyayaFlow is an open-source judicial decision-support prototype submitted for Track 07 (Timely Justice) of the Bharat Agentic-AI Hackathon 2026. **It is not certified for direct production court adjudications without formal judicial infrastructure audit and statutory administrative clearance.**
>
> **Responsible Disclosure Contact:** `security@nyayaflow.dev` / `amrit@nyayaflow.org` (Response within 48 hours).

---

## 1. Threat Model (STRIDE Framework)

### 1.1 Assets Under Protection
1. **Case Dockets & Case Metadata:** Litigant names, charges, custody status, procedural orders.
2. **Confidential Court Filings:** Evidentiary submissions, FIRs, charge sheets, forensic reports, medical records.
3. **Personally Identifiable Information (PII):** Aadhaar numbers, PAN cards, phone numbers, minor and sexual assault victim identities protected under POCSO and Section 228A IPC / Section 73 BNS.
4. **Audit Trail Integrity:** Historical sequence of case views, decryptions, filings, and judicial review decisions.
5. **Session Credentials:** In-memory JWT access tokens, HttpOnly refresh tokens, and user credentials.

### 1.2 Actors & Trust Boundaries
- **Judicial Bench (`judge`):** High trust; access to briefs, causes lists, and citation verifications for their court.
- **Court Registry Clerk (`clerk`):** Moderate trust; intake filing, redaction inspection, and scheduling assistance.
- **Advocate (`lawyer`):** Low trust; isolated strictly to matters where they are formally designated counsel.
- **Police / IO (`police`):** Low trust; evidence submission and chain-of-custody tracking for assigned FIRs.
- **Citizen / Litigant (`citizen`):** Zero trust; access strictly isolated to non-privileged public summaries (`CaseStatusPublic`), free legal aid calculator, and conversational literacy assistant.
- **Auditor / Vigilance (`auditor`):** High trust (read-only); verification of audit trail integrity and fraud telemetry.
- **Court Administrator (`admin`):** High trust; user account management and access policy enforcement.

### 1.3 Threats & Mitigations

| Threat Category (STRIDE) | Attack Vector | NyayaFlow Mitigation & Implementation |
|---|---|---|
| **Spoofing** | Attacker impersonates judge or advocate via credential stuffing. | PBKDF2-HMAC-SHA256 (600,000 iterations); 15-minute account lockout after 5 consecutive failures (HTTP 429); generic 401 response preventing user enumeration. |
| **Tampering** | Rogue actor directly alters court docket or charge sheet in database. | Merkle-like SHA-256 hash chaining of every state change; tamper detection verification checks all blocks from Genesis to Head; external anchor registry (`docs/audit-anchors.md`). |
| **Repudiation** | User denies accessing a confidential case dossier or reviewing an AI brief. | Process-level mutex locked (`_audit_lock`) audit logger records actor ID, timestamp, IP, user-agent, action, and object hash for every access event. |
| **Information Disclosure** | Advocate A attempts to view Advocate B's confidential dispute file. | Strict backend query scoping (`visible_cases`): unassigned cases return `404 Not Found` (never leaking whether the matter exists); citizen portal strictly isolates to `CaseStatusPublic`. |
| **Denial of Service** | Malicious actor uploads 10GB archive or 10,000 parallel audit requests. | File upload validation limits size to 25MB and enforces file magic bytes; SQLite process concurrency lock prevents database corruption. |
| **Elevation of Privilege** | Citizen attempts to call judge's cause list or cause schedule API. | Backend FastAPI dependency guard `require_permission` enforces role matrix on every endpoint; 403 errors are logged as `access_denied` security events. |

---

## 2. Cryptographic Specifications

### 2.1 Key Derivation & Envelope Encryption (SEC-03)
Rather than deriving encryption keys from flat master keys, NyayaFlow uses **HKDF-SHA256 (RFC 5869)** with explicit functional context separation:

$$\text{PRK} = \text{HKDF-Extract}(\text{salt}=\text{None}, \text{IKM}=\text{MASTER\_KEY})$$
$$\text{DataKey} = \text{HKDF-Expand}(\text{PRK}, \text{info}=\text{"nyayaflow-document-storage-v1"}, \text{length}=32)$$

- **Envelope Encryption:** Each uploaded document is encrypted with a unique, cryptographically random per-document data key. The data key is encrypted (wrapped) using the derived master key and persisted in the `encrypted_key_ref` database column.
- **Algorithm:** AES-256 in Galois/Counter Mode (AES-256-GCM) with authenticated 128-bit authentication tags and unique 96-bit random nonces per encryption operation.
- **Backward Compatibility:** Existing SHA-256 derived ciphertexts from early prototypes are automatically detected and decrypted cleanly.

### 2.2 Tamper-Evident Hash Chain Math (SEC-05, SEC-06)
Every state change creates an immutable block linked to its predecessor:

$$H_0 = \text{0000000000000000000000000000000000000000000000000000000000000000}$$
$$H_n = \text{SHA-256}(H_{n-1} \parallel \text{ts\_iso} \parallel \text{actor\_id} \parallel \text{action} \parallel \text{object\_type} \parallel \text{object\_id} \parallel \text{canonical\_json}(\text{details}))$$

- **Serialization:** Thread-safe re-entrant lock `_audit_lock` ensures that concurrent requests cannot fork the chain or cause hash race conditions.
- **External Anchoring:** The chain head is periodically committed to `docs/audit-anchors.md` using `scripts/anchor_audit_head.py`, creating a tamper-evident external proof.

---

## 3. DPDP Act (2023) Alignment Statement

In compliance with India's **Digital Personal Data Protection Act, 2023**:
1. **Purpose Limitation (Section 5):** Personal data is processed exclusively for judicial brief preparation, limitation monitoring, and legal aid eligibility.
2. **Data Minimization (Section 6):** 12 categories of sensitive identifiers (Aadhaar, PAN, phone, email, voter ID, passport, driving license, bank account, IFSC, UPI, addresses, person names) are tokenized before text reaches LLMs or summarizers.
3. **Mandatory Minor & POCSO Protection:** Section 228A IPC / Section 73 BNS and POCSO guidelines strictly mask names and identifying markers of minors and victims into cryptographic tokens (`[VICTIM_1]`, `[MINOR_1]`).
4. **Reversible Cryptographic Vault:** Original PII values are encrypted using AES-256-GCM and stored in a restricted `redaction_map` table, accessible only to authorized judicial officers and audited on every reveal event.
5. **Data Retention & Purging:** `scripts/purge_chat_history.py` provides automated purging of citizen interaction logs older than the configurable retention threshold (`CHAT_RETENTION_DAYS=30`).
