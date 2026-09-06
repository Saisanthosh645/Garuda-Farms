-- ============================================================================
-- Migration 006: Customer Account Center & E-Commerce Tables
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================================

BEGIN;

-- 1. CUSTOMER ADDRESSES TABLE (Address Book)
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT DEFAULT 'Telangana',
  pincode TEXT NOT NULL,
  label TEXT DEFAULT 'Home', -- 'Home', 'Work', 'Other'
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_user_id ON customer_addresses(user_id);

-- 2. WISHLIST ITEMS TABLE
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_product_wishlist UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);

-- 3. ORDER STATUS HISTORY TABLE (Audit log for order lifecycle)
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  changed_by TEXT DEFAULT 'System',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);

-- 4. CUSTOMER NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS customer_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'order', -- 'order', 'promo', 'system'
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_notifications_user_id ON customer_notifications(user_id);

-- 5. SUPPORT TICKETS TABLE
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  order_id TEXT,
  subject TEXT NOT NULL,
  category TEXT DEFAULT 'General', -- 'Order', 'Payment', 'Delivery', 'Product', 'General'
  message TEXT NOT NULL,
  status TEXT DEFAULT 'Open', -- 'Open', 'In Progress', 'Resolved'
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);

-- Enable RLS on all customer-owned tables
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Create owner-only RLS policies using auth.uid()
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'customer_addresses_owner') THEN
    CREATE POLICY customer_addresses_owner ON customer_addresses FOR ALL USING (user_id::text = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'wishlist_items_owner') THEN
    CREATE POLICY wishlist_items_owner ON wishlist_items FOR ALL USING (user_id::text = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'customer_notifications_owner') THEN
    CREATE POLICY customer_notifications_owner ON customer_notifications FOR ALL USING (user_id::text = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'support_tickets_owner') THEN
    CREATE POLICY support_tickets_owner ON support_tickets FOR ALL USING (user_id::text = auth.uid());
  END IF;
END $$;

COMMIT;
