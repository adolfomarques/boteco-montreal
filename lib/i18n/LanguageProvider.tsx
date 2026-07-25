'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from './translations';
import { translations } from './translations';

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value};path=/;max-age=${60 * 60 * 24 * 365}`;
}

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

function resolveNested(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('boteco-locale') as Locale | null;
        if (stored && stored in translations) return stored;
      }
    } catch {}
    return 'fr';
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('boteco-locale', newLocale);
      setCookie('boteco-locale', newLocale);
    }
    router.refresh();
  }, [router]);

  const t = useCallback(
    (path: string): string => {
      const dict = translations[locale] as unknown as Record<string, unknown>;
      return resolveNested(dict, path);
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
