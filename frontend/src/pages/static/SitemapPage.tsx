import React from 'react';
import { Link } from 'react-router-dom';
import { Panel } from '../../components/ui/Panel';

export const SitemapPage: React.FC = () => {
  return (
    <div className="py-6 max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
      <div className="border-b border-[#C5CCD6] pb-3">
        <h1 className="text-2xl font-bold text-[#0B2A5B] m-0">Portal Sitemap</h1>
        <p className="text-xs text-[#4A4F57] m-0 mt-1">
          Complete Directory of Public Information Pages and Judicial Dockets
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Public Information & Policies">
          <ul className="space-y-2.5 text-xs list-disc pl-4 text-[#1A1A1A]">
            <li>
              <Link to="/login" className="text-[#0B5FA5] font-semibold underline">User Login</Link> — Select user category and authenticate with credentials.
            </li>
            <li>
              <Link to="/about" className="text-[#0B5FA5] font-semibold underline">About NyayaFlow</Link> — Project mission, problem context, and four pillars.
            </li>
            <li>
              <Link to="/how-it-works" className="text-[#0B5FA5] font-semibold underline">How It Works</Link> — 6-step operational lifecycle.
            </li>
            <li>
              <Link to="/legal-aid-info" className="text-[#0B5FA5] font-semibold underline">Legal Aid Information</Link> — Section 12 entitlement categories & NALSA helpline 15100.
            </li>
            <li>
              <Link to="/help" className="text-[#0B5FA5] font-semibold underline">Help & FAQs</Link> — Technical support and browser guidelines.
            </li>
            <li>
              <Link to="/contact" className="text-[#0B5FA5] font-semibold underline">Contact & Feedback</Link> — Developer repository and support email.
            </li>
            <li>
              <Link to="/accessibility" className="text-[#0B5FA5] font-semibold underline">Accessibility Statement</Link> — GIGW & WCAG 2.1 AA features.
            </li>
            <li>
              <Link to="/terms" className="text-[#0B5FA5] font-semibold underline">Terms of Use</Link> — Prototype usage guidelines.
            </li>
            <li>
              <Link to="/privacy" className="text-[#0B5FA5] font-semibold underline">Privacy Policy</Link> — DPDP Act, 2023 aligned data handling.
            </li>
            <li>
              <Link to="/disclaimer" className="text-[#0B5FA5] font-semibold underline">Disclaimer</Link> — Advisory nature of AI outputs.
            </li>
          </ul>
        </Panel>

        <Panel title="Role-Authorized Judicial Dockets (Post-Login)">
          <ul className="space-y-2.5 text-xs list-disc pl-4 text-[#1A1A1A]">
            <li>
              <span className="font-semibold text-[#0B2A5B]">Judge / Bench:</span>{' '}
              <Link to="/cases" className="text-[#0B5FA5] underline">Urgency Cause List</Link>,{' '}
              <Link to="/schedule" className="text-[#0B5FA5] underline">Hearing Scheduler</Link>, Case Dossiers.
            </li>
            <li>
              <span className="font-semibold text-[#0B2A5B]">Court Registry Clerk:</span>{' '}
              <Link to="/intake" className="text-[#0B5FA5] underline">Case Registration & Ingestion</Link>, Cause List Management.
            </li>
            <li>
              <span className="font-semibold text-[#0B2A5B]">Advocate / Legal Counsel:</span>{' '}
              <Link to="/my-cases" className="text-[#0B5FA5] underline">My Assigned Matters</Link>, Deadlines, Cause List.
            </li>
            <li>
              <span className="font-semibold text-[#0B2A5B]">Police / Investigating Officer:</span>{' '}
              <Link to="/evidence" className="text-[#0B5FA5] underline">Evidence Chain-of-Custody Vault</Link>.
            </li>
            <li>
              <span className="font-semibold text-[#0B2A5B]">Citizen / Litigant:</span>{' '}
              <Link to="/citizen" className="text-[#0B5FA5] underline">Nyaya Sahayak Citizen Portal</Link>,{' '}
              <Link to="/citizen/eligibility" className="text-[#0B5FA5] underline">Eligibility Calculator</Link>,{' '}
              <Link to="/citizen/chat" className="text-[#0B5FA5] underline">Bilingual Assistant</Link>,{' '}
              <Link to="/citizen/status" className="text-[#0B5FA5] underline">My Case Status</Link>.
            </li>
            <li>
              <span className="font-semibold text-[#0B2A5B]">Auditor / Vigilance:</span>{' '}
              <Link to="/audit" className="text-[#0B5FA5] underline">Tamper-Evident Audit Ledger</Link>,{' '}
              <Link to="/evaluation" className="text-[#0B5FA5] underline">Benchmark Evaluation</Link>.
            </li>
            <li>
              <span className="font-semibold text-[#0B2A5B]">Court Administrator:</span>{' '}
              <Link to="/admin/users" className="text-[#0B5FA5] underline">User Management & Security</Link>.
            </li>
          </ul>
        </Panel>
      </div>
    </div>
  );
};
