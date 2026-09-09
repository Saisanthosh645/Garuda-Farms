import { getSupabase } from '../db/supabase';

export interface NotificationResult {
  smsSent: boolean;
  whatsappSent: boolean;
  whatsappDeepLink?: string;
  inAppSaved: boolean;
}

/**
 * Clean phone number to E.164 / International format for SMS & WhatsApp (e.g. +919876543210 or 919876543210)
 */

function sanitizePhoneNumber(phone: string): { formatted: string; digitsOnly: string } {
  let digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 10) {
    digits = '91' + digits; // Default to India (+91)
  }
  return {
    formatted: `+${digits}`,
    digitsOnly: digits,
  };
}

/**
 * Generate a direct WhatsApp click-to-chat URL with pre-filled message text
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const { digitsOnly } = sanitizePhoneNumber(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${digitsOnly}?text=${encodedText}`;
}

/**
 * Main dispatcher for SMS & WhatsApp notifications
 */
export async function sendOrderNotification(payload: {
  phone: string;
  email?: string;
  orderId: string;
  type: 'ORDER_PLACED' | 'STATUS_CHANGE' | 'PAYMENT_RECEIVED' | 'ORDER_CANCELLED';
  status?: string;
  totalAmount?: number;
  customerName?: string;
}): Promise<NotificationResult> {
  const { phone, email, orderId, type, status, totalAmount, customerName } = payload;
  const { formatted, digitsOnly } = sanitizePhoneNumber(phone);
  const name = customerName || 'Valued Patron';

  let messageText = '';

  switch (type) {
    case 'ORDER_PLACED':
      messageText = `🌿 Garuda Farms: Thank you for your order! Order #${orderId} for ₹${totalAmount || 0} has been placed successfully. We are preparing your fresh farm products. Track your order at https://garudafarms.com/track`;
      break;

    case 'STATUS_CHANGE':
      messageText = `🚜 Garuda Farms Update: Order #${orderId} is now "${status}". Track live progress at https://garudafarms.com/track`;
      break;

    case 'PAYMENT_RECEIVED':
      messageText = `✅ Garuda Farms: Payment received for Order #${orderId} (₹${totalAmount || 0}). Thank you!`;
      break;

    case 'ORDER_CANCELLED':
      messageText = `❌ Garuda Farms: Order #${orderId} has been cancelled. For queries, call +91 98669 29427.`;
      break;
  }

  const result: NotificationResult = {
    smsSent: false,
    whatsappSent: false,
    whatsappDeepLink: generateWhatsAppLink(phone, messageText),
    inAppSaved: false,
  };

  // 1. Save In-App Notification to Database
  try {
    const supabase = getSupabase();
    if (supabase && email) {
      await supabase.from('customer_notifications').insert({
        customer_email: email,
        title: type === 'ORDER_PLACED' ? 'Order Confirmed!' : `Order Status: ${status || type}`,
        message: messageText,
        type: 'order',
        read: false,
        created_at: new Date().toISOString(),
      });
      result.inAppSaved = true;
    }
  } catch (err: any) {
    console.warn('[Notifications] In-app notification error:', err?.message);
  }

  // 2. Dispatch SMS / WhatsApp via API if Provider Keys exist in Environment
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  const msg91Key = process.env.MSG91_AUTH_KEY;

  if (twilioSid && twilioToken && twilioPhone) {
    try {
      // Send SMS via Twilio API
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const body = new URLSearchParams({
        From: twilioPhone,
        To: formatted,
        Body: messageText,
      });

      const smsRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (smsRes.ok) {
        result.smsSent = true;
        console.log(`[SMS Sent] Successfully dispatched SMS to ${formatted}`);
      }
    } catch (err: any) {
      console.error('[SMS Error]', err?.message);
    }
  } else {
    console.log(`[SMS Notification Logged - Add TWILIO_ACCOUNT_SID to enable automated dispatch]`);
    console.log(`📱 To: ${formatted} | Message: ${messageText}`);
  }

  // Log WhatsApp URL for Admin usage / Webhooks
  console.log(`💬 WhatsApp Link: ${result.whatsappDeepLink}`);

  return result;
}
