import { Router, Request, Response } from 'express';
import { requireAdmin } from '../middleware/auth';
import { getSupabase } from '../db/supabase';
import { PINCODE_DISTANCE_MAP } from '../utils/distance';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Helper: Log admin action to audit_logs
async function auditLog(
  adminEmail: string,
  action: string,
  entityType: string,
  entityId: string | null,
  details: any
) {
  try {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from('audit_logs').insert({
      admin_email: adminEmail,
      action,
      entity_type: entityType,
      entity_id: entityId ? String(entityId) : null,
      details,
    });
  } catch (e) {
    // Non-fatal — audit log failure should not block operation
    console.warn('[Audit] Failed to write audit log:', e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/stats — Full dashboard statistics
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stats', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const [ordersRes, productsRes, categoriesRes, customersRes] = await Promise.all([
      supabase.from('orders').select('id, total_amount, payment_status, order_status, created_at'),
      supabase.from('products').select('id, is_active, is_in_stock, is_featured'),
      supabase.from('categories').select('id, is_active'),
      supabase.from('profiles').select('id, created_at'),
    ]);

    const orders = ordersRes.data || [];
    const products = productsRes.data || [];
    const categories = categoriesRes.data || [];
    const customers = customersRes.data || [];

    const todayOrders = orders.filter((o) => o.created_at >= todayISO);
    const paidOrders = orders.filter((o) => o.payment_status === 'Paid');

    const statusCounts: Record<string, number> = {
      Pending: 0, Confirmed: 0, Processing: 0, Packed: 0,
      Shipped: 0, 'Out for Delivery': 0, Delivered: 0, Cancelled: 0,
    };
    orders.forEach((o) => {
      if (statusCounts[o.order_status] !== undefined) statusCounts[o.order_status]++;
    });

    res.json({
      ok: true,
      stats: {
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        totalRevenue: paidOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0),
        todayRevenue: todayOrders
          .filter((o) => o.payment_status === 'Paid')
          .reduce((s, o) => s + Number(o.total_amount || 0), 0),
        totalProducts: products.length,
        activeProducts: products.filter((p) => p.is_active && p.is_in_stock).length,
        unavailableProducts: products.filter((p) => !p.is_in_stock).length,
        featuredProducts: products.filter((p) => p.is_featured).length,
        totalCategories: categories.length,
        activeCategories: categories.filter((c) => c.is_active).length,
        totalCustomers: customers.length,
        ...statusCounts,
      },
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/customers — Customer list with order counts
// ─────────────────────────────────────────────────────────────────────────────
router.get('/customers', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

  try {
    const { search, page = '1', limit = '50' } = req.query;
    const pageNum = Math.max(1, Number(page));
    const pageSize = Math.min(100, Number(limit));
    const from = (pageNum - 1) * pageSize;

    // Get profiles (Supabase auth users with profiles)
    let profileQuery = supabase
      .from('profiles')
      .select('id, full_name, email, phone, created_at')
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1);

    if (search) {
      profileQuery = profileQuery.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    const { data: profiles, error } = await profileQuery;
    if (error) { res.status(500).json({ ok: false, error: error.message }); return; }

    // For each profile, get order stats
    const profileIds = (profiles || []).map((p) => p.id);
    const { data: orders } = profileIds.length > 0
      ? await supabase
          .from('orders')
          .select('auth_id, customer_id, total_amount, payment_status')
          .or(profileIds.map((id) => `auth_id.eq.${id},customer_id.eq.${id}`).join(','))
      : { data: [] };

    const ordersByCustomer: Record<string, { count: number; total: number }> = {};
    (orders || []).forEach((o) => {
      const cid = String(o.auth_id || o.customer_id || '');
      if (!ordersByCustomer[cid]) ordersByCustomer[cid] = { count: 0, total: 0 };
      ordersByCustomer[cid].count++;
      if (o.payment_status === 'Paid') {
        ordersByCustomer[cid].total += Number(o.total_amount || 0);
      }
    });

    const customers = (profiles || []).map((p) => ({
      id: p.id,
      name: p.full_name,
      email: p.email,
      phone: p.phone || '-',
      registeredAt: p.created_at,
      orderCount: ordersByCustomer[p.id]?.count || 0,
      totalSpend: ordersByCustomer[p.id]?.total || 0,
    }));

    res.json({ ok: true, customers });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// COUPONS CRUD
// ─────────────────────────────────────────────────────────────────────────────
router.get('/coupons', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { res.status(500).json({ ok: false, error: error.message }); return; }
    res.json({ ok: true, coupons: data || [] });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post('/coupons', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

  try {
    const { code, discount_type, discount_value, minimum_order_amount,
            maximum_discount_amount, usage_limit, expires_at, is_active,
            first_order_only, applicable_category, applicable_product_id, per_customer_limit } = req.body;

    if (!code || !discount_type || discount_value === undefined) {
      res.status(400).json({ ok: false, error: 'code, discount_type, and discount_value are required.' });
      return;
    }

    const { data, error } = await supabase.from('coupons').insert({
      code: code.toUpperCase().trim(),
      discount_type,
      discount_value: Number(discount_value),
      minimum_order_amount: Number(minimum_order_amount || 0),
      maximum_discount_amount: maximum_discount_amount ? Number(maximum_discount_amount) : null,
      usage_limit: usage_limit ? Number(usage_limit) : null,
      expires_at: expires_at || null,
      is_active: is_active !== false,
      first_order_only: Boolean(first_order_only),
      applicable_category: applicable_category || 'All',
      applicable_product_id: applicable_product_id ? Number(applicable_product_id) : null,
      per_customer_limit: Number(per_customer_limit || 1),
    }).select().single();

    if (error) { res.status(400).json({ ok: false, error: error.message }); return; }

    await auditLog(req.user.email, 'coupon.create', 'coupon', data.id, { code: data.code });
    res.status(201).json({ ok: true, coupon: data, message: 'Coupon created successfully.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.put('/coupons/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

  try {
    const { id } = req.params;
    const updates: any = {};
    const allowedFields = ['code', 'discount_type', 'discount_value', 'minimum_order_amount',
                           'maximum_discount_amount', 'usage_limit', 'expires_at', 'is_active',
                           'first_order_only', 'applicable_category', 'applicable_product_id', 'per_customer_limit'];
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    if (updates.code) updates.code = updates.code.toUpperCase().trim();

    const { data, error } = await supabase.from('coupons').update(updates).eq('id', id).select().single();
    if (error) { res.status(400).json({ ok: false, error: error.message }); return; }

    await auditLog(req.user.email, 'coupon.update', 'coupon', id, updates);
    res.json({ ok: true, coupon: data, message: 'Coupon updated.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.delete('/coupons/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

  try {
    const { id } = req.params;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) { res.status(400).json({ ok: false, error: error.message }); return; }

    await auditLog(req.user.email, 'coupon.delete', 'coupon', id, {});
    res.json({ ok: true, message: 'Coupon deleted.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Admin Dynamic Offers & Section Management
// ─────────────────────────────────────────────────────────────────────────────
router.put('/products/:id/dynamic-offers', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

  try {
    const id = Number(req.params.id);
    const { is_todays_deal, deal_price, is_fresh_arrival, is_best_seller, is_special_offer } = req.body;

    const updates: any = {};
    if (is_todays_deal !== undefined) updates.is_todays_deal = Boolean(is_todays_deal);
    if (deal_price !== undefined) updates.deal_price = deal_price ? Number(deal_price) : null;
    if (is_fresh_arrival !== undefined) updates.is_fresh_arrival = Boolean(is_fresh_arrival);
    if (is_best_seller !== undefined) updates.is_best_seller = Boolean(is_best_seller);
    if (is_special_offer !== undefined) updates.is_special_offer = Boolean(is_special_offer);

    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
    if (error) { res.status(400).json({ ok: false, error: error.message }); return; }

    await auditLog(req.user.email, 'product.dynamic_offers', 'product', String(id), updates);
    res.json({ ok: true, product: data, message: 'Dynamic offers updated for product.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Admin Product Reviews Moderation Desk
// ─────────────────────────────────────────────────────────────────────────────
router.get('/reviews', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

  try {
    const statusFilter = req.query.status ? String(req.query.status) : 'All';
    let query = supabase.from('product_reviews').select('*, products(name)').order('created_at', { ascending: false });

    if (statusFilter !== 'All') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) { res.status(500).json({ ok: false, error: error.message }); return; }

    res.json({ ok: true, reviews: data || [] });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.put('/reviews/:id/status', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400).json({ ok: false, error: 'Status must be pending, approved, or rejected.' });
      return;
    }

    const { data, error } = await supabase
      .from('product_reviews')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) { res.status(400).json({ ok: false, error: error.message }); return; }

    await auditLog(req.user.email, 'review.moderate', 'review', id, { status });
    res.json({ ok: true, review: data, message: `Review status set to ${status}.` });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.delete('/reviews/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

  try {
    const { id } = req.params;
    const { error } = await supabase.from('product_reviews').delete().eq('id', id);
    if (error) { res.status(400).json({ ok: false, error: error.message }); return; }

    await auditLog(req.user.email, 'review.delete', 'review', id, {});
    res.json({ ok: true, message: 'Review deleted by admin.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// STORE SETTINGS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/store-settings', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

  try {
    const { data, error } = await supabase.from('store_settings').select('key, value');
    if (error) { res.status(500).json({ ok: false, error: error.message }); return; }

    // Convert array of {key, value} to a flat object
    const settings: Record<string, any> = {};
    (data || []).forEach((row) => { settings[row.key] = row.value; });
    res.json({ ok: true, settings });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.put('/store-settings', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

  try {
    const updates = req.body as Record<string, any>;
    if (!updates || typeof updates !== 'object') {
      res.status(400).json({ ok: false, error: 'Request body must be an object of key/value pairs.' });
      return;
    }

    const rows = Object.entries(updates).map(([key, value]) => ({
      key,
      value: typeof value === 'string' ? JSON.parse(JSON.stringify(value)) : value,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('store_settings').upsert(rows, { onConflict: 'key' });
    if (error) { res.status(400).json({ ok: false, error: error.message }); return; }

    await auditLog(req.user.email, 'store_settings.update', 'store_settings', null, { keys: Object.keys(updates) });
    res.json({ ok: true, message: 'Store settings updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE UPLOAD — Upload to Supabase Storage, returns public URL
// ─────────────────────────────────────────────────────────────────────────────
router.post('/upload-image', requireAdmin, upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

  try {
    if (!req.file) {
      res.status(400).json({ ok: false, error: 'No image file provided.' });
      return;
    }

    const file = req.file;
    const ext = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bucketName = 'product-images';

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      res.status(400).json({ ok: false, error: `Storage upload failed: ${error.message}. Make sure the 'product-images' bucket exists in Supabase Storage.` });
      return;
    }

    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;

    await auditLog(req.user.email, 'image.upload', 'storage', fileName, { url: publicUrl });
    res.json({ ok: true, url: publicUrl, message: 'Image uploaded successfully.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT LOGS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/audit-logs', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) { res.status(500).json({ ok: false, error: error.message }); return; }
    res.json({ ok: true, logs: data || [] });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Admin product delete (soft-archive via is_active = false)
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/products/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

  try {
    const id = Number(req.params.id);
    // Soft-archive: set is_active = false so historical order_items are preserved
    const { data, error } = await supabase
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('name')
      .single();

    if (error) { res.status(400).json({ ok: false, error: error.message }); return; }

    await auditLog(req.user.email, 'product.archive', 'product', String(id), { name: data?.name });
    res.json({ ok: true, message: `Product archived (hidden from storefront). Historical orders preserved.` });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Admin me endpoint — returns admin identity
// ─────────────────────────────────────────────────────────────────────────────
router.get('/me', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  res.json({
    ok: true,
    admin: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.fullName || user.user_metadata?.full_name || 'Garuda Admin',
      role: 'admin',
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Admin Delivery Management Endpoints
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/delivery/settings
router.get('/delivery/settings', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('key, value')
      .in('key', ['delivery_rate_per_km', 'free_delivery_threshold', 'delivery_origin_address', 'delivery_origin_pincode']);

    if (error) { res.status(400).json({ ok: false, error: error.message }); return; }

    const settings: Record<string, any> = {
      ratePerKm: 10,
      freeThreshold: 1000,
      originAddress: 'Garuda Sanctuary, Mudimyala, Chevella (501503)',
      originPincode: '501503',
    };

    if (data && Array.isArray(data)) {
      data.forEach((row) => {
        if (row.key === 'delivery_rate_per_km') {
          const val = typeof row.value === 'number' ? row.value : parseFloat(row.value);
          if (!isNaN(val)) settings.ratePerKm = val;
        } else if (row.key === 'free_delivery_threshold') {
          const val = typeof row.value === 'number' ? row.value : parseFloat(row.value);
          if (!isNaN(val)) settings.freeThreshold = val;
        } else if (row.key === 'delivery_origin_address') {
          settings.originAddress = typeof row.value === 'string' ? row.value.replace(/^"|"$/g, '') : row.value;
        } else if (row.key === 'delivery_origin_pincode') {
          settings.originPincode = typeof row.value === 'string' ? row.value.replace(/^"|"$/g, '') : row.value;
        }
      });
    }

    res.json({ ok: true, settings });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT /api/admin/delivery/settings
router.put('/delivery/settings', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

  try {
    const { ratePerKm, freeThreshold, originAddress, originPincode } = req.body || {};

    const updates = [
      { key: 'delivery_rate_per_km', value: JSON.stringify(Number(ratePerKm) || 10) },
      { key: 'free_delivery_threshold', value: JSON.stringify(Number(freeThreshold) || 0) },
      { key: 'delivery_origin_address', value: JSON.stringify(String(originAddress || 'Garuda Sanctuary, Mudimyala, Chevella (501503)')) },
      { key: 'delivery_origin_pincode', value: JSON.stringify(String(originPincode || '501503')) },
    ];

    for (const item of updates) {
      await supabase.from('store_settings').upsert({ key: item.key, value: item.value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    }

    await auditLog(req.user.email, 'delivery.update_settings', 'settings', 'delivery', { ratePerKm, freeThreshold, originAddress, originPincode });
    res.json({ ok: true, message: 'Delivery settings updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/admin/delivery/pincodes — All pincodes (enabled & disabled)
router.get('/delivery/pincodes', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('serviceable_pincodes')
        .select('*')
        .order('pincode', { ascending: true });

      if (!error && data && data.length > 0) {
        res.json({ ok: true, pincodes: data });
        return;
      }
    } catch (err: any) {
      console.warn('[Admin Delivery Pincodes DB warning]:', err);
    }
  }

  // Graceful fallback to static 45 PIN codes list if table not yet created in Supabase
  const fallbackList = Object.entries(PINCODE_DISTANCE_MAP).map(([pin, info], index) => ({
    id: `pin-${pin}`,
    pincode: pin,
    area_name: info.name,
    distance_km: info.distanceKm,
    is_enabled: true,
  }));

  res.json({ ok: true, pincodes: fallbackList, isFallback: true });
});

// POST /api/admin/delivery/pincodes — Add new PIN code
router.post('/delivery/pincodes', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

  try {
    const { pincode, area_name, distance_km, is_enabled = true } = req.body || {};

    const cleanPin = String(pincode || '').trim().replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6) {
      res.status(400).json({ ok: false, error: 'Valid 6-digit PIN code is required.' });
      return;
    }

    if (!area_name) {
      res.status(400).json({ ok: false, error: 'Area name is required.' });
      return;
    }

    const dist = Math.max(0.1, Number(distance_km) || 1);

    const { data, error } = await supabase
      .from('serviceable_pincodes')
      .upsert({
        pincode: cleanPin,
        area_name: String(area_name).trim(),
        distance_km: dist,
        is_enabled: Boolean(is_enabled),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'pincode' })
      .select()
      .single();

    if (error) { res.status(400).json({ ok: false, error: error.message }); return; }

    await auditLog(req.user.email, 'delivery.add_pincode', 'pincode', cleanPin, { area_name, distance_km: dist, is_enabled });
    res.json({ ok: true, pincode: data, message: `PIN code ${cleanPin} saved successfully.` });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT /api/admin/delivery/pincodes/:id — Update existing PIN code
router.put('/delivery/pincodes/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

  try {
    const id = req.params.id;
    const { pincode, area_name, distance_km, is_enabled } = req.body || {};

    const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() };
    if (pincode) updatePayload.pincode = String(pincode).trim().replace(/\D/g, '');
    if (area_name !== undefined) updatePayload.area_name = String(area_name).trim();
    if (distance_km !== undefined) updatePayload.distance_km = Math.max(0.1, Number(distance_km));
    if (is_enabled !== undefined) updatePayload.is_enabled = Boolean(is_enabled);

    const { data, error } = await supabase
      .from('serviceable_pincodes')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) { res.status(400).json({ ok: false, error: error.message }); return; }

    await auditLog(req.user.email, 'delivery.update_pincode', 'pincode', String(id), updatePayload);
    res.json({ ok: true, pincode: data, message: 'PIN code updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/admin/delivery/pincodes/:id — Delete PIN code
router.delete('/delivery/pincodes/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

  try {
    const id = req.params.id;

    const { data: existing } = await supabase
      .from('serviceable_pincodes')
      .select('pincode, area_name')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('serviceable_pincodes')
      .delete()
      .eq('id', id);

    if (error) { res.status(400).json({ ok: false, error: error.message }); return; }

    await auditLog(req.user.email, 'delivery.delete_pincode', 'pincode', String(id), { pincode: existing?.pincode });
    res.json({ ok: true, message: `PIN code ${existing?.pincode || id} deleted successfully.` });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN COUPONS MANAGEMENT ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/coupons — List all coupons
router.get('/coupons', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase database not connected' }); return; }

  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) { res.status(400).json({ ok: false, error: error.message }); return; }
    res.json({ ok: true, coupons: data || [] });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/admin/coupons — Create new coupon
router.post('/coupons', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase database not connected' }); return; }

  try {
    const body = req.body || {};
    if (!body.code || !body.discount_value) {
      res.status(400).json({ ok: false, error: 'Coupon code and discount value are required.' });
      return;
    }

    const cleanCode = String(body.code).trim().toUpperCase();
    const payload = {
      code: cleanCode,
      discount_type: body.discount_type || 'percentage',
      discount_value: Number(body.discount_value),
      minimum_order_amount: Number(body.minimum_order_amount || 0),
      maximum_discount_amount: body.maximum_discount_amount ? Number(body.maximum_discount_amount) : null,
      usage_limit: body.usage_limit ? Number(body.usage_limit) : null,
      expires_at: body.expires_at ? new Date(body.expires_at).toISOString() : null,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      description: body.description || null,
      first_order_only: Boolean(body.first_order_only),
      applicable_category: body.applicable_category || null,
      applicable_product_id: body.applicable_product_id ? Number(body.applicable_product_id) : null,
    };

    const { data, error } = await supabase
      .from('coupons')
      .insert(payload)
      .select()
      .single();

    if (error) { res.status(400).json({ ok: false, error: error.message }); return; }

    await auditLog(req.user.email, 'coupon.create', 'coupon', String(data.id), { code: cleanCode });
    res.json({ ok: true, coupon: data, message: `Coupon "${cleanCode}" created successfully.` });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT /api/admin/coupons/:id — Update coupon
router.put('/coupons/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase database not connected' }); return; }

  try {
    const id = req.params.id;
    const body = req.body || {};
    const updatePayload: Record<string, any> = {};

    if (body.code !== undefined) updatePayload.code = String(body.code).trim().toUpperCase();
    if (body.discount_type !== undefined) updatePayload.discount_type = body.discount_type;
    if (body.discount_value !== undefined) updatePayload.discount_value = Number(body.discount_value);
    if (body.minimum_order_amount !== undefined) updatePayload.minimum_order_amount = Number(body.minimum_order_amount);
    if (body.maximum_discount_amount !== undefined) updatePayload.maximum_discount_amount = body.maximum_discount_amount ? Number(body.maximum_discount_amount) : null;
    if (body.usage_limit !== undefined) updatePayload.usage_limit = body.usage_limit ? Number(body.usage_limit) : null;
    if (body.expires_at !== undefined) updatePayload.expires_at = body.expires_at ? new Date(body.expires_at).toISOString() : null;
    if (body.is_active !== undefined) updatePayload.is_active = Boolean(body.is_active);
    if (body.description !== undefined) updatePayload.description = body.description || null;
    if (body.first_order_only !== undefined) updatePayload.first_order_only = Boolean(body.first_order_only);
    if (body.applicable_category !== undefined) updatePayload.applicable_category = body.applicable_category || null;
    if (body.applicable_product_id !== undefined) updatePayload.applicable_product_id = body.applicable_product_id ? Number(body.applicable_product_id) : null;

    const { data, error } = await supabase
      .from('coupons')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) { res.status(400).json({ ok: false, error: error.message }); return; }

    await auditLog(req.user.email, 'coupon.update', 'coupon', String(id), updatePayload);
    res.json({ ok: true, coupon: data, message: 'Coupon updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/admin/coupons/:id — Delete coupon
router.delete('/coupons/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) { res.status(500).json({ ok: false, error: 'Supabase database not connected' }); return; }

  try {
    const id = req.params.id;

    const { data: existing } = await supabase
      .from('coupons')
      .select('code')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) { res.status(400).json({ ok: false, error: error.message }); return; }

    await auditLog(req.user.email, 'coupon.delete', 'coupon', String(id), { code: existing?.code });
    res.json({ ok: true, message: `Coupon "${existing?.code || id}" deleted successfully.` });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export { auditLog };
export default router;

