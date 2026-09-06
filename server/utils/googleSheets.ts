import { getSupabase } from '../db/supabase';

export interface OrderSyncData {
  id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_address?: string;
  city?: string;
  pincode?: string;
  delivery_slot?: string;
  items?: Array<{ product_name: string; selected_weight: string; quantity: number; total_price: number }>;
  subtotal?: number;
  delivery_charge?: number;
  discount_amount?: number;
  coupon_code?: string;
  total_amount?: number;
  payment_method?: string;
  payment_status?: string;
  order_status?: string;
  created_at?: string;
}

/**
 * Real-time order sync to Google Sheets Webhook
 */
export async function syncOrderToGoogleSheets(order: OrderSyncData): Promise<void> {
  try {
    // 1. Get Webhook URL from env or DB store_settings
    let webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || '';

    if (!webhookUrl) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data } = await supabase
            .from('store_settings')
            .select('value')
            .eq('key', 'google_sheets_webhook_url')
            .maybeSingle();
          if (data && data.value) {
            webhookUrl = typeof data.value === 'string' ? data.value.replace(/^"|"$/g, '') : data.value;
          }
        } catch (dbErr) {
          // ignore DB error
        }
      }
    }

    const itemsSummary = Array.isArray(order.items)
      ? order.items.map((i) => `${i.product_name} (${i.selected_weight} × ${i.quantity})`).join(', ')
      : '';

    const payload = {
      order_id: order.id,
      date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      customer_name: order.customer_name || 'Guest Patron',
      customer_email: order.customer_email || 'N/A',
      customer_phone: order.customer_phone || 'N/A',
      shipping_address: `${order.shipping_address || ''}, ${order.city || ''} - ${order.pincode || ''}`.trim(),
      delivery_slot: order.delivery_slot || 'Standard Morning',
      items: itemsSummary,
      subtotal: order.subtotal ?? 0,
      delivery_charge: order.delivery_charge ?? 0,
      discount_amount: order.discount_amount ?? 0,
      coupon_code: order.coupon_code || 'None',
      total_amount: order.total_amount ?? 0,
      payment_method: order.payment_method || 'N/A',
      payment_status: order.payment_status || 'Pending',
      order_status: order.order_status || 'Confirmed',
    };

    if (webhookUrl && webhookUrl.startsWith('http')) {
      const encodedData = encodeURIComponent(JSON.stringify(payload));
      const urlWithQuery = webhookUrl.includes('?') 
        ? `${webhookUrl}&data=${encodedData}` 
        : `${webhookUrl}?data=${encodedData}`;

      fetch(urlWithQuery, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        redirect: 'follow',
      })
        .then((res) => {
          console.log(`[Google Sheets Sync] Order #${order.id} synced to Google Sheets (Status: ${res.status})`);
        })
        .catch((err) => {
          console.warn(`[Google Sheets Sync] Failed to send order #${order.id} to Google Sheets:`, err.message);
        });
    } else {
      console.log(`[Google Sheets Sync] Order #${order.id} prepared. (Configure GOOGLE_SHEETS_WEBHOOK_URL in Vercel or store_settings to enable live sheet push)`);
    }
  } catch (err: any) {
    console.warn(`[Google Sheets Sync Warning]:`, err.message);
  }
}
