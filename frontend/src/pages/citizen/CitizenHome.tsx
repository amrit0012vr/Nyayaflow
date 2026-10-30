import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Calculator, FileText, Phone, ShieldCheck, HeartHandshake } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CitizenHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-cyan-950 border border-cyan-800/40 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
              Nyaya Sahayak · Citizen Justice Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
              Namaste, {user?.name || 'Citizen'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Under Article 39A of the Constitution of India and the Legal Services Authorities Act, 1987,
              every citizen has the right to free legal representation and accessible justice.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-lg">
              <Phone className="w-5 h-5" />
              <span>15100</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">NALSA National Toll-Free (24x7)</p>
          </div>
        </div>
      </div>

      {/* Three Primary Service Cards (RBAC-04 / §4.4) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Legal Aid Chat */}
        <div
          onClick={() => navigate('/citizen/chat')}
          className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 cursor-pointer transition-all hover:bg-slate-800/50 flex flex-col justify-between group shadow-lg"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
              Legal Aid Assistant
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Ask questions about your legal rights, bail provisions, undertrial protections, or how to get a court-appointed advocate.
            </p>
          </div>
          <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Start Conversation</span>
            <span>&rarr;</span>
          </div>
        </div>

        {/* Card 2: Section 12 Eligibility Calculator */}
        <div
          onClick={() => navigate('/citizen/eligibility')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 cursor-pointer transition-all hover:bg-slate-800/50 flex flex-col justify-between group shadow-lg"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Calculator className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
              Section 12 Eligibility
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Check in 60 seconds if you qualify for a 100% free lawyer under the Legal Services Authorities Act, 1987.
            </p>
          </div>
          <div className="text-xs font-semibold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Check My Eligibility</span>
            <span>&rarr;</span>
          </div>
        </div>

        {/* Card 3: My Case Status */}
        <div
          onClick={() => navigate('/citizen/status')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 cursor-pointer transition-all hover:bg-slate-800/50 flex flex-col justify-between group shadow-lg"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
              My Case Status
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Track your court matters explained in plain, jargon-free language with upcoming hearing dates and courtrooms.
            </p>
          </div>
          <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>View My Cases</span>
            <span>&rarr;</span>
          </div>
        </div>
      </div>

      {/* Advisory Notice */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-400">
        <HeartHandshake className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p>
          NyayaFlow is designed to empower citizens with legal transparency. If you face difficulty paying court fees or securing counsel, visit your nearest District Legal Services Authority (DLSA) office located in any district court complex.
        </p>
      </div>
    </div>
  );
};

