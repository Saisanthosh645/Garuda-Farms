import { Router, Request, Response } from 'express';
import { requireUser } from '../middleware/auth';
import { getSupabase } from '../db/supabase';

const router = Router();
const localTicketsMap: Record<string, any[]> = {};

/**
 * GET /api/support/tickets — Get customer support tickets
 */
router.get('/tickets', requireUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const client = getSupabase();

    if (client) {
      const { data, error } = await client
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        res.json({ ok: true, tickets: data });
        return;
      }
    }

    res.json({ ok: true, tickets: localTicketsMap[userId] || [] });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * POST /api/support/tickets — Create a support ticket
 */
router.post('/tickets', requireUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { subject, category, message, order_id } = req.body;
    const client = getSupabase();

    if (!subject || !message) {
      res.status(400).json({ ok: false, error: 'Subject and message are required.' });
      return;
    }

    if (client) {
      const { data, error } = await client
        .from('support_tickets')
        .insert({
          user_id: userId,
          subject,
          category: category || 'General',
          message,
          order_id: order_id || null,
          status: 'Open',
        })
        .select()
        .single();

      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }

      res.status(201).json({ ok: true, ticket: data, message: 'Support ticket submitted.' });
      return;
    }

    if (!localTicketsMap[userId]) localTicketsMap[userId] = [];
    const newTicket = {
      id: `tkt_${Date.now()}`,
      user_id: userId,
      subject,
      category: category || 'General',
      message,
      order_id: order_id || null,
      status: 'Open',
      created_at: new Date().toISOString(),
    };
    localTicketsMap[userId].unshift(newTicket);
    res.status(201).json({ ok: true, ticket: newTicket, message: 'Support ticket submitted.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
