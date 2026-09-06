import { supabase } from './supabaseClient';

export async function signUpWithEmail(payload: { email: string; password: string; fullName?: string; phone?: string }) {
  const { email, password, fullName, phone } = payload;
  // Supabase v2: pass options with user metadata under `options.data`
  return supabase.auth.signUp({ email, password, options: { data: { fullName, phone } } });
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => callback(event, session));
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data?.session || null;
}

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}
