-- Migration: 007_smart_coupons_offers_reviews.sql
-- Description: Adds smart coupon rules, dynamic offer flags on products, and product reviews table.

-- 1. Smart Coupon Columns
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS first_order_only BOOLEAN DEFAULT FALSE;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS applicable_category TEXT DEFAULT 'All';
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS applicable_product_id BIGINT;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS per_customer_limit INT DEFAULT 1;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS used_count INT DEFAULT 0;

-- 2. Dynamic Offer Flags on Products
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_todays_deal BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS deal_price NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_fresh_arrival BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_special_offer BOOLEAN DEFAULT FALSE;

-- 3. Product Reviews Table
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  photo_url TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for product reviews query
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_status ON product_reviews(status);
