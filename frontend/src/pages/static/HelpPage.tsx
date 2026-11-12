import React from 'react';
import { Panel } from '../../components/ui/Panel';

export const HelpPage: React.FC = () => {
  const faqs = [
    {
      q: 'How do I log in to the NyayaFlow portal?',
      a: 'First, select your assigned user category on the login page (Step 1). Then, enter your official email address and password (Step 2). If you do not have credentials, please contact your court registry administrator.'
    },
    {
      q: 'How do I adjust font size or switch to high contrast mode?',
      a: 'The utility bar at the top of every page provides A-, A, and A+ buttons to scale text size (87.5%, 100%, 125%). The ◐ Contrast button enables the high-contrast black-and-gold theme.'
    },
    {
      q: 'Which browsers are supported?',
      a: 'NyayaFlow is optimized for the latest stable versions of Google Chrome, Microsoft Edge, Mozilla Firefox, and Apple Safari across desktop and mobile devices.'
    },
    {
      q: 'How does Nyaya Sahayak assist citizens?',
      a: 'Nyaya Sahayak allows citizens to check Section 12 legal aid eligibility, consult a multilingual assistant in English, Hindi, or Odia, and track case hearing stages in plain language.'
    },
    {
      q: 'Is my data secure and private?',
      a: 'Yes. All filings and evidence are encrypted using HKDF-SHA256 envelope encryption. Personally Identifiable Information (PII) is masked in compliance with the Digital Personal Data Protection (DPDP) Act, 2023.'
    }
  ];

  return (
    <div className="py-6 max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
      <div className="border-b border-[#C5CCD6] pb-3">
        <h1 className="text-2xl font-bold text-[#0B2A5B] m-0">Help & Frequently Asked Questions</h1>
        <p className="text-xs text-[#4A4F57] m-0 mt-1">
          Technical Assistance, User Guidelines, and System Navigation
        </p>
      </div>

      <Panel title="Frequently Asked Questions">
        <div className="space-y-4 pt-2">
          {faqs.map((faq, i) => (
            <div key={i} className="p-4 bg-[#F4F6FA] border border-[#C5CCD6] rounded">
              <h3 className="text-sm font-bold text-[#0B2A5B] mb-1.5">{faq.q}</h3>
              <p className="text-xs text-[#1A1A1A] leading-relaxed m-0">{faq.a}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="p-4 bg-white border border-[#C5CCD6] rounded text-xs text-[#4A4F57]">
        <strong>Need further support?</strong> You can contact the technical desk at{' '}
        <a href="mailto:support@nyayaflow.demo" className="text-[#0B5FA5] underline">
          support@nyayaflow.demo
        </a>.
      </div>
    </div>
  );
};
