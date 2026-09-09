import { Router, Request, Response } from 'express';
import { requireUser, requireAdmin } from '../middleware/auth';
import { getSupabase } from '../db/supabase';
import { auditLog } from './admin';
import { sendOrderNotification } from '../utils/smsWhatsapp';

const router = Router();

const VALID_ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

/**
 * Helper to attach order_items to orders array
 */
async function attachOrderItems(supabase: any, orders: any[]): Promise<any[]> {
  if (!orders || orders.length === 0) return [];
  const orderIds = orders.map((o) => o.id);

  const { data: items, error } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds);

  if (error || !items) {
    return orders.map((o) => ({ ...o, items: [] }));
  }

  const itemsByOrderId: Record<string, any[]> = {};
  items.forEach((item) => {
    if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = [];
    itemsByOrderId[item.order_id].push({
      id: item.id,
      product_id: item.product_id,
      product_name: item.product_name,
      selected_weight: item.selected_weight,
      unit_price: Number(item.unit_price),
      quantity: Number(item.quantity),
      total_price: Number(item.total_price),
    });
  });

  return orders.map((o) => ({
    ...o,
    items: itemsByOrderId[o.id] || [],
  }));
}

/**
 * GET /api/orders — Returns orders for the authenticated customer
 * Uses customer_email as primary match (always stored), auth_id as secondary.
 */
router.get('/', requireUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: 'Supabase database not configured on server.' });
      return;
    }

    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!userId && !userEmail) {
      res.status(400).json({ ok: false, error: 'User ID or email missing in request.' });
      return;
    }

    // PRIMARY: Query by customer_email — always reliable since email is always stored in orders
    let allOrders: any[] = [];
    const seenIds = new Set<string>();

    if (userEmail) {
      const { data: emailOrders, error: emailErr } = await client
        .from('orders')
        .select('*')
        .eq('customer_email', userEmail)
        .order('created_at', { ascending: false });

      if (!emailErr && emailOrders) {
        emailOrders.forEach((o) => {
          if (!seenIds.has(o.id)) {
            seenIds.add(o.id);
            allOrders.push(o);
          }
        });
      } else if (emailErr) {
        console.warn('[Orders] email query error:', emailErr.message);
      }
    }

    // SECONDARY: Also try auth_id lookup (may not exist on older DBs — handle gracefully)
    if (userId) {
      try {
        const { data: authOrders, error: authErr } = await client
          .from('orders')
          .select('*')
          .eq('auth_id', userId)
          .order('created_at', { ascending: false });

        if (!authErr && authOrders) {
          authOrders.forEach((o) => {
            if (!seenIds.has(o.id)) {
              seenIds.add(o.id);
              allOrders.push(o);
            }
          });
        }
      } catch (authLookupErr: any) {
        // auth_id column may not exist yet — non-fatal, skip
        console.warn('[Orders] auth_id lookup skipped:', authLookupErr?.message);
      }
    }

    // Sort merged results newest-first
    allOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const ordersWithItems = await attachOrderItems(client, allOrders);
    res.json({ ok: true, orders: ordersWithItems });
  } catch (err: any) {
    console.error('GET /api/orders error:', err);
    res.status(500).json({ ok: false, error: err.message || 'Internal server error' });
  }
});


/**
 * GET /api/orders/admin — Returns all orders for Admin Portal
 */
router.get('/admin', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: 'Supabase not configured on server' });
      return;
    }

    const { status, search } = req.query;

    let query = client.from('orders').select('*').order('created_at', { ascending: false });

    if (status && String(status) !== 'All') {
      query = query.eq('order_status', String(status));
    }

    if (search) {
      const q = String(search);
      query = query.or(`id.ilike.%${q}%,customer_name.ilike.%${q}%,customer_email.ilike.%${q}%,customer_phone.ilike.%${q}%`);
    }

    const { data: orders, error } = await query;
    if (error) {
      res.status(500).json({ ok: false, error: error.message });
      return;
    }

    const ordersWithItems = await attachOrderItems(client, orders || []);
    res.json({ ok: true, orders: ordersWithItems });
  } catch (err: any) {
    console.error('GET /api/orders/admin error:', err);
    res.status(500).json({ ok: false, error: err.message || 'Internal server error' });
  }
});

/**
 * GET /api/orders/admin/stats — Returns dashboard overview metrics
 */
