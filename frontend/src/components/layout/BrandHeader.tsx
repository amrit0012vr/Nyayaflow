import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LanguageCode } from '../../hooks/useLanguage';
import { t } from '../../lib/i18n';

export interface BrandHeaderProps {
  language: LanguageCode;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({ language }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleLabels: Record<string, string> = {
    judge: 'Judge / Bench',
    clerk: 'Court Registry Clerk',
    lawyer: 'Advocate',
    police: 'Police / IO',
    citizen: 'Citizen / Litigant',
    auditor: 'Auditor / Vigilance',
    admin: 'Court Administrator'
  };

  const secondaryTitle = {
    hi: 'न्यायप्रवाह पोर्टल',
    or: 'ନ୍ୟାୟପ୍ରବାହ ପୋର୍ଟାଲ',
    en: 'Judicial Decision-Support Platform'
  }[language];

  return (
    <header className="bg-white border-b border-[#C5CCD6] py-3">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Own Clean Scales-of-Justice Wordmark (No Emblem / No Flag) */}
        <Link to="/" className="flex items-center gap-3.5 no-underline group">
          <div className="w-11 h-11 rounded border border-[#0B2A5B] bg-[#F4F6FA] text-[#0B2A5B] flex items-center justify-center shrink-0">
            <svg
              className="w-7 h-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
              <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
              <path d="M7 21h10" />
              <path d="M12 3v18" />
              <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
            </svg>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-[#0B2A5B] leading-none tracking-tight">
              NyayaFlow Portal
            </div>
            <div className="text-xs sm:text-sm font-semibold text-[#4A4F57] leading-tight mt-0.5">
              {secondaryTitle}
            </div>
            <div className="text-[11px] text-[#4A4F57] hidden md:block leading-tight mt-0.5">
              {t('portal_subtitle', language)}
            </div>
          </div>
        </Link>

        {/* Right: Pre-login Prototype Badge or Post-login User Box */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 bg-[#F4F6FA] border border-[#C5CCD6] p-2 sm:px-3 rounded text-left">
              <div className="w-8 h-8 rounded-full bg-[#0B2A5B] text-white flex items-center justify-center shrink-0">
                <UserIcon className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-[#1A1A1A] leading-tight">{user.name}</div>
                <div className="text-[#4A4F57] text-[11px] leading-tight mt-0.5">
                  <span className="font-semibold text-[#0B2A5B]">
                    {roleLabels[user.role] || user.role}
                  </span>
                  {user.court && <span> · {user.court}</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Logout from portal"
                className="ml-2 px-2.5 py-1 text-xs font-semibold text-[#0B2A5B] hover:bg-[#C5CCD6]/50 border border-[#C5CCD6] rounded transition flex items-center gap-1 inline-control"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">{t('logout', language)}</span>
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#FF9933] bg-[#FFF4E5] text-[#8A4B00] text-xs font-bold uppercase tracking-wider">
              <span>{t('prototype_badge', language)}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
