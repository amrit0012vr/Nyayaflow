import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Scale, FileText, Briefcase, Shield, Users, CheckCircle2,
  Lock, Eye, EyeOff, ArrowLeft, AlertCircle, Sparkles, Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PersonaCard {
  id: string;
  name: string;
  badge: string;
  desc: string;
  icon: React.ReactNode;
  defaultEmail: string;
  color: string;
}

const PERSONAS: PersonaCard[] = [
  {
    id: 'judge',
    name: 'Judge / Judicial Bench',
    badge: 'Bench Access',
    desc: 'Review urgency-ranked cause lists, 1-page bench briefs, and citation verifications.',
    icon: <Scale className="w-6 h-6 text-purple-400" />,
    defaultEmail: 'judge1@nyayaflow.demo',
    color: 'hover:border-purple-500/50 hover:bg-purple-500/5'
  },
  {
    id: 'clerk',
    name: 'Court Registry Clerk',
    badge: 'Registry Clearance',
    desc: 'Register case files, run DPDP PII redaction vault, and oversee court scheduling.',
    icon: <FileText className="w-6 h-6 text-blue-400" />,
    defaultEmail: 'clerk1@nyayaflow.demo',
    color: 'hover:border-blue-500/50 hover:bg-blue-500/5'
  },
  {
    id: 'lawyer',
    name: 'Advocate / Legal Counsel',
    badge: 'Bar Enrolled',
    desc: 'Access your assigned court matters, procedural timelines, and hearing notices.',
    icon: <Briefcase className="w-6 h-6 text-emerald-400" />,
    defaultEmail: 'advocate1@nyayaflow.demo',
    color: 'hover:border-emerald-500/50 hover:bg-emerald-500/5'
  },
  {
    id: 'police',
    name: 'Police / Investigating Officer',
    badge: 'Law Enforcement',
    desc: 'Deposit evidence with SHA-256 digital seals and inspect chain-of-custody logs.',
    icon: <Shield className="w-6 h-6 text-amber-400" />,
    defaultEmail: 'io1@nyayaflow.demo',
    color: 'hover:border-amber-500/50 hover:bg-amber-500/5'
  },
  {
    id: 'citizen',
    name: 'Citizen / Litigant',
    badge: 'Public Portal',
    desc: 'Check Section 12 free legal aid qualification, plain-language status, and AI support.',
    icon: <Users className="w-6 h-6 text-cyan-400" />,
    defaultEmail: 'citizen1@nyayaflow.demo',
    color: 'hover:border-cyan-500/50 hover:bg-cyan-500/5'
  },
  {
    id: 'auditor',
    name: 'Auditor / Vigilance',
    badge: 'Independent Oversight',
    desc: 'Cryptographically verify immutable audit ledger and inspect tamper alert telemetry.',
    icon: <CheckCircle2 className="w-6 h-6 text-rose-400" />,
    defaultEmail: 'auditor1@nyayaflow.demo',
    color: 'hover:border-rose-500/50 hover:bg-rose-500/5'
  }
];

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedPersona, setSelectedPersona] = useState<PersonaCard | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('NyayaDemo@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [language, setLanguage] = useState('en');

  const handleSelectPersona = (persona: PersonaCard) => {
    setSelectedPersona(persona);
    setIsAdminMode(false);
    setEmail(persona.defaultEmail);
    setPassword('NyayaDemo@2026');
    setError(null);
  };

  const handleSelectAdmin = () => {
    setIsAdminMode(true);
    setSelectedPersona(null);
    setEmail('admin@nyayaflow.demo');
    setPassword('NyayaDemo@2026');
    setError(null);
  };

  const handleBackToPersonas = () => {
    setSelectedPersona(null);
    setIsAdminMode(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const personaId = isAdminMode ? 'admin' : (selectedPersona?.id || 'citizen');

    try {
      const homeRoute = await login({
        email,
        password,
        persona: personaId
      });
      // Redirect to target from state if authorized, or home route
      const from = (location.state as any)?.from?.pathname;
      navigate(from || homeRoute, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials for the selected role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (p: PersonaCard) => {
    handleSelectPersona(p);
    setIsSubmitting(true);
    try {
      const homeRoute = await login({
        email: p.defaultEmail,
        password: 'NyayaDemo@2026',
        persona: p.id
      });
      navigate(homeRoute, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100">
      {/* Top Bar with Language Selector */}
      <header className="border-b border-slate-900 bg-slate-900/60 backdrop-blur py-3 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-white">Nyaya<span className="text-amber-400">Flow</span></span>
            <span className="ml-2 text-xs text-slate-400">Secure Judicial AI Core</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700 text-xs">
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-slate-300 outline-none cursor-pointer"
          >
            <option value="en" className="bg-slate-800">English</option>
            <option value="hi" className="bg-slate-800">हिन्दी (Hindi)</option>
            <option value="or" className="bg-slate-800">ଓଡ଼ିଆ (Odia)</option>
          </select>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {!selectedPersona && !isAdminMode ? (
          <div>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                Welcome to NyayaFlow Judicial Portal
              </h1>
              <p className="text-sm text-slate-400">
                Please select your judicial role persona to access authorized dockets, case briefs, and statutory workflows.
              </p>
            </div>

            {/* Persona Cards Grid (AUTH-02) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {PERSONAS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectPersona(p)}
                  className={`bg-slate-900 border border-slate-800 rounded-xl p-5 cursor-pointer transition-all duration-200 ${p.color} flex flex-col justify-between group shadow-sm`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 group-hover:border-slate-600 transition">
                        {p.icon}
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {p.badge}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                      {p.name}
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 group-hover:text-amber-300">
                    <span>Enter credentials</span>
                    <span>&rarr;</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Demo Quick-Login Bar (AUTH-09) */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-2.5">
                <Sparkles className="w-4 h-4" />
                <span>Demo Quick-Launch (1-Click Authenticated Access):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleQuickLogin(p)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-md transition flex items-center gap-1.5"
                  >
                    <span>{p.name.split('/')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Administrator link */}
            <div className="text-center">
              <button
                onClick={handleSelectAdmin}
                className="text-xs text-slate-500 hover:text-slate-300 transition underline underline-offset-4"
              >
                Administrator sign-in
              </button>
            </div>
          </div>
        ) : (
          /* Credentials Form for Selected Persona (AUTH-02, AUTH-03) */
          <div className="max-w-md w-full mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-2xl">
            <button
              onClick={handleBackToPersonas}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change persona</span>
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                {isAdminMode ? <Lock className="w-6 h-6 text-red-400" /> : selectedPersona?.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {isAdminMode ? 'Administrator Sign-In' : selectedPersona?.name}
                </h2>
                <p className="text-xs text-slate-400">
                  {isAdminMode ? 'System maintenance & user control' : selectedPersona?.badge}
                </p>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-xs text-rose-300 flex items-start gap-2 mb-4"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Registered Official Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@nyayaflow.demo"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition disabled:opacity-50 mt-2 shadow-lg"
              >
                {isSubmitting ? 'Verifying Credentials...' : `Sign in as ${isAdminMode ? 'Admin' : selectedPersona?.name.split('/')[0]}`}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-900/40 py-4 px-6 text-center text-xs text-slate-500">
        <p>NyayaFlow Judicial Platform · Open source (Apache-2.0)</p>
        <p className="mt-1 text-[11px] text-slate-600">
          Notice: AI outputs are advisory; judicial decisions and orders remain with authorised court officials.
        </p>
      </footer>
    </div>
  );
};

