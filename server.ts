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

async function startServer() {
  const app = express();
  const PORT = 3000;

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
  // Orders API
  app.use('/api/orders', ordersRoutes);
  // Admin Control Center API
  app.use('/api/admin', adminRoutes);
  // Customer Account & Profile APIs
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

        // Run schema migrations to add any new columns introduced by server routes
        try {
          const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

          if (supabaseUrl && serviceKey) {
            // Use the Supabase REST SQL endpoint to run DDL migrations
            const migrationSql = `
              ALTER TABLE orders ADD COLUMN IF NOT EXISTS auth_id UUID;
              ALTER TABLE customers ADD COLUMN IF NOT EXISTS auth_id UUID;
              ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dob DATE;
              ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'Prefer not to say';
              ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
              CREATE TABLE IF NOT EXISTS customer_addresses (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                full_name TEXT NOT NULL,
                phone TEXT NOT NULL,
                address_line TEXT NOT NULL,
                city TEXT NOT NULL,
                state TEXT NOT NULL DEFAULT 'Telangana',
                pincode TEXT NOT NULL,
                label TEXT NOT NULL DEFAULT 'Home',
                is_default BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
              );
              CREATE TABLE IF NOT EXISTS wishlist_items (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(user_id, product_id)
              );
              CREATE TABLE IF NOT EXISTS support_tickets (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                subject TEXT NOT NULL,
                category TEXT DEFAULT 'General',
                message TEXT NOT NULL,
                order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
                status TEXT NOT NULL DEFAULT 'Open',
                admin_reply TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
              );
              CREATE TABLE IF NOT EXISTS customer_notifications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT DEFAULT 'system',
                order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
                read BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW()
              );
            `;

            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`,
              },
              body: JSON.stringify({ sql: migrationSql }),
            });

            if (response.ok) {
              console.log('[Garuda Farms] Schema migrations applied successfully.');
            } else {
              // Fallback: try individual column addition via direct API calls
              // The RPC may not exist; try a simpler check
              console.log('[Garuda Farms] RPC migration endpoint not available, checking schema via table queries...');

              // Test if auth_id exists by trying to select it
              const { error: colCheck } = await client
                .from('orders')
                .select('auth_id')
                .limit(1);

              if (colCheck) {
                console.log('[Garuda Farms] auth_id column not yet in orders table. Please run the schema migration in Supabase SQL editor:');
                console.log('ALTER TABLE orders ADD COLUMN IF NOT EXISTS auth_id UUID;');
              } else {
                console.log('[Garuda Farms] auth_id column exists in orders table.');
              }
            }
          }
        } catch (migErr: any) {
          console.warn('[Garuda Farms] Schema migration check:', migErr.message);
        }
      })();
    }
  }


  // 4. Vite Middleware (Dev) vs Static Serving (Prod)
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Garuda Farms] Server running on http://0.0.0.0:${PORT}`);
  });
}

(async () => {
  try {
    await startServer();
  } catch (err) {
    console.error('[Garuda Farms] Server startup failed:', err);
    process.exit(1);
  }
})();
