import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Calculator,
  FileText,
  Phone,
  Scale,
  ArrowRight,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Panel } from '../../components/ui/Panel';

export const CitizenHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Welcome & Legal Entitlement Banner */}
      <div className="bg-[#F4F6FA] border border-[#C5CCD6] rounded p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0B2A5B]">
              <Scale className="w-4 h-4 text-[#FF9933]" aria-hidden="true" />
              <span>Nyaya Sahayak &bull; Citizen Legal Services Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0B2A5B] font-display">
              Namaste, {user?.name || 'Citizen'}
            </h1>
            <div className="w-16 h-[3px] bg-[#FF9933]" />
            <p className="text-sm text-[#1A1A1A] leading-relaxed">
              Under Article 39A of the Constitution of India and the Legal Services Authorities Act, 1987,
              every eligible citizen has a statutory right to free legal representation, advice, and accessible justice.
            </p>
          </div>

          <div className="bg-white border-2 border-[#0B2A5B] rounded p-4 text-center shrink-0 min-w-[200px]">
            <span className="text-[11px] font-bold text-[#0B2A5B] uppercase tracking-wider block">
              NALSA National Helpline
            </span>
            <div className="flex items-center justify-center gap-2 text-[#0B2A5B] font-extrabold text-2xl my-1">
              <Phone className="w-5 h-5 text-[#FF9933]" aria-hidden="true" />
              <span>15100</span>
            </div>
            <p className="text-[11px] text-[#4A4F57]">Toll-Free &bull; 24 Hours &bull; All Days</p>
          </div>
        </div>
      </div>

      {/* Three Primary Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Legal Aid Chat */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/citizen/chat')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('/citizen/chat');
            }
          }}
          className="bg-white border border-[#C5CCD6] hover:border-[#0B2A5B] rounded p-6 cursor-pointer transition-colors shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded bg-[#0B2A5B]/10 border border-[#0B2A5B]/20 flex items-center justify-center text-[#0B2A5B] mb-4">
              <MessageSquare className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-[#0B2A5B] mb-2 font-display">
              Legal Aid Assistant
            </h2>
            <p className="text-xs text-[#4A4F57] leading-relaxed mb-4">
              Ask questions about your legal rights, bail provisions, undertrial protections, or how to get a court-appointed advocate.
            </p>
          </div>
          <div className="text-xs font-bold text-[#0B2A5B] flex items-center gap-1 pt-3 border-t border-[#C5CCD6]">
            <span>Start Conversation</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </div>

        {/* Card 2: Section 12 Eligibility Calculator */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/citizen/eligibility')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('/citizen/eligibility');
            }
          }}
          className="bg-white border border-[#C5CCD6] hover:border-[#0B2A5B] rounded p-6 cursor-pointer transition-colors shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded bg-[#FF9933]/15 border border-[#FF9933]/30 flex items-center justify-center text-[#8A4B00] mb-4">
              <Calculator className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-[#0B2A5B] mb-2 font-display">
              Section 12 Eligibility
            </h2>
            <p className="text-xs text-[#4A4F57] leading-relaxed mb-4">
              Check in 60 seconds if you qualify for a 100% free lawyer under Section 12 of the Legal Services Authorities Act, 1987.
            </p>
          </div>
          <div className="text-xs font-bold text-[#0B2A5B] flex items-center gap-1 pt-3 border-t border-[#C5CCD6]">
            <span>Check My Eligibility</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </div>

        {/* Card 3: My Case Status */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/citizen/status')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('/citizen/status');
            }
          }}
          className="bg-white border border-[#C5CCD6] hover:border-[#0B2A5B] rounded p-6 cursor-pointer transition-colors shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded bg-[#137333]/10 border border-[#137333]/20 flex items-center justify-center text-[#137333] mb-4">
              <FileText className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-[#0B2A5B] mb-2 font-display">
              My Case Status
            </h2>
            <p className="text-xs text-[#4A4F57] leading-relaxed mb-4">
              Track your court matters explained in plain, jargon-free language with upcoming hearing dates and assigned courtrooms.
            </p>
          </div>
          <div className="text-xs font-bold text-[#0B2A5B] flex items-center gap-1 pt-3 border-t border-[#C5CCD6]">
            <span>View My Cases</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Advisory Information Strip */}
      <div className="bg-[#F4F6FA] border border-[#C5CCD6] rounded p-4 flex items-start gap-3 text-xs text-[#4A4F57]">
        <Info className="w-5 h-5 text-[#0B2A5B] shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          NyayaFlow is designed to empower citizens with legal transparency. If you face difficulty paying court fees or securing counsel, visit your nearest District Legal Services Authority (DLSA) office located in any district court complex across India.
        </p>
      </div>
    </div>
  );
};
