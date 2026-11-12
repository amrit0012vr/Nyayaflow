import React from 'react';
import { Panel } from '../../components/ui/Panel';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: '1',
      title: 'Case Registration & Filing Ingestion',
      desc: 'The Registry Clerk uploads petitions, charge-sheets, or applications. The system extracts text using OCR and validates mandatory statutory attachments.'
    },
    {
      num: '2',
      title: 'DPDP Privacy Vault & PII Redaction',
      desc: 'Sensitive identifiers (Aadhaar, PAN, phone numbers, minor witness names under POCSO Act) are automatically tokenized and redacted before indexing.'
    },
    {
      num: '3',
      title: 'Statutory Urgency Triage & Scoring',
      desc: 'Rule-based algorithmic triage scores case urgency using statutory factors: ongoing custody, pre-trial detention duration, senior citizen status, and imminent statutory deadlines.'
    },
    {
      num: '4',
      title: 'One-Page Citation-Verified Bench Brief',
      desc: 'The system drafts a structured 1-page summary highlighting primary issues, statutory sections, prayers, and verified citations with exact document page references.'
    },
    {
      num: '5',
      title: 'Human Review & Judicial Discretion',
      desc: 'Judicial officers and court clerks review, override, or accept recommendations. The AI system is strictly advisory; decisions and orders remain with court officials.'
    },
    {
      num: '6',
      title: 'Constraint-Optimized Hearing Scheduling',
      desc: 'Google OR-Tools CP-SAT calculates optimal hearing slots, avoiding advocate calendar clashes, courtroom bottlenecks, and gazetted court holidays.'
    }
  ];

  return (
    <div className="py-6 max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
      <div className="border-b border-[#C5CCD6] pb-3">
        <h1 className="text-2xl font-bold text-[#0B2A5B] m-0">How NyayaFlow Works</h1>
        <p className="text-xs text-[#4A4F57] m-0 mt-1">
          Operational Lifecycle: From Filing Ingestion to Cause List Adjudication
        </p>
      </div>

      {/* Fundamental Guardrail Notice */}
      <div className="p-4 bg-[#FFF4E5] border-l-4 border-[#FF9933] rounded text-sm text-[#8A4B00]">
        <strong>Core Operational Guardrail:</strong> AI outputs are strictly decision-support recommendations.
        Under the Indian constitutional framework, judicial discretion, finding of fact, and order issuance remain
        exclusively with authorized judicial officers.
      </div>

      {/* Numbered Steps */}
      <Panel title="The 6-Step Processing Pipeline">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {steps.map((s) => (
            <div key={s.num} className="flex gap-4 p-4 bg-[#F4F6FA] border border-[#C5CCD6] rounded">
              <div className="w-9 h-9 rounded-full bg-[#0B2A5B] text-white flex items-center justify-center font-bold text-sm shrink-0">
                {s.num}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0B2A5B] mb-1">{s.title}</h3>
                <p className="text-xs text-[#4A4F57] leading-relaxed m-0">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};
