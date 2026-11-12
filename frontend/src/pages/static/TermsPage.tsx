import React from 'react';
import { Panel } from '../../components/ui/Panel';

export const TermsPage: React.FC = () => {
  return (
    <div className="py-6 max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
      <div className="border-b border-[#C5CCD6] pb-3">
        <h1 className="text-2xl font-bold text-[#0B2A5B] m-0">Terms of Use</h1>
        <p className="text-xs text-[#4A4F57] m-0 mt-1">
          Conditions of Access and Prototype Usage Guidelines
        </p>
      </div>

      <Panel title="Terms & Conditions">
        <div className="space-y-4 text-xs text-[#1A1A1A] leading-relaxed">
          <p>
            <strong>1. Prototype Status:</strong> NyayaFlow is an experimental software prototype developed for the Bharat Agentic-AI Hackathon 2026. It is not an official portal of the Government of India, the Supreme Court of India, or any High Court or District Judiciary.
          </p>
          <p>
            <strong>2. Authorized Use:</strong> Access to judicial dockets, clerk intake, evidence registers, and administrative consoles is strictly reserved for authorized demonstration participants and evaluators. All user actions are logged in the tamper-evident audit ledger.
          </p>
          <p>
            <strong>3. Synthetic and Non-Confidential Data:</strong> Users must not upload real, unredacted, or classified case files or personal confidential documents. Only synthetic or authorized public datasets may be processed.
          </p>
          <p>
            <strong>4. Open Source License:</strong> NyayaFlow is distributed under the terms of the Apache License 2.0. Users may inspect, modify, and distribute the software in compliance with the license provisions.
          </p>
        </div>
      </Panel>
    </div>
  );
};
