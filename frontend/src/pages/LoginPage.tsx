import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Scale, FileText, Briefcase, Shield, Users, CheckCircle2,
  Lock, Eye, EyeOff, AlertCircle, Info, HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CategoryTile } from '../components/ui/CategoryTile';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';
import { ErrorSummary } from '../components/ui/ErrorSummary';
import { LanguageCode } from '../hooks/useLanguage';
import { t } from '../lib/i18n';

export interface LoginPageProps {
  language?: LanguageCode;
}

interface CategoryOption {
  id: string;
  nameEn: string;
  nameKey: string;
  descKey: string;
  icon: React.ReactNode;
  defaultEmail: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'judge',
    nameEn: 'Judge / Bench',
    nameKey: 'judge',
    descKey: 'judge_desc',
    icon: <Scale className="w-5 h-5" aria-hidden="true" />,
    defaultEmail: 'judge1@nyayaflow.demo'
  },
  {
    id: 'clerk',
    nameEn: 'Court Registry Clerk',
    nameKey: 'clerk',
    descKey: 'clerk_desc',
    icon: <FileText className="w-5 h-5" aria-hidden="true" />,
    defaultEmail: 'clerk1@nyayaflow.demo'
  },
  {
    id: 'lawyer',
    nameEn: 'Advocate / Legal Counsel',
    nameKey: 'lawyer',
    descKey: 'lawyer_desc',
    icon: <Briefcase className="w-5 h-5" aria-hidden="true" />,
    defaultEmail: 'advocate1@nyayaflow.demo'
  },
  {
    id: 'police',
    nameEn: 'Police / Investigating Officer',
    nameKey: 'police',
    descKey: 'police_desc',
    icon: <Shield className="w-5 h-5" aria-hidden="true" />,
    defaultEmail: 'io1@nyayaflow.demo'
  },
  {
    id: 'citizen',
    nameEn: 'Citizen / Litigant',
    nameKey: 'citizen',
    descKey: 'citizen_desc',
    icon: <Users className="w-5 h-5" aria-hidden="true" />,
    defaultEmail: 'citizen1@nyayaflow.demo'
  },
  {
    id: 'auditor',
    nameEn: 'Auditor / Vigilance',
    nameKey: 'auditor',
    descKey: 'auditor_desc',
    icon: <CheckCircle2 className="w-5 h-5" aria-hidden="true" />,
    defaultEmail: 'auditor1@nyayaflow.demo'
  }
];

