import express, { Request, Response } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

// Database & Seed
import { getSupabase, isSupabaseConfigured, testSupabaseConnection } from './server/db/supabase';
import { seedDatabase } from './server/db/seed';

// Routers
import authRoutes from './server/routes/auth';
import productRoutes from './server/routes/products';
import categoryRoutes from './server/routes/categories';
import paymentsRoutes, { handleCreateOrder, handleVerifyPayment, handleCreateCodOrder } from './server/routes/payments';
import ordersRoutes from './server/routes/orders';
import adminRoutes from './server/routes/admin';
import accountRoutes from './server/routes/account';
import addressesRoutes from './server/routes/addresses';
import wishlistRoutes from './server/routes/wishlist';
import notificationsRoutes from './server/routes/notifications';
import supportRoutes from './server/routes/support';
import couponsRoutes from './server/routes/coupons';
import reviewsRoutes from './server/routes/reviews';
import deliveryRoutes from './server/routes/delivery';

export const app = express();

// Middlewares
// Raw body parser for Razorpay webhook signature verification
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 1. Health Check Endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  const supabaseConfigured = isSupabaseConfigured();
  let dbStatus = { ok: false, message: 'Supabase credentials not configured in .env' };

  if (supabaseConfigured) {
    dbStatus = await testSupabaseConnection();
  }

  res.json({
    status: 'ok',
    service: 'Garuda Farms E-Commerce API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      provider: 'Supabase PostgreSQL',
      configured: supabaseConfigured,
      connected: dbStatus.ok,
      statusMessage: dbStatus.message,
    },
    auth: {
      singleAdminConfigured: true,
      adminEmail: process.env.ADMIN_EMAIL || 'admin@garudafarms.com',
    },
    payments: {
      razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      mode: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) ? 'Live Gateway' : 'Disabled (Pending real credentials)',
    },
  });
});

// 2. Database Status & Migration Check
app.get('/api/db/status', async (req: Request, res: Response) => {
  const client = getSupabase();
  if (!client) {
    res.json({
      ok: true,
      configured: false,
      message: 'Running in standby mode. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to connect to Supabase PostgreSQL.',
      seededProductsCount: 50,
      seededCategoriesCount: 10,
    });
    return;
  }

  try {
    const { count: prodCount } = await client.from('products').select('*', { count: 'exact', head: true });
    const { count: catCount } = await client.from('categories').select('*', { count: 'exact', head: true });
    const { count: adminCount } = await client.from('admin_users').select('*', { count: 'exact', head: true });

    res.json({
      ok: true,
      configured: true,
      connection: 'Connected to Supabase PostgreSQL',
      productsInDatabase: prodCount ?? 0,
      categoriesInDatabase: catCount ?? 0,
      adminsInDatabase: adminCount ?? 0,
      migrationReady: (prodCount ?? 0) >= 50,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 3. Database Seed / Migration Endpoint
app.post('/api/db/seed', async (req: Request, res: Response) => {
  const client = getSupabase();
  if (!client) {
    res.status(400).json({
      ok: false,
      error: 'Cannot seed Supabase: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env.',
    });
    return;
  }

  try {
    const result = await seedDatabase(client);
    res.json({ ok: true, ...result });
  } catch (err: any) {
    console.error('Seeding error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Mount API Sub-Routers
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

// Razorpay & COD Standard Checkout direct endpoints
app.post('/api/create-order', handleCreateOrder);
app.post('/api/verify-payment', handleVerifyPayment);
app.post('/api/create-cod', handleCreateCodOrder);

// Auto-attempt seeding if Supabase is connected and empty
if (isSupabaseConfigured()) {
  const client = getSupabase();
  if (client) {
    (async () => {
      try {
        const { count } = await client
          .from('products')
          .select('id', { count: 'exact', head: true });
        if (count === 0 || count === null) {
          console.log('[Garuda Farms] Supabase connected with 0 products. Running automated seed...');
          const res = await seedDatabase(client);
          console.log(`[Garuda Farms] Auto-seed complete: ${res.message}`);
        } else {
          console.log(`[Garuda Farms] Supabase connected. Found ${count} products in database.`);
        }
      } catch (err: any) {
        console.warn('[Garuda Farms] Initial DB check:', err.message);
      }
    })();
  }
}

// Standalone Server listening (for non-Vercel environments like local dev or custom VPS)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  (async () => {
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, () => {
      console.log(`[Garuda Farms] Server running on http://localhost:${PORT}`);
    });
  })();
}

export default app;
