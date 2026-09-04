import bcrypt from 'bcryptjs';
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
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@garudafarms.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'GarudaAdmin@2026!';

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

  // 3. Initialize Single Admin User (Enforcing exactly ONE admin account)
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  // Check if admin already exists
  const { data: existingAdmins } = await client
    .from('admin_users')
    .select('id, email')
    .limit(1);

  let adminCreated = false;
  if (!existingAdmins || existingAdmins.length === 0) {
    const { error: adminError } = await client
      .from('admin_users')
      .insert({
        email: adminEmail.toLowerCase().trim(),
        password_hash: passwordHash,
        name: 'Garuda Admin',
      });

    if (adminError) {
      throw new Error(`Failed to create admin user: ${adminError.message}`);
    }
    adminCreated = true;
  } else {
    // If admin already exists, update email/password if configured
    const currentAdminId = existingAdmins[0].id;
    await client
      .from('admin_users')
      .update({
        email: adminEmail.toLowerCase().trim(),
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentAdminId);
  }

  // 4. Default Store Settings
  const defaultSettings = [
    {
      key: 'general',
      value: {
        store_name: 'Garuda Farms',
        tagline: 'Pure by Nature • Ethical by Choice • Grown with Care',
        support_email: 'support@garudafarms.com',
        support_phone: '+91 98490 12345',
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
