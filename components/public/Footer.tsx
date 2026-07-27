'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../lib/i18n/LanguageProvider';
import { RESTAURANT, RESTAURANT_HOURS_ARRAY } from '../../lib/data/restaurant';

export default function Footer() {
  const { t, locale } = useLanguage();

  return (
    <footer className="bg-surface border-t border-outline-variant/10 scroll-mt-16 md:scroll-mt-20" id="contato">
      <div className="container-max pb-section-gap pt-4 md:pt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <span className="font-headline-sm text-[18px] text-on-surface uppercase tracking-tight">
              Boteco Montreal
            </span>
            <p className="font-body-md text-on-surface-variant max-w-xs leading-relaxed mt-4">
              {t('footer.description')}
            </p>
          </div>
          <div>
            <h4 className="font-label-caps text-secondary mb-6">{t('footer.exploreTitle')}</h4>
            <ul className="space-y-4 font-body-md text-on-surface-variant">
              <li><Link href="/menu" className="hover:text-secondary transition-colors">{t('nav.menu')}</Link></li>
              <li><Link href="/eventos" className="hover:text-secondary transition-colors">{t('nav.eventos')}</Link></li>
              <li><Link href="/reservas" className="hover:text-secondary transition-colors">{t('nav.reservas')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-label-caps text-secondary mb-6">{t('footer.hoursTitle')}</h4>
            <ul className="space-y-3 font-body-md text-on-surface-variant">
              {RESTAURANT_HOURS_ARRAY.map(({ key }) => {
                const day = RESTAURANT.hours[key as keyof typeof RESTAURANT.hours];
                const label = day.label[locale as keyof typeof day.label] || day.label.en;
                const isClosed = 'status' in day && day.status === 'closed';
                const hoursStr = !isClosed && 'hours' in day
                  ? day.hours[locale as keyof typeof day.hours] || day.hours.en
                  : '';
                return (
                  <li key={key} className="flex gap-2">
                    <span>{label}</span>
                    <span className={`font-medium ${isClosed ? 'text-error' : 'text-on-surface'}`}>
                      {isClosed ? t('footer.closed') : hoursStr}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h4 className="font-label-caps text-secondary mb-6">{t('footer.contactTitle')}</h4>
            <ul className="space-y-4 font-body-md text-on-surface-variant">
              <li>
                <a
                  href="https://maps.app.goo.gl/SJQagBwD9u21L9RQ6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 hover:text-secondary transition-colors group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0 text-secondary">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span className="leading-relaxed group-hover:text-secondary transition-colors">{t('footer.address')}</span>
                </a>
              </li>
              <li>
                <a href={`tel:${RESTAURANT.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 hover:text-secondary transition-colors group">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-secondary">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <span className="group-hover:text-secondary transition-colors">{RESTAURANT.phone}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${RESTAURANT.email}`} className="flex items-center gap-3 hover:text-secondary transition-colors group">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-secondary">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span className="group-hover:text-secondary transition-colors">{RESTAURANT.email}</span>
                </a>
              </li>
              <li className="pt-2">
                <div className="flex items-center gap-3">
                  <a
                    href={RESTAURANT.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-secondary hover:text-on-secondary transition-all"
                    aria-label="Instagram"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  </a>
                  <a
                    href={RESTAURANT.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-secondary hover:text-on-secondary transition-all"
                    aria-label="Facebook"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
          <div className="border-t border-outline-variant/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-label-caps text-[10px] text-on-surface-variant/60 tracking-widest">
            {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="font-label-caps text-[10px] text-on-surface-variant/60 hover:text-secondary transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link href="/terms" className="font-label-caps text-[10px] text-on-surface-variant/60 hover:text-secondary transition-colors">
              {t('footer.terms')}
            </Link>
            <Link href="/careers" className="font-label-caps text-[10px] text-on-surface-variant/60 hover:text-secondary transition-colors">
              {t('footer.careers')}
            </Link>
            <a
              href={RESTAURANT.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-surface-variant/60 hover:text-secondary transition-colors"
              aria-label="Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a
              href={RESTAURANT.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-surface-variant/60 hover:text-secondary transition-colors"
              aria-label="Facebook"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
