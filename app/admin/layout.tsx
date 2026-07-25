'use client';

import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AuthGuard from '@/components/admin/AuthGuard';
import { LanguageProvider, useLanguage } from '@/lib/i18n/LanguageProvider';

function AdminFooter() {
  const { t } = useLanguage();
  return (
    <footer className="mt-auto px-gutter py-6 border-t border-outline-variant flex justify-between items-center bg-surface">
      <span className="font-label-caps text-[10px] text-on-surface-variant">{t('admin.footerCopyright')}</span>
      <div className="flex gap-6">
        <a className="text-[10px] font-label-caps text-on-surface-variant hover:text-secondary" href="#">{t('admin.footerSystemStatus')}</a>
        <a className="text-[10px] font-label-caps text-on-surface-variant hover:text-secondary" href="#">{t('admin.footerPrivacy')}</a>
      </div>
    </footer>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="ml-56 flex-1 flex flex-col bg-background min-h-screen">
          {children}
          <AdminFooter />
        </main>
      </div>
      </AuthGuard>
    </LanguageProvider>
  );
}
