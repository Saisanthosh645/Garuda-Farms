-- ============================================================================
-- Migration 005: Admin Control Center — Additive Changes Only
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================================

BEGIN;

-- 1. Add user_id column to admin_users (maps Supabase Auth UUID to admin allowlist)
ALTER TABLE IF EXISTS admin_users
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Insert the two authorized admin emails (upsert safe — won't duplicate)
INSERT INTO admin_users (email, password_hash, name, is_active)
VALUES 
  ('garudafarms9427@gmail.com', 'supabase-auth-managed', 'Garuda Farms Admin', TRUE),
  ('raminisaisanthosh@gmail.com', 'supabase-auth-managed', 'Santhosh Admin', TRUE)
ON CONFLICT (email) DO UPDATE 
  SET is_active = TRUE, 
      name = EXCLUDED.name,
      updated_at = NOW();

-- 3. Create audit_logs table (record all admin actions)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,         -- e.g. 'product.update', 'order.status_change'
  entity_type TEXT,             -- e.g. 'product', 'order', 'category'
  entity_id TEXT,               -- the affected record ID
  details JSONB,                -- old/new values, description
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Ensure store_settings table has default keys
-- Store name, contact, delivery settings, homepage content
INSERT INTO store_settings (key, value) VALUES
  ('store_name',          '"Garuda Farms"'),
  ('store_tagline',       '"Farm Fresh, Delivered Pure"'),
  ('store_email',         '"garudafarms9427@gmail.com"'),
  ('store_phone',         '"+91 9876543210"'),
  ('store_whatsapp',      '"+91 9876543210"'),
  ('store_address',       '"Chevella, Rangareddy District, Telangana 501503"'),
  ('delivery_fee',        '49'),
  ('free_delivery_threshold', '499'),
  ('announcement_bar',    '"🌿 Free delivery on orders above ₹499 | Farm Fresh Products"'),
  ('announcement_active', 'true'),
  ('hero_title',          '"Pure. Organic. Farm-Fresh."'),
  ('hero_subtitle',       '"From Our Sanctuary to Your Table"'),
  ('hero_cta_text',       '"Shop Fresh Harvest"'),
  ('homepage_featured_category', '"Fresh A2 Milk & Dairy"')
ON CONFLICT (key) DO NOTHING;

-- 5. Add image_url column to order_items (for admin order detail view)
ALTER TABLE IF EXISTS order_items
  ADD COLUMN IF NOT EXISTS product_image TEXT;

-- 6. Ensure categories has is_active (already in schema but guard it)
ALTER TABLE IF EXISTS categories
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 7. Create index on audit_logs for quick recent lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_email ON audit_logs (admin_email);

COMMIT;
