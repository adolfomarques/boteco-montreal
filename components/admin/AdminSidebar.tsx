'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

interface SidebarCtxValue {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}
const SidebarCtx = createContext<SidebarCtxValue>({ isOpen: false, toggle: () => {}, close: () => {} });
export function useSidebar() { return useContext(SidebarCtx); }
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen(v => !v), []);
  const close = useCallback(() => setIsOpen(false), []);
  return <SidebarCtx.Provider value={{ isOpen, toggle, close }}>{children}</SidebarCtx.Provider>;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { adminUser, signOut } = useAuth();
  const { t } = useLanguage();
  const { isOpen, close } = useSidebar();

  const NAV_ITEMS = [
    { href: '/admin/dashboard', label: t('admin.dashboard'), icon: 'dashboard' },
    { href: '/admin/menu', label: t('admin.menuTitle'), icon: 'restaurant_menu' },
    { href: '/admin/landing', label: 'NOSSA COZINHA', icon: 'flatware' },
    { href: '/admin/events', label: t('admin.eventsTitle'), icon: 'event' },
    { href: '/admin/gallery', label: t('admin.galleryTitle'), icon: 'photo_library' },
    { href: '/admin/reservations', label: t('admin.reservationsTitle'), icon: 'event_seat' },
    { href: '/admin/settings', label: t('admin.settingsTitle'), icon: 'settings' },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={close}
        />
      )}
      <aside
        className={`h-screen w-56 fixed left-0 top-0 flex flex-col border-r border-outline-variant bg-surface z-50 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-56'
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full p-3">
          <div className="mb-6 px-3 flex items-center justify-between">
            <h1 className="font-headline-sm text-secondary tracking-tight">Samba Modern</h1>
            <button onClick={close} className="md:hidden material-symbols-outlined text-on-surface-variant hover:text-on-surface text-sm">
              close
            </button>
          </div>

          <nav className="flex-1 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all active:scale-95 ${
                    isActive
                      ? 'bg-secondary-container text-on-secondary-container font-bold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{item.icon}</span>
                  <span className="font-label-caps text-xs">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-outline-variant space-y-3">
            <button className="w-full bg-secondary text-on-secondary py-2.5 px-3 rounded-lg font-bold font-label-caps text-xs hover:brightness-110 active:scale-95 transition-all">
              {t('admin.sidebarUpdate')}
            </button>
            <div className="space-y-0.5">
              <Link className="flex items-center gap-3 px-3 py-1.5 text-on-surface-variant hover:text-on-surface transition-colors" href="/admin/help">
                <span className="material-symbols-outlined text-sm">help</span>
                <span className="font-label-caps text-[11px]">{t('admin.sidebarHelp')}</span>
              </Link>
              {adminUser && (
                <div className="px-3 py-1.5 text-on-surface-variant text-[11px] font-label-caps truncate border-b border-outline-variant mb-1">
                  {adminUser.name || adminUser.email}
                </div>
              )}
              <button
                onClick={signOut}
                className="flex items-center gap-3 px-3 py-1.5 w-full text-left text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                <span className="font-label-caps text-[11px]">{t('admin.sidebarLogout')}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
