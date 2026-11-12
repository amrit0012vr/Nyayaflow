import React from 'react';
import { Panel } from '../../components/ui/Panel';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-6 max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
      <div className="border-b border-[#C5CCD6] pb-3">
        <h1 className="text-2xl font-bold text-[#0B2A5B] m-0">About NyayaFlow</h1>
        <p className="text-xs text-[#4A4F57] m-0 mt-1">
          Open-Source Judicial Decision-Support Prototype for Subordinate Courts in India
        </p>
      </div>

      {/* Core Mission */}
      <Panel title="Mission & Problem Context">
        <div className="space-y-4 text-sm text-[#1A1A1A] leading-relaxed">
          <p>
            <strong>NyayaFlow</strong> is an open-source, privacy-first judicial decision-support platform engineered specifically for subordinate courts (District and Taluka courts) in India. Built as an experimental prototype for the <strong>Bharat Agentic-AI Hackathon 2026</strong> (Track 07: Timely Justice — Reducing Case Backlog), NyayaFlow assists judicial officers, registry staff, advocates, and citizens by streamlining document scrutiny, triaging urgent matters, and automating scheduling constraints.
          </p>

          <h3 className="text-base font-bold text-[#0B2A5B] pt-2">The Scale of Pendency in Indian Courts</h3>
          <p>
            The Indian subordinate judiciary handles tens of millions of filings annually. Official metrics from the National Judicial Data Grid (NJDG) and National Crime Records Bureau (NCRB) demonstrate the systemic challenge:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 bg-[#F4F6FA] border border-[#C5CCD6] rounded">
              <div className="text-2xl font-bold text-[#0B2A5B]">5.1 Crore</div>
              <div className="text-xs font-semibold text-[#1A1A1A] mt-1">Total Cases Pending</div>
              <div className="text-[11px] text-[#4A4F57] mt-0.5">Source: NJDG (Sep 2026)</div>
            </div>
            <div className="p-4 bg-[#F4F6FA] border border-[#C5CCD6] rounded">
              <div className="text-2xl font-bold text-[#0B2A5B]">1.34 Crore</div>
              <div className="text-xs font-semibold text-[#1A1A1A] mt-1">Pending &gt; 5 Years</div>
              <div className="text-[11px] text-[#4A4F57] mt-0.5">Source: NJDG (Sep 2026)</div>
            </div>
            <div className="p-4 bg-[#F4F6FA] border border-[#C5CCD6] rounded">
              <div className="text-2xl font-bold text-[#0B2A5B]">75.8%</div>
              <div className="text-xs font-semibold text-[#1A1A1A] mt-1">Under-Trial Prison Ratio</div>
              <div className="text-[11px] text-[#4A4F57] mt-0.5">Source: NCRB PSI Report</div>
            </div>
            <div className="p-4 bg-[#F4F6FA] border border-[#C5CCD6] rounded">
              <div className="text-2xl font-bold text-[#0B2A5B]">14.2 Lakh</div>
              <div className="text-xs font-semibold text-[#1A1A1A] mt-1">Annual Legal Aid Cases</div>
              <div className="text-[11px] text-[#4A4F57] mt-0.5">Source: NALSA Annual Report</div>
            </div>
          </div>
        </div>
      </Panel>

      {/* The Four Core Pillars */}
      <Panel title="Four Functional Pillars">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
          <div className="p-4 bg-[#F4F6FA] border border-[#C5CCD6] rounded">
            <h3 className="text-sm font-bold text-[#0B2A5B] mb-1">1. Intelligent Filing Scrutiny</h3>
            <p className="text-xs text-[#4A4F57] leading-relaxed">
              Automates preliminary document verification, detects statutory defects, extracts parties and citations, and redacts sensitive PII under the Digital Personal Data Protection (DPDP) Act, 2023.
            </p>
          </div>
          <div className="p-4 bg-[#F4F6FA] border border-[#C5CCD6] rounded">
            <h3 className="text-sm font-bold text-[#0B2A5B] mb-1">2. Urgency-Ranked Cause List</h3>
            <p className="text-xs text-[#4A4F57] leading-relaxed">
              Triages pending cases using statutory urgency rules (under-trial detention under CrPC 436A / BNSS 479, senior citizens, medical emergencies, interim injunctions) to prevent urgent matters from being buried.
            </p>
          </div>
          <div className="p-4 bg-[#F4F6FA] border border-[#C5CCD6] rounded">
            <h3 className="text-sm font-bold text-[#0B2A5B] mb-1">3. Constraint-Based Hearing Scheduling</h3>
            <p className="text-xs text-[#4A4F57] leading-relaxed">
              Applies mathematical constraint satisfaction algorithms (Google OR-Tools CP-SAT) to generate balanced hearing schedules respecting court calendars, advocate availability, and holiday calendars.
            </p>
          </div>
          <div className="p-4 bg-[#F4F6FA] border border-[#C5CCD6] rounded">
            <h3 className="text-sm font-bold text-[#0B2A5B] mb-1">4. Nyaya Sahayak (Citizen Legal Aid)</h3>
            <p className="text-xs text-[#4A4F57] leading-relaxed">
              Bilingual, conversational guidance that determines statutory legal aid eligibility under Section 12 of the Legal Services Authorities Act, 1987, and provides plain-language case stage tracking.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
};
