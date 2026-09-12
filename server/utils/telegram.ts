import { OrderNotificationPayload } from './email';

/**
 * Send real-time instant Telegram push alert to the owner's phone via Telegram Bot API (100% Free)
 */
export async function sendTelegramOrderAlert(order: OrderNotificationPayload): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const rawChatIds = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !rawChatIds) {
    console.log(`[Telegram Alert Logged] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing in .env. Skipping Telegram alert for Order #${order.id}.`);
    return false;
  }

  const chatIds = rawChatIds.split(',').map((id) => id.trim()).filter(Boolean);
  if (chatIds.length === 0) return false;

  try {
    const fullAddress = `${order.shipping_address || ''}, ${order.city || ''} - ${order.pincode || ''}`.trim();
    const itemsList = Array.isArray(order.items)
      ? order.items.map((i) => `  • ${i.product_name} (${i.selected_weight}) × ${i.quantity} = ₹${i.total_price}`).join('\n')
      : '  • No items listed';

    const messageText = `
🚨 *NEW ORDER RECEIVED!* 🌾
-----------------------------------
🆔 *Order ID:* \`#${order.id}\`
📅 *Time:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
💳 *Payment:* *${(order.payment_method || 'COD').toUpperCase()}* (${order.payment_status || 'Pending'})

👤 *Customer Details:*
• *Name:* ${order.customer_name || 'Guest Patron'}
• *Phone:* ${order.customer_phone || 'N/A'}
• *Slot:* ${order.delivery_slot || 'Standard'}
• *Address:* ${fullAddress}

📦 *Ordered Items:*
${itemsList}

💰 *Subtotal:* ₹${order.subtotal ?? order.total_amount}
${order.delivery_charge ? `🚚 *Delivery Fee:* ₹${order.delivery_charge}\n` : ''}${order.discount_amount ? `🏷️ *Discount:* -₹${order.discount_amount}\n` : ''}💵 *Grand Total:* ₹${order.total_amount}
-----------------------------------
🚜 *Garuda Farms Store Alert*
`.trim();

    const sendResults = await Promise.allSettled(
      chatIds.map(async (id) => {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: id,
            text: messageText,
            parse_mode: 'Markdown',
          }),
        });
        if (response.ok) {
          console.log(`[Telegram Alert Sent] Order #${order.id} push notification sent to Telegram chat (${id})`);
          return true;
        } else {
          const errRes = await response.text();
          console.warn(`[Telegram Alert Warning] Telegram API returned error for chat ${id}:`, errRes);
          return false;
        }
      })
    );

    return sendResults.some((r) => r.status === 'fulfilled' && r.value === true);
  } catch (err: any) {
    console.error(`[Telegram Alert Error] Failed to dispatch Telegram alert for Order #${order.id}:`, err?.message || err);
    return false;
  }
}
