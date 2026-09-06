-- Add mapping to Supabase auth for customers and admin
ALTER TABLE IF EXISTS customers
  ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;

ALTER TABLE IF EXISTS admin_users
  ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE;

-- Optional: index for quick lookups
CREATE INDEX IF NOT EXISTS idx_customers_auth_id ON customers(auth_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- Note: Do NOT run this migration until you have backed up existing data.
-- This migration is additive and safe (adds nullable columns only).