# Security Policy & Responsible Disclosure — NyayaFlow

## Prototype Disclaimer
> [!IMPORTANT]
> **NyayaFlow is an open-source judicial decision-support prototype** developed for Track 07 (Timely Justice) of the Bharat Agentic-AI Hackathon 2026. It is designed to assist judicial officers, court staff, advocates, and underrepresented citizens. **It is not certified for direct production court adjudications without formal judicial audit and administrative clearance.**

---

## Reporting a Security Vulnerability
If you discover a security vulnerability or potential privilege escalation in NyayaFlow, please report it privately:
- **Security Contact:** `security@nyayaflow.dev` / `amrit@nyayaflow.org`
- **Response SLA:** Within 48 hours with an initial acknowledgment and mitigation timeline.
- **Coordinated Disclosure:** Please do not file public GitHub issues for security vulnerabilities until a patch is issued.

---

## Cryptographic Security Model

1. **Authentication (AUTH-01 – AUTH-05):**
   - PBKDF2-HMAC-SHA256 password hashing with 600,000 iterations and per-user 16-byte cryptographically secure random salt.
   - Short-lived signed JWT access tokens (max 30 minutes) held purely in memory (`accessToken` variable), never persisted in `localStorage` or `sessionStorage`.
   - Single-use HttpOnly refresh token rotation with family reuse revocation.
   - 15-minute brute-force lockout after 5 consecutive failed attempts (HTTP 429 Retry-After).

2. **Data-at-Rest Encryption (SEC-03):**
   - Envelope encryption using AES-256-GCM.
   - Per-document wrapped data keys derived using HKDF-SHA256 with domain context separation (`nyayaflow-document-storage-v1`).
   - Legacy backwards-compatible decryption path for early prototype ciphertexts.

3. **Tamper-Evident Audit Chain (SEC-04 – SEC-06):**
   - Merkle-like SHA-256 hash chaining of every state mutation:
     `H_n = SHA256(H_(n-1) || timestamp || actor_id || action || object_type || object_id || details_json)`
   - Process-level mutex concurrency protection preventing chain bifurcation under load.
   - External audit head anchoring via `scripts/anchor_audit_head.py`.

4. **DPDP Act (2023) Compliance:**
   - Pre-LLM PII tokenization masking 12 statutory identifier categories (Aadhaar, PAN, phone, email, voter ID, passport, driving license, bank account, IFSC, UPI, POCSO victim protection, dates of birth).
   - Reversible cryptographic token vault encrypted with AES-256-GCM.
   - Citizen persona access strictly isolated to non-privileged public schemas (`CaseStatusPublic`).

