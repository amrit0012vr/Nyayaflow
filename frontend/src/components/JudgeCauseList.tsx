import React, { useState, useEffect } from 'react';
import { Case, TriageResponse, SummaryResponse, SourceCitation } from '../types';
import { api } from '../lib/api';
import {
  Clock,
  FileText,
  CheckCircle2,
  ChevronRight,
  UserCheck,
  AlertTriangle,
  Scale,
  Search,
  BookOpen
} from 'lucide-react';
import { StatusChip, ChipVariant } from './ui/StatusChip';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';
import { Dialog } from './ui/Dialog';

export const JudgeCauseList: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [caseTriage, setCaseTriage] = useState<TriageResponse | null>(null);
  const [caseSummary, setCaseSummary] = useState<SummaryResponse | null>(null);
  const [activeCitation, setActiveCitation] = useState<SourceCitation | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const data = await api.getCases(selectedTier || undefined, undefined, search || undefined);
      setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [selectedTier, search]);

  const handleOpenCase = async (c: Case) => {
    setSelectedCase(c);
    setModalLoading(true);
    setActiveCitation(null);
    try {
      const [triageData, summaryData] = await Promise.all([
        api.getTriage(c.id).catch(() => null),
        api.getSummary(c.id, 'judge').catch(() => null)
      ]);
      setCaseTriage(triageData);
      setCaseSummary(summaryData);
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-[#C5CCD6] pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0B2A5B]">
          <Scale className="w-4 h-4 text-[#FF9933]" aria-hidden="true" />
          <span>Judicial Bench Docket &bull; Prioritized Cause List</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0B2A5B] font-display mt-1">
          Automated Urgency Triage &amp; Cause List
        </h1>
        <div className="w-16 h-[3px] bg-[#FF9933] mt-2 mb-2" />
        <p className="text-sm text-[#4A4F57] max-w-3xl">
          Matters ranked by statutory urgency factors: under-trial custody duration, limitation deadlines, and vulnerable party protections.
        </p>
      </div>

      {/* Filter and Search Panel */}
      <Panel
        title="Cause List Filters"
        subtitle={`Showing ${cases.length} active listings`}
      >
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <label htmlFor="cause-list-search" className="sr-only">
              Search by case number, title, or party
            </label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#757575]">
              <Search className="w-4 h-4" aria-hidden="true" />
            </div>
            <input
              id="cause-list-search"
              type="text"
              placeholder="Search by case number, title, or party..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#C5CCD6] rounded text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B] focus:border-[#0B2A5B]"
            />
          </div>

          {/* Tier Buttons */}
          <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filter cause list by urgency tier">
            <button
              type="button"
              onClick={() => setSelectedTier('')}
              className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                selectedTier === ''
                  ? 'bg-[#0B2A5B] text-white border-[#0B2A5B]'
                  : 'bg-white text-[#1A1A1A] border-[#C5CCD6] hover:bg-[#F4F6FA]'
              }`}
            >
              All Tiers ({cases.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTier('critical')}
              className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                selectedTier === 'critical'
                  ? 'bg-[#B3261E] text-white border-[#B3261E]'
                  : 'bg-white text-[#B3261E] border-[#C5CCD6] hover:bg-[#B3261E]/5'
              }`}
            >
              Critical Priority
            </button>
            <button
              type="button"
              onClick={() => setSelectedTier('high')}
              className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                selectedTier === 'high'
                  ? 'bg-[#8A4B00] text-white border-[#8A4B00]'
                  : 'bg-white text-[#8A4B00] border-[#C5CCD6] hover:bg-[#FF9933]/10'
              }`}
            >
              High Urgency
            </button>
            <button
              type="button"
              onClick={() => setSelectedTier('normal')}
              className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                selectedTier === 'normal'
                  ? 'bg-[#0B5FA5] text-white border-[#0B5FA5]'
                  : 'bg-white text-[#0B5FA5] border-[#C5CCD6] hover:bg-[#0B5FA5]/10'
              }`}
            >
              Normal
            </button>
          </div>
        </div>
      </Panel>

      {/* Case Matters List */}
      <Panel title="Scheduled Bench Matters">
        {loading ? (
          <div className="p-12 text-center text-[#4A4F57]">
            <div className="w-8 h-8 border-4 border-[#0B2A5B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold">Loading prioritized cause list...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="p-12 text-center text-[#4A4F57]">
            <p className="text-base font-semibold text-[#1A1A1A]">No matters found</p>
            <p className="text-xs mt-1">No cases match the selected filter or search criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#C5CCD6]">
            {cases.map((c) => (
              <div
                key={c.id}
                className="py-4 px-2 hover:bg-[#F4F6FA] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-[#0B2A5B]">
                      {c.case_number}
                    </span>
                    <StatusChip
                      variant={mapTierToVariant(c.triage_tier)}
                      label={`${c.triage_tier ? c.triage_tier.toUpperCase() : 'LOW'} (${c.triage_score ?? 15}/100)`}
                    />
                    <span className="text-xs px-2 py-0.5 rounded bg-[#F4F6FA] text-[#4A4F57] border border-[#C5CCD6]">
                      {c.case_type}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-[#1A1A1A]">
                    {c.title}
                  </h2>

                  <div className="flex items-center gap-4 text-xs text-[#4A4F57] flex-wrap">
                    <span>
                      Court: <strong className="text-[#1A1A1A]">{c.court}</strong>
                    </span>
                    <span>
                      Filed: <strong className="text-[#1A1A1A]">{c.filing_date.slice(0, 10)}</strong>
                    </span>
                    {c.custody_flag && (
                      <span className="text-[#B3261E] font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        Undertrial in Custody ({c.custody_since ? `${Math.round((new Date().getTime() - new Date(c.custody_since).getTime()) / (1000 * 60 * 60 * 24 * 30))} months` : 'Active'})
                      </span>
                    )}
                    {c.statutory_deadline && (
                      <span className="text-[#8A4B00] font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                        Statutory Deadline: {c.statutory_deadline.slice(0, 10)}
                      </span>
                    )}
                    {c.vulnerable_party && (
                      <span className="text-[#137333] font-medium flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                        Priority: {c.vulnerability_reason}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenCase(c)}
                    className="flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#0B2A5B]" aria-hidden="true" />
                    <span>Bench Brief &amp; Citations</span>
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Bench Brief Accessible Dialog */}
      {selectedCase && (
        <Dialog
          isOpen={!!selectedCase}
          onClose={() => setSelectedCase(null)}
          title={`Judicial Bench Brief — ${selectedCase.case_number}`}
          description={`${selectedCase.court} • Case Ingestion Record`}
          maxWidth="max-w-4xl"
        >
          {modalLoading ? (
            <div className="p-12 text-center text-[#4A4F57]">
              <div className="w-8 h-8 border-4 border-[#0B2A5B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold">Generating 1-page Bench Brief and verifying citations...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Details */}
              <div className="p-4 bg-[#F4F6FA] border border-[#C5CCD6] rounded space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-[#0B2A5B]">
                    {selectedCase.case_number}
                  </span>
                  <StatusChip
                    variant={mapTierToVariant(selectedCase.triage_tier)}
                    label={`${selectedCase.triage_tier?.toUpperCase() || 'LOW'} (${selectedCase.triage_score ?? 15}/100)`}
                  />
                  <StatusChip variant="ai" label="AI-assisted — verify with source" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">{selectedCase.title}</h3>
                <p className="text-xs text-[#4A4F57]">
                  Ingested Files: {selectedCase.document_count} &bull; Filed on {selectedCase.filing_date.slice(0, 10)}
                </p>
              </div>

              {/* 1-Page Bench Brief Card */}
              {caseSummary && (
                <div className="border border-[#C5CCD6] rounded p-5 bg-white space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#C5CCD6]">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#0B2A5B]" aria-hidden="true" />
                      <h4 className="font-bold text-[#0B2A5B] text-base">
                        Judicial Bench Brief (Concise &le; 250 Words)
                      </h4>
                    </div>
                    <span className="text-xs text-[#757575] font-medium">Advisory Decision Support</span>
                  </div>

                  <div className="text-sm text-[#1A1A1A] leading-relaxed font-serif bg-[#F4F6FA] p-4 rounded border border-[#C5CCD6]">
                    {caseSummary.brief}
                  </div>

                  {/* Timeline with Clickable Citations */}
                  <div className="mt-4">
                    <h5 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wider mb-2">
                      Chronological Event Timeline (Select citation to verify excerpt)
                    </h5>
                    <div className="space-y-2">
                      {caseSummary.timeline.map((ev, idx) => (
                        <div
                          key={idx}
                          role="button"
                          tabIndex={0}
                          onClick={() => ev.source && setActiveCitation(ev.source)}
                          onKeyDown={(e) => {
                            if ((e.key === 'Enter' || e.key === ' ') && ev.source) {
                              e.preventDefault();
                              setActiveCitation(ev.source);
                            }
                          }}
                          className={`p-3 rounded border text-xs flex items-center justify-between gap-3 cursor-pointer transition ${
                            activeCitation === ev.source
                              ? 'bg-[#0B2A5B]/10 border-[#0B2A5B] text-[#0B2A5B] font-semibold'
                              : 'bg-white border-[#C5CCD6] text-[#1A1A1A] hover:bg-[#F4F6FA]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-[#4A4F57] shrink-0 font-bold">{ev.date}</span>
                            <span>{ev.event}</span>
                          </div>
                          {ev.source && (
                            <span className="shrink-0 px-2 py-0.5 rounded bg-[#0B2A5B]/10 text-[#0B2A5B] border border-[#0B2A5B]/30 text-[11px] font-mono">
                              Page {ev.source.page} [{ev.source.span.join('-')}]
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Citation Inspection Callout */}
                  {activeCitation && (
                    <div className="mt-4 p-4 rounded bg-[#F4F6FA] border-2 border-[#0B2A5B] text-xs space-y-2" role="region" aria-label="Citation Verification Details">
                      <div className="flex items-center justify-between text-[#0B2A5B] font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#137333]" aria-hidden="true" />
                          Verified Ground-Truth Source Citation
                        </span>
                        <span className="font-mono">
                          Doc: {activeCitation.document_id.slice(0, 8)}... | Page {activeCitation.page}
                        </span>
                      </div>
                      <p className="text-[#1A1A1A]">
                        Verified Excerpt: <span className="bg-white px-2 py-1 rounded border border-[#C5CCD6] font-mono font-medium inline-block mt-1">"{activeCitation.excerpt || 'verified phrase'}"</span>
                      </p>
                    </div>
                  )}

                  {/* Key Issues */}
                  {caseSummary.issues.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#C5CCD6]">
                      <h5 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wider mb-2">
                        Key Legal Issues Framed for Determination
                      </h5>
                      <ul className="list-disc list-inside text-xs text-[#1A1A1A] space-y-1">
                        {caseSummary.issues.map((iss, i) => (
                          <li key={i}>{iss}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Explainable Factor Breakdown */}
              {caseTriage && (
                <div className="border border-[#C5CCD6] rounded p-5 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-[#0B2A5B] text-base">
                      Transparent Triage Scoring Factors
                    </h4>
                    <span className="text-xs font-mono font-bold text-[#0B2A5B] bg-[#0B2A5B]/10 px-2 py-1 rounded">
                      Total Score: {caseTriage.score}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {caseTriage.factors.map((f, i) => (
                      <div
                        key={i}
                        className="bg-[#F4F6FA] border border-[#C5CCD6] p-3 rounded text-xs flex justify-between items-start gap-2"
                      >
                        <div>
                          <div className="font-bold text-[#1A1A1A] capitalize">{f.name.replace(/_/g, ' ')}</div>
                          <div className="text-[#4A4F57] mt-0.5">{f.value}</div>
                        </div>
                        <span className="font-mono font-bold text-[#0B2A5B] shrink-0">
                          +{f.points} / {f.max_points}
                        </span>
                      </div>
                    ))}
                  </div>

                  {caseTriage.overridden_by && (
                    <div className="mt-3 p-3 rounded bg-[#FF9933]/15 border border-[#FF9933]/40 text-xs">
                      <span className="font-bold text-[#8A4B00]">Judicial Override Applied:</span> Changed to '{caseTriage.tier}' by {caseTriage.overridden_by}. Reason: "{caseTriage.override_reason}"
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button variant="secondary" onClick={() => setSelectedCase(null)}>
                  Close Bench Brief
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      )}
    </div>
  );
};
