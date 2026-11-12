import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { CaseStatusPublic } from '../../types';
import {
  FileText,
  Calendar,
  Building,
  ArrowLeft,
  HeartHandshake,
  Scale
} from 'lucide-react';
import { Panel } from '../../components/ui/Panel';
import { InlineBanner } from '../../components/ui/InlineBanner';

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
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Back Link */}
      <div className="pb-2">
        <button
          type="button"
          onClick={() => navigate('/citizen')}
          className="flex items-center gap-1.5 text-xs text-[#0B2A5B] font-semibold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Citizen Home</span>
        </button>
      </div>

      {/* Page Header */}
      <div className="border-b border-[#C5CCD6] pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0B2A5B]">
          <Scale className="w-4 h-4 text-[#FF9933]" aria-hidden="true" />
          <span>Citizen Case Tracking &bull; Transparent Proceedings</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0B2A5B] font-display mt-1">
          My Case Status (Plain Language)
        </h1>
        <div className="w-16 h-[3px] bg-[#FF9933] mt-2 mb-2" />
        <p className="text-sm text-[#4A4F57] max-w-2xl">
          Track official judicial proceedings and upcoming hearing dates in clear, jargon-free citizen language.
        </p>
      </div>

      {error && (
        <InlineBanner variant="danger" title="Error Loading Case Status">
          {error}
        </InlineBanner>
      )}

      <Panel
        title="Active Court Proceedings"
        subtitle={`Registered filings: ${cases.length}`}
      >
        {loading ? (
          <div className="p-12 text-center text-[#4A4F57]">
            <div className="w-8 h-8 border-4 border-[#0B2A5B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold">Loading case information from court registry...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="p-12 text-center text-[#4A4F57]">
            <FileText className="w-10 h-10 text-[#C5CCD6] mx-auto mb-3" aria-hidden="true" />
            <p className="text-base font-bold text-[#1A1A1A]">No Active Case Filings Registered</p>
            <p className="text-xs mt-1">
              You do not currently have any pending court matters registered under this citizen account.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((c, i) => (
              <div
                key={i}
                className="bg-white border border-[#C5CCD6] rounded p-6 shadow-sm hover:border-[#0B2A5B] transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#C5CCD6]">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B2A5B] bg-[#0B2A5B]/10 border border-[#0B2A5B]/20 px-2.5 py-0.5 rounded">
                      {c.stage_label}
                    </span>
                    <h2 className="text-base font-bold text-[#1A1A1A] mt-2">
                      Case Number: {c.case_number}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#4A4F57] bg-[#F4F6FA] px-3 py-1.5 rounded border border-[#C5CCD6]">
                    <Building className="w-3.5 h-3.5 text-[#0B2A5B]" aria-hidden="true" />
                    <span>{c.court}</span>
                  </div>
                </div>

                <p className="text-sm text-[#1A1A1A] leading-relaxed mb-4">
                  {c.status_explanation}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#C5CCD6] text-xs">
                  <div className="flex items-center gap-2 text-[#4A4F57]">
                    <Calendar className="w-4 h-4 text-[#137333]" aria-hidden="true" />
                    <span>
                      Next Hearing:{' '}
                      <strong className="text-[#1A1A1A]">
                        {c.next_hearing ? `${c.next_hearing} (${c.courtroom || 'Courtroom 3'})` : 'To be notified by court'}
                      </strong>
                    </span>
                  </div>

                  {c.legal_aid_hint && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#8A4B00] bg-[#FF9933]/15 px-2.5 py-1 rounded border border-[#FF9933]/30 font-medium">
                      <HeartHandshake className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{c.legal_aid_hint}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
};
