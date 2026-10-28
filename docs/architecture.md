# NyayaFlow Architecture Documentation

## 1. High-Level System Architecture

NyayaFlow is built on two interdependent layers designed for strict judicial integrity and operational acceleration:

```mermaid
flowchart TD
    subgraph Clients["Presentation Layer (Next.js / React)"]
        J[Judge / Bench]
        C[Court Registry Clerk]
        L[Advocate]
        P[Police / Investigating Officer]
        Z[Citizen / Litigant]
        A[Auditor / Vigilance]
    end

    subgraph Gateway["API Gateway & Core Security"]
        GW[FastAPI REST Gateway]
        AUTH[JWT / RBAC Enforcement]
        AUDIT[Tamper-Evident Hash Chain Engine]
    end

    subgraph Storage["Secure Storage Vault"]
        ENC[AES-256-GCM Encryption Core]
        VAULT[(Encrypted Object Vault)]
        DB[(Relational DB + Vector Embeddings)]
    end

    subgraph MultiAgent["Multi-Agent Orchestrator"]
        ORC[Orchestrator Agent]
        INT[Intake Agent]
        TRI[Triage Agent]
        SUM[Summarisation Agent]
        SCH[Constraint Scheduling Agent]
        LEG[Legal Aid Agent]
    end

    subgraph Verification["Integrity & Guardrails"]
        CV[Citation Verifier]
        RED[PII Masking & Encrypted Token Map]
        CH_VER[Hash Chain Verifier]
    end

    Clients --> GW
    GW --> AUTH --> DB
    GW --> AUDIT --> DB
    GW --> ENC --> VAULT
    GW --> ORC
    ORC --> RED --> INT
    ORC --> TRI
    ORC --> SUM --> CV
    ORC --> SCH
    ORC --> LEG
```

## 2. Multi-Agent Pipeline Specifications

1. **Intake Agent:** Scans case documents, extracts legal acts & sections (BNS, IPC, CrPC, BNSS), identifies parties, and classifies document types.
2. **Triage Agent:** Transparent rule scoring (0-100) prioritizing under-trial custody duration, statutory limitation deadlines, case age, and protected vulnerable parties.
3. **Summarisation Agent:** Generates 1-page bench briefs (<= 250 words), chronological timelines, and key issues with page/span source citations.
4. **Citation Verifier:** Validates every generated sentence against stored chunk excerpts to prevent hallucinations.
5. **Scheduling Agent:** CP-SAT constraint optimization allocating hearing slots while avoiding holidays and grouping related cases.
6. **Legal Aid Agent:** Multilingual citizen interface providing NALSA/DLSA guidance and automated Section 12 eligibility checks.
