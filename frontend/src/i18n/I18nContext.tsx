import { createContext, useContext, useState, ReactNode } from 'react';
import en from './en';
import fr from './fr';

type Lang = 'en' | 'fr';

const translations: Record<Lang, Record<string, string>> = { en, fr };

interface I18nContextType {
  t: (key: string, params?: Record<string, string | number>) => string;
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function replaceParams(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem('lang');
    return (stored === 'en' || stored === 'fr') ? stored : 'en';
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const text = translations[lang]?.[key] ?? key;
    return replaceParams(text, params);
  };

  return (
    <I18nContext.Provider value={{ t, lang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
