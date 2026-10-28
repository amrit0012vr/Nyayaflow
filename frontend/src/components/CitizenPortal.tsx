import React, { useState } from 'react';
import { api } from '../lib/api';
import { 
  MessageSquare, Send, CheckCircle2, Phone, ShieldCheck, 
  HelpCircle, UserCheck, AlertCircle, FileText, Globe, Scale 
} from 'lucide-react';

interface CitizenPortalProps {
  language: string;
  setLanguage: (lang: string) => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({ language, setLanguage }) => {
  const [messages, setMessages] = useState<Array<{ role: string; text: string; details?: any }>>([
    {
      role: 'assistant',
      text: language === 'hi'
        ? 'नमस्ते! मैं न्यायफ्लो का निःशुल्क कानूनी सहायता सहायक हूँ। क्या आप अपने मामले की स्थिति, मुफ्त वकील की पात्रता, या जमानत के नियमों के बारे में जानना चाहते हैं?'
        : language === 'or'
        ? 'ନମସ୍କାର! ମୁଁ ନ୍ୟାୟଫ୍ଲୋ ର ମାଗଣା ଆଇନ ସହାୟକ। ଆପଣଙ୍କୁ ମୁଁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?'
        : 'Namaste! I am NyayaFlow’s Legal Aid Assistant. You can ask about your case status, check if you qualify for a free court-appointed lawyer, or learn about your legal rights under Indian law.'
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [caseNumber, setCaseNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Eligibility Calculator State
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [annualIncome, setAnnualIncome] = useState<number>(200000);
  const [isWomanOrChild, setIsWomanOrChild] = useState<boolean>(false);
  const [isScSt, setIsScSt] = useState<boolean>(false);
  const [inCustody, setInCustody] = useState<boolean>(false);
  const [hasDisability, setHasDisability] = useState<boolean>(false);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  const [calcLoading, setCalcLoading] = useState<boolean>(false);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim()) return;

    const userMsg = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setLoading(true);

    try {
      const res = await api.sendCitizenChat(textToSend, language, caseNumber || undefined);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.reply,
          details: {
            eligible: res.eligible_for_aid,
            schemes: res.schemes_referred,
            disclaimer: res.disclaimer
          }
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Apologies, I encountered an error connecting to the legal aid knowledge base. Please dial NALSA Toll-Free 15100 for 24x7 assistance.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRunEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalcLoading(true);
    try {
      const res = await api.checkEligibility({
        annual_income: Number(annualIncome),
        is_woman_or_child: isWomanOrChild,
        is_sc_st: isScSt,
        in_custody: inCustody,
        has_disability: hasDisability
      });
      setEligibilityResult(res);
    } catch (err: any) {
      alert(`Calculator error: ${err.message}`);
    } finally {
      setCalcLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
            <Scale className="w-4 h-4" /> Citizen Legal Aid & Plain-Language Justice Access
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Nyaya Mitra — Multilingual Citizen Assistant
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Free, plain-language guidance on case tracking, under-trial rights (Article 21), and Free Legal Aid under Section 12 of the Legal Services Authorities Act, 1987.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20"
          >
            <UserCheck className="w-4 h-4" />
            {showCalculator ? 'Close Eligibility Calculator' : 'Check Free Lawyer Eligibility'}
          </button>
        </div>
      </div>

      {/* Section 12 Statutory Eligibility Calculator Card */}
      {showCalculator && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Statutory Free Legal Aid Eligibility Check (Section 12, Act of 1987)
              </h2>
              <p className="text-xs text-slate-400">
                In India, legal aid is a statutory right. Certain citizens receive 100% free counsel regardless of income.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              NALSA Guideline
            </span>
          </div>

          <form onSubmit={handleRunEligibility} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Annual Household Income (₹) [Threshold: ₹3,00,000]
              </label>
              <input
                type="number"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div className="space-y-2 pt-2 md:pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={inCustody}
                  onChange={(e) => setInCustody(e.target.checked)}
                  className="rounded text-emerald-500"
                />
                <span className="font-semibold text-rose-400">Under-Trial Prisoner / In Custody (Section 12g)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={isWomanOrChild}
                  onChange={(e) => setIsWomanOrChild(e.target.checked)}
                  className="rounded text-emerald-500"
                />
                <span>Woman or Child (Section 12c — No Income Bar)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={isScSt}
                  onChange={(e) => setIsScSt(e.target.checked)}
                  className="rounded text-emerald-500"
                />
                <span>Scheduled Caste (SC) or Scheduled Tribe (ST) (Section 12a)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={hasDisability}
                  onChange={(e) => setHasDisability(e.target.checked)}
                  className="rounded text-emerald-500"
                />
                <span>Person with Disability (Section 12d)</span>
              </label>
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={calcLoading}
                className="w-full py-2.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition"
              >
                {calcLoading ? 'Checking Statutory Guidelines...' : 'Evaluate Free Legal Aid Rights'}
              </button>
            </div>
          </form>

          {eligibilityResult && (
            <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-3 text-xs mt-3">
              <div className="flex items-center gap-2 text-sm font-bold">
                {eligibilityResult.is_eligible ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5" /> 100% Eligible for Free Court-Appointed Advocate!
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="w-5 h-5" /> Above Ceiling — Eligible for Lok Adalat & Mediation
                  </span>
                )}
              </div>

              <div className="text-slate-300">
                <strong>Legal Basis:</strong> {eligibilityResult.legal_basis}
              </div>

              <div className="space-y-1">
                <strong>Next Steps:</strong>
                {eligibilityResult.next_steps.map((st: string, i: number) => (
                  <div key={i} className="text-slate-300">{st}</div>
                ))}
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
                {eligibilityResult.helpline}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Window */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[580px] shadow-xl overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Nyaya Mitra Interactive Assistant</h3>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Active in {language.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Optional Case Number Search */}
            <input
              type="text"
              placeholder="Case No (e.g. BAIL/DEL/2026/0412)"
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500 w-48 hidden sm:block"
            />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="p-2.5 bg-slate-800/20 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
            <button
              onClick={() => handleSendMessage('Mujhe muft vakil (legal aid lawyer) chahiye, kaise milega?')}
              className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap"
            >
              Free Lawyer Guidance
            </button>
            <button
              onClick={() => handleSendMessage('Check status of my case BAIL/DEL/2026/0412')}
              className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap"
            >
              Track Case Status
            </button>
            <button
              onClick={() => handleSendMessage('What are undertrial bail rights under Section 436A / BNSS 479?')}
              className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap"
            >
              Undertrial Rights
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                    m.role === 'user'
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-tl-none space-y-2'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.text}</div>
                  {m.details?.disclaimer && (
                    <div className="pt-2 border-t border-slate-700/60 text-[10px] text-slate-400 italic">
                      {m.details.disclaimer}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-400 rounded-2xl p-3 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                  <span>Consulting Legal Services Authority Knowledge Base...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-800/40 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={
                language === 'hi'
                  ? 'अपना प्रश्न यहाँ लिखें (उदा. क्या मुझे सरकारी वकील मिल सकता है?)...'
                  : 'Type your legal query (e.g. How to apply for bail under legal aid?)...'
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-2.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 disabled:opacity-40 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Legal Aid Helplines & Rights Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Phone className="w-5 h-5" /> 24x7 NALSA National Helpline
            </div>
            <div className="text-3xl font-extrabold text-white tracking-wider">
              15100
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Toll-free, 24 hours across India. Available in Hindi, English, and regional languages for urgent bail assistance and lawyer appointment.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3 text-xs">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" /> Statutory Rights of Undertrials
            </h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Article 39A:</strong> Constitutional mandate for free legal aid so justice is not denied to any citizen by reason of economic disabilities.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Article 21:</strong> Right to speedy trial and personal liberty. Undue custody delay is prima facie grounds for bail.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>BNSS Section 479 (CrPC 436A):</strong> Maximum period for which an undertrial can be detained without bail is one-half of the offense maximum sentence.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
