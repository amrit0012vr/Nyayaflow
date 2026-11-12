import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Download,
  Printer,
  Scale
} from 'lucide-react';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { StatusChip, ChipVariant } from '../components/ui/StatusChip';
import { Dialog } from '../components/ui/Dialog';
import { InlineBanner } from '../components/ui/InlineBanner';

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
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);

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
      const updated = await api.getCaseDetail(id);
      setCaseData(updated);
      setReviewStatus(`AI decision-support brief marked as ${decision.toUpperCase()}.`);
    } catch (err: any) {
      alert(`Review submission failed: ${err.message}`);
    } finally {
      setIsReviewing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const mapTierToVariant = (tier?: string): ChipVariant => {
    switch (tier?.toLowerCase()) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'normal':
        return 'normal';
      default:
        return 'low';
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-[#4A4F57]">
        <div className="w-8 h-8 border-4 border-[#0B2A5B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold">Decrypting and assembling judicial case dossier...</p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <InlineBanner variant="danger" title="Dossier Loading Error">
          {error || 'Case not found'}
        </InlineBanner>
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
            <span>Return to Previous Screen</span>
          </Button>
        </div>
      </div>
    );
  }

  const c = caseData.case;
  const triage = caseData.triage;
  const summary = caseData.summary;
  const docs = caseData.documents || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Bar with Print and Back */}
      <div className="flex items-center justify-between pb-3 border-b border-[#C5CCD6] print:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-[#0B2A5B] font-semibold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Case List</span>
        </button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Print Dossier</span>
          </Button>
          <span className="text-xs text-[#4A4F57] font-mono font-bold">
            {c.case_number}
          </span>
          <StatusChip
            variant={mapTierToVariant(triage?.tier)}
            label={`${triage?.tier?.toUpperCase() || 'LOW'} (${triage?.score ?? 0}/100)`}
          />
        </div>
      </div>

      {reviewStatus && (
        <InlineBanner variant="info" title="Judicial Review Recorded">
          {reviewStatus}
        </InlineBanner>
      )}

      {/* Case Header Banner */}
      <div className="bg-[#F4F6FA] border border-[#C5CCD6] rounded p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0B2A5B]">
              <Scale className="w-4 h-4 text-[#FF9933]" aria-hidden="true" />
              <span>Official Judicial Case Dossier</span>
            </div>
            <h1 className="text-xl font-bold text-[#0B2A5B] font-display mt-1 mb-2">
              {c.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#4A4F57]">
              <span><strong>Forum:</strong> {c.court}</span>
              <span>&bull;</span>
              <span><strong>Category:</strong> {c.case_type}</span>
              <span>&bull;</span>
              <span><strong>Filed:</strong> {c.filing_date?.slice(0, 10)}</span>
              {c.custody_flag && (
                <>
                  <span>&bull;</span>
                  <span className="text-[#B3261E] font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    Custody Since {c.custody_since?.slice(0, 10) || 'Active'}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusChip
              variant="ai"
              label={`Generated: ${summary?.generated_by || 'rules'}`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 1-Page Bench Brief & Review Gate */}
        <div className="lg:col-span-2 space-y-6">
          <Panel
            title="Judicial Bench Brief (Concise &le; 250 words)"
            subtitle="Citation-anchored summary of facts and legal questions"
            action={<StatusChip variant="ai" label="Advisory decision-support" />}
          >
            <div className="text-sm text-[#1A1A1A] leading-relaxed font-serif bg-[#F4F6FA] p-4 rounded border border-[#C5CCD6] mb-6">
              {summary?.brief || 'No summary brief generated yet.'}
            </div>

            {/* Timeline with citations */}
            {summary?.timeline && summary.timeline.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wider">
                  Chronological Event Timeline &amp; Citations:
                </h3>
                <div className="space-y-2">
                  {summary.timeline.map((event: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded border border-[#C5CCD6] flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="text-[#0B2A5B] font-mono font-bold mr-2">{event.date}</span>
                        <span className="text-[#1A1A1A]">{event.event}</span>
                      </div>
                      {event.source && (
                        <button
                          type="button"
                          onClick={() => setCitationModal(event.source)}
                          className="shrink-0 text-[11px] text-[#0B2A5B] hover:underline bg-[#0B2A5B]/10 px-2 py-1 rounded border border-[#0B2A5B]/20 font-mono font-semibold"
                        >
                          [Doc p.{event.source.page}]
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Panel>

          {/* Review AI Output Gate */}
          {canReview && (
            <Panel
              title="Judicial Review &amp; Approval Gate"
              subtitle="Official determination on AI-assisted decision draft"
              action={
                <span className={`text-xs px-2.5 py-0.5 rounded font-semibold uppercase border ${
                  summary?.review_state === 'approved'
                    ? 'bg-[#137333]/15 text-[#137333] border-[#137333]/30'
                    : summary?.review_state === 'rejected'
                    ? 'bg-[#B3261E]/15 text-[#B3261E] border-[#B3261E]/30'
                    : 'bg-[#FF9933]/15 text-[#8A4B00] border-[#FF9933]/40'
                }`}>
                  State: {summary?.review_state || 'pending_review'}
                </span>
              }
            >
              <p className="text-xs text-[#4A4F57] mb-4">
                Judicial officers review and approve or reject AI-generated briefs before they are referenced in cause lists or published to citizen views.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Optional review note / comment for audit ledger"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="flex-1 bg-white border border-[#C5CCD6] rounded px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                />
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleReviewDecision('approved')}
                    disabled={isReviewing}
                    className="flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Approve</span>
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleReviewDecision('rejected')}
                    disabled={isReviewing}
                    className="flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Reject</span>
                  </Button>
                </div>
              </div>
            </Panel>
          )}
        </div>

        {/* Right Column: Triage Factors & Ingested Files */}
        <div className="space-y-6">
          <Panel title="Triage Urgency Factors">
            <div className="space-y-3">
              {triage?.factors?.map((f: any, i: number) => (
                <div key={i} className="bg-[#F4F6FA] p-3 rounded border border-[#C5CCD6] text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#1A1A1A] capitalize">
                      {f.name.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-[#0B2A5B] font-bold">
                      +{f.points} / {f.max_points}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4A4F57]">{f.value}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title={`Encrypted File Vault (${docs.length})`}>
            <div className="space-y-2">
              {docs.map((d: any) => (
                <div
                  key={d.id}
                  className="bg-[#F4F6FA] p-2.5 rounded border border-[#C5CCD6] text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-[#1A1A1A] line-clamp-1">{d.title}</div>
                    <div className="text-[10px] text-[#4A4F57] uppercase font-semibold">{d.doc_type}</div>
                  </div>
                  {d.versions && d.versions[0] && (
                    <a
                      href={`/api/v1/documents/version/${d.versions[0].id}/download`}
                      download
                      className="p-1.5 rounded bg-white hover:bg-[#E2E7EE] text-[#0B2A5B] border border-[#C5CCD6]"
                      title="Download decrypted document version"
                    >
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* Accessible Citation Dialog */}
      {citationModal && (
        <Dialog
          isOpen={!!citationModal}
          onClose={() => setCitationModal(null)}
          title="Ground-Truth Citation Verification"
          description="Source verification excerpt anchored in encrypted record"
        >
          <div className="space-y-3 text-xs">
            <div className="flex gap-4 text-[#4A4F57]">
              <span><strong>Page Number:</strong> {citationModal.page}</span>
              <span><strong>Span:</strong> [{citationModal.span?.join(', ')}]</span>
            </div>
            <div className="bg-[#F4F6FA] p-3 rounded border border-[#C5CCD6] font-mono text-xs text-[#1A1A1A] whitespace-pre-wrap">
              "{citationModal.excerpt || 'Verified extracted paragraph'}"
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setCitationModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
