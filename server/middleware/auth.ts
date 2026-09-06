import { Request, Response, NextFunction } from 'express';
import { getSupabase } from '../db/supabase';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any; // Supabase user object
      admin?: boolean;
    }
  }
}

/**
 * Server-side admin allowlist — ONLY these two emails may access admin APIs.
 * This is enforced server-side; no frontend flag can override it.
 */
const ADMIN_ALLOWLIST = [
  'garudafarms9427@gmail.com',
  'raminisaisanthosh@gmail.com',
];

/**
 * requireUser middleware
 * - Expects `Authorization: Bearer <access_token>` header
 * - Verifies token using server-side Supabase client (service role key)
 * - Attaches `req.user` with verified Supabase user object
 */
export async function requireUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = String(req.headers.authorization || '');
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({ ok: false, error: 'Missing Authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ ok: false, error: 'Missing access token' });
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      res.status(500).json({ ok: false, error: 'Supabase not configured on server' });
      return;
    }

    // Verify token server-side using Supabase service role client
    const { data, error } = await supabase.auth.getUser(token as string);
    if (error || !data?.user) {
      res.status(401).json({ ok: false, error: 'Invalid or expired access token' });
      return;
    }

    req.user = data.user;
    next();
  } catch (err: any) {
    console.error('[Auth] requireUser error:', err);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

/**
 * requireAdmin middleware
 * - Verifies Supabase session via requireUser
 * - Checks authenticated user email against the server-side ADMIN_ALLOWLIST
 * - ALSO checks admin_users table for additional security
 * - Returns 403 for any non-admin user regardless of frontend state
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await requireUser(req, res, async () => {
      try {
        const user = req.user;
        if (!user || !user.email) {
          res.status(403).json({ ok: false, error: 'Forbidden. Admin access required.' });
          return;
        }

        const userEmail = user.email.toLowerCase().trim();

        // PRIMARY CHECK: Server-side hardcoded allowlist
        const isAllowlisted = ADMIN_ALLOWLIST.some(
          (adminEmail) => adminEmail.toLowerCase().trim() === userEmail
        );

        if (isAllowlisted) {
          req.admin = true;
          next();
          return;
        }

        // SECONDARY CHECK: admin_users table (for any future additions)
        const supabase = getSupabase();
        if (supabase) {
          const { data: adminRow } = await supabase
            .from('admin_users')
            .select('id, email, is_active')
            .ilike('email', userEmail)
            .eq('is_active', true)
            .limit(1)
            .maybeSingle();

          if (adminRow) {
            req.admin = true;
            next();
            return;
          }
        }

        // All checks failed — deny access
        console.warn(`[Admin Auth] DENIED access attempt from: ${userEmail}`);
        res.status(403).json({ ok: false, error: 'Forbidden. You are not authorized to access admin resources.' });
      } catch (err: any) {
        console.error('[Auth] requireAdmin inner error:', err);
        res.status(500).json({ ok: false, error: 'Internal server error' });
      }
    });
  } catch (err: any) {
    console.error('[Auth] requireAdmin error:', err);
  }
}
