'use client';

import React from 'react';
import { useLanguage } from '../../lib/i18n/LanguageProvider';
import type { Locale } from '../../lib/i18n/translations';

const locales: { code: Locale; label: string }[] = [
  { code: 'fr', label: 'FR' },
  { code: 'pt', label: 'PT' },
  { code: 'en', label: 'EN' },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <span className="hidden lg:inline text-on-surface-variant font-label-caps cursor-pointer hover:text-secondary transition-colors">
      {locales.map((l, i) => (
        <React.Fragment key={l.code}>
          {i > 0 && <span className="text-on-surface-variant/40"> | </span>}
          <button
            onClick={() => setLocale(l.code)}
            className={`transition-colors ${
              locale === l.code ? 'text-secondary' : 'hover:text-secondary'
            }`}
          >
            {l.label}
          </button>
        </React.Fragment>
      ))}
    </span>
  );
}
