import { Router, Request, Response } from 'express';
import { getSupabase } from '../db/supabase';
import { requireUser, requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/auth/me
router.get('/me', requireUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase();
    const user = req.user;

    // Try to fetch a customer profile if it exists
    let profile: any = null;
    if (supabase && user?.id) {
      const { data } = await supabase.from('customers').select('*').eq('id', user.id).maybeSingle();
      profile = data || null;
    }

    res.json({ ok: true, user, profile });
  } catch (err: any) {
    console.error('/api/auth/me error:', err);
    res.status(500).json({ ok: false, error: 'Failed to retrieve authenticated user.' });
  }
});

// Note: Clients should call Supabase `signOut()` directly. No server-side logout endpoint provided.

// GET /api/auth/status
router.get('/status', async (req: Request, res: Response): Promise<void> => {
  const client = getSupabase();
  if (!client) {
    res.json({
      ok: true,
      databaseConfigured: false,
      singleAdminInitialized: true,
      note: 'Operating with default local admin until Supabase credentials are provided in .env',
    });
    return;
  }

  const { count, error } = await client
    .from('admin_users')
    .select('*', { count: 'exact', head: true });

  res.json({
    ok: true,
    databaseConfigured: true,
    singleAdminInitialized: (count ?? 0) > 0,
    adminCount: count ?? 0,
  });
});

export default router;
