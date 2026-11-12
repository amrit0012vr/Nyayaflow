import React from 'react';
import { Link } from 'react-router-dom';
import { LanguageCode } from '../../hooks/useLanguage';
import { t } from '../../lib/i18n';

export interface FooterProps {
  language: LanguageCode;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const buildDate = import.meta.env.VITE_BUILD_DATE || '12 Nov 2026';
  const gitSha = import.meta.env.VITE_GIT_SHA || 'eee2c40';

  return (
    <footer className="bg-[#0B2A5B] text-white pt-10 pb-6 border-t-4 border-[#FF9933] mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Three Column Main Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-white/20 text-xs">
          {/* Column 1: About */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-3">
              {t('about', language)}
            </h3>
            <p className="text-white/85 leading-relaxed mb-3">
              NyayaFlow is an open-source, privacy-first judicial decision-support prototype designed for subordinate court benches, registry clerks, legal counsel, and citizens.
            </p>
            <p className="text-white/85">
              Licensed under the{' '}
              <a
                href="https://github.com/amrit0012vr/Nyayaflow"
                target="_blank"
                rel="noreferrer"
                className="text-white font-semibold underline hover:text-[#FFBF47]"
              >
                Apache-2.0 Open Source License
              </a>.
            </p>
          </div>

          {/* Column 2: Policies and Help */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-3">
              Policies & Statutory Information
            </h3>
            <ul className="space-y-2 list-none p-0 m-0">
              <li>
                <Link to="/terms" className="text-white/90 hover:text-[#FFBF47] underline">
                  {t('terms', language)}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-white/90 hover:text-[#FFBF47] underline">
                  {t('privacy', language)} (DPDP Act, 2023 Aligned)
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="text-white/90 hover:text-[#FFBF47] underline">
                  {t('accessibility', language)}
                </Link>
              </li>
              <li>
                <Link to="/legal-aid-info" className="text-white/90 hover:text-[#FFBF47] underline">
                  {t('legal_aid_info', language)} (Section 12, LSA Act)
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-white/90 hover:text-[#FFBF47] underline">
                  {t('disclaimer', language)}
                </Link>
              </li>
              <li>
                <Link to="/sitemap" className="text-white/90 hover:text-[#FFBF47] underline">
                  {t('sitemap', language)}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Prototype Attribution */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-3">
              Project Context & Support
            </h3>
            <p className="text-white/85 leading-relaxed mb-2">
              <strong>Team:</strong> NyayaFlow Engineering Group
            </p>
            <p className="text-white/85 leading-relaxed mb-3">
              <strong>Support Email:</strong>{' '}
              <a href="mailto:support@nyayaflow.demo" className="text-white underline hover:text-[#FFBF47]">
                support@nyayaflow.demo
              </a>
            </p>
            <div className="p-3 bg-[#071C3F] border border-white/20 rounded text-[11px] text-white/90 leading-relaxed">
              <span className="font-bold text-[#FFBF47]">Bharat Agentic-AI Hackathon 2026</span>
              <br />
              Track 07 — Timely Justice: Reducing Case Backlog
            </div>
          </div>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="pt-6 text-[11px] text-white/75 space-y-1.5 text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <span>Content owned by: <strong>NyayaFlow Team</strong></span> ·{' '}
            <span>Last updated: <strong>{buildDate}</strong></span> ·{' '}
            <span>Version: <code className="bg-white/10 px-1 py-0.5 rounded text-white">{gitSha}</code></span>
          </div>
          <div className="text-[10px] text-white/70">
            Best viewed in the latest versions of Chrome, Edge, Firefox and Safari.
          </div>
        </div>

        {/* Single-line Prototype Notice */}
        <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-white/65 text-center">
          {t('prototype_notice', language)}
        </div>
      </div>
    </footer>
  );
};
