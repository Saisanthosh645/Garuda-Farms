-- Migration 004: Ensure orders auth_id, razorpay_payment_id unique index, and RLS policies
BEGIN;

-- 1. Ensure auth_id column exists on orders table
ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS auth_id UUID;

-- 2. Create index on orders(auth_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_orders_auth_id'
  ) THEN
    CREATE INDEX idx_orders_auth_id ON orders (auth_id);
  END IF;
END$$;

-- 3. Create unique index on razorpay_payment_id to prevent duplicate payment processing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_orders_razorpay_payment_id_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_orders_razorpay_payment_id_unique 
    ON orders (razorpay_payment_id) 
    WHERE razorpay_payment_id IS NOT NULL;
  END IF;
END$$;

-- 4. Enable RLS and add customer select policy
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'orders_select_own_by_auth_id'
  ) THEN
    CREATE POLICY "orders_select_own_by_auth_id" ON orders FOR SELECT USING (auth_id::text = auth.uid() OR customer_id::text = auth.uid());
  END IF;
END$$;

COMMIT;
