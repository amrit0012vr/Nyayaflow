import React from 'react';
import { Info } from 'lucide-react';
import { LanguageCode } from '../../hooks/useLanguage';
import { t } from '../../lib/i18n';

export interface NoticeBannerProps {
  language: LanguageCode;
}

export const NoticeBanner: React.FC<NoticeBannerProps> = ({ language }) => {
  const isDemoMode = import.meta.env.VITE_DEMO_MODE !== 'false';

  return (
    <aside
      className="notice-strip bg-[#FFF4E5] border-y border-[#C5CCD6] border-l-4 border-l-[#FF9933] text-[#1A1A1A] py-2 px-4"
      aria-label="Official Prototype Notice"
    >
      <div className="max-w-[1200px] mx-auto flex items-start gap-2.5 text-xs">
        <Info className="w-4 h-4 text-[#FF9933] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="leading-relaxed">
          <span className="font-bold text-[#8A4B00] mr-1.5">NOTICE:</span>
          <span>{t('prototype_notice', language)}</span>
          {isDemoMode && (
            <span className="ml-1.5 font-semibold text-[#8A4B00]">
              ({t('demo_mode_notice', language)})
            </span>
          )}
        </div>
      </div>
    </aside>
  );
};
