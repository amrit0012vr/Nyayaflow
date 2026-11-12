import en from '../locales/en.json';
import hi from '../locales/hi.json';
import orLocale from '../locales/or.json';

export type Language = 'en' | 'hi' | 'or';
export type TranslationKey = keyof typeof en;

const translations: Record<Language, Record<string, string>> = {
  en: en as Record<string, string>,
  hi: hi as Record<string, string>,
  or: orLocale as Record<string, string>
};

export function t(key: TranslationKey | string, lang: Language = 'en'): string {
  const dict = translations[lang] || translations.en;
  return dict[key] || translations.en[key] || key;
}
