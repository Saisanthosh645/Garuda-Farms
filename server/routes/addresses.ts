import { Router, Request, Response } from 'express';
import { requireUser } from '../middleware/auth';
import { getSupabase } from '../db/supabase';

const router = Router();

// Local fallback in-memory address store when Supabase is not connected
const localAddressesMap: Record<string, any[]> = {};

/**
 * GET /api/addresses — Fetch authenticated customer's address book
 */
router.get('/', requireUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const client = getSupabase();

    if (client) {
      const { data, error } = await client
        .from('customer_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (!error && data) {
        res.json({ ok: true, addresses: data });
        return;
      }
    }

    res.json({ ok: true, addresses: localAddressesMap[userId] || [] });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * POST /api/addresses — Add a new address
 */
router.post('/', requireUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { full_name, phone, address_line, city, state, pincode, label, is_default } = req.body;
    const client = getSupabase();

    if (!full_name || !phone || !address_line || !city || !pincode) {
      res.status(400).json({ ok: false, error: 'Full name, phone, address line, city, and pincode are required.' });
      return;
    }

    if (client) {
      // If marking as default, unset previous default
      if (is_default) {
        await client
          .from('customer_addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data, error } = await client
        .from('customer_addresses')
        .insert({
          user_id: userId,
          full_name,
          phone,
          address_line,
          city,
          state: state || 'Telangana',
          pincode,
          label: label || 'Home',
          is_default: Boolean(is_default),
        })
        .select()
        .single();

      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }

      res.status(201).json({ ok: true, address: data, message: 'Address saved successfully.' });
      return;
    }

    // Local fallback
    if (!localAddressesMap[userId]) localAddressesMap[userId] = [];
    if (is_default) {
      localAddressesMap[userId].forEach((a) => (a.is_default = false));
    }
    const newAddr = {
      id: `addr_${Date.now()}`,
      user_id: userId,
      full_name,
      phone,
      address_line,
      city,
      state: state || 'Telangana',
      pincode,
      label: label || 'Home',
      is_default: Boolean(is_default || localAddressesMap[userId].length === 0),
      created_at: new Date().toISOString(),
    };
    localAddressesMap[userId].unshift(newAddr);
    res.status(201).json({ ok: true, address: newAddr, message: 'Address saved locally.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * PUT /api/addresses/:id — Edit an existing address
 */
router.put('/:id', requireUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { full_name, phone, address_line, city, state, pincode, label, is_default } = req.body;
    const client = getSupabase();

    if (client) {
      if (is_default) {
        await client
          .from('customer_addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const updates: any = { updated_at: new Date().toISOString() };
      if (full_name !== undefined) updates.full_name = full_name;
      if (phone !== undefined) updates.phone = phone;
      if (address_line !== undefined) updates.address_line = address_line;
      if (city !== undefined) updates.city = city;
      if (state !== undefined) updates.state = state;
      if (pincode !== undefined) updates.pincode = pincode;
      if (label !== undefined) updates.label = label;
      if (is_default !== undefined) updates.is_default = is_default;

      const { data, error } = await client
        .from('customer_addresses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }

      res.json({ ok: true, address: data, message: 'Address updated successfully.' });
      return;
    }

    // Local fallback
    const list = localAddressesMap[userId] || [];
    const idx = list.findIndex((a) => a.id === id);
    if (idx !== -1) {
      if (is_default) list.forEach((a) => (a.is_default = false));
      list[idx] = { ...list[idx], ...req.body, is_default: Boolean(is_default) };
      res.json({ ok: true, address: list[idx], message: 'Address updated.' });
    } else {
      res.status(404).json({ ok: false, error: 'Address not found.' });
    }
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * DELETE /api/addresses/:id — Delete an address
 */
router.delete('/:id', requireUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const client = getSupabase();

    if (client) {
      const { error } = await client
        .from('customer_addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }

      res.json({ ok: true, message: 'Address deleted.' });
      return;
    }

    if (localAddressesMap[userId]) {
      localAddressesMap[userId] = localAddressesMap[userId].filter((a) => a.id !== id);
    }
    res.json({ ok: true, message: 'Address deleted.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * PATCH /api/addresses/:id/default — Set address as default
 */
router.patch('/:id/default', requireUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const client = getSupabase();

    if (client) {
      await client
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('user_id', userId);

      const { data, error } = await client
        .from('customer_addresses')
        .update({ is_default: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }

      res.json({ ok: true, address: data, message: 'Default address updated.' });
      return;
    }

    const list = localAddressesMap[userId] || [];
    list.forEach((a) => (a.is_default = a.id === id));
    res.json({ ok: true, message: 'Default address set.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