router.get('/admin/stats', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: 'Supabase not configured' });
      return;
    }

    const { data: orders, error } = await client.from('orders').select('id, total_amount, payment_status, order_status');
    if (error || !orders) {
      res.status(500).json({ ok: false, error: error?.message || 'Error fetching order stats' });
      return;
    }

    const totalOrders = orders.length;
    let totalRevenue = 0;
    const statusCounts: Record<string, number> = {
      Pending: 0,
      Confirmed: 0,
      Processing: 0,
      Packed: 0,
      Shipped: 0,
      'Out for Delivery': 0,
      Delivered: 0,
      Cancelled: 0,
    };

    orders.forEach((o) => {
      if (o.payment_status === 'Paid') {
        totalRevenue += Number(o.total_amount || 0);
      }
      if (statusCounts[o.order_status] !== undefined) {
        statusCounts[o.order_status] += 1;
      }
    });

    res.json({
      ok: true,
      stats: {
        totalOrders,
        totalRevenue,
        ...statusCounts,
      },
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * GET /api/orders/admin/:id — Get details of a single order
 */
router.get('/admin/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: 'Supabase not configured' });
      return;
    }

    const { id } = req.params;
    const { data: order, error } = await client.from('orders').select('*').eq('id', id).single();
    if (error || !order) {
      res.status(404).json({ ok: false, error: 'Order not found' });
      return;
    }

    const [orderWithItems] = await attachOrderItems(client, [order]);
    res.json({ ok: true, order: orderWithItems });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * PATCH /api/orders/admin/:id/status — Admin updates order status
 */
router.patch('/admin/:id/status', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: 'Supabase not configured' });
      return;
    }

    const { id } = req.params;
    const { order_status, payment_status } = req.body;

    if (order_status && !VALID_ORDER_STATUSES.includes(order_status)) {
      res.status(400).json({ ok: false, error: `Invalid order status. Allowed: ${VALID_ORDER_STATUSES.join(', ')}` });
      return;
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (order_status) updates.order_status = order_status;
    if (payment_status) updates.payment_status = payment_status;

    const { data, error } = await client
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      res.status(400).json({ ok: false, error: error?.message || 'Failed to update order status' });
      return;
    }

    await auditLog(req.user.email, 'order.status_change', 'order', id, { order_status, payment_status });

    // Log status history for customer tracking
    try {
      await client.from('order_status_history').insert({
        order_id: id,
        status: order_status || data.order_status,
        changed_by: `Admin (${req.user.email})`,
        notes: `Status updated to ${order_status}`,
      });
    } catch {}

    // Dispatch SMS, WhatsApp, and in-app notifications
    sendOrderNotification({
      phone: data.customer_phone,
      email: data.customer_email,
      orderId: id,
      type: 'STATUS_CHANGE',
      status: order_status || data.order_status,
      totalAmount: data.total_amount,
      customerName: data.customer_name,
    }).catch((err) => console.warn('[Notification Error]', err));

    res.json({ ok: true, order: data, message: `Order #${id} status updated to "${order_status}".` });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * POST /api/orders/:id/cancel — Customer cancels an order
 */
