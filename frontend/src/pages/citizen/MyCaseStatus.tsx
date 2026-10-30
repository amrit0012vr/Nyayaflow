import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { CaseStatusPublic } from '../../types';
import { FileText, Calendar, Building, Phone, ArrowLeft, HeartHandshake } from 'lucide-react';

export const MyCaseStatus: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseStatusPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCases() {
      try {
        const data = await api.getMyCases();
        setCases(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load case status');
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <button
        onClick={() => navigate('/citizen')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Citizen Home</span>
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">My Case Status (Plain Language)</h1>
        <p className="text-xs text-slate-400 mt-1">
          Track official proceedings and upcoming hearing dates in clear, jargon-free citizen language.
        </p>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
          Loading case information from court registry...
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-xs text-rose-300">
          {error}
        </div>
      ) : cases.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h2 className="text-sm font-semibold text-slate-300 mb-1">No Active Case Filings Registered</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You do not currently have any pending court matters registered under this citizen account.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((c, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md hover:border-slate-700 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                    {c.stage_label}
                  </span>
                  <h2 className="text-base font-bold text-white mt-1.5">
                    Case No: {c.case_number}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  <span>{c.court}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {c.status_explanation}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>
                    Next Hearing:{' '}
                    <strong className="text-white">
                      {c.next_hearing ? `${c.next_hearing} (${c.courtroom || 'Courtroom 3'})` : 'To be notified by court'}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>{c.legal_aid_hint}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

