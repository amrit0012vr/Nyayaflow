import { useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'hi' | 'or';

export function useLanguage() {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('nyayaflow_lang');
      if (stored === 'en' || stored === 'hi' || stored === 'or') {
        return stored;
      }
    }
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nyayaflow_lang', lang);
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return { language, setLanguage };
}