router.post('/:id/cancel', requireUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: 'Database client not configured' });
      return;
    }

    const { id } = req.params;
    const userId = req.user.id;

    // Verify order exists and belongs to user
    const { data: order, error: fetchErr } = await client
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !order) {
      res.status(404).json({ ok: false, error: 'Order not found' });
      return;
    }

    // Security check: order must belong to caller
    if (order.customer_id !== userId && order.auth_id !== userId) {
      res.status(403).json({ ok: false, error: 'Unauthorized to cancel this order.' });
      return;
    }

    // Business rule check: only Pending or Confirmed orders can be cancelled
    const cancellableStatuses = ['Pending', 'Confirmed'];
    if (!cancellableStatuses.includes(order.order_status)) {
      res.status(400).json({
        ok: false,
        error: `Cannot cancel order in "${order.order_status}" status. Please contact support.`,
      });
      return;
    }

    const { data: updated, error: updateErr } = await client
      .from('orders')
      .update({
        order_status: 'Cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      res.status(500).json({ ok: false, error: updateErr.message });
      return;
    }

    // Log status history
    try {
      await client.from('order_status_history').insert({
        order_id: id,
        status: 'Cancelled',
        changed_by: `Customer (${req.user.email})`,
        notes: 'Order cancelled by customer',
      });
    } catch {}

    res.json({ ok: true, order: updated, message: `Order #${id} has been cancelled.` });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * POST /api/orders/:id/reorder — Buy Again: checks current availability & prices
 */
router.post('/:id/reorder', requireUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: 'Database client not configured' });
      return;
    }

    const { id } = req.params;
    const userId = req.user.id;

    // Fetch order items
    const { data: order, error: fetchErr } = await client
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !order) {
      res.status(404).json({ ok: false, error: 'Order not found' });
      return;
    }

    if (order.customer_id !== userId && order.auth_id !== userId) {
      res.status(403).json({ ok: false, error: 'Unauthorized.' });
      return;
    }

    const [orderWithItems] = await attachOrderItems(client, [order]);
    const items = orderWithItems.items || [];

    if (items.length === 0) {
      res.status(400).json({ ok: false, error: 'No items found in this order to reorder.' });
      return;
    }

    // Query current live products to verify stock & current prices
    const productIds = items.map((it: any) => it.product_id);
    const { data: dbProducts } = await client
      .from('products')
      .select('*')
      .in('id', productIds);

    const dbProductsMap: Record<number, any> = {};
    (dbProducts || []).forEach((p: any) => (dbProductsMap[p.id] = p));

    const reorderItems: any[] = [];
    const unavailableNames: string[] = [];

    items.forEach((item: any) => {
      const liveP = dbProductsMap[item.product_id];
      if (!liveP || !liveP.is_active || liveP.is_in_stock === false) {
        unavailableNames.push(item.product_name);
      } else {
        reorderItems.push({
          product: {
            id: liveP.id,
            name: liveP.name,
            category: liveP.category,
            description: liveP.description,
            image: liveP.image,
            price: Number(liveP.price),
            originalPrice: Number(liveP.original_price),
            rating: Number(liveP.rating),
            reviews: liveP.reviews_count,
            availableWeights: liveP.available_weights || ['Standard Pack'],
            defaultWeight: liveP.default_weight || 'Standard Pack',
            badge: liveP.badge,
            farmOrigin: liveP.farm_origin,
            stock: liveP.is_in_stock,
          },
          weight: item.selected_weight,
          quantity: item.quantity,
          currentPrice: Number(liveP.price),
        });
      }
    });

    res.json({
      ok: true,
      items: reorderItems,
      unavailable: unavailableNames,
      message: unavailableNames.length > 0
        ? `Some products (${unavailableNames.join(', ')}) are currently unavailable and were omitted.`
        : 'All items are available for reorder.',
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * GET /api/orders/track/:query — Public Order Tracking by Order ID, Phone, or Email
 * Returns real live status, items, shipping details, and status history
 */
router.get('/track/:query', async (req: Request, res: Response): Promise<void> => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: 'Database client not configured' });
      return;
    }

    const { query } = req.params;
    const cleanQuery = query.replace('#', '').trim();

    if (!cleanQuery) {
      res.status(400).json({ ok: false, error: 'Order reference or phone required' });
      return;
    }

    // Match exact ID or partial ID, phone, or email
    const { data: orders, error } = await client
      .from('orders')
      .select('*')
      .or(`id.ilike.%${cleanQuery}%,customer_phone.ilike.%${cleanQuery}%,customer_email.ilike.%${cleanQuery}%`)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error || !orders || orders.length === 0) {
      res.status(404).json({ ok: false, error: `No active order found matching "${cleanQuery}".` });
      return;
    }

    const primaryOrder = orders[0];
    const [orderWithItems] = await attachOrderItems(client, [primaryOrder]);

    const { data: history } = await client
      .from('order_status_history')
      .select('*')
      .eq('order_id', primaryOrder.id)
      .order('created_at', { ascending: true });

    res.json({
      ok: true,
      order: orderWithItems,
      currentStatus: primaryOrder.order_status,
      paymentStatus: primaryOrder.payment_status,
      createdAt: primaryOrder.created_at,
      updatedAt: primaryOrder.updated_at,
      history: history || [],
      matchingOrders: orders.map((o) => ({
        id: o.id,
        created_at: o.created_at,
        total_amount: o.total_amount,
        status: o.order_status,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * GET /api/orders/:id/tracking — Timeline status history for customer tracking
 */
router.get('/:id/tracking', requireUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: 'Database client not configured' });
      return;
    }

    const { id } = req.params;
    const { data: order, error } = await client
      .from('orders')
      .select('id, order_status, payment_status, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !order) {
      res.status(404).json({ ok: false, error: 'Order not found' });
      return;
    }

    const { data: history } = await client
      .from('order_status_history')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: true });

    res.json({
      ok: true,
      currentStatus: order.order_status,
      paymentStatus: order.payment_status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      history: history || [],
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * DELETE /api/orders/admin/clear-all — Clear all test orders (Admin only)
 */
router.delete('/admin/clear-all', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: 'Database client not configured' });
      return;
    }

    await client.from('order_items').delete().gte('id', 0);
    const { error } = await client.from('orders').delete().neq('id', 'NO_MATCH');

    if (error) {
      res.status(500).json({ ok: false, error: error.message });
      return;
    }

    await auditLog(req.user.email, 'orders.clear_all', 'orders', null, {});
    res.json({ ok: true, message: 'All test orders have been cleared successfully.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * DELETE /api/orders/admin/:id — Delete a single order (Admin only)
 */
router.delete('/admin/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: 'Database client not configured' });
      return;
    }

    const { id } = req.params;
    await client.from('order_items').delete().eq('order_id', id);
    const { error } = await client.from('orders').delete().eq('id', id);

    if (error) {
      res.status(500).json({ ok: false, error: error.message });
      return;
    }

    await auditLog(req.user.email, 'order.delete', 'order', id, {});
    res.json({ ok: true, message: `Order #${id} deleted successfully.` });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;


