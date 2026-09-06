import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. App will run in degraded mode.');
}

let _supabase: SupabaseClient | any;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
} else {
  // Minimal stub that surfaces clear runtime errors if any supabase method is used
  const errorMsg = '[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Configure .env and restart dev server.';
  _supabase = new Proxy({}, {
    get() {
      return () => {
        throw new Error(errorMsg);
      };
    },
  }) as any;
}

export const supabase: SupabaseClient | any = _supabase;
export default supabase;
