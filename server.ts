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
import paymentsRoutes, { handleCreateOrder, handleVerifyPayment, handleTestPayment } from './server/routes/payments';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
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

  // Razorpay Standard Checkout direct endpoints
  app.post('/api/create-order', handleCreateOrder);
  app.post('/api/verify-payment', handleVerifyPayment);
  app.post('/api/test-payment', handleTestPayment);

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
