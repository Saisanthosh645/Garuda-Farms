/**
 * Garuda Farms — DB Migration Script
 * Run once to add missing columns to existing Supabase database.
 * Usage: npx tsx server/db/migrate.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const migrations = [
  // Add auth_id to orders for linking orders to auth users
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS auth_id UUID`,
  // Add auth_id to customers table
  `ALTER TABLE customers ADD COLUMN IF NOT EXISTS auth_id UUID`,
  // Add extra profile columns
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dob DATE`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'Prefer not to say'`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT`,
  // Create wishlist_items table
  `CREATE TABLE IF NOT EXISTS wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
  )`,
  // Create customer_addresses table
  `CREATE TABLE IF NOT EXISTS customer_addresses (
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
  )`,
  // Create support_tickets table
  `CREATE TABLE IF NOT EXISTS support_tickets (
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
  )`,
  // Create customer_notifications table
  `CREATE TABLE IF NOT EXISTS customer_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'system',
    order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  // Create serviceable_pincodes table
  `CREATE TABLE IF NOT EXISTS serviceable_pincodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pincode VARCHAR(10) UNIQUE NOT NULL,
    area_name TEXT NOT NULL,
    distance_km NUMERIC(6,2) NOT NULL DEFAULT 10.0,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
];

async function runMigrations() {
  console.log(`🌾 Garuda Farms — Database Migration`);
  console.log(`📡 Connected to: ${SUPABASE_URL}`);
  console.log(`🔧 Running ${migrations.length} migration statements...\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < migrations.length; i++) {
    const sql = migrations[i].trim();
    const preview = sql.split('\n')[0].trim().substring(0, 80);
    
    try {
      // Use Supabase's rpc to run raw SQL (requires the exec_sql function to exist,
      // OR we run via the PostgreSQL-compatible REST endpoint)
      const { error } = await (supabase as any).rpc('exec_sql', { sql });
      
      if (error) {
        // Try via direct from() approach for DDL — not all methods support this
        // Log the SQL that needs to be run manually
        console.log(`⚠️  [${i + 1}] Manual migration needed:`);
        console.log(`    ${preview}`);
        console.log(`    Error: ${error.message}`);
        failCount++;
      } else {
        console.log(`✅ [${i + 1}] ${preview}`);
        successCount++;
      }
    } catch (err: any) {
      console.log(`⚠️  [${i + 1}] Requires manual execution: ${preview}`);
      failCount++;
    }
  }

  console.log(`\n📊 Migration Summary: ${successCount} applied, ${failCount} require manual SQL`);

  if (failCount > 0) {
    console.log(`\n🔴 Run these in Supabase SQL Editor (Dashboard → SQL Editor):`);
    console.log(`   https://supabase.com/dashboard/project/YOUR_PROJECT/sql\n`);
    migrations.forEach((sql, i) => {
      console.log(`-- Migration ${i + 1}`);
      console.log(sql.trim() + ';\n');
    });
  } else {
    console.log(`\n✨ All migrations applied successfully!`);
  }
}

runMigrations().catch(console.error);
