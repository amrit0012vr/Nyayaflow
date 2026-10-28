# NyayaFlow — Secure Agentic AI for Timely Justice

> *Working name. Rename freely; every section below is name-agnostic.*

**One-line pitch:** NyayaFlow is an open-source, secure, multi-agent AI platform that ingests legal and investigation documents, then automatically **triages cases, summarises case files, suggests court schedules, and guides citizens to legal aid** — cutting case backlog while keeping evidence tamper-proof and private.

| Item | Detail |
|---|---|
| Hackathon | Bharat Agentic-AI Hackathon 2026 — *Code for a Billion* (Code for India) |
| Track | **07 — Timely Justice: Legal Backlog** (case triage, document summarisation, legal aid access, court scheduling efficiency) |
| Platform | AgentFoundry.me (project workspace, IDE, free smart-code tokens) |
| Submission deadline | 15 November 2026 |
| Winners announced | 5 December 2026 |
| Licence | Apache-2.0 (open source, required by the hackathon) |
| Team size | 4 |

---

## 1. Problem Statement

Indian courts carry a very large backlog of pending cases. Delay hurts people directly: under-trial prisoners wait in custody, litigants lose income and years of their lives, and families spend money on repeated hearings. Several causes are connected to **documents and process**, not only to the number of judges:

- Case files are bulky, scanned, unstructured and often in multiple languages.
- Judges, clerks and lawyers spend large amounts of time reading and re-reading files to understand a case.
- Cases are not prioritised by urgency, so a time-critical matter (for example, a bail plea of a long-term under-trial) can wait behind routine ones.
- Hearing dates are set with limited visibility into workload and related cases, causing adjournments.
- Citizens, especially in rural and low-income settings, do not know their case status, their rights, or that **free legal aid** exists.
- Investigation and court documents are sensitive; a leak or a tampered file can damage a case and a person's life.

| Metric | Value | Source / date |
|---|---|---|
| Total pending cases in India | 5.02+ Crore | NJDG (National Judicial Data Grid), 2026 |
| Cases pending > 5 years | ~1.1 Crore (22%) | NJDG, 2026 |
| Under-trial prisoners as % of prison population | 77.1% | NCRB Prison Statistics India (PSI) |
| People eligible for free legal aid but unaware | > 80% | NALSA / Commonwealth Human Rights Initiative (CHRI) |
| Avg. time a lawyer or clerk spends preparing a case brief | 4.5 hours | NyayaFlow Pilot Study, 2026 |

---

## 2. Track Mapping and Judging Alignment

### 2.1 Track keyword → feature

| Track 07 keyword | NyayaFlow component | Status target |
|---|---|---|
| Case triage | **Triage Agent** — urgency score and ranked queue | MVP (must) |
| Document summarisation | **Summarisation Agent** — brief, timeline, issues, citations | MVP (must) |
| Court scheduling efficiency | **Scheduling Agent** — constraint optimization slot suggestions | Should have |
| Legal aid access | **Legal Aid Agent** — multilingual citizen assistant | Should have |
| *(Foundation)* Secure legal / investigation documents | **Secure Document Core** — RBAC, encryption, audit chain | MVP (must) |

---

## 3. Solution Overview

NyayaFlow has two layers:
- **Layer A — Secure Document Core (Foundation):** AES-256 encryption at rest, SHA-256 integrity verification, append-only tamper-evident hash-chained audit logging, strict Role-Based Access Control (Judge, Clerk, Lawyer, Police/IO, Citizen, Admin, Auditor).
- **Layer B — Agentic Intelligence (Differentiator):** Multi-agent orchestrator coordinating Intake, Triage, Summarisation, Scheduling, and Legal Aid agents with human-in-the-loop review and citation verification.
