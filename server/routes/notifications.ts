import { Router, Request, Response } from 'express';
import { requireUser } from '../middleware/auth';
import { getSupabase } from '../db/supabase';

const router = Router();

/**
 * GET /api/notifications — Fetch customer notifications
 */
router.get('/', requireUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const client = getSupabase();

    if (client) {
      const { data, error } = await client
        .from('customer_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        res.json({ ok: true, notifications: data });
        return;
      }
    }

    // Default system welcome notification
    res.json({
      ok: true,
      notifications: [
        {
          id: 'welcome-1',
          user_id: userId,
          title: 'Welcome to Garuda Farms',
          message: 'Your account is active. Enjoy 100% pure single-origin A2 milk and organic harvests.',
          type: 'system',
          read: false,
          created_at: new Date().toISOString(),
        },
      ],
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * PATCH /api/notifications/:id/read — Mark notification as read
 */
router.patch('/:id/read', requireUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const client = getSupabase();

    if (client) {
      await client
        .from('customer_notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', userId);
    }

    res.json({ ok: true, message: 'Notification marked as read.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * PATCH /api/notifications/read-all — Mark all notifications as read
 */
router.patch('/read-all', requireUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const client = getSupabase();

    if (client) {
      await client
        .from('customer_notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);
    }

    res.json({ ok: true, message: 'All notifications marked as read.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
