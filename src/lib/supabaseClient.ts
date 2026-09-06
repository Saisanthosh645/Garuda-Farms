import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Please add them to Vercel Environment Variables.');
}

const createSafeProxy = () => {
  const dummyAuth = {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('VITE_SUPABASE_URL missing') }),
    signUp: async () => ({ data: { user: null, session: null }, error: new Error('VITE_SUPABASE_URL missing') }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ error: new Error('VITE_SUPABASE_URL missing') }),
  };

  return new Proxy({}, {
    get(_, prop) {
      if (prop === 'auth') return dummyAuth;
      return () => {
        console.warn(`[Supabase] Method '${String(prop)}' called, but VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing.`);
        return Promise.resolve({ data: null, error: new Error('Supabase credentials missing on Vercel') });
      };
    },
  });
};

let _supabase: SupabaseClient | any;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
} else {
  _supabase = createSafeProxy();
}

export const supabase: SupabaseClient | any = _supabase;
export default supabase;
