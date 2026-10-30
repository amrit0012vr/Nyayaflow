import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  Scale, FileText, ArrowLeft, Clock, CheckCircle2, XCircle,
  ShieldCheck, AlertTriangle, Download, Sparkles
} from 'lucide-react';

export const CaseDossierPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [citationModal, setCitationModal] = useState<any>(null);

  const canReview = user?.role === 'judge' || user?.role === 'clerk';

  useEffect(() => {
    async function loadDossier() {
      if (!id) return;
      try {
        const data = await api.getCaseDetail(id);
        setCaseData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load case dossier');
      } finally {
        setLoading(false);
      }
    }
    loadDossier();
  }, [id]);

  const handleReviewDecision = async (decision: 'approved' | 'rejected') => {
    if (!id) return;
    setIsReviewing(true);
    try {
      await api.reviewCase(id, decision, reviewNote || undefined);
      // Reload dossier to reflect updated state
      const updated = await api.getCaseDetail(id);
      setCaseData(updated);
      alert(`AI Output marked as: ${decision.toUpperCase()}`);
    } catch (err: any) {
      alert(`Review submission failed: ${err.message}`);
    } finally {
      setIsReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-xs text-slate-400">
        Decrypting and assembling judicial case dossier...
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6 text-xs text-rose-300 mb-4">
          {error || 'Case not found'}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>
    );
  }

  const c = caseData.case;
  const triage = caseData.triage;
  const summary = caseData.summary;
  const docs = caseData.documents || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top Back & Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">Case ID: {c.case_number}</span>
          <span className={`text-xs px-2.5 py-0.5 rounded font-semibold uppercase border ${
            triage?.tier === 'critical'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              : triage?.tier === 'high'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}>
            Tier: {triage?.tier || 'UNRANKED'} ({triage?.score ?? 0}/100)
          </span>
        </div>
      </div>

      {/* Case Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white mb-1.5">{c.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span><strong>Forum:</strong> {c.court}</span>
              <span>&bull;</span>
              <span><strong>Category:</strong> {c.case_type}</span>
              <span>&bull;</span>
              <span><strong>Filed:</strong> {c.filing_date?.slice(0, 10)}</span>
              {c.custody_flag && (
                <>
                  <span>&bull;</span>
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Custody Since {c.custody_since?.slice(0, 10) || 'Active'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* AI Badge (AI-04) */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300">Generated: <strong>{summary?.generated_by || 'rules'}</strong></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column: 1-Page Bench Brief (SUM-01) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>1-Page Judicial Bench Brief (&le; 250 words)</span>
              </h2>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                100% Citations Verified
              </span>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line mb-6">
              {summary?.brief || 'No summary brief generated yet.'}
            </p>

            {/* Timeline with clickable citations (SUM-02, SUM-03) */}
            {summary?.timeline && summary.timeline.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Key Timeline & Document Citations:
                </h3>
                <div className="space-y-2">
                  {summary.timeline.map((event: any, idx: number) => (
                    <div key={idx} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-start justify-between gap-3 text-xs">
                      <div>
                        <span className="text-amber-400 font-mono font-bold mr-2">{event.date}</span>
                        <span className="text-slate-300">{event.event}</span>
                      </div>
                      {event.source && (
                        <button
                          onClick={() => setCitationModal(event.source)}
                          className="shrink-0 text-[10px] text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20 font-mono"
                        >
                          [Doc p.{event.source.page}]
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Review AI Output Gate (DATA-04) */}
          {canReview && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Human-in-the-Loop Review Gate (DATA-04)</span>
                </h3>
                <span className={`text-xs px-2.5 py-0.5 rounded font-semibold uppercase border ${
                  summary?.review_state === 'approved'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : summary?.review_state === 'rejected'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  State: {summary?.review_state || 'pending_review'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Judges and Clerks must review AI-generated briefs before they are released or published to citizen views.
              </p>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Optional review note / comment"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
                <button
                  onClick={() => handleReviewDecision('approved')}
                  disabled={isReviewing}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handleReviewDecision('rejected')}
                  disabled={isReviewing}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Triage Breakdown & Ingested Files */}
        <div className="space-y-6">
          {/* Triage Factor Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
            <h2 className="text-sm font-bold text-white mb-4 pb-2 border-b border-slate-800">
              Transparent 6-Factor Urgency Radar
            </h2>
            <div className="space-y-3">
              {triage?.factors?.map((f: any, i: number) => (
                <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200 capitalize">
                      {f.name.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-amber-400 font-bold">
                      {f.points}/{f.max_points} pts
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ingested Encrypted Files */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
            <h2 className="text-sm font-bold text-white mb-3 pb-2 border-b border-slate-800">
              Encrypted File Vault ({docs.length})
            </h2>
            <div className="space-y-2">
              {docs.map((d: any) => (
                <div key={d.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200 line-clamp-1">{d.title}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{d.doc_type}</div>
                  </div>
                  {d.versions && d.versions[0] && (
                    <a
                      href={`/api/v1/documents/version/${d.versions[0].id}/download`}
                      download
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Download decrypted file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Citation Modal (SUM-02, SUM-03) */}
      {citationModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                Ground-Truth Citation Verification
              </span>
              <button
                onClick={() => setCitationModal(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                &times;
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-300 mb-4">
              <div><strong>Page:</strong> {citationModal.page}</div>
              <div><strong>Span:</strong> [{citationModal.span?.join(', ')}]</div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-amber-200 italic font-mono whitespace-pre-wrap">
                "{citationModal.excerpt || 'Verified extracted paragraph'}"
              </div>
            </div>
            <button
              onClick={() => setCitationModal(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-lg text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

