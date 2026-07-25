'use client';

import { useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AuthProvider, { useAuth } from './AuthProvider';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

function AuthCheck({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const { session, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!mounted) setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-dim">
        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-dim">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
          <span className="font-label-caps text-on-surface-variant">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!session) {
    router.replace('/admin/login');
    return null;
  }

  return <>{children}</>;
}

export default function AuthGuard({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthCheck>{children}</AuthCheck>
    </AuthProvider>
  );
}
