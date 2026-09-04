import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key || !url.startsWith('http')) {
    return null;
  }

  try {
    if (!supabaseClient) {
      supabaseClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
    return supabaseClient;
  } catch (err) {
    console.warn('[Supabase Client Error]:', err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(url && key && url.startsWith('http'));
}

export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string; details?: any }> {
  const client = getSupabase();
  if (!client) {
    return {
      ok: false,
      message: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable is missing or invalid.',
    };
  }

  try {
    const { data, error } = await client.from('categories').select('count', { count: 'exact', head: true });
    if (error) {
      return {
        ok: false,
        message: `Database query error: ${error.message}`,
        details: error,
      };
    }
    return {
      ok: true,
      message: 'Successfully connected to Supabase PostgreSQL database.',
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `Connection failed: ${err.message}`,
    };
  }
}
