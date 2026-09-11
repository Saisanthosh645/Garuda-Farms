import { sendOwnerOrderEmail, OrderNotificationPayload } from './email';
import { sendTelegramOrderAlert } from './telegram';
import { generateWhatsAppLink } from './smsWhatsapp';

export type { OrderNotificationPayload };

/**
 * Dispatch multi-channel notifications (Email, Telegram, WhatsApp) to the farm owner when a new order is placed
 */
export async function notifyOwnerOnNewOrder(order: OrderNotificationPayload): Promise<{
  emailSent: boolean;
  telegramSent: boolean;
  whatsappLink: string;
}> {
  console.log(`[Owner Alert Initiated] Processing new order notification for Order #${order.id}...`);

  const ownerPhone = process.env.OWNER_PHONE_NUMBER || process.env.ADMIN_PHONE || '919866929427';
  const messageForWhatsapp = `🌾 *Garuda Farms New Order #${order.id}*\nTotal: ₹${order.total_amount} (${(order.payment_method || 'COD').toUpperCase()})\nCustomer: ${order.customer_name || 'Patron'} (${order.customer_phone || ''})`;
  const whatsappLink = generateWhatsAppLink(ownerPhone, messageForWhatsapp);

  // Dispatch Email and Telegram in parallel without blocking client response
  const [emailResult, telegramResult] = await Promise.allSettled([
    sendOwnerOrderEmail(order),
    sendTelegramOrderAlert(order),
  ]);

  const emailSent = emailResult.status === 'fulfilled' ? emailResult.value : false;
  const telegramSent = telegramResult.status === 'fulfilled' ? telegramResult.value : false;

  console.log(`[Owner Alert Summary] Order #${order.id} -> Email: ${emailSent ? 'SENT' : 'SKIPPED/FAILED'} | Telegram: ${telegramSent ? 'SENT' : 'SKIPPED/FAILED'}`);
  console.log(`💬 Owner WhatsApp Link: ${whatsappLink}`);

  return {
    emailSent,
    telegramSent,
    whatsappLink,
  };
}
