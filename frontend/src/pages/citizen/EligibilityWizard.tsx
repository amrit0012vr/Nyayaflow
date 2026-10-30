import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { EligibilityResult } from '../../types';
import { Calculator, CheckCircle2, XCircle, Phone, ArrowLeft, ShieldAlert } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto px-4 py-6">
      <button
        onClick={() => navigate('/citizen')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Citizen Home</span>
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl mb-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              Free Legal Aid Eligibility Calculator (Section 12)
            </h1>
            <p className="text-xs text-slate-400">
              Evaluated strictly according to the Legal Services Authorities Act, 1987.
            </p>
          </div>
        </div>

        <form onSubmit={handleEvaluate} className="space-y-6">
          {/* Statutory Exemptions Checkboxes (Clauses a to g) */}
          <div>
            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">
              1. Statutory Priority & Exempt Categories (Free regardless of income)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-start gap-2.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={isWomanOrChild}
                  onChange={(e) => setIsWomanOrChild(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-0"
                />
                <span className="text-xs text-slate-200">
                  <strong>Woman or Child</strong> (Section 12(c))
                </span>
              </label>

              <label className="flex items-start gap-2.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={isScSt}
                  onChange={(e) => setIsScSt(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-0"
                />
                <span className="text-xs text-slate-200">
                  <strong>Scheduled Caste / Scheduled Tribe</strong> (Section 12(a))
                </span>
              </label>

              <label className="flex items-start gap-2.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={inCustody}
                  onChange={(e) => setInCustody(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-0"
                />
                <span className="text-xs text-slate-200">
                  <strong>In Police / Judicial Custody</strong> (Section 12(g))
                </span>
              </label>

              <label className="flex items-start gap-2.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={hasDisability}
                  onChange={(e) => setHasDisability(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-0"
                />
                <span className="text-xs text-slate-200">
                  <strong>Person with Disability / Mental Illness</strong> (Section 12(d))
                </span>
              </label>

              <label className="flex items-start gap-2.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={isTrafficking}
                  onChange={(e) => setIsTrafficking(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-0"
                />
                <span className="text-xs text-slate-200">
                  <strong>Victim of Trafficking or Begar</strong> (Section 12(b))
                </span>
              </label>

              <label className="flex items-start gap-2.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={isDisasterVictim}
                  onChange={(e) => setIsDisasterVictim(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-0"
                />
                <span className="text-xs text-slate-200">
                  <strong>Victim of Disaster / Ethnic Violence</strong> (Section 12(e))
                </span>
              </label>

              <label className="flex items-start gap-2.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={isWorkman}
                  onChange={(e) => setIsWorkman(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-0"
                />
                <span className="text-xs text-slate-200">
                  <strong>Industrial Workman</strong> (Section 12(f))
                </span>
              </label>
            </div>
          </div>

          {/* Forum & Income Selection (Section 12(h)) */}
          <div className="pt-4 border-t border-slate-800">
            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">
              2. State Jurisdiction & Annual Income (Section 12(h))
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">State / Territory</label>
                <select
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="Delhi">Delhi (DLSA)</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Odisha">Odisha</option>
                  <option value="West Bengal">West Bengal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Court Level</label>
                <select
                  value={courtLevel}
                  onChange={(e) => setCourtLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="district">District & Subordinate Courts</option>
                  <option value="high_court">High Court</option>
                  <option value="supreme_court">Supreme Court of India</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Total Family Annual Income (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 italic">
              Notice: Statutory income limits vary by State and court level — confirm exact limits with your local DLSA.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition shadow-lg"
          >
            {loading ? 'Evaluating Statutory Parameters...' : 'Calculate Statutory Eligibility'}
          </button>
        </form>

        {/* Calculation Result */}
        {result && (
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div
              className={`p-5 rounded-xl border flex items-start gap-4 ${
                result.is_eligible
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              }`}
            >
              <div className="mt-0.5">
                {result.is_eligible ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                ) : (
                  <XCircle className="w-7 h-7 text-amber-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base">
                    {result.is_eligible ? 'Eligible for 100% Free Legal Representation' : 'Income Above Prescribed Threshold'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-semibold">
                    {result.clause}
                  </span>
                </div>
                <p className="text-xs mt-1 text-slate-300 leading-relaxed">{result.notes}</p>
                <div className="mt-3 text-xs text-slate-400 font-medium">
                  <strong>Statutory Basis:</strong> {result.legal_basis}
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mt-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Recommended Procedural Next Steps:
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {result.next_steps.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400">&bull;</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
