import { Router, Request, Response } from 'express';
import { getSupabase } from '../db/supabase';

const router = Router();

/**
 * GET /api/coupons/active — Returns active coupons for customers
 */
router.get('/active', async (req: Request, res: Response): Promise<void> => {
  try {
    const client = getSupabase();

    if (client) {
      const now = new Date().toISOString();
      const { data, error } = await client
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        res.json({ ok: true, coupons: data });
        return;
      }
    }

    res.json({ ok: true, coupons: [] });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * POST /api/coupons/validate — Authoritative Smart Coupon Validation
 */
router.post('/validate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, subtotal, items, customerEmail } = req.body;

    if (!code || typeof code !== 'string') {
      res.status(400).json({ ok: false, error: 'Coupon code is required.' });
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    const cartSubtotal = Number(subtotal || 0);

    const client = getSupabase();
    let coupon: any = null;

    if (client) {
      try {
        const { data, error } = await client
          .from('coupons')
          .select('*')
          .eq('code', cleanCode)
          .limit(1);

        if (error) {
          const { data: ilikeData } = await client
            .from('coupons')
            .select('*')
            .ilike('code', cleanCode)
            .limit(1);
          if (ilikeData && ilikeData.length > 0) {
            coupon = ilikeData[0];
          }
        } else if (data && data.length > 0) {
          coupon = data[0];
        }
      } catch (err: any) {
        console.warn('[Coupons Validation] Error querying coupons table:', err.message);
      }
    }

    if (!coupon) {
      res.status(400).json({ ok: false, error: `Invalid coupon code "${cleanCode}".` });
      return;
    }

    if (coupon.is_active === false) {
      res.status(400).json({ ok: false, error: `Coupon code "${cleanCode}" is no longer active.` });
      return;
    }

    // Expiry Date check
    if (coupon.expires_at) {
      const exp = new Date(coupon.expires_at).getTime();
      if (exp < Date.now()) {
        res.status(400).json({ ok: false, error: `Coupon code "${cleanCode}" has expired.` });
        return;
      }
    }

    // Usage limit check
    if (coupon.usage_limit && coupon.used_count && coupon.used_count >= coupon.usage_limit) {
      res.status(400).json({ ok: false, error: `Coupon code "${cleanCode}" has reached maximum usage limit.` });
      return;
    }

    // Minimum Order Amount check
    const minAmount = Number(coupon.minimum_order_amount || 0);
    if (cartSubtotal < minAmount) {
      res.status(400).json({
        ok: false,
        error: `Coupon "${cleanCode}" requires a minimum order subtotal of ₹${minAmount}. (Current: ₹${cartSubtotal})`,
      });
      return;
    }

    // First Order Only check
    if (coupon.first_order_only && customerEmail && client) {
      try {
        const { data: orderData } = await client
          .from('orders')
          .select('id')
          .eq('customer_email', String(customerEmail).trim().toLowerCase())
          .limit(1);

        if (orderData && orderData.length > 0) {
          res.status(400).json({
            ok: false,
            error: `Coupon "${cleanCode}" is valid for first-time customers only.`,
          });
          return;
        }
      } catch (e) {
        console.warn('First order coupon check error:', e);
      }
    }

    // Category Specificity check
    if (coupon.applicable_category && coupon.applicable_category !== 'All' && Array.isArray(items)) {
      const categoryMatch = items.some((it) =>
        it.category && it.category.toLowerCase() === coupon.applicable_category.toLowerCase()
      );
      if (!categoryMatch) {
        res.status(400).json({
          ok: false,
          error: `Coupon "${cleanCode}" is valid only for items in the "${coupon.applicable_category}" category.`,
        });
        return;
      }
    }

    // Product Specificity check
    if (coupon.applicable_product_id && Array.isArray(items)) {
      const productMatch = items.some((it) => Number(it.product_id || it.id) === Number(coupon.applicable_product_id));
      if (!productMatch) {
        res.status(400).json({
          ok: false,
          error: `Coupon "${cleanCode}" is valid only for specific targeted products.`,
        });
        return;
      }
    }

    // Calculate Discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round((cartSubtotal * Number(coupon.discount_value)) / 100);
      if (coupon.maximum_discount_amount && discountAmount > Number(coupon.maximum_discount_amount)) {
        discountAmount = Number(coupon.maximum_discount_amount);
      }
    } else {
      discountAmount = Number(coupon.discount_value || 0);
    }

    discountAmount = Math.min(cartSubtotal, discountAmount);
    const netTotal = Math.max(0, cartSubtotal - discountAmount);

    res.json({
      ok: true,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        description: coupon.description || `${coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`} discount`,
      },
      discountAmount,
      netTotal,
      message: `Coupon "${coupon.code}" applied! You saved ₹${discountAmount}.`,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
