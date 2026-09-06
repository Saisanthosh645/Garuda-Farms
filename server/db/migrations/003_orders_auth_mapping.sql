-- Migration 003: Add orders.auth_id mapping and tighten RLS for orders
-- Non-destructive: adds nullable auth_id, index, and safe RLS policies.

BEGIN;

-- 1) Add nullable auth_id column to orders to reference auth.users(id)
ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS auth_id UUID;

-- 2) Create index on orders(auth_id) for faster lookups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_orders_auth_id'
  ) THEN
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_auth_id ON orders (auth_id);
  END IF;
END$$;

-- 3) Add foreign key reference note (cannot create FK to auth schema safely in some hosted setups)
-- Optional FK (uncomment if your setup allows cross-schema foreign keys):
-- ALTER TABLE orders ADD CONSTRAINT fk_orders_auth_users FOREIGN KEY (auth_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4) Row Level Security: ensure authenticated users can SELECT their own orders via auth_id OR linked customers.auth_id
-- Keep client-side INSERT/UPDATE/DELETE blocked (only server/service role may perform those ops)

-- Allow selecting orders where orders.auth_id matches auth.uid()
CREATE POLICY IF NOT EXISTS "orders_select_own_by_auth_id" ON orders FOR SELECT USING (auth_id::text = auth.uid());

-- Prevent direct client-side INSERT/UPDATE/DELETE on orders
CREATE POLICY IF NOT EXISTS "orders_no_client_insert" ON orders FOR INSERT USING (false);
CREATE POLICY IF NOT EXISTS "orders_no_client_update" ON orders FOR UPDATE USING (false);
CREATE POLICY IF NOT EXISTS "orders_no_client_delete" ON orders FOR DELETE USING (false);

COMMIT;

-- Manual verification:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'auth_id';
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'orders';
