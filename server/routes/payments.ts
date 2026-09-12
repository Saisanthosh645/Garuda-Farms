import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { getSupabase } from '../db/supabase';
import { calculateServerDeliveryFee } from '../utils/distance';
import { syncOrderToGoogleSheets } from '../utils/googleSheets';
import { sendOrderNotification } from '../utils/smsWhatsapp';
import { notifyOwnerOnNewOrder } from '../utils/ownerAlerts';

const router = Router();

function getRazorpayClient(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

import { updateLocalStockQuantity, decrementLocalProductStock } from './products';

/**
 * Automatically decrements product stock quantity when orders are confirmed
 */
async function decrementProductStock(supabase: any, items: Array<{ product_id: any; quantity: number }>) {
  if (!items || items.length === 0) return;

  for (const item of items) {
    try {
      const pId = Number(item.product_id);
      const qtyPurchased = Math.max(1, Math.floor(Number(item.quantity) || 1));

      if (supabase) {
        const { data: prod } = await supabase
          .from('products')
          .select('id, stock_quantity, is_in_stock')
          .eq('id', pId)
          .maybeSingle();

        if (prod) {
          const currentQty = Number(prod.stock_quantity ?? 100);
          const newQty = Math.max(0, currentQty - qtyPurchased);
          const isInStock = newQty > 0;

          await supabase
            .from('products')
            .update({
              stock_quantity: newQty,
              is_in_stock: isInStock,
              updated_at: new Date().toISOString(),
            })
            .eq('id', pId);

          updateLocalStockQuantity(pId, newQty);
        }
      } else {
        decrementLocalProductStock(pId, qtyPurchased);
      }
    } catch (err: any) {
      console.warn(`[Stock Decrement Error] Failed for product #${item.product_id}:`, err?.message);
    }
  }
}

/**
 * Automatically save or update customer address in customer_addresses and mark as default
 */
async function autoSaveAddressAsDefault(
  supabase: any,
  userId: string | undefined | null,
  details: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    pincode: string;
  }
) {
  if (!supabase || !userId || !details.addressLine || !details.pincode) return;
  try {
    const cleanAddr = details.addressLine.trim();
    const cleanPin = details.pincode.trim();
    if (!cleanAddr || !cleanPin) return;

    const { data: existing } = await supabase
      .from('customer_addresses')
      .select('id')
      .eq('user_id', userId)
      .eq('address_line', cleanAddr)
      .eq('pincode', cleanPin)
      .maybeSingle();

    await supabase
      .from('customer_addresses')
      .update({ is_default: false })
      .eq('user_id', userId);

    if (existing && existing.id) {
      await supabase
        .from('customer_addresses')
        .update({
          full_name: details.fullName,
          phone: details.phone,
          city: details.city || 'Hyderabad',
          is_default: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('customer_addresses').insert({
        user_id: userId,
        full_name: details.fullName,
        phone: details.phone,
        address_line: cleanAddr,
        city: details.city || 'Hyderabad',
        state: 'Telangana',
        pincode: cleanPin,
        label: 'Default Harvest Address',
        is_default: true,
      });
    }
  } catch (err: any) {
    console.warn('[Address Book Error] Auto-saving address failed:', err?.message);
  }
}

/**
 * Calculate weight multiplier based on weight name or index
 */
function getWeightMultiplier(selectedWeight?: string, availableWeights?: string[]): number {
  if (!selectedWeight || !availableWeights || availableWeights.length === 0) return 1;
  const idx = availableWeights.indexOf(selectedWeight);
  if (idx <= 0) return 1;
  if (idx === 1) return 1.8;
  return 2.5;
}

/**
 * Calculate authoritative totals for a list of items and coupon code
 */
async function calculateAuthoritativeTotals(
  items: Array<{ product_id: number; quantity: number; selected_weight?: string }>,
  couponCode?: string,
  pincode?: string
): Promise<{
  ok: boolean;
  error?: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  totalInPaise: number;
  validatedItems: Array<{
    product_id: number;
    product_name: string;
    selected_weight: string;
    unit_price: number;
    quantity: number;
    total_price: number;
  }>;
}> {
  const supabase = getSupabase();
  const validatedItems: Array<any> = [];

  let subtotal = 0;

  if (supabase) {
    const productIds = items.map((it) => Number(it.product_id));
    const { data: dbProducts, error: dbErr } = await supabase
      .from('products')
      .select('id, name, price, is_active, is_in_stock, available_weights, default_weight')
      .in('id', productIds);

    if (dbErr || !dbProducts) {
      return { ok: false, error: 'Failed to fetch product details from database.', subtotal: 0, deliveryFee: 0, discount: 0, total: 0, totalInPaise: 0, validatedItems: [] };
    }

    const dbProductsById: Record<number, any> = {};
    dbProducts.forEach((p) => (dbProductsById[p.id] = p));

    for (const item of items) {
      const p = dbProductsById[item.product_id];
      if (!p) {
        return { ok: false, error: `Product ID ${item.product_id} not found in database.`, subtotal: 0, deliveryFee: 0, discount: 0, total: 0, totalInPaise: 0, validatedItems: [] };
      }

      if (p.is_active === false) {
        return { ok: false, error: `Product "${p.name}" is no longer active.`, subtotal: 0, deliveryFee: 0, discount: 0, total: 0, totalInPaise: 0, validatedItems: [] };
      }

      if (p.is_in_stock === false) {
        return { ok: false, error: `Product "${p.name}" is currently out of stock / unavailable.`, subtotal: 0, deliveryFee: 0, discount: 0, total: 0, totalInPaise: 0, validatedItems: [] };
      }

      const availableWeights = p.available_weights || ['Standard Pack'];
      const selectedWeight = item.selected_weight || p.default_weight || availableWeights[0] || 'Standard Pack';
      const multiplier = getWeightMultiplier(selectedWeight, availableWeights);
      const unitPrice = Math.round(Number(p.price) * multiplier);
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const itemTotal = unitPrice * quantity;

      subtotal += itemTotal;
      validatedItems.push({
        product_id: p.id,
        product_name: p.name,
        selected_weight: selectedWeight,
        unit_price: unitPrice,
        quantity,
        total_price: itemTotal,
      });
    }
  } else {
    return { ok: false, error: 'Database client not initialized on server.', subtotal: 0, deliveryFee: 0, discount: 0, total: 0, totalInPaise: 0, validatedItems: [] };
  }

  // Calculate dynamic server-side delivery fee using distance engine (₹10/km from Garuda Farms)
  let deliveryFee = 0;
  if (pincode) {
    const deliveryCalc = await calculateServerDeliveryFee(pincode, subtotal, couponCode);
    if (deliveryCalc.ok && deliveryCalc.serviceable) {
      // Known serviceable location — use the calculated fee
      deliveryFee = deliveryCalc.finalFee;
    } else {
      // Pincode not in DB or unserviceable — fall back to flat ₹40 fee (don't block the order)
      const isGarudaFree = String(couponCode || '').trim().toUpperCase() === 'GARUDAFREE' && subtotal >= 500;
      deliveryFee = isGarudaFree || validatedItems.length === 0 ? 0 : 40;
    }
  } else {
    const isGarudaFree = String(couponCode || '').trim().toUpperCase() === 'GARUDAFREE' && subtotal >= 500;
    deliveryFee = isGarudaFree || validatedItems.length === 0 ? 0 : 40;
  }

  let discount = 0;
  if (couponCode && supabase) {
    const cleanCode = String(couponCode).trim().toUpperCase();
    const { data: dbCoupons } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', cleanCode)
      .eq('is_active', true)
      .limit(1);

    if (dbCoupons && dbCoupons.length > 0) {
      const c = dbCoupons[0];
      const isExpired = c.expires_at && new Date(c.expires_at).getTime() < Date.now();
      const minOk = subtotal >= Number(c.minimum_order_amount || 0);

      if (!isExpired && minOk) {
        if (c.discount_type === 'percentage') {
          discount = Math.round((subtotal * Number(c.discount_value)) / 100);
          if (c.maximum_discount_amount && discount > Number(c.maximum_discount_amount)) {
            discount = Number(c.maximum_discount_amount);
          }
        } else {
          discount = Number(c.discount_value || 0);
        }
        discount = Math.min(subtotal, discount);
      }
    }
  }

  const grandTotal = Math.max(1, subtotal + deliveryFee - discount);
  const totalInPaise = Math.round(grandTotal * 100);

  return {
    ok: true,
    subtotal,
    deliveryFee,
    discount,
    total: grandTotal,
    totalInPaise,
    validatedItems,
  };
}

/**
 * STEP 1: CREATE RAZORPAY ORDER
 * Authoritative Server Price Calculation
 * Endpoint: POST /api/create-order
 */
export async function handleCreateOrder(req: Request, res: Response): Promise<void> {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      res.status(401).json({
        ok: false,
        error: 'Razorpay credentials not configured on the server. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.',
      });
      return;
    }

    const { items, couponCode, receipt, notes, pincode: reqPincode } = req.body;
    const pincode = reqPincode || notes?.pincode || req.body.address?.pincode || req.body.shipping_address?.pincode || '';

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ ok: false, error: 'Cart items array is required to create an order.' });
      return;
    }

    // Authoritative pricing check
    const calc = await calculateAuthoritativeTotals(items, couponCode, pincode);
    if (!calc.ok) {
      res.status(400).json({ ok: false, error: calc.error });
      return;
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      res.status(500).json({ ok: false, error: 'Razorpay client initialization failed.' });
      return;
    }

    const options = {
      amount: calc.totalInPaise,
      currency: 'INR',
      receipt: receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      notes: notes || {},
    };

    try {
      const order = await razorpay.orders.create(options);
      res.status(200).json({
        ok: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: keyId,
        receipt: order.receipt,
        calculatedTotal: calc.total,
        subtotal: calc.subtotal,
        deliveryFee: calc.deliveryFee,
        discount: calc.discount,
      });
      return;
    } catch (createErr: any) {
      console.error('Razorpay Create Order Error:', createErr);
      const isAuthError =
        createErr.statusCode === 401 ||
        createErr.error?.code === 'BAD_REQUEST_ERROR' ||
        createErr.error?.description === 'Authentication failed' ||
        createErr.message?.includes('Authentication failed');

      if (isAuthError) {
        if (process.env.RAZORPAY_ALLOW_SIMULATOR === 'true') {
          console.warn('[Razorpay] Live key auth failed; using developer test simulation order.');
          const simOrderId = `order_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          res.status(200).json({
            ok: true,
            order_id: simOrderId,
            amount: calc.totalInPaise,
            currency: 'INR',
            key_id: keyId,
            receipt: options.receipt,
            isSimulated: true,
            calculatedTotal: calc.total,
            subtotal: calc.subtotal,
            deliveryFee: calc.deliveryFee,
            discount: calc.discount,
          });
          return;
        }

        res.status(400).json({
          ok: false,
          error:
            'Razorpay Authentication Failed: Your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env do not match. Please update RAZORPAY_KEY_SECRET with the secret from your Razorpay Dashboard.',
        });
        return;
      }

      const desc = createErr.error?.description || createErr.message || '';
      res.status(500).json({ ok: false, error: desc || 'Error occurred while creating Razorpay order.' });
    }
  } catch (err: any) {
    console.error('Razorpay Create Order Handler Error:', err);
    res.status(500).json({ ok: false, error: err.message || 'Error occurred while creating Razorpay order.' });
  }
}

/**
 * STEP 2: VERIFY RAZORPAY PAYMENT & SAVE ORDER
 * Endpoint: POST /api/verify-payment
 */
export async function handleVerifyPayment(req: Request, res: Response): Promise<void> {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      res.status(401).json({ ok: false, verified: false, error: 'Razorpay key secret is missing on server.' });
      return;
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      custom_order_id,
      orderPayload,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({
        ok: false,
        verified: false,
        error: 'Missing required payment verification parameters.',
      });
      return;
    }

    // Cryptographic HMAC-SHA256 signature verification (bypass signature check only if order is simulated)
    const isSimulated = String(razorpay_order_id).startsWith('order_sim_') || String(razorpay_payment_id).startsWith('pay_sim_');

    if (!isSimulated) {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        res.status(400).json({
          ok: false,
          verified: false,
          error: 'Invalid payment signature. Payment verification failed.',
        });
        return;
      }
    }

    const supabase = getSupabase();
    if (!supabase) {
      res.status(500).json({ ok: false, error: 'Supabase database not connected.' });
      return;
    }

    // Identify authenticated user from Authorization header
    let authUser: any = null;
    const authHeader = String(req.headers.authorization || '');
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const { data } = await supabase.auth.getUser(token);
        if (data?.user) authUser = data.user;
      } catch (e) {
        console.warn('Supabase auth getUser error during payment verify:', e);
      }
    }

    // Idempotency check 1: check if razorpay_payment_id was already recorded
    const { data: existingPay } = await supabase
      .from('orders')
      .select('id, payment_status')
      .eq('razorpay_payment_id', razorpay_payment_id)
      .maybeSingle();

    if (existingPay && existingPay.payment_status === 'Paid') {
      res.status(200).json({
        ok: true,
        verified: true,
        message: 'Payment already processed and verified.',
        orderId: existingPay.id,
        razorpay_payment_id,
      });
      return;
    }

    // Idempotency check 2: check if custom_order_id already exists
    const orderId = custom_order_id || `GF-${Math.floor(Date.now() / 1000)}`;
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, payment_status')
      .eq('id', orderId)
      .maybeSingle();

    if (existingOrder && existingOrder.payment_status === 'Paid') {
      res.status(200).json({
        ok: true,
        verified: true,
        message: 'Order already processed.',
        orderId: existingOrder.id,
        razorpay_payment_id,
      });
      return;
    }

    // Validate payload and calculate authoritative totals
    const items = orderPayload?.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ ok: false, verified: false, error: 'Missing cart items in payment verification payload.' });
      return;
    }

    const pincode = orderPayload?.pincode || orderPayload?.shippingAddress?.pincode || '';
    const calc = await calculateAuthoritativeTotals(items, orderPayload?.couponCode, pincode);
    if (!calc.ok) {
      res.status(400).json({ ok: false, verified: false, error: calc.error });
      return;
    }

    // Resolve or create customer record
    let customerId: string | null = null;
    if (authUser) {
      const { data: byAuth } = await supabase.from('customers').select('id').eq('auth_id', authUser.id).maybeSingle();
      if (byAuth && byAuth.id) {
        customerId = byAuth.id;
      } else {
        const { data: existingCust } = await supabase.from('customers').select('*').eq('email', authUser.email).maybeSingle();
        if (existingCust && existingCust.id) {
          customerId = existingCust.id;
          if (!existingCust.auth_id) {
            await supabase.from('customers').update({ auth_id: authUser.id }).eq('id', existingCust.id);
          }
        } else {
          const { data: newCust } = await supabase.from('customers').insert({
            email: authUser.email,
            name: orderPayload.customerName || authUser.user_metadata?.fullName || authUser.email,
            phone: orderPayload.phone || authUser.phone || null,
            auth_id: authUser.id,
          }).select('id').maybeSingle();
          customerId = newCust?.id || null;
        }
      }
    }

    const orderRecord: any = {
      id: orderId,
      customer_id: customerId,
      customer_name: String(orderPayload.customerName || authUser?.user_metadata?.fullName || 'Guest Patron').trim(),
      customer_email: String(orderPayload.email || authUser?.email || '').trim().toLowerCase(),
      customer_phone: String(orderPayload.phone || authUser?.phone || '').trim(),
      shipping_address: orderPayload.address || '',
      city: orderPayload.city || 'Hyderabad',
      pincode: orderPayload.pincode || '',
      delivery_slot: orderPayload.deliverySlot || null,
      subtotal: calc.subtotal,
      delivery_charge: calc.deliveryFee,
      discount_amount: calc.discount,
      coupon_code: orderPayload.couponCode || null,
      total_amount: calc.total,
      payment_method: 'Razorpay',
      payment_status: 'Paid',
      order_status: 'Confirmed',
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      notes: orderPayload.notes ? JSON.stringify(orderPayload.notes) : null,
      updated_at: new Date().toISOString(),
    };

    // Try to include auth_id if column exists (graceful degradation)
    try {
      const testRecord = { ...orderRecord, auth_id: authUser?.id || null };
      const { error: upsertErr } = await supabase.from('orders').upsert(testRecord, { onConflict: 'id' });
      if (upsertErr) {
        // Column may not exist — retry without auth_id
        console.warn('[Payment] Order upsert with auth_id failed, retrying without:', upsertErr.message);
        const { error: retryErr } = await supabase.from('orders').upsert(orderRecord, { onConflict: 'id' });
        if (retryErr) {
          console.error('[Payment] Order upsert failed:', retryErr.message);
        }
      }
    } catch (upsertEx: any) {
      console.error('[Payment] Order upsert exception:', upsertEx.message);
      await supabase.from('orders').upsert(orderRecord, { onConflict: 'id' });
    }

    // Clean old order_items and insert fresh validated order items
    await supabase.from('order_items').delete().eq('order_id', orderId);
    for (const item of calc.validatedItems) {
      await supabase.from('order_items').insert({
        order_id: orderId,
        product_id: item.product_id,
        product_name: item.product_name,
        selected_weight: item.selected_weight,
        unit_price: item.unit_price,
        quantity: item.quantity,
        total_price: item.total_price,
      });
    }

    // Decrement product stock quantities automatically
    decrementProductStock(supabase, calc.validatedItems);

    // Auto-save shipping address to customer's address book as default
    if (authUser?.id) {
      autoSaveAddressAsDefault(supabase, authUser.id, {
        fullName: orderRecord.customer_name,
        phone: orderRecord.customer_phone,
        addressLine: orderRecord.shipping_address,
        city: orderRecord.city,
        pincode: orderRecord.pincode,
      });
    }

    // Trigger secondary real-time Google Sheets backup sync (non-blocking)
    syncOrderToGoogleSheets({ ...orderRecord, items: calc.validatedItems });

    // Trigger SMS, WhatsApp, and In-App notification
    sendOrderNotification({
      phone: orderRecord.customer_phone,
      email: orderRecord.customer_email,
      orderId,
      type: 'ORDER_PLACED',
      status: 'Confirmed',
      totalAmount: calc.total,
      customerName: orderRecord.customer_name,
    }).catch((err) => console.warn('[Notification Error]', err));

    // Trigger Farm Owner Notification (Email & Telegram)
    notifyOwnerOnNewOrder({ ...orderRecord, items: calc.validatedItems }).catch((err) =>
      console.warn('[Owner Notification Error]', err)
    );

    res.status(200).json({
      ok: true,
      verified: true,
      message: 'Razorpay payment verified and order created successfully.',
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
    });
  } catch (err: any) {
    console.error('Payment Verification Error:', err);
    res.status(500).json({ ok: false, verified: false, error: err.message || 'Internal error during payment verification.' });
  }
}

/**
 * CREATE CASH ON DELIVERY (COD) ORDER
 * Endpoint: POST /api/payments/create-cod
 */
export async function handleCreateCodOrder(req: Request, res: Response): Promise<void> {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      res.status(500).json({ ok: false, error: 'Supabase database not configured.' });
      return;
    }

    let authUser: any = null;
    const authHeader = String(req.headers.authorization || '');
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data } = await supabase.auth.getUser(token);
      if (data?.user) {
        authUser = data.user;
      }
    }

    const payload = req.body || {};
    const items = payload.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ ok: false, error: 'Cart items are required for COD order.' });
      return;
    }

    const pincode = payload.pincode || payload.shippingAddress?.pincode || '';
    const calc = await calculateAuthoritativeTotals(items, payload.couponCode, pincode);
    if (!calc.ok) {
      res.status(400).json({ ok: false, error: calc.error });
      return;
    }

    const orderId = payload.orderId || `GF-${Math.floor(Date.now() / 1000)}`;

    // Resolve customer ID
    let customerId: string | null = null;
    if (authUser) {
      const { data: byAuth } = await supabase.from('customers').select('id').eq('auth_id', authUser.id).maybeSingle();
      if (byAuth && byAuth.id) {
        customerId = byAuth.id;
      } else {
        const { data: existingCust } = await supabase.from('customers').select('*').eq('email', authUser.email).maybeSingle();
        if (existingCust && existingCust.id) {
          customerId = existingCust.id;
          if (!existingCust.auth_id) {
            await supabase.from('customers').update({ auth_id: authUser.id }).eq('id', existingCust.id);
          }
        }
      }
    }

    const orderRecord: any = {
      id: orderId,
      customer_id: customerId,
      customer_name: String(payload.customerName || authUser?.user_metadata?.fullName || 'Guest Patron').trim(),
      customer_email: String(payload.email || authUser?.email || '').trim().toLowerCase(),
      customer_phone: String(payload.phone || authUser?.phone || '').trim(),
      shipping_address: payload.address || '',
      city: payload.city || 'Hyderabad',
      pincode: payload.pincode || '',
      delivery_slot: payload.deliverySlot || null,
      subtotal: calc.subtotal,
      delivery_charge: calc.deliveryFee,
      discount_amount: calc.discount,
      coupon_code: payload.couponCode || null,
      total_amount: calc.total,
      payment_method: 'COD',
      payment_status: 'Pending',
      order_status: 'Confirmed',
      updated_at: new Date().toISOString(),
    };

    // Try to include auth_id if column exists (graceful degradation)
    try {
      const testRecord = { ...orderRecord, auth_id: authUser?.id || null };
      const { error: upsertErr } = await supabase.from('orders').upsert(testRecord, { onConflict: 'id' });
      if (upsertErr) {
        // Column may not exist — retry without auth_id
        console.warn('[COD] Order upsert with auth_id failed, retrying without:', upsertErr.message);
        const { error: retryErr } = await supabase.from('orders').upsert(orderRecord, { onConflict: 'id' });
        if (retryErr) {
          console.error('[COD] Order upsert failed:', retryErr.message);
          res.status(500).json({ ok: false, error: 'Failed to save order: ' + retryErr.message });
          return;
        }
      }
    } catch (upsertEx: any) {
      console.error('[COD] Order upsert exception:', upsertEx.message);
      const { error: fallbackErr } = await supabase.from('orders').upsert(orderRecord, { onConflict: 'id' });
      if (fallbackErr) {
        res.status(500).json({ ok: false, error: 'Failed to save order: ' + fallbackErr.message });
        return;
      }
    }

    await supabase.from('order_items').delete().eq('order_id', orderId);
    for (const item of calc.validatedItems) {
      await supabase.from('order_items').insert({
        order_id: orderId,
        product_id: item.product_id,
        product_name: item.product_name,
        selected_weight: item.selected_weight,
        unit_price: item.unit_price,
        quantity: item.quantity,
        total_price: item.total_price,
      });
    }

    // Decrement product stock quantities automatically
    decrementProductStock(supabase, calc.validatedItems);

    // Auto-save shipping address to customer's address book as default
    if (authUser?.id) {
      autoSaveAddressAsDefault(supabase, authUser.id, {
        fullName: orderRecord.customer_name,
        phone: orderRecord.customer_phone,
        addressLine: orderRecord.shipping_address,
        city: orderRecord.city,
        pincode: orderRecord.pincode,
      });
    }

    // Trigger secondary real-time Google Sheets backup sync (non-blocking)
    syncOrderToGoogleSheets({ ...orderRecord, items: calc.validatedItems });

    // Trigger SMS, WhatsApp, and In-App notification
    sendOrderNotification({
      phone: orderRecord.customer_phone,
      email: orderRecord.customer_email,
      orderId,
      type: 'ORDER_PLACED',
      status: 'Confirmed',
      totalAmount: calc.total,
      customerName: orderRecord.customer_name,
    }).catch((err) => console.warn('[Notification Error]', err));

    // Trigger Farm Owner Notification (Email & Telegram)
    notifyOwnerOnNewOrder({ ...orderRecord, items: calc.validatedItems }).catch((err) =>
      console.warn('[Owner Notification Error]', err)
    );

    res.status(200).json({
      ok: true,
      orderId,
      message: 'Cash on Delivery order created successfully.',
    });
  } catch (err: any) {
    console.error('COD Order Error:', err);
    res.status(500).json({ ok: false, error: err.message || 'Internal error creating COD order.' });
  }
}

/**
 * RAZORPAY WEBHOOK HANDLER
 * Endpoint: POST /api/payments/webhook
 */
export async function handleWebhook(req: Request, res: Response): Promise<void> {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET not set in environment.');
      res.status(400).json({ ok: false, error: 'Webhook secret not configured on server.' });
      return;
    }

    const signature = req.headers['x-razorpay-signature'] as string;
    if (!signature) {
      res.status(400).json({ ok: false, error: 'Missing x-razorpay-signature header.' });
      return;
    }

    // Get raw request body string
    const rawBody = typeof req.body === 'string' || Buffer.isBuffer(req.body) 
      ? req.body 
      : JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('[Razorpay Webhook] Invalid webhook signature detected.');
      res.status(400).json({ ok: false, error: 'Invalid webhook signature.' });
      return;
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const eventType = event.event;
    const payload = event.payload;

    console.log(`[Razorpay Webhook] Received event: ${eventType}`);

    const supabase = getSupabase();
    if (supabase) {
      if (eventType === 'payment.captured' || eventType === 'order.paid') {
        const paymentEntity = payload?.payment?.entity;
        const razorpayOrderId = paymentEntity?.order_id;
        const razorpayPaymentId = paymentEntity?.id;

        if (razorpayOrderId || razorpayPaymentId) {
          let query = supabase.from('orders').update({
            payment_status: 'Paid',
            order_status: 'Confirmed',
            updated_at: new Date().toISOString(),
          });

          if (razorpayOrderId) {
            query = query.eq('razorpay_order_id', razorpayOrderId);
          } else {
            query = query.eq('razorpay_payment_id', razorpayPaymentId);
          }

          await query;
          console.log(`[Razorpay Webhook] Order updated to Paid for Razorpay Order ${razorpayOrderId}`);
        }
      } else if (eventType === 'payment.failed') {
        const paymentEntity = payload?.payment?.entity;
        const razorpayOrderId = paymentEntity?.order_id;

        if (razorpayOrderId) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'Failed',
              order_status: 'Cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('razorpay_order_id', razorpayOrderId);
        }
      }
    }

    res.status(200).json({ ok: true, status: 'processed' });
  } catch (err: any) {
    console.error('[Razorpay Webhook Error]:', err);
    res.status(500).json({ ok: false, error: err.message || 'Webhook processing error.' });
  }
}

// Router bindings
router.post('/create-order', handleCreateOrder);
router.post('/verify-payment', handleVerifyPayment);
router.post('/create-cod', handleCreateCodOrder);
router.post('/webhook', handleWebhook);

export default router;