export const LoginPage: React.FC<LoginPageProps> = ({ language = 'en' }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [capsLockActive, setCapsLockActive] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const emailInputRef = useRef<HTMLInputElement>(null);

  const isDemoMode = import.meta.env.VITE_DEMO_MODE !== 'false';

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setIsAdminMode(false);
    setErrors([]);
    const option = CATEGORIES.find((c) => c.id === catId);
    if (option) {
      setEmail(option.defaultEmail);
    }
  };

  const handleSelectAdmin = () => {
    setSelectedCategory('admin');
    setIsAdminMode(true);
    setEmail('admin@nyayaflow.demo');
    setPassword('');
    setErrors([]);
  };

  const handleClear = () => {
    setEmail('');
    setPassword('');
    setErrors([]);
  };

  const handleKeyDownPassword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (!selectedCategory) {
      setErrors([t('category_required', language)]);
      return;
    }

    if (!email.trim() || !password) {
      setErrors(['Please enter both your registered official email and password.']);
      return;
    }

    setIsSubmitting(true);
    try {
      const homeRoute = await login({
        email: email.trim(),
        password,
        persona: selectedCategory
      });
      const from = (location.state as any)?.from?.pathname;
      navigate(from || homeRoute, { replace: true });
    } catch (err: any) {
      const msg = err.message || t('auth_error_generic', language);
      setErrors([msg]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseDemoAccount = (catId: string, demoEmail: string) => {
    setSelectedCategory(catId);
    setIsAdminMode(catId === 'admin');
    setEmail(demoEmail);
    setPassword('NyayaDemo@2026');
    setErrors([]);
    emailInputRef.current?.focus();
  };

  const currentCategoryLabel = isAdminMode
    ? t('admin', language)
    : selectedCategory
    ? t(CATEGORIES.find((c) => c.id === selectedCategory)?.nameKey || 'judge', language)
    : '';

  return (
    <div className="py-6 max-w-[1200px] mx-auto px-4 sm:px-6">
      {/* Page Heading & Mandate indicator */}
      <div className="flex flex-wrap items-baseline justify-between border-b border-[#C5CCD6] pb-3 mb-6 gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#0B2A5B] m-0">
            {t('user_login', language)}
          </h1>
          <p className="text-xs text-[#4A4F57] m-0 mt-1">
            Select your user category and sign in with your registered official credentials.
          </p>
        </div>
        <div className="text-xs text-[#4A4F57]">
          <span className="text-[#B3261E] font-bold" aria-hidden="true">*</span> indicates mandatory fields
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel: Two-Step Credentials Area (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Error Summary Box */}
          <ErrorSummary errors={errors} title="Submission Error" />

          {/* Step 1: User Category Selector */}
          <section
            aria-labelledby="category-heading"
            className="p-5 bg-white border border-[#C5CCD6] rounded shadow-sm"
          >
            <h2 id="category-heading" className="text-base font-bold text-[#0B2A5B] mb-1">
              {t('select_category', language)}{' '}
              <span className="text-[#B3261E]" aria-hidden="true">*</span>
            </h2>
            <p className="text-xs text-[#4A4F57] mb-4">
              Choose the role corresponding to your judicial or administrative appointment.
            </p>

            <div
              role="radiogroup"
              aria-label="User category"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {CATEGORIES.map((cat, idx) => (
                <CategoryTile
                  key={cat.id}
                  id={cat.id}
                  nameEn={cat.nameEn}
                  nameLocal={language !== 'en' ? t(cat.nameKey, language) : undefined}
                  desc={t(cat.descKey, language)}
                  icon={cat.icon}
                  selected={selectedCategory === cat.id}
                  onSelect={() => handleSelectCategory(cat.id)}
                  tabIndex={selectedCategory === cat.id || (!selectedCategory && idx === 0) ? 0 : -1}
                />
              ))}
            </div>

            {/* Administrator link */}
            <div className="mt-4 pt-3 border-t border-[#C5CCD6] flex items-center justify-between text-xs">
              <span className="text-[#4A4F57]">System management & maintenance?</span>
              <button
                type="button"
                onClick={handleSelectAdmin}
                className={`font-semibold underline ${
                  isAdminMode ? 'text-[#0B2A5B]' : 'text-[#0B5FA5] hover:text-[#0B2A5B]'
                }`}
              >
                {t('admin_signin', language)}
              </button>
            </div>
          </section>

          {/* Step 2: Credentials Form */}
          <section
            aria-labelledby="credentials-heading"
            className={`p-5 bg-white border border-[#C5CCD6] rounded shadow-sm transition-opacity ${
              !selectedCategory ? 'opacity-60 pointer-events-none' : 'opacity-100'
            }`}
          >
            <div className="flex items-center justify-between border-b border-[#C5CCD6] pb-3 mb-4">
              <div>
                <h2 id="credentials-heading" className="text-base font-bold text-[#0B2A5B] m-0">
                  {t('enter_credentials', language)}{' '}
                  <span className="text-[#B3261E]" aria-hidden="true">*</span>
                </h2>
                <div
                  aria-live="polite"
                  className="text-xs text-[#0B5FA5] font-semibold mt-0.5"
                >
                  {selectedCategory ? (
                    <span>
                      {t('logging_in_as', language)}{' '}
                      <strong>{currentCategoryLabel}</strong>
                    </span>
                  ) : (
                    <span className="text-[#4A4F57]">{t('category_required', language)}</span>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <fieldset disabled={!selectedCategory} aria-disabled={!selectedCategory}>
                <legend className="sr-only">Sign-in credentials</legend>

                {/* Email Field */}
                <FormField
                  id="login-email"
                  label={t('email', language)}
                  required
                  hint="Enter your official court-issued or registered email address."
                >
                  <input
                    ref={emailInputRef}
                    id="login-email"
                    type="email"
                    name="username"
                    autoComplete="username"
                    required
                    disabled={!selectedCategory || isSubmitting}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@nyayaflow.demo"
                    className="w-full bg-white border border-[#C5CCD6] rounded px-3 py-2 text-sm text-[#1A1A1A] placeholder-[#4A4F57]/60 focus:border-[#0B2A5B] focus:ring-1 focus:ring-[#0B2A5B] outline-none disabled:bg-[#F4F6FA] disabled:cursor-not-allowed"
                  />
                </FormField>

                {/* Password Field */}
                <FormField
                  id="login-password"
                  label={t('password', language)}
                  required
                  hint="Passphrase must be confidential and securely managed."
                >
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="current-password"
                      required
                      disabled={!selectedCategory || isSubmitting}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={handleKeyDownPassword}
                      onKeyUp={handleKeyDownPassword}
                      placeholder="Enter your confidential password"
                      className="w-full bg-white border border-[#C5CCD6] rounded px-3 py-2 pr-11 text-sm text-[#1A1A1A] placeholder-[#4A4F57]/60 focus:border-[#0B2A5B] focus:ring-1 focus:ring-[#0B2A5B] outline-none disabled:bg-[#F4F6FA] disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? t('hide_password', language) : t('show_password', language)}
                      className="absolute right-2 top-2 p-1.5 text-[#4A4F57] hover:text-[#0B2A5B] rounded transition inline-control"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {capsLockActive && (
                    <p className="text-xs text-[#8A4B00] bg-[#FFF4E5] p-1.5 rounded border border-[#FF9933] mt-1 flex items-center gap-1 font-semibold">
                      <span aria-hidden="true">⚠</span> {t('caps_lock_on', language)}
                    </p>
                  )}
                </FormField>

                {/* Form Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    isBusy={isSubmitting}
                    disabled={!selectedCategory || isSubmitting}
                  >
                    {isSubmitting ? t('signing_in', language) : t('login', language)}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleClear}
                    disabled={!selectedCategory || isSubmitting}
                  >
                    {t('clear', language)}
                  </Button>
                </div>
              </fieldset>
            </form>
          </section>

          {/* Demo Accounts Panel (Strictly when DEMO_MODE=true) */}
          {isDemoMode && (
            <details className="p-4 bg-[#F4F6FA] border border-[#C5CCD6] rounded text-xs">
              <summary className="font-bold text-[#0B2A5B] cursor-pointer hover:underline select-none">
                Demo accounts (prototype only)
              </summary>
              <div className="mt-3 pt-3 border-t border-[#C5CCD6] space-y-2">
                <p className="text-[#8A4B00] bg-[#FFF4E5] p-2 rounded border border-[#FF9933]">
                  These pre-configured accounts exist only in demo mode with synthetic case filings. The default password is known to evaluators.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#C5CCD6] text-[#4A4F57]">
                        <th className="py-1 px-2 font-semibold">Category</th>
                        <th className="py-1 px-2 font-semibold">Email</th>
                        <th className="py-1 px-2 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C5CCD6]">
                      {CATEGORIES.map((cat) => (
                        <tr key={cat.id}>
                          <td className="py-1.5 px-2 font-medium text-[#1A1A1A]">{cat.nameEn}</td>
                          <td className="py-1.5 px-2 font-mono text-[#4A4F57]">{cat.defaultEmail}</td>
                          <td className="py-1.5 px-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleUseDemoAccount(cat.id, cat.defaultEmail)}
                              className="text-[#0B5FA5] hover:text-[#0B2A5B] underline font-semibold"
                            >
                              Fill account
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td className="py-1.5 px-2 font-medium text-[#1A1A1A]">Administrator</td>
                        <td className="py-1.5 px-2 font-mono text-[#4A4F57]">admin@nyayaflow.demo</td>
                        <td className="py-1.5 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleUseDemoAccount('admin', 'admin@nyayaflow.demo')}
                            className="text-[#0B5FA5] hover:text-[#0B2A5B] underline font-semibold"
                          >
                            Fill account
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </details>
          )}
        </div>

        {/* Right Panel: Official Notices / Help Sidebar (4 cols) */}
        <aside className="lg:col-span-4 space-y-5" aria-label="Notices and Support">
          <section className="bg-white border border-[#C5CCD6] rounded p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#C5CCD6] pb-2.5 mb-3 text-[#0B2A5B] font-bold text-sm">
              <Info className="w-4 h-4 text-[#0B2A5B]" aria-hidden="true" />
              <h2>{t('notices_heading', language)}</h2>
            </div>
            <ul className="space-y-3 text-xs text-[#1A1A1A] pl-4 list-disc leading-relaxed">
              <li>{t('notice_auth_only', language)}</li>
              <li>{t('notice_password_conf', language)}</li>
              <li>{t('notice_forgot_pwd', language)}</li>
              <li>{t('notice_helpdesk', language)}</li>
            </ul>
          </section>

          <section className="bg-[#F4F6FA] border border-[#C5CCD6] rounded p-5 text-xs text-[#4A4F57] leading-relaxed">
            <h3 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wider mb-2">
              Accessibility Notice
            </h3>
            <p className="mb-2">
              This portal is designed to adhere to GIGW and WCAG 2.1 AA accessibility standards. Use the utility bar controls above to adjust text sizing, contrast, and language.
            </p>
            <Link to="/accessibility" className="text-[#0B5FA5] font-semibold underline hover:text-[#0B2A5B]">
              Read the full Accessibility Statement &rarr;
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
};
