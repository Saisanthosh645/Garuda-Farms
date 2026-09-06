import { Router, Request, Response } from 'express';
import { requireUser } from '../middleware/auth';
import { getSupabase } from '../db/supabase';

const router = Router();

/**
 * GET /api/account/profile — Get authenticated user's profile
 */
router.get('/profile', requireUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const client = getSupabase();

    if (!client) {
      res.json({
        ok: true,
        profile: {
          id: userId,
          full_name: req.user.user_metadata?.fullName || req.user.email.split('@')[0],
          email: req.user.email,
          phone: req.user.phone || '',
          avatar_url: req.user.user_metadata?.avatar_url || '',
        },
      });
      return;
    }

    const { data: profile } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profile) {
      res.json({ ok: true, profile });
    } else {
      res.json({
        ok: true,
        profile: {
          id: userId,
          full_name: req.user.user_metadata?.fullName || req.user.email.split('@')[0],
          email: req.user.email,
          phone: req.user.phone || '',
          avatar_url: '',
        },
      });
    }
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * PATCH /api/account/profile — Update user profile details
 */
router.patch('/profile', requireUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { full_name, phone, avatar_url, dob, gender } = req.body;
    const client = getSupabase();

    if (client) {
      const updates: any = {
        updated_at: new Date().toISOString(),
      };
      if (full_name !== undefined) updates.full_name = full_name;
      if (phone !== undefined) updates.phone = phone;
      if (avatar_url !== undefined) updates.avatar_url = avatar_url;
      if (dob !== undefined) updates.dob = dob;
      if (gender !== undefined) updates.gender = gender;

      // Upsert into profiles table
      const { data, error } = await client
        .from('profiles')
        .upsert({ id: userId, email: req.user.email, ...updates })
        .select()
        .single();

      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }

      res.json({ ok: true, profile: data, message: 'Profile updated successfully.' });
      return;
    }

    res.json({
      ok: true,
      profile: { id: userId, full_name, phone, email: req.user.email, avatar_url },
      message: 'Profile updated locally.',
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
