import React from 'react';
import { Scale, ShieldCheck, User, Globe, AlertTriangle } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: string;
  setActiveRole: (role: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeRole,
  setActiveRole,
  language,
  setLanguage
}) => {
  const roles = [
    { id: 'judge', name: 'Judge / Bench', desc: 'Prioritized Cause List & Judicial Briefs' },
    { id: 'clerk', name: 'Court Registry', desc: 'Case Intake, Overrides & Upload' },
    { id: 'lawyer', name: 'Advocate', desc: 'Brief Workspace & Timelines' },
    { id: 'police', name: 'Police / IO', desc: 'Evidence Vault & Chain of Custody' },
    { id: 'citizen', name: 'Citizen / Litigant', desc: 'Multilingual Legal Aid & Status' },
    { id: 'auditor', name: 'Auditor / Vigilance', desc: 'Tamper-Evident Hash Chain' }
  ];

  const tabs = [
    { id: 'cause-list', label: 'Cause List & Triage' },
    { id: 'clerk-intake', label: 'Intake & Ingestion' },
    { id: 'scheduling', label: 'Court Scheduling' },
    { id: 'citizen', label: 'Citizen Legal Aid' },
    { id: 'evidence', label: 'Evidence Vault' },
    { id: 'audit', label: 'Audit Chain' },
    { id: 'analytics', label: 'Impact & Pilot' }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-lg">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">Nyaya<span className="text-amber-400">Flow</span></span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Sealed
              </span>
            </div>
            <p className="text-xs text-slate-400">Secure Agentic AI for Timely Justice — Track 07 (Bharat Agentic-AI Hackathon)</p>
          </div>
        </div>

        {/* Persona Switcher & Language */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Persona selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
            <User className="w-4 h-4 text-slate-400 ml-1.5" />
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value)}
              className="bg-transparent text-sm text-slate-200 font-medium focus:outline-none pr-2 py-0.5 cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id} className="bg-slate-900 text-slate-200">
                  Persona: {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Language selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
            <Globe className="w-4 h-4 text-slate-400 ml-1.5" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-sm text-slate-200 font-medium focus:outline-none pr-2 py-0.5 cursor-pointer"
            >
              <option value="en" className="bg-slate-900">English</option>
              <option value="hi" className="bg-slate-900">हिन्दी (Hindi)</option>
              <option value="or" className="bg-slate-900">ଓଡ଼ିଆ (Odia)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-1 border-t border-slate-800/80 py-1.5 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
