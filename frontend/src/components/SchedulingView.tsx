import React, { useState, useEffect } from 'react';
import { Case, ScheduleSlot } from '../types';
import { api } from '../lib/api';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Scale,
  Cpu
} from 'lucide-react';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';
import { FormField } from './ui/FormField';
import { StatusChip } from './ui/StatusChip';
import { InlineBanner } from './ui/InlineBanner';

export const SchedulingView: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [suggestions, setSuggestions] = useState<ScheduleSlot[]>([]);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [bookedSlot, setBookedSlot] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCases = async () => {
    try {
      const data = await api.getCases();
      setCases(data);
      if (data.length > 0 && !selectedCaseId) {
        setSelectedCaseId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleGenerateSlots = async () => {
    if (!selectedCaseId) return;
    setLoading(true);
    setBookedSlot(null);
    setErrorMessage(null);
    try {
      const res = await api.getScheduleSuggestions(selectedCaseId);
      setSuggestions(res.suggestions);
      setConflicts(res.conflicts);
    } catch (err: any) {
      setErrorMessage(`Scheduling error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSlot = async (slot: ScheduleSlot) => {
    try {
      await api.acceptSchedule(selectedCaseId, slot);
      setBookedSlot(`${slot.courtroom} on ${slot.slot_start.slice(0, 10)} at ${slot.slot_start.slice(11, 16)}`);
      fetchCases();
    } catch (err: any) {
      setErrorMessage(`Booking failed: ${err.message}`);
    }
  };

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-[#C5CCD6] pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0B2A5B]">
          <Scale className="w-4 h-4 text-[#FF9933]" aria-hidden="true" />
          <span>Court Administration &bull; Judicial Listing Engine</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0B2A5B] font-display mt-1">
          Constraint-Optimized Hearing Slot Allocation
        </h1>
        <div className="w-16 h-[3px] bg-[#FF9933] mt-2 mb-2" />
        <p className="text-sm text-[#4A4F57] max-w-3xl">
          Multi-constraint scheduling using Google OR-Tools CP-SAT solver: honors official court calendars, courtroom capacities, priority scores, and party grouping to prevent adjournments.
        </p>
      </div>

      {bookedSlot && (
        <InlineBanner variant="success" title="Hearing Successfully Listed">
          Hearing officially confirmed and docketed for {bookedSlot}. Entry recorded in tamper-evident judicial audit log.
        </InlineBanner>
      )}

      {errorMessage && (
        <InlineBanner variant="danger" title="Scheduling Error">
          {errorMessage}
        </InlineBanner>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Case Selection & Solver Run */}
        <div className="space-y-6">
          <Panel title="Listing Target Selection">
            <div className="space-y-4">
              <FormField
                label="Target Case Docket"
                required
                htmlFor="schedule-case-selector"
                hint="Select case requiring a new hearing date listing."
              >
                <select
                  id="schedule-case-selector"
                  value={selectedCaseId}
                  onChange={(e) => {
                    setSelectedCaseId(e.target.value);
                    setSuggestions([]);
                    setBookedSlot(null);
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#C5CCD6] rounded text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.case_number} — {c.title.slice(0, 45)}...
                    </option>
                  ))}
                </select>
              </FormField>

              {selectedCase && (
                <div className="p-3 bg-[#F4F6FA] border border-[#C5CCD6] rounded text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#4A4F57]">Urgency Tier:</span>
                    <StatusChip
                      variant={
                        selectedCase.triage_tier === 'critical'
                          ? 'critical'
                          : selectedCase.triage_tier === 'high'
                          ? 'high'
                          : selectedCase.triage_tier === 'normal'
                          ? 'normal'
                          : 'low'
                      }
                      label={`${selectedCase.triage_tier?.toUpperCase() || 'LOW'} (${selectedCase.triage_score ?? 15}/100)`}
                    />
                  </div>
                  <div className="flex justify-between py-1 border-t border-[#C5CCD6]">
                    <span className="text-[#4A4F57]">Status:</span>
                    <strong className="text-[#1A1A1A] uppercase font-mono">{selectedCase.status}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-t border-[#C5CCD6]">
                    <span className="text-[#4A4F57]">Undertrial Custody:</span>
                    <strong className={selectedCase.custody_flag ? 'text-[#B3261E]' : 'text-[#4A4F57]'}>
                      {selectedCase.custody_flag ? 'Yes (Urgent Priority)' : 'No'}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-t border-[#C5CCD6]">
                    <span className="text-[#4A4F57]">Court Forum:</span>
                    <strong className="text-[#1A1A1A]">{selectedCase.court}</strong>
                  </div>
                </div>
              )}

              <Button
                variant="primary"
                isBusy={loading}
                disabled={loading || !selectedCaseId}
                onClick={handleGenerateSlots}
                className="w-full flex items-center justify-center gap-2"
              >
                <Cpu className="w-4 h-4" aria-hidden="true" />
                <span>{loading ? 'Solving Constraints...' : 'Generate Optimal Hearing Slots'}</span>
              </Button>

              {/* Mathematical Formulation Note */}
              <div className="p-3 bg-[#F4F6FA] border border-[#C5CCD6] rounded text-xs space-y-1">
                <span className="font-bold text-[#0B2A5B] block">CP-SAT Mathematical Formulation:</span>
                <code className="text-[#0B2A5B] block font-mono text-[11px] bg-white p-1 rounded border border-[#C5CCD6]">
                  Max &Sigma; x[c,s] &bull; (P[c]&bull;w1 - Wait(c,s)&bull;w2 + Group&bull;w3)
                </code>
                <p className="text-[11px] text-[#4A4F57] mt-1">
                  Guarantees non-holiday, non-overlapping courtroom slots while honoring statutory priority.
                </p>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right Column: Slot Recommendations & Conflicts */}
        <div className="lg:col-span-2 space-y-6">
          {conflicts.length > 0 && (
            <InlineBanner variant="warning" title="Calendar Conflict Constraints Noted">
              <ul className="list-disc list-inside space-y-1 text-xs">
                {conflicts.map((conf, i) => (
                  <li key={i}>{conf}</li>
                ))}
              </ul>
            </InlineBanner>
          )}

          <Panel
            title="Recommended Hearing Slots"
            subtitle="Ranked by CP-SAT solver constraint satisfaction score"
          >
            {suggestions.length === 0 ? (
              <div className="p-12 text-center text-[#4A4F57] space-y-2">
                <Calendar className="w-10 h-10 text-[#C5CCD6] mx-auto" aria-hidden="true" />
                <p className="text-base font-bold text-[#1A1A1A]">No active slots generated</p>
                <p className="text-xs max-w-md mx-auto">
                  Select a case docket and click "Generate Optimal Hearing Slots" to compute available listings across courtrooms.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((slot, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-[#F4F6FA] border border-[#C5CCD6] rounded hover:border-[#0B2A5B] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#0B2A5B] text-white">
                          Rank #{idx + 1}
                        </span>
                        <span className="font-mono text-xs font-semibold text-[#0B2A5B] bg-[#0B2A5B]/10 px-2 py-0.5 rounded">
                          Score: {slot.score}
                        </span>
                        <strong className="text-sm text-[#1A1A1A]">{slot.courtroom}</strong>
                      </div>

                      <div className="text-xs text-[#4A4F57] flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1 font-mono text-[#1A1A1A] font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-[#0B2A5B]" aria-hidden="true" />
                          {slot.slot_start.slice(0, 10)}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[#1A1A1A]">
                          <Clock className="w-3.5 h-3.5 text-[#0B2A5B]" aria-hidden="true" />
                          {slot.slot_start.slice(11, 16)} &ndash; {slot.slot_end.slice(11, 16)}
                        </span>
                        <span>
                          Bench: <strong className="text-[#1A1A1A]">{slot.judge_id}</strong>
                        </span>
                      </div>

                      <div className="space-y-0.5 pt-1">
                        {slot.reasons.map((r, ri) => (
                          <div key={ri} className="text-xs text-[#137333] flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="shrink-0 w-full sm:w-auto">
                      <Button
                        variant="primary"
                        onClick={() => handleAcceptSlot(slot)}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5"
                      >
                        <span>Confirm Slot</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
};
