import { Router, Request, Response } from 'express';
import { requireUser } from '../middleware/auth';
import { getSupabase } from '../db/supabase';
import { PRODUCTS } from '../../src/data/products';

const router = Router();
const localWishlistMap: Record<string, number[]> = {};

/**
 * GET /api/wishlist — Get authenticated customer's wishlist items
 */
router.get('/', requireUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const client = getSupabase();

    if (client) {
      const { data, error } = await client
        .from('wishlist_items')
        .select('product_id')
        .eq('user_id', userId);

      if (!error && data) {
        const productIds = data.map((item) => item.product_id);
        res.json({ ok: true, productIds });
        return;
      }
    }

    res.json({ ok: true, productIds: localWishlistMap[userId] || [] });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * POST /api/wishlist — Add product to wishlist
 */
router.post('/', requireUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    const client = getSupabase();

    if (!productId) {
      res.status(400).json({ ok: false, error: 'Product ID is required.' });
      return;
    }

    const numericId = Number(productId);

    if (client) {
      const { error } = await client
        .from('wishlist_items')
        .upsert({ user_id: userId, product_id: numericId }, { onConflict: 'user_id,product_id' });

      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }

      res.status(201).json({ ok: true, productId: numericId, message: 'Added to wishlist.' });
      return;
    }

    if (!localWishlistMap[userId]) localWishlistMap[userId] = [];
    if (!localWishlistMap[userId].includes(numericId)) {
      localWishlistMap[userId].push(numericId);
    }
    res.status(201).json({ ok: true, productId: numericId, message: 'Added to wishlist.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * DELETE /api/wishlist/:productId — Remove product from wishlist
 */
router.delete('/:productId', requireUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const numericId = Number(req.params.productId);
    const client = getSupabase();

    if (client) {
      const { error } = await client
        .from('wishlist_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', numericId);

      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }

      res.json({ ok: true, productId: numericId, message: 'Removed from wishlist.' });
      return;
    }

    if (localWishlistMap[userId]) {
      localWishlistMap[userId] = localWishlistMap[userId].filter((id) => id !== numericId);
    }
    res.json({ ok: true, productId: numericId, message: 'Removed from wishlist.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
