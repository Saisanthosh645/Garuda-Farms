import nodemailer from 'nodemailer';

export interface OrderNotificationPayload {
  id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_address?: string;
  city?: string;
  pincode?: string;
  delivery_slot?: string;
  items?: Array<{ product_name: string; selected_weight: string; quantity: number; total_price: number; unit_price?: number }>;
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
 * Send rich HTML email notification to the farm owner when a new order is placed
 */
export async function sendOwnerOrderEmail(order: OrderNotificationPayload): Promise<boolean> {
  const ownerEmail = process.env.OWNER_EMAIL || process.env.ADMIN_EMAIL;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!ownerEmail) {
    console.log(`[Email Notification Logged] OWNER_EMAIL not set in .env. Skipping email dispatch.`);
    return false;
  }

  if (!smtpUser || !smtpPass) {
    console.log(`[Email Notification Logged] SMTP_USER or SMTP_PASS missing in .env. Skipping automated email dispatch for Order #${order.id}.`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const itemsRows = Array.isArray(order.items)
      ? order.items
          .map(
            (item) => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 500;">${item.product_name} (${item.selected_weight})</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.total_price}</td>
            </tr>`
          )
          .join('')
      : '<tr><td colspan="3" style="padding: 10px;">No items listed</td></tr>';

    const fullAddress = `${order.shipping_address || ''}, ${order.city || ''} - ${order.pincode || ''}`.trim();
    const formattedDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
          .header { background: #166534; color: #ffffff; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; letter-spacing: 0.5px; }
          .header p { margin: 6px 0 0 0; opacity: 0.9; font-size: 14px; }
          .content { padding: 24px; }
          .section-title { font-size: 16px; font-weight: bold; color: #166534; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; margin-top: 20px; margin-bottom: 12px; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          .info-table td { padding: 6px 0; font-size: 14px; }
          .info-table td.label { font-weight: bold; color: #555; width: 35%; }
          .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
          .items-table th { background: #f9fafb; padding: 10px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
          .total-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 16px; margin-top: 20px; }
          .footer { text-align: center; padding: 16px; background: #f9fafb; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌿 New Order Notification!</h1>
            <p>Garuda Farms Store Alert</p>
          </div>
          <div class="content">
            <div class="section-title">📦 Order Summary</div>
            <table class="info-table">
              <tr><td class="label">Order ID:</td><td><strong>#${order.id}</strong></td></tr>
              <tr><td class="label">Date & Time:</td><td>${formattedDate}</td></tr>
              <tr><td class="label">Payment Method:</td><td><strong>${(order.payment_method || 'COD').toUpperCase()}</strong> (${order.payment_status || 'Pending'})</td></tr>
              <tr><td class="label">Delivery Slot:</td><td>${order.delivery_slot || 'Standard Slot'}</td></tr>
            </table>

            <div class="section-title">👤 Customer Details</div>
            <table class="info-table">
              <tr><td class="label">Name:</td><td>${order.customer_name || 'Guest Patron'}</td></tr>
              <tr><td class="label">Phone:</td><td><a href="tel:${order.customer_phone}">${order.customer_phone || 'N/A'}</a></td></tr>
              <tr><td class="label">Email:</td><td>${order.customer_email || 'N/A'}</td></tr>
              <tr><td class="label">Delivery Address:</td><td>${fullAddress}</td></tr>
            </table>

            <div class="section-title">🛒 Ordered Items</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <div class="total-box">
              <table style="width:100%; font-size: 14px;">
                <tr><td>Subtotal:</td><td style="text-align:right;">₹${order.subtotal ?? order.total_amount}</td></tr>
                ${order.delivery_charge ? `<tr><td>Delivery Fee:</td><td style="text-align:right;">₹${order.delivery_charge}</td></tr>` : ''}
                ${order.discount_amount ? `<tr><td>Discount (${order.coupon_code || 'Applied'}):</td><td style="text-align:right; color: #dc2626;">-₹${order.discount_amount}</td></tr>` : ''}
                <tr style="font-size: 18px; font-weight: bold; color: #166534; border-top: 1px solid #bbf7d0;">
                  <td style="padding-top: 10px;">Grand Total:</td>
                  <td style="padding-top: 10px; text-align: right;">₹${order.total_amount}</td>
                </tr>
              </table>
            </div>
          </div>
          <div class="footer">
            Garuda Farms E-Commerce Automated Order Alert System
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Garuda Farms Orders" <${smtpUser}>`,
      to: ownerEmail,
      subject: `🚨 New Order #${order.id} Received - ₹${order.total_amount} (${(order.payment_method || 'COD').toUpperCase()})`,
      html: htmlContent,
    });

    console.log(`[Email Sent] Successfully dispatched order notification for #${order.id} to owner (${ownerEmail})`);
    return true;
  } catch (err: any) {
    console.error(`[Email Error] Failed to send email for Order #${order.id}:`, err?.message || err);
    return false;
  }
}
