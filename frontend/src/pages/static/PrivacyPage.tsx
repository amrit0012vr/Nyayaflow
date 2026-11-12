import React from 'react';
import { Panel } from '../../components/ui/Panel';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="py-6 max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
      <div className="border-b border-[#C5CCD6] pb-3">
        <h1 className="text-2xl font-bold text-[#0B2A5B] m-0">Privacy Policy</h1>
        <p className="text-xs text-[#4A4F57] m-0 mt-1">
          Data Governance Framework Aligned with the Digital Personal Data Protection (DPDP) Act, 2023
        </p>
      </div>

      <Panel title="Privacy & Data Protection Principles">
        <div className="space-y-4 text-xs text-[#1A1A1A] leading-relaxed">
          <p>
            <strong>1. Scope & Application:</strong> This policy outlines the handling of user authentication identifiers, audit logs, and case filings within the NyayaFlow demonstration portal.
          </p>
          <p>
            <strong>2. PII Tokenization & Redaction Vault:</strong> Under Section 4 and Section 8 of the DPDP Act, 2023, personal identifiers including Aadhaar numbers, Permanent Account Numbers (PAN), mobile numbers, and names of minor witnesses under the POCSO Act are masked and tokenized prior to indexing.
          </p>
          <p>
            <strong>3. Cryptographic Envelope Encryption:</strong> Case filings are secured using AES-256 Galois/Counter Mode (GCM) with ephemeral per-case data keys derived from HKDF-SHA256, protecting documents both at rest and in transit.
          </p>
          <p>
            <strong>4. Tamper-Evident Audit Ledger:</strong> All administrative access, evidence deposits, and login events append to a tamper-evident SHA-256 hash-chained ledger to ensure transparency and accountability.
          </p>
          <p>
            <strong>5. Data Retention & Erasure:</strong> Synthetic demo data and session logs are retained for demonstration purposes and reset periodically. No real biometric or unredacted citizen personal data is stored.
          </p>
        </div>
      </Panel>
    </div>
  );
};
