-- ============================================================================
-- GARUDA FARMS — SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SINGLE ADMIN TABLE (Strictly 1 Admin Account)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'Garuda Admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    icon TEXT NOT NULL DEFAULT '🌾',
    description TEXT,
    image_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS TABLE (Direct migration of all 50 single-origin harvests)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL REFERENCES categories(name) ON UPDATE CASCADE ON DELETE RESTRICT,
    short_description TEXT,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    fallback_image TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    price NUMERIC(10,2) NOT NULL,
    original_price NUMERIC(10,2) NOT NULL,
    discount_percent INT DEFAULT 0,
    unit TEXT DEFAULT '1 Pack',
    sku TEXT,
    stock_quantity INT DEFAULT 100,
    is_in_stock BOOLEAN DEFAULT TRUE,
    low_stock_threshold INT DEFAULT 10,
    rating NUMERIC(3,2) DEFAULT 4.9,
    reviews_count INT DEFAULT 0,
    available_weights JSONB NOT NULL DEFAULT '["Standard Pack"]'::jsonb,
    default_weight TEXT NOT NULL DEFAULT 'Standard Pack',
    badge TEXT,
    farm_origin TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    organic_cert TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    nutrition_highlights JSONB DEFAULT '[]'::jsonb,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CUSTOMERS TABLE (Guest and Registered Accounts)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT, -- Null for guest customers
    name TEXT NOT NULL,
    phone TEXT,
    addresses JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. USER PROFILES (Recommended: map to Supabase auth.users.id)
-- This table is separate from the legacy `customers` table and is intended
-- to store profile information mapped to Supabase auth user IDs.
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY, -- should equal auth.users.id (Supabase)
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT NOT NULL,
    dob DATE,
    gender TEXT DEFAULT 'Prefer not to say',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for profiles and create simple owner policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Allow owners to select and update their own profiles
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id::text);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id::text) WITH CHECK (auth.uid() = id::text);

-- 5b. CUSTOMER ADDRESSES (Dedicated address book for authenticated users)
CREATE TABLE IF NOT EXISTS customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- references auth.users.id
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Telangana',
    pincode TEXT NOT NULL,
    label TEXT NOT NULL DEFAULT 'Home', -- 'Home', 'Work', 'Other'
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 5. INVENTORY LOGS (Audit trail for stock adjustments)
CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    quantity_changed INT NOT NULL,
    change_type TEXT NOT NULL, -- 'order_placed', 'order_cancelled', 'manual_adjustment', 'initial_seed'
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COUPONS TABLE
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
    discount_value NUMERIC(10,2) NOT NULL,
    minimum_order_amount NUMERIC(10,2) DEFAULT 0,
    maximum_discount_amount NUMERIC(10,2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDERS TABLE (Server-verified source of truth)
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, -- e.g. GF-12345
    auth_id UUID, -- Supabase auth.users.id of the ordering user (for RLS)
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT DEFAULT 'Telangana',
    pincode TEXT NOT NULL,
    delivery_slot TEXT,
    delivery_instructions TEXT,
    subtotal NUMERIC(10,2) NOT NULL,
    delivery_charge NUMERIC(10,2) DEFAULT 0,
    tax_amount NUMERIC(10,2) DEFAULT 0,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    coupon_code TEXT,
    total_amount NUMERIC(10,2) NOT NULL,
    payment_method TEXT NOT NULL, -- 'UPI', 'Card', 'COD', 'Razorpay'
    payment_status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Paid', 'Failed', 'Refunded'
    order_status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7b. ORDER STATUS HISTORY (Audit trail for tracking timeline)
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    changed_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- references auth.users.id
    subject TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    message TEXT NOT NULL,
    order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'Open', -- 'Open', 'In Progress', 'Resolved', 'Closed'
    admin_reply TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. CUSTOMER NOTIFICATIONS
CREATE TABLE IF NOT EXISTS customer_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- references auth.users.id
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'system', -- 'system', 'order', 'promo'
    order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security on orders: customers can select their own orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- Allow selecting orders where auth.uid() = customer_id
-- Note: customer_id should be stored as UUID text matching auth.uid()
CREATE POLICY "orders_select_own" ON orders FOR SELECT USING (customer_id::text = auth.uid());
-- Prevent customers from updating sensitive fields; allow updates only via server/service role
CREATE POLICY "orders_no_client_update" ON orders FOR UPDATE USING (false);


-- 8. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    selected_weight TEXT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    quantity INT NOT NULL,
    total_price NUMERIC(10,2) NOT NULL
);

-- 8b. WISHLIST ITEMS (User-saved product wishlist)
CREATE TABLE IF NOT EXISTS wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- references auth.users.id
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 8c. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_email TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. LEADS & CONTACT INQUIRIES
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'New', -- 'New', 'Contacted', 'Converted', 'Closed'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. STORE SETTINGS (Key-Value configuration)
CREATE TABLE IF NOT EXISTS store_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on sensitive tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- Note: When querying via backend Supabase Service Role Key, RLS is bypassed safely on the server.
-- Public read access can be allowed on active products and categories:
CREATE POLICY "Public products view" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public categories view" ON categories FOR SELECT USING (is_active = true);
