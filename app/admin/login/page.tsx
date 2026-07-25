'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { isSupabaseConfigured, LOCAL_AUTH_KEY } from '@/components/admin/AuthProvider';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isSupabaseConfigured()) {
      if (email && password) {
        const mockSession = {
          user: { email },
          access_token: 'local-token',
          refresh_token: 'local-refresh',
          expires_in: 86400,
          expires_at: Math.floor(Date.now() / 1000) + 86400,
          token_type: 'bearer',
        };
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(mockSession));
        router.push('/admin/dashboard');
      } else {
        setError(t('admin.loginInvalid'));
      }
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message === 'Invalid login credentials'
        ? t('admin.loginInvalid')
        : signInError.message);
      setLoading(false);
      return;
    }

    router.push('/admin/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-dim">
      <div className="w-full max-w-sm glass-card p-6 rounded-xl">
        <div className="text-center mb-6">
          <h1 className="font-display-lg text-headline-sm text-secondary tracking-tight">Samba Modern</h1>
          <p className="font-label-caps text-[10px] text-on-surface-variant tracking-widest mt-2 uppercase">{t('admin.sidebarTitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isSupabaseConfigured() && (
            <div className="bg-secondary/10 text-secondary p-3 rounded-lg text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">cloud_off</span>
              Modo local — qualquer email/senha funciona
            </div>
          )}
          <div>
            <label className="block font-label-caps mb-2 text-on-surface">{t('admin.loginEmail')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/20 p-3 rounded-xl text-on-surface text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/50"
              placeholder={t('admin.loginEmailPlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block font-label-caps mb-2 text-on-surface">{t('admin.loginPassword')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/20 p-3 rounded-xl text-on-surface text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/50"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-error/20 text-error p-3 rounded-lg font-body-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary hover:bg-secondary-fixed text-on-secondary py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? t('admin.loginSubmitLoading') : t('admin.loginSubmit')}
          </button>
        </form>

        <p className="mt-8 text-center font-label-caps text-[10px] text-on-surface-variant">
          {t('admin.loginCopyright')}
        </p>
      </div>
    </div>
  );
}
