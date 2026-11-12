import React from 'react';
import { UtilityBar } from './UtilityBar';
import { BrandHeader } from './BrandHeader';
import { NavBar } from './NavBar';
import { NoticeBanner } from './NoticeBanner';
import { Breadcrumb } from './Breadcrumb';
import { Footer } from './Footer';
import { LanguageCode } from '../../hooks/useLanguage';

export interface AppShellProps {
  children: React.ReactNode;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  showBreadcrumb?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  language,
  setLanguage,
  showBreadcrumb = true
}) => {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1A1A1A] flex flex-col font-sans">
      {/* 4px Saffron Top Rule */}
      <div className="h-1 bg-[#FF9933] w-full" aria-hidden="true" />

      {/* Utility Bar */}
      <UtilityBar language={language} setLanguage={setLanguage} />

      {/* Branding Header */}
      <BrandHeader language={language} />

      {/* Primary Navigation Bar */}
      <NavBar language={language} />

      {/* Static Non-scrolling Notice Banner */}
      <NoticeBanner language={language} />

      {/* Breadcrumb Navigation */}
      {showBreadcrumb && <Breadcrumb />}

      {/* Main Content Area */}
      <main id="main-content" tabIndex={-1} className="flex-1 w-full outline-none">
        {children}
      </main>

      {/* Formal Footer */}
      <Footer language={language} />
    </div>
  );
};
