import { SupabaseClient } from '@supabase/supabase-js';
import { PRODUCTS, CATEGORIES } from '../../src/data/products';

export interface SeedResult {
  categoriesSeeded: number;
  productsSeeded: number;
  adminCreated: boolean;
  settingsInitialized: boolean;
  message: string;
}

// Generate URL friendly slug
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function seedDatabase(client: SupabaseClient): Promise<SeedResult> {
  // Admins should be created and managed via Supabase Auth dashboard.
  // Do not create admin passwords in seed scripts.

  // 1. Seed / Upsert Categories
  const categoryRecords = CATEGORIES.filter(c => c.name !== 'All').map((cat, idx) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    description: `Finest single-origin ${cat.name.toLowerCase()} harvested sustainably from Garuda Farms sanctuaries.`,
    display_order: idx + 1,
    is_active: true,
  }));

  const { error: catError } = await client
    .from('categories')
    .upsert(categoryRecords, { onConflict: 'id' });

  if (catError) {
    throw new Error(`Failed to seed categories: ${catError.message}`);
  }

  // 2. Seed / Upsert 50 Products
  const productRecords = PRODUCTS.map((p) => {
    return {
      id: p.id,
      slug: `${slugify(p.name)}-${p.id}`,
      name: p.name,
      category: p.category,
      short_description: p.description.slice(0, 120) + '...',
      description: p.description,
      image: p.image,
      fallback_image: p.fallbackImage || null,
      images: [p.image],
      price: p.price,
      original_price: p.originalPrice,
      discount_percent: Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) || 0,
      unit: p.defaultWeight,
      sku: `GF-${p.category.substring(0, 3).toUpperCase()}-${String(p.id).padStart(3, '0')}`,
      stock_quantity: p.stock ? 75 : 0,
      is_in_stock: p.stock,
      low_stock_threshold: 15,
      rating: p.rating,
      reviews_count: p.reviews,
      available_weights: p.availableWeights,
      default_weight: p.defaultWeight,
      badge: p.badge || null,
      farm_origin: p.farmOrigin,
      is_featured: Boolean(p.featured),
      is_bestseller: p.badge?.toLowerCase().includes('bestseller') || false,
      is_new: p.badge?.toLowerCase().includes('new') || false,
      is_active: true,
      organic_cert: p.organicCert || 'Certified Natural & Sustainable',
      tags: p.tags,
      nutrition_highlights: p.nutritionHighlights || [],
      seo_title: `${p.name} | 100% Pure & Single-Origin | Garuda Farms`,
      seo_description: p.description,
    };
  });

  const { error: prodError } = await client
    .from('products')
    .upsert(productRecords, { onConflict: 'id' });

  if (prodError) {
    throw new Error(`Failed to seed products: ${prodError.message}`);
  }

  // 3. Admin account must be created in Supabase Auth manually in production.
  // The seed process will NOT create or seed admin passwords. Ensure an admin
  // user is created via the Supabase Dashboard and optionally mirrored in
  // the `admin_users` table with a `user_id` mapping.
  let adminCreated = false;

  // 4. Default Store Settings
  const defaultSettings = [
    {
      key: 'general',
      value: {
        store_name: 'Garuda Farms',
        tagline: 'Pure by Nature • Ethical by Choice • Grown with Care',
        support_email: 'support@garudafarms.com',
        support_phone: '+91 98669 29427',
        currency: 'INR',
        currency_symbol: '₹',
      },
    },
    {
      key: 'delivery',
      value: {
        base_delivery_charge: 40,
        free_delivery_threshold: 500,
        supported_pincodes: ['500032', '500081', '500033', '500084', '500019', '500008'],
        estimated_delivery_hours: 'Same-day morning (6:00 AM - 9:00 AM)',
      },
    },
    {
      key: 'tax',
      value: {
        gst_enabled: true,
        default_gst_percent: 5,
        tax_inclusive: true,
      },
    },
    {
      key: 'razorpay',
      value: {
        enabled: false,
        key_id: process.env.RAZORPAY_KEY_ID || '',
      },
    },
  ];

  await client
    .from('store_settings')
    .upsert(defaultSettings, { onConflict: 'key' });

  return {
    categoriesSeeded: categoryRecords.length,
    productsSeeded: productRecords.length,
    adminCreated,
    settingsInitialized: true,
    message: `Successfully migrated ${productRecords.length} products and ${categoryRecords.length} categories into Supabase PostgreSQL.`,
  };
}
