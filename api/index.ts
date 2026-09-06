import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database & Seed
import { getSupabase, isSupabaseConfigured, testSupabaseConnection } from '../server/db/supabase';
import { seedDatabase } from '../server/db/seed';

// Routers
import authRoutes from '../server/routes/auth';
import productRoutes from '../server/routes/products';
import categoryRoutes from '../server/routes/categories';
import paymentsRoutes, { handleCreateOrder, handleVerifyPayment, handleCreateCodOrder } from '../server/routes/payments';
import ordersRoutes from '../server/routes/orders';
import adminRoutes from '../server/routes/admin';
import accountRoutes from '../server/routes/account';
import addressesRoutes from '../server/routes/addresses';
import wishlistRoutes from '../server/routes/wishlist';
import notificationsRoutes from '../server/routes/notifications';
import supportRoutes from '../server/routes/support';
import couponsRoutes from '../server/routes/coupons';
import reviewsRoutes from '../server/routes/reviews';
import deliveryRoutes from '../server/routes/delivery';

const app = express();

// Middlewares
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS for Vercel
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Health Check
app.get('/api/health', async (req: Request, res: Response) => {
  const supabaseConfigured = isSupabaseConfigured();
  let dbStatus = { ok: false, message: 'Supabase credentials not configured' };
  if (supabaseConfigured) dbStatus = await testSupabaseConnection();
  res.json({
    status: 'ok',
    service: 'Garuda Farms E-Commerce API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    database: { provider: 'Supabase PostgreSQL', configured: supabaseConfigured, connected: dbStatus.ok },
    payments: { razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) },
  });
});

// DB Status
app.get('/api/db/status', async (req: Request, res: Response) => {
  const client = getSupabase();
  if (!client) { res.json({ ok: true, configured: false }); return; }
  try {
    const { count: prodCount } = await client.from('products').select('*', { count: 'exact', head: true });
    res.json({ ok: true, configured: true, productsInDatabase: prodCount ?? 0 });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DB Seed
app.post('/api/db/seed', async (req: Request, res: Response) => {
  const client = getSupabase();
  if (!client) { res.status(400).json({ ok: false, error: 'Supabase not configured.' }); return; }
  try {
    const result = await seedDatabase(client);
    res.json({ ok: true, ...result });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Mount all API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/addresses', addressesRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/delivery', deliveryRoutes);

// Direct payment routes
app.post('/api/create-order', handleCreateOrder);
app.post('/api/verify-payment', handleVerifyPayment);
app.post('/api/create-cod', handleCreateCodOrder);

// Auto-seed on cold start if DB is empty
if (isSupabaseConfigured()) {
  const client = getSupabase();
  if (client) {
    client.from('products').select('id', { count: 'exact', head: true })
      .then(({ count }) => {
        if (count === 0 || count === null) {
          return seedDatabase(client).then(() => console.log('[Garuda Farms] Auto-seed complete.'));
        }
        console.log(`[Garuda Farms] DB ready with ${count} products.`);
      })
      .catch((err: any) => console.warn('[Garuda Farms] DB check error:', err.message));
  }
}

export default app;
