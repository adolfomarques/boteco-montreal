'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { useSidebar } from './AdminSidebar';

export default function AdminTopBar({ title }: { title: string }) {
  const { t } = useLanguage();
  const { toggle } = useSidebar();
  return (
    <header className="flex justify-between items-center h-16 px-gutter sticky top-0 z-30 bg-surface-container border-b border-outline-variant">
      <div className="flex items-center gap-3">
        <button onClick={toggle} className="md:hidden material-symbols-outlined text-on-surface-variant hover:text-on-surface p-1" aria-label="Toggle menu">
          menu
        </button>
        <h2 className="font-headline-sm text-on-surface">{title}</h2>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            className="bg-surface-container-low border border-outline-variant rounded-full pl-10 pr-4 py-1.5 text-sm focus:ring-2 focus:ring-secondary focus:border-transparent outline-none w-64"
            placeholder={t('admin.searchOrders')}
            type="text"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-on-surface-variant hover:text-secondary transition-colors active:opacity-80">
            notifications
          </button>
          <button className="material-symbols-outlined text-on-surface-variant hover:text-secondary transition-colors active:opacity-80">
            language
          </button>
          <div className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant">
            <div className="relative w-full h-full">
              <Image
                className="object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6bWrFQ6ZRerIidL1K33Y9K1tbR9X0vuaCwMqxJwHEHoQWTC61xIyT4jj3YXUbjt0hMmoJBV6EEdJG7SKygO4V_kcsOg1o0XA-cf-ouzBTZjDHVoVKvZC8UNoTAdrmZSt5y0Nk7fRNvaicYY2Gga3h3U-IPGrQFaf6aw9U8Ox6r1bl_XX9RZzpPSZgqU38eA7GyI0LKuN8SnO1EJ6dydKXQxOqO3mSFm1NEiHoc_wFmixYcosQbqVZX1KJs9eHQCQZPSDlZCdEbgY"
                alt="Profile"
                fill
                sizes="32px"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
