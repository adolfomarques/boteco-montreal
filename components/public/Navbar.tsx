'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from '../ui/Button';
import { useLanguage } from '../../lib/i18n/LanguageProvider';
import LanguageSwitcher from './LanguageSwitcher';
import { RESTAURANT } from '../../lib/data/restaurant';

const NAV_ICONS: Record<string, string> = {
  '/menu': 'restaurant_menu',
  '/eventos': 'celebration',
  '/reservas': 'calendar_today',
  '/#contato': 'call',
};



export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hash, setHash] = useState('');
  const pathname = usePathname();
  const { t, locale, setLocale } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('hashchange', handleHashChange);
    setHash(window.location.hash);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: t('nav.menu'), href: '/menu' },
    { name: t('nav.eventos'), href: '/eventos' },
    { name: t('nav.reservas'), href: '/reservas' },
    { name: t('nav.contato'), href: '/#contato' },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-surface/95 backdrop-blur-md border-outline-variant/20 shadow-xl'
          : 'bg-surface/90 backdrop-blur-md border-outline-variant/10'
      }`}
    >
      <div className="hidden md:block py-1 text-[11px] text-on-surface-variant/70 bg-surface-container-high border-b border-outline-variant/5">
        <div className="container-max flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="https://maps.app.goo.gl/SJQagBwD9u21L9RQ6"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-secondary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {RESTAURANT.address.full}
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href={`tel:${RESTAURANT.phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:text-secondary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              {RESTAURANT.phone}
            </a>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center container-max h-16 md:h-20">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-secondary/20 to-tertiary/20">
            <img
              alt="Boteco Montreal"
              src="/boteco-logo2-clean.png"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-headline-md text-[20px] tracking-tighter text-on-surface uppercase">
            Boteco
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-stack-lg">
          {navLinks.map((link) => {
            const isActive = link.href.includes('#')
              ? pathname === '/' && hash === '#' + link.href.split('#')[1]
              : pathname === link.href;
            const handleClick = link.href.includes('#')
              ? () => setTimeout(() => setHash(window.location.hash), 50)
              : undefined;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleClick}
                className={`font-label-caps transition-colors duration-300 ${
                  isActive
                    ? 'text-secondary font-bold border-b-2 border-secondary pb-1'
                    : 'text-on-surface-variant font-medium hover:text-secondary'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-stack-md">
          <LanguageSwitcher />
          <Link href="/reservas" tabIndex={-1}>
            <Button variant="secondary" className="rounded-full shadow-secondary/20 font-label-caps text-xs">
              {t('nav.reservar')}
            </Button>
          </Link>
          <button
            className={`md:hidden relative z-50 text-on-surface flex items-center justify-center p-3 min-w-[44px] min-h-[44px] transition-opacity duration-200 ${
              mobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            onClick={() => setMobileMenuOpen(true)}
            aria-label={t('nav.menuLabel')}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="material-symbols-outlined">
              menu
            </span>
          </button>
        </div>
      </div>

      <div
        className={`fixed top-0 left-0 w-screen h-dvh z-40 md:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div
          className={`absolute top-0 right-0 h-dvh w-[280px] max-w-[80vw] bg-surface-container-high border-l border-outline-variant/10 shadow-2xl transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 pt-5 pb-2">
            <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
              <div className="relative h-8 w-8 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-secondary/20 to-tertiary/20">
                <img
                  alt="Boteco Montreal"
                  src="/boteco-logo2-clean.png"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-headline-sm text-[16px] tracking-tighter text-on-surface uppercase">
                Boteco
              </span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
              aria-label={t('nav.closeLabel')}
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div className="pb-6 px-6 flex flex-col h-full" style={{ height: 'calc(100% - 60px)' }}>
            <div className="flex-1 space-y-1 pt-4">
              {navLinks.map((link) => {
                const isActive = link.href.includes('#')
                  ? pathname === '/' && hash === '#' + link.href.split('#')[1]
                  : pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (link.href.includes('#')) setTimeout(() => setHash(window.location.hash), 50);
                    }}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-label-caps text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-secondary/15 text-secondary font-bold'
                        : 'text-on-surface hover:bg-surface-container-low hover:text-secondary'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-secondary' : 'text-on-surface-variant'}`}>
                      {NAV_ICONS[link.href] || 'link'}
                    </span>
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="pt-5 mt-4 border-t border-outline-variant/10">
              <Link
                href="/reservas"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button variant="secondary" className="w-full rounded-xl font-label-caps text-sm py-4">
                  {t('nav.reservar')}
                </Button>
              </Link>

              <div className="mt-4 flex items-center justify-center gap-3">
                {(['fr', 'pt', 'en'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLocale(l)}
                    className={`w-10 h-10 rounded-full font-label-caps text-sm font-bold transition-all duration-200 ${
                      locale === l
                        ? 'bg-secondary text-on-secondary shadow-md shadow-secondary/30 scale-110'
                        : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                    aria-label={l.toUpperCase()}
                    aria-current={locale === l ? 'true' : undefined}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
