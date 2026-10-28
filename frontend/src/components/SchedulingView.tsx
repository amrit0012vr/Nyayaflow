import React, { useState, useEffect } from 'react';
import { Case, ScheduleSlot } from '../types';
import { api } from '../lib/api';
import { Calendar, Clock, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Scale } from 'lucide-react';

export const SchedulingView: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [suggestions, setSuggestions] = useState<ScheduleSlot[]>([]);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [bookedSlot, setBookedSlot] = useState<string | null>(null);

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
    try {
      const res = await api.getScheduleSuggestions(selectedCaseId);
      setSuggestions(res.suggestions);
      setConflicts(res.conflicts);
    } catch (err: any) {
      alert(`Scheduling error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSlot = async (slot: ScheduleSlot) => {
    try {
      await api.acceptSchedule(selectedCaseId, slot);
      setBookedSlot(`${slot.courtroom} on ${slot.slot_start.slice(0, 10)} at ${slot.slot_start.slice(11, 16)}`);
      fetchCases();
      alert(`Hearing officially scheduled for ${slot.courtroom}! Recorded in cryptographic audit log.`);
    } catch (err: any) {
      alert(`Booking failed: ${err.message}`);
    }
  };

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
            <Scale className="w-4 h-4" /> Court Scheduling Efficiency Engine
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Constraint-Optimized Hearing Slot Allocation
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Solves multi-constraint scheduling (Google OR-Tools / CP-SAT): respects court working days, courtroom capacities, priority scores, and groups related cases to eliminate adjournments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Selection & Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            Select Case for Listing
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Case Docket</label>
            <select
              value={selectedCaseId}
              onChange={(e) => {
                setSelectedCaseId(e.target.value);
                setSuggestions([]);
                setBookedSlot(null);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.case_number} — {c.title}
                </option>
              ))}
            </select>
          </div>

          {selectedCase && (
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className="font-semibold text-amber-400 uppercase">{selectedCase.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Triage Tier:</span>
                <span className="font-semibold text-rose-400 uppercase">{selectedCase.triage_tier} ({selectedCase.triage_score}/100)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Under-trial Custody:</span>
                <span className="text-slate-200">{selectedCase.custody_flag ? 'Yes (Urgent)' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Forum:</span>
                <span className="text-slate-200">{selectedCase.court}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleGenerateSlots}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Solving Constraints...' : 'Generate Optimal Hearing Slots'}
          </button>

          {/* Model Formulation Explainability */}
          <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/40 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">CP-SAT Mathematical Objective:</div>
            <code className="text-amber-300 block font-mono">
              Max Σ x[c,s] * (P[c]*w1 - Wait(c,s)*w2 + Club*w3)
            </code>
            <p>Guarantees non-holiday, non-overlapping court sessions.</p>
          </div>
        </div>

        {/* Slot Recommendations */}
        <div className="lg:col-span-2 space-y-4">
          {bookedSlot && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-sm text-emerald-400 font-semibold">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              Hearing successfully confirmed & docketed in {bookedSlot}!
            </div>
          )}

          {conflicts.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Calendar Conflict Notes:
              </div>
              {conflicts.map((conf, i) => (
                <div key={i}>{conf}</div>
              ))}
            </div>
          )}

          {suggestions.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-2">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-base font-semibold text-slate-300">No active suggestions displayed</div>
              <p className="text-xs max-w-md mx-auto">
                Select a case and click "Generate Optimal Hearing Slots" to run the constraint solver across Courtrooms 1, 3, and 5.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Ranked Slot Options (Ranked by Constraint Score)</span>
                <span className="text-xs font-normal text-slate-400">Next 14 Working Days Window</span>
              </h3>

              {suggestions.map((slot, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Rank #{idx + 1} • Score: {slot.score}
                      </span>
                      <span className="font-semibold text-white text-sm">{slot.courtroom}</span>
                    </div>

                    <div className="text-xs text-slate-300 flex items-center gap-3">
                      <span className="flex items-center gap-1 font-mono text-amber-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {slot.slot_start.slice(0, 10)}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {slot.slot_start.slice(11, 16)} - {slot.slot_end.slice(11, 16)}
                      </span>
                      <span>Bench: <strong>{slot.judge_id}</strong></span>
                    </div>

                    <div className="space-y-0.5 pt-1">
                      {slot.reasons.map((r, ri) => (
                        <div key={ri} className="text-xs text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {r}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAcceptSlot(slot)}
                    className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow-lg shadow-emerald-500/20"
                  >
                    Confirm & Book Slot <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
