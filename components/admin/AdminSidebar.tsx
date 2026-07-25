'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { adminUser, signOut } = useAuth();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { href: '/admin/dashboard', label: t('admin.dashboard'), icon: 'dashboard' },
    { href: '/admin/menu', label: t('admin.menuTitle'), icon: 'restaurant_menu' },
    { href: '/admin/events', label: t('admin.eventsTitle'), icon: 'event' },
    { href: '/admin/gallery', label: t('admin.galleryTitle'), icon: 'photo_library' },
    { href: '/admin/reservations', label: t('admin.reservationsTitle'), icon: 'event_seat' },
    { href: '/admin/settings', label: t('admin.settingsTitle'), icon: 'settings' },
  ];

  return (
    <aside className="h-screen w-56 fixed left-0 top-0 flex flex-col border-r border-outline-variant bg-surface z-50">
      <div className="flex flex-col h-full p-3">
        <div className="mb-6 px-3">
          <h1 className="font-headline-sm text-secondary tracking-tight">Samba Modern</h1>
        </div>

        <nav className="flex-1 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
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
            <a className="flex items-center gap-3 px-3 py-1.5 text-on-surface-variant hover:text-on-surface transition-colors" href="#">
              <span className="material-symbols-outlined text-sm">help</span>
              <span className="font-label-caps text-[11px]">{t('admin.sidebarHelp')}</span>
            </a>
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
  );
}
