-- Safe migration: add `auth_id` to `customers` to map legacy customers to Supabase `auth.users.id`
-- Non-destructive: adds nullable column, unique index, and an RLS-friendly policy for orders.

BEGIN;

-- 1) Add nullable UUID column for mapping to Supabase auth.users.id
ALTER TABLE IF EXISTS customers
  ADD COLUMN IF NOT EXISTS auth_id UUID;

-- 2) Create unique index on auth_id to prevent duplicate mappings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_customers_auth_id_unique'
  ) THEN
    CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_auth_id_unique ON customers (auth_id);
  END IF;
END$$;

-- 3) OPTIONAL: populate auth_id by matching customer email to auth.users email
-- WARNING: Run this only when you have verified that auth.users contains the expected emails
-- and that you are executing with the Supabase service_role key (required to read auth.users).
-- Example (safe):
-- UPDATE customers SET auth_id = u.id
-- FROM auth.users u
-- WHERE customers.email IS NOT NULL
--   AND u.email IS NOT NULL
--   AND customers.email = u.email
--   AND customers.auth_id IS NULL;

-- 4) RLS: Add a policy that allows selecting orders when the linked customer has a mapped auth_id
-- This complements the existing policy that checks orders.customer_id::text = auth.uid().
CREATE POLICY IF NOT EXISTS "orders_select_own_via_customers_auth" ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM customers c WHERE c.id = orders.customer_id AND c.auth_id::text = auth.uid()
    )
  );

COMMIT;

-- Manual verification steps:
-- 1) BACKUP your database or test on a staging copy.
-- 2) Run the optional UPDATE (above) to populate `customers.auth_id` using `auth.users` emails.
-- 3) Verify mapping:
--    SELECT id, email, auth_id FROM customers WHERE auth_id IS NOT NULL LIMIT 20;
-- 4) Test RLS by signing in as a known user and calling GET /api/orders to confirm orders are returned.
