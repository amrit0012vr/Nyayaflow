import React from 'react';
import { Link } from 'react-router-dom';
import { useTextSize } from '../../hooks/useTextSize';
import { useContrast } from '../../hooks/useContrast';
import { LanguageCode } from '../../hooks/useLanguage';
import { t } from '../../lib/i18n';

export interface UtilityBarProps {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

export const UtilityBar: React.FC<UtilityBarProps> = ({ language, setLanguage }) => {
  const { textSize, setTextSize } = useTextSize();
  const { isContrast, toggleContrast } = useContrast();

  return (
    <div className="bg-[#F4F6FA] border-b border-[#C5CCD6] text-xs text-[#1A1A1A]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-9 flex items-center justify-between gap-4">
        {/* Left Accessibility Links */}
        <div className="flex items-center gap-4">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-1 focus:left-2 focus:z-50 focus:bg-[#0B2A5B] focus:text-white focus:px-3 focus:py-1 focus:rounded focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
          >
            {t('skip_to_main', language)}
          </a>
          <Link
            to="/accessibility"
            className="text-[#0B2A5B] hover:underline font-medium flex items-center gap-1"
          >
            <span aria-hidden="true">♿</span>
            <span>{t('screen_reader', language)}</span>
          </Link>
        </div>

        {/* Right Accessibility & Preference Controls */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Font Resizing Controls (A- / A / A+) */}
          <div className="flex items-center gap-1 border-r border-[#C5CCD6] pr-3" aria-label={t('text_size', language)}>
            <button
              type="button"
              onClick={() => setTextSize('small')}
              aria-label={t('text_decrease', language)}
              title={t('text_decrease', language)}
              aria-pressed={textSize === 'small'}
              className={`px-1.5 py-0.5 rounded font-bold text-xs inline-control transition ${
                textSize === 'small' ? 'bg-[#0B2A5B] text-white' : 'text-[#0B2A5B] hover:bg-[#C5CCD6]/50'
              }`}
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setTextSize('normal')}
              aria-label={t('text_normal', language)}
              title={t('text_normal', language)}
              aria-pressed={textSize === 'normal'}
              className={`px-1.5 py-0.5 rounded font-bold text-xs inline-control transition ${
                textSize === 'normal' ? 'bg-[#0B2A5B] text-white' : 'text-[#0B2A5B] hover:bg-[#C5CCD6]/50'
              }`}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setTextSize('large')}
              aria-label={t('text_increase', language)}
              title={t('text_increase', language)}
              aria-pressed={textSize === 'large'}
              className={`px-1.5 py-0.5 rounded font-bold text-xs inline-control transition ${
                textSize === 'large' ? 'bg-[#0B2A5B] text-white' : 'text-[#0B2A5B] hover:bg-[#C5CCD6]/50'
              }`}
            >
              A+
            </button>
          </div>

          {/* High Contrast Toggle */}
          <button
            type="button"
            onClick={toggleContrast}
            aria-pressed={isContrast}
            aria-label="Toggle high contrast mode"
            title={t('contrast', language)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold inline-control transition border ${
              isContrast
                ? 'bg-black text-yellow-400 border-yellow-400'
                : 'text-[#0B2A5B] border-[#C5CCD6] hover:bg-[#C5CCD6]/40'
            }`}
          >
            <span aria-hidden="true">◐</span>
            <span className="hidden sm:inline">{t('contrast', language)}</span>
          </button>

          {/* Language Selector */}
          <div className="flex items-center gap-1">
            <label htmlFor="utility-lang-select" className="sr-only">
              {t('select_language', language)}
            </label>
            <select
              id="utility-lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="bg-white border border-[#C5CCD6] text-[#1A1A1A] text-xs rounded px-2 py-0.5 cursor-pointer outline-none inline-control"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="or">ଓଡ଼ିଆ (Odia)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
