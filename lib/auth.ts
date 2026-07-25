import { supabase } from './supabase';
import type { AdminUser } from './types';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const session = await getSession();
  if (!session?.user?.email) return null;

  const { data } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', session.user.email)
    .single();

  return data as unknown as AdminUser | null;
}
