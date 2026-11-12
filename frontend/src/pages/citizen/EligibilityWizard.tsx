import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { EligibilityResult } from '../../types';
import {
  Calculator,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Scale
} from 'lucide-react';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';

export const EligibilityWizard: React.FC = () => {
  const navigate = useNavigate();

  const [annualIncome, setAnnualIncome] = useState<number>(200000);
  const [stateName, setStateName] = useState<string>('Delhi');
  const [courtLevel, setCourtLevel] = useState<string>('district');
  const [isScSt, setIsScSt] = useState<boolean>(false);
  const [isTrafficking, setIsTrafficking] = useState<boolean>(false);
  const [isWomanOrChild, setIsWomanOrChild] = useState<boolean>(false);
  const [hasDisability, setHasDisability] = useState<boolean>(false);
  const [isDisasterVictim, setIsDisasterVictim] = useState<boolean>(false);
  const [isWorkman, setIsWorkman] = useState<boolean>(false);
  const [inCustody, setInCustody] = useState<boolean>(false);

  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.checkEligibility({
        annual_income: Number(annualIncome),
        state: stateName,
        court_level: courtLevel,
        is_sc_st: isScSt,
        is_victim_of_trafficking_or_begar: isTrafficking,
        is_woman_or_child: isWomanOrChild,
        has_disability_or_mental_illness: hasDisability,
        is_victim_of_disaster_or_ethnic_violence: isDisasterVictim,
        is_industrial_workman: isWorkman,
        in_custody: inCustody
      });
      setResult(res);
    } catch {
      alert('Error connecting to eligibility evaluation endpoint.');
    } finally {
      setLoading(false);
    }
  };

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
          <span>Legal Services Authorities Act, 1987 &bull; Section 12 Evaluation</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0B2A5B] font-display mt-1">
          Free Legal Aid Eligibility Calculator
        </h1>
        <div className="w-16 h-[3px] bg-[#FF9933] mt-2 mb-2" />
        <p className="text-sm text-[#4A4F57] max-w-2xl">
          Evaluate statutory eligibility for state-funded legal representation in subordinate, High Court, or Supreme Court proceedings.
        </p>
      </div>

      <Panel title="Statutory Assessment Form">
        <form onSubmit={handleEvaluate} className="space-y-6">
          {/* Statutory Priority & Exempt Categories */}
          <div>
            <h2 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wider mb-3">
              1. Statutory Priority &amp; Exempt Categories (Free regardless of family income)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-start gap-2.5 p-3 rounded bg-[#F4F6FA] border border-[#C5CCD6] cursor-pointer hover:border-[#0B2A5B] transition-colors">
                <input
                  type="checkbox"
                  checked={isWomanOrChild}
                  onChange={(e) => setIsWomanOrChild(e.target.checked)}
                  className="mt-0.5 rounded text-[#0B2A5B] focus:ring-[#0B2A5B]"
                />
                <span className="text-xs text-[#1A1A1A]">
                  <strong>Woman or Child</strong> (Section 12(c))
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded bg-[#F4F6FA] border border-[#C5CCD6] cursor-pointer hover:border-[#0B2A5B] transition-colors">
                <input
                  type="checkbox"
                  checked={isScSt}
                  onChange={(e) => setIsScSt(e.target.checked)}
                  className="mt-0.5 rounded text-[#0B2A5B] focus:ring-[#0B2A5B]"
                />
                <span className="text-xs text-[#1A1A1A]">
                  <strong>Scheduled Caste / Scheduled Tribe</strong> (Section 12(a))
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded bg-[#F4F6FA] border border-[#C5CCD6] cursor-pointer hover:border-[#0B2A5B] transition-colors">
                <input
                  type="checkbox"
                  checked={inCustody}
                  onChange={(e) => setInCustody(e.target.checked)}
                  className="mt-0.5 rounded text-[#0B2A5B] focus:ring-[#0B2A5B]"
                />
                <span className="text-xs text-[#1A1A1A]">
                  <strong>In Police / Judicial Custody</strong> (Section 12(g))
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded bg-[#F4F6FA] border border-[#C5CCD6] cursor-pointer hover:border-[#0B2A5B] transition-colors">
                <input
                  type="checkbox"
                  checked={hasDisability}
                  onChange={(e) => setHasDisability(e.target.checked)}
                  className="mt-0.5 rounded text-[#0B2A5B] focus:ring-[#0B2A5B]"
                />
                <span className="text-xs text-[#1A1A1A]">
                  <strong>Person with Disability / Mental Illness</strong> (Section 12(d))
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded bg-[#F4F6FA] border border-[#C5CCD6] cursor-pointer hover:border-[#0B2A5B] transition-colors">
                <input
                  type="checkbox"
                  checked={isTrafficking}
                  onChange={(e) => setIsTrafficking(e.target.checked)}
                  className="mt-0.5 rounded text-[#0B2A5B] focus:ring-[#0B2A5B]"
                />
                <span className="text-xs text-[#1A1A1A]">
                  <strong>Victim of Trafficking or Begar</strong> (Section 12(b))
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded bg-[#F4F6FA] border border-[#C5CCD6] cursor-pointer hover:border-[#0B2A5B] transition-colors">
                <input
                  type="checkbox"
                  checked={isDisasterVictim}
                  onChange={(e) => setIsDisasterVictim(e.target.checked)}
                  className="mt-0.5 rounded text-[#0B2A5B] focus:ring-[#0B2A5B]"
                />
                <span className="text-xs text-[#1A1A1A]">
                  <strong>Victim of Disaster / Ethnic Violence</strong> (Section 12(e))
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded bg-[#F4F6FA] border border-[#C5CCD6] cursor-pointer hover:border-[#0B2A5B] transition-colors">
                <input
                  type="checkbox"
                  checked={isWorkman}
                  onChange={(e) => setIsWorkman(e.target.checked)}
                  className="mt-0.5 rounded text-[#0B2A5B] focus:ring-[#0B2A5B]"
                />
                <span className="text-xs text-[#1A1A1A]">
                  <strong>Industrial Workman</strong> (Section 12(f))
                </span>
              </label>
            </div>
          </div>

          {/* Forum & Income Selection */}
          <div className="pt-4 border-t border-[#C5CCD6]">
            <h2 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wider mb-3">
              2. Jurisdiction &amp; Annual Income Parameters (Section 12(h))
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="State / Territory" required htmlFor="state-select">
                <select
                  id="state-select"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#C5CCD6] rounded text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                >
                  <option value="Delhi">Delhi (DLSA)</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Odisha">Odisha</option>
                  <option value="West Bengal">West Bengal</option>
                </select>
              </FormField>

              <FormField label="Court Level" required htmlFor="court-level-select">
                <select
                  id="court-level-select"
                  value={courtLevel}
                  onChange={(e) => setCourtLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#C5CCD6] rounded text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                >
                  <option value="district">District &amp; Subordinate Courts</option>
                  <option value="high_court">High Court</option>
                  <option value="supreme_court">Supreme Court of India</option>
                </select>
              </FormField>

              <FormField label="Total Family Annual Income (₹)" required htmlFor="annual-income-input">
                <input
                  id="annual-income-input"
                  type="number"
                  min="0"
                  step="10000"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-[#C5CCD6] rounded text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                />
              </FormField>
            </div>
            <p className="text-[11px] text-[#4A4F57] mt-2 italic">
              Notice: Statutory income limits vary by State and court level &mdash; confirm exact limits with your local DLSA.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            isBusy={loading}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2"
          >
            <Calculator className="w-4 h-4" aria-hidden="true" />
            <span>{loading ? 'Evaluating Statutory Parameters...' : 'Calculate Statutory Eligibility'}</span>
          </Button>
        </form>

        {/* Calculation Result */}
        {result && (
          <div className="mt-8 pt-6 border-t border-[#C5CCD6]">
            <div
              className={`p-5 rounded border flex items-start gap-4 ${
                result.is_eligible
                  ? 'bg-[#137333]/10 border-[#137333]/40 text-[#137333]'
                  : 'bg-[#FF9933]/15 border-[#FF9933]/40 text-[#8A4B00]'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {result.is_eligible ? (
                  <CheckCircle2 className="w-6 h-6 text-[#137333]" aria-hidden="true" />
                ) : (
                  <XCircle className="w-6 h-6 text-[#8A4B00]" aria-hidden="true" />
                )}
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-[#1A1A1A]">
                    {result.is_eligible
                      ? 'Eligible for 100% Free Legal Representation'
                      : 'Income Above Prescribed Threshold'}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-white border border-[#C5CCD6] text-[#0B2A5B] font-semibold">
                    {result.clause}
                  </span>
                </div>
                <p className="text-xs text-[#1A1A1A] leading-relaxed">{result.notes}</p>
                <div className="pt-2 text-[11px] text-[#4A4F57]">
                  <strong>Statutory Basis:</strong> {result.legal_basis}
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mt-4 bg-[#F4F6FA] p-4 rounded border border-[#C5CCD6]">
              <h3 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wider mb-2">
                Recommended Procedural Next Steps:
              </h3>
              <ul className="space-y-1.5 text-xs text-[#1A1A1A]">
                {result.next_steps.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#FF9933] font-bold">&bull;</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
};
