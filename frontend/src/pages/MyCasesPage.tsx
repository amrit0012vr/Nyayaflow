import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Case } from '../types';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Calendar, FileText, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

export const MyCasesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAssignedCases() {
      try {
        const data = await api.getCases();
        setCases(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load assigned matters');
      } finally {
        setLoading(false);
      }
    }
    loadAssignedCases();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              {user?.role === 'lawyer' ? 'Bar Counsel Docket' : 'Law Enforcement Docket'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">My Assigned Court Matters</h1>
          <p className="text-xs text-slate-400 mt-1">
            Matters where you are the designated {user?.role === 'lawyer' ? 'Advocate on Record' : 'Investigating Officer'}.
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
          Total Assigned: <strong className="text-white text-sm ml-1">{cases.length}</strong>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
          Loading assigned case files...
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-xs text-rose-300">
          {error}
        </div>
      ) : cases.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h2 className="text-sm font-semibold text-slate-300 mb-1">No Assigned Matters</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You do not currently have any active judicial files assigned in your docket.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/cases/${c.id}`)}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 cursor-pointer transition hover:bg-slate-800/40 flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {c.case_number}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    c.triage_tier === 'critical'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : c.triage_tier === 'high'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {c.triage_tier || 'UNRANKED'}
                  </span>
                </div>

                <h2 className="text-sm font-bold text-white mb-2 line-clamp-1 group-hover:text-emerald-300 transition-colors">
                  {c.title}
                </h2>

                <div className="space-y-1 text-xs text-slate-400 mb-4">
                  <div><strong>Court:</strong> {c.court}</div>
                  <div><strong>Type:</strong> {c.case_type}</div>
                  {c.custody_flag && (
                    <div className="text-rose-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Accused in judicial custody</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 group-hover:text-emerald-400 transition-colors">
                <span>Open Dossier & Brief</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

