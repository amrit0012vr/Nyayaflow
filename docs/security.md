# Security, Privacy & Integrity Specifications

NyayaFlow is engineered to meet India's **Digital Personal Data Protection (DPDP) Act, 2023** and strict court record confidentiality norms.

## 1. Cryptographic Hash-Chained Audit Trail

Every administrative, judicial, and automated action is recorded in an append-only hash chain:

$$\text{entry\_hash}_n = \text{SHA256}(\text{prev\_hash}_{n-1} \parallel \text{ts} \parallel \text{actor\_id} \parallel \text{action} \parallel \text{object\_id} \parallel \text{details\_json})$$

- **Genesis Hash:** `0000000000000000000000000000000000000000000000000000000000000000`
- **Verification:** Any alteration or omission immediately invalidates all subsequent entries, pinpointing the exact corrupted block.

## 2. Encryption at Rest & in Transit

- **At Rest:** Documents are encrypted using 256-bit AES in Galois/Counter Mode (AES-256-GCM) with a unique 96-bit nonce per encryption.
- **In Transit:** TLS 1.3 enforced across all gateway and client communications.

## 3. PII Redaction & Reversible Token Vault

Before text is processed by LLMs or external agents:
- Names, mobile numbers, Aadhaar IDs, PAN cards, and addresses are masked into tokens (`[PHONE_1]`, `[AADHAAR_1]`).
- Original values are encrypted and stored in a separate restricted table (`redaction_map`), accessible only with judicial authorization and logged in the audit trail.
