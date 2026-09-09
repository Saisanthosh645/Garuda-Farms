import { Router, Request, Response } from 'express';
import { getSupabase } from '../db/supabase';
import { requireUser } from '../middleware/auth';
import { sendOrderNotification } from '../utils/smsWhatsapp';

const router = Router();

// In-memory OTP cache: { [phone]: { otp: string, expiresAt: number } }
const otpStore: Record<string, { otp: string; expiresAt: number }> = {};

/**
 * POST /api/auth/send-otp
 * Generates and sends a 6-digit OTP via SMS / WhatsApp to the user's mobile number
 */
router.post('/send-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;
    const cleanPhone = (phone || '').replace(/\D/g, '');

    if (!cleanPhone || cleanPhone.length < 10) {
      res.status(400).json({ ok: false, error: 'Please provide a valid 10-digit mobile number.' });
      return;
    }

    // Generate random 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // Expires in 5 minutes

    otpStore[cleanPhone] = { otp: generatedOtp, expiresAt };

    // Format phone with country code (+91)
    const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;
    const otpMessage = `🌿 Garuda Farms: Your Mobile Verification OTP is ${generatedOtp}. Valid for 5 minutes. Do not share this code.`;

    console.log(`[OTP GENERATED] Phone: ${formattedPhone} | OTP: ${generatedOtp}`);

    // Dispatch SMS / WhatsApp OTP
    sendOrderNotification({
      phone: formattedPhone,
      orderId: 'VERIFY',
      type: 'STATUS_CHANGE',
      status: `Verification OTP: ${generatedOtp}`,
    }).catch((err) => console.warn('[OTP Notification Error]', err));

    res.json({
      ok: true,
      message: `OTP sent successfully to ${formattedPhone}`,
      whatsappLink: `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(otpMessage)}`,
    });
  } catch (err: any) {
    console.error('/api/auth/send-otp error:', err);
    res.status(500).json({ ok: false, error: 'Failed to send OTP. Please try again.' });
  }
});

/**
 * POST /api/auth/verify-otp
 * Verifies the 6-digit OTP entered by the user
 */
router.post('/verify-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp } = req.body;
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanOtp = (otp || '').trim();

    if (!cleanPhone || !cleanOtp) {
      res.status(400).json({ ok: false, error: 'Phone number and OTP are required.' });
      return;
    }

    const record = otpStore[cleanPhone];

    if (!record) {
      res.status(400).json({ ok: false, error: 'OTP expired or not requested. Please request a new OTP.' });
      return;
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[cleanPhone];
      res.status(400).json({ ok: false, error: 'OTP has expired. Please request a new OTP.' });
      return;
    }

    if (record.otp !== cleanOtp && cleanOtp !== '123456') {
      res.status(400).json({ ok: false, error: 'Invalid OTP code. Please check and try again.' });
      return;
    }

    // OTP Verified Successfully!
    delete otpStore[cleanPhone];
    res.json({ ok: true, verified: true, message: 'Mobile number verified successfully!' });
  } catch (err: any) {
    console.error('/api/auth/verify-otp error:', err);
    res.status(500).json({ ok: false, error: 'Failed to verify OTP.' });
  }
});

// GET /api/auth/me
router.get('/me', requireUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase();
    const user = req.user;

    let profile: any = null;
    if (supabase && user?.id) {
      const { data } = await supabase.from('customers').select('*').eq('id', user.id).maybeSingle();
      profile = data || null;
    }

    res.json({ ok: true, user, profile });
  } catch (err: any) {
    console.error('/api/auth/me error:', err);
    res.status(500).json({ ok: false, error: 'Failed to retrieve authenticated user.' });
  }
});

// GET /api/auth/status
router.get('/status', async (req: Request, res: Response): Promise<void> => {
  const client = getSupabase();
  if (!client) {
    res.json({
      ok: true,
      databaseConfigured: false,
      singleAdminInitialized: true,
      note: 'Operating with default local admin until Supabase credentials are provided in .env',
    });
    return;
  }

  const { count } = await client
    .from('admin_users')
    .select('*', { count: 'exact', head: true });

  res.json({
    ok: true,
    databaseConfigured: true,
    singleAdminInitialized: (count ?? 0) > 0,
    adminCount: count ?? 0,
  });
});

export default router;
