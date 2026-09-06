import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (payload: { email: string; password: string; fullName?: string; phone?: string }) => Promise<any>;
  signIn: (payload: { email: string; password: string }) => Promise<any>;
  signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      console.log('[AuthProvider] mounted — checking initial session');
      const s = await supabase.auth.getSession();
      if (!mounted) return;
      const sessionData = (s as any)?.data?.session ?? null;
      setSession(sessionData);
      setUser(sessionData?.user ?? null);
      setLoading(false);

      // Clean up empty trailing '#' from URL if present
      if (window.location.hash === '#') {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }

      // If we didn't find a session, check for an OAuth return in the URL and retry fetching session.
      // We detect presence only — we never log tokens or full URLs.
      const hasOAuthReturn = (() => {
        try {
          const h = window.location.hash || '';
          const q = window.location.search || '';
          return (
            h.includes('access_token') ||
            h.includes('provider=') ||
            q.includes('access_token') ||
            q.includes('code')
          );
        } catch (e) {
          return false;
        }
      })();

      if (!sessionData && hasOAuthReturn) {
        console.log('[AuthProvider] OAuth return detected in URL — re-checking session');
        // Small delay gives the Supabase client time to process the URL
        setTimeout(async () => {
          try {
            const s2 = await supabase.auth.getSession();
            const session2 = (s2 as any)?.data?.session ?? null;
            console.log('[AuthProvider] re-check session present?', !!session2);
            if (!mounted) return;
            if (session2) {
              setSession(session2);
              setUser(session2.user ?? null);
              if (window.location.hash) {
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
              }
            }
          } catch (err) {
            console.warn('[AuthProvider] error during OAuth re-check');
          }
        }, 350);
      } else if (!sessionData) {
        // Delayed re-check to catch cases where Supabase processes the OAuth redirect slightly after startup
        setTimeout(async () => {
          try {
            console.log('[AuthProvider] delayed session re-check');
            const s2 = await supabase.auth.getSession();
            const session2 = (s2 as any)?.data?.session ?? null;
            console.log('[AuthProvider] delayed session present?', !!session2);
            if (!mounted) return;
            if (session2) {
              setSession(session2);
              setUser(session2.user ?? null);
            }
          } catch (err) {
            console.warn('[AuthProvider] delayed session check error');
          }
        }, 500);
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, payload) => {
      // Events: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, PASSWORD_RECOVERY, INITIAL_SESSION
      try {
        let newSession = (payload as any)?.session ?? null;
        console.log('[AuthProvider] onAuthStateChange', { event, hasSession: !!newSession, userId: newSession?.user?.id ?? null });

        // Some environments fire SIGNED_IN before the session is available in the payload.
        // In that case, proactively fetch the current session from the client.
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && !newSession) {
          try {
            const s = await supabase.auth.getSession();
            newSession = (s as any)?.data?.session ?? null;
            console.log('[AuthProvider] fetched session after event', { hasSession: !!newSession });
          } catch (e) {
            console.warn('[AuthProvider] error fetching session after auth event');
          }
        }

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } catch (err) {
        console.warn('[AuthProvider] onAuthStateChange handler error');
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  const signUp = (payload: { email: string; password: string; fullName?: string; phone?: string }) => {
    return supabase.auth.signUp({ email: payload.email, password: payload.password, options: { data: { fullName: payload.fullName, phone: payload.phone } } });
  };

  const signIn = (payload: { email: string; password: string }) => {
    return supabase.auth.signInWithPassword({ email: payload.email, password: payload.password });
  };

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthProvider;
