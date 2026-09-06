-- Safe migration: add nullable user_id column to admin_users to map to auth.users(id)
-- Non-destructive: adds column and unique index; does not populate data.

BEGIN;

-- 1) Add nullable UUID column for user mapping (if not exists)
ALTER TABLE IF EXISTS admin_users
  ADD COLUMN IF NOT EXISTS user_id UUID;

-- 2) Add a unique index to ensure only one admin user maps to an auth user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_admin_users_user_id_unique'
  ) THEN
    CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_admin_users_user_id_unique ON admin_users (user_id);
  END IF;
END$$;

-- NOTE: After running this migration, manually populate `user_id` for the single admin
-- by looking up the Supabase auth user's `id` and updating admin_users.user_id accordingly.
-- Example:
-- UPDATE admin_users SET user_id = '<SUPABASE_USER_ID>' WHERE email = 'admin@garudafarms.com';

COMMIT;
