'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { AdminUser } from '@/lib/types';
import type { Session } from '@supabase/supabase-js';

const LOCAL_AUTH_KEY = 'boteco_local_auth';

function isSupabaseConfigured(): boolean {
  if (typeof window === 'undefined') return false;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return url.startsWith('https://') && !url.includes('your-project');
}

interface AuthContextValue {
  session: Session | null;
  adminUser: AdminUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  adminUser: null,
  loading: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (!isSupabaseConfigured()) {
        const stored = localStorage.getItem(LOCAL_AUTH_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSession(parsed);
          setAdminUser({
            id: 'local-admin',
            email: parsed?.user?.email ?? 'admin@boteco.local',
            name: 'Admin Local',
            avatar_url: null,
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        if (!cancelled) setLoading(false);
        return;
      }

      const { data: { session: s } } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(s);
      if (s?.user?.email) {
        const { data } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', s.user.email)
          .single();
        if (!cancelled && data) setAdminUser(data as unknown as AdminUser);
      }
      if (!cancelled) setLoading(false);
    }
    init();

    if (!isSupabaseConfigured()) return;

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) {
        setAdminUser(null);
        router.push('/admin/login');
      }
    });

    return () => {
      cancelled = true;
      listener?.subscription.unsubscribe();
    };
  }, [router, pathname]);

  async function handleSignOut() {
    if (!isSupabaseConfigured()) {
      localStorage.removeItem(LOCAL_AUTH_KEY);
      setSession(null);
      setAdminUser(null);
      router.push('/admin/login');
      return;
    }
    await supabase.auth.signOut();
    setSession(null);
    setAdminUser(null);
    router.push('/admin/login');
  }

  return (
    <AuthContext.Provider value={{ session, adminUser, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export { isSupabaseConfigured, LOCAL_AUTH_KEY };
