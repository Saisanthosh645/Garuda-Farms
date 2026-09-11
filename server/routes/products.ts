import { Router, Request, Response } from 'express';
import { getSupabase } from '../db/supabase';
import { requireAdmin } from '../middleware/auth';
import { PRODUCTS } from '../../src/data/products';
import { slugify } from '../db/seed';
import { auditLog } from './admin';

const router = Router();

// In-memory runtime cache/mirror of the 50 products when Supabase is not connected
let localProducts = [...PRODUCTS];

export function updateLocalStockQuantity(productId: number | string, newQuantity: number | null) {
  const pId = Number(productId);
  const idx = localProducts.findIndex((p) => Number(p.id) === pId);
  if (idx !== -1) {
    if (newQuantity === null) {
      localProducts[idx].stock = true;
      (localProducts[idx] as any).stockQuantity = null;
      (localProducts[idx] as any).stockType = 'unlimited';
    } else {
      const q = Math.max(0, Number(newQuantity));
      (localProducts[idx] as any).stockQuantity = q;
      (localProducts[idx] as any).stockType = 'quantity';
      localProducts[idx].stock = q > 0;
    }
  }
}

export function decrementLocalProductStock(productId: number | string, qtyPurchased: number) {
  const pId = Number(productId);
  const idx = localProducts.findIndex((p) => Number(p.id) === pId);
  if (idx !== -1) {
    const item = localProducts[idx] as any;
    const isUnl = item.stockType === 'unlimited' || item.stockQuantity === null;
    if (!isUnl) {
      const current = Number(item.stockQuantity ?? 75);
      const newQty = Math.max(0, current - qtyPurchased);
      item.stockQuantity = newQty;
      item.stockType = 'quantity';
      item.stock = newQty > 0;
      console.log(`[Local Stock Decremented] Product #${pId}: ${current} -> ${newQty}`);
    }
  }
}

// GET /api/products
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, featured, active_only, sort } = req.query;
    const client = getSupabase();

    if (client) {
      let query = client.from('products').select('*');

      if (category && category !== 'All') {
        query = query.eq('category', String(category));
      }

      if (featured === 'true') {
        query = query.eq('is_featured', true);
      }

      if (active_only !== 'false') {
        // Storefront: only show active AND in-stock products
        query = query.eq('is_active', true);
      }

      if (search) {
        query = query.ilike('name', `%${String(search)}%`);
      }

      // Sorting
      if (sort === 'price-asc') {
        query = query.order('price', { ascending: true });
      } else if (sort === 'price-desc') {
        query = query.order('price', { ascending: false });
      } else if (sort === 'rating') {
        query = query.order('rating', { ascending: false });
      } else {
        query = query.order('id', { ascending: true });
      }

      const { data, error } = await query;

      if (!error && data) {
        const formatted = data.map((p) => {
          const isUnl = p.stock_quantity === null || p.stock_quantity === undefined || p.stock_type === 'unlimited';
          const qty = isUnl ? null : Number(p.stock_quantity ?? 0);
          const isAvail = p.is_in_stock !== false;

          return {
            id: p.id,
            name: p.name,
            category: p.category,
            description: p.description,
            image: p.image,
            fallbackImage: p.fallback_image,
            price: Number(p.price),
            originalPrice: Number(p.original_price),
            rating: Number(p.rating),
            reviews: p.reviews_count,
            availableWeights: p.available_weights || ['Standard Pack'],
            defaultWeight: p.default_weight || 'Standard Pack',
            badge: p.badge,
            farmOrigin: p.farm_origin,
            stock: isUnl ? isAvail : (isAvail && qty !== null && qty > 0),
            stockType: isUnl ? 'unlimited' : 'quantity',
            stockQuantity: qty,
            featured: p.is_featured,
            hidden: p.is_hidden === true || p.is_active === false || (p as any).hidden === true,
            organicCert: p.organic_cert,
            tags: p.tags || [],
            nutritionHighlights: p.nutrition_highlights || [],
          };
        });

        const filteredSupabase = active_only !== 'false'
          ? formatted.filter((p) => !p.hidden)
          : formatted;

        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.json({
          ok: true,
          count: filteredSupabase.length,
          source: 'supabase',
          products: filteredSupabase,
        });
        return;
      }
    }

    // Fallback to in-memory 50 products if Supabase not configured or query errored
    let list = [...localProducts];

    if (active_only !== 'false') {
      // Storefront: hide unavailable and hidden products in local fallback too
      list = list.filter((p) => p.stock !== false && !p.hidden);
    }

    if (category && category !== 'All') {
      list = list.filter((p) => p.category === category);
    }

    if (featured === 'true') {
      list = list.filter((p) => p.featured);
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sort === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    const formattedLocal = list.map((p) => {
      const isUnl = p.stockType === 'unlimited' || p.stockQuantity === null || (p.stockQuantity === undefined && (p as any).stock_quantity === undefined);
      const rawQty = p.stockQuantity !== undefined ? p.stockQuantity : ((p as any).stock_quantity !== undefined ? (p as any).stock_quantity : (p.stock ? 75 : 0));
      const qty = isUnl ? null : (rawQty !== null ? Number(rawQty) : null);
      const isAvail = p.stock !== false;

      return {
        ...p,
        stock: isUnl ? isAvail : (isAvail && qty !== null && qty > 0),
        stockType: isUnl ? 'unlimited' : 'quantity',
        stockQuantity: qty,
        hidden: Boolean(p.hidden || (p as any).is_hidden),
      };
    });

    res.json({
      ok: true,
      count: formattedLocal.length,
      source: 'local_seeded',
      products: formattedLocal,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    const client = getSupabase();

    if (client) {
      const isNumeric = !isNaN(Number(idParam));
      let query = client.from('products').select('*');

      if (isNumeric) {
        query = query.eq('id', Number(idParam));
      } else {
        query = query.eq('slug', idParam);
      }

      const { data, error } = await query.single();
      if (!error && data) {
        res.json({
          ok: true,
          source: 'supabase',
          product: {
            id: data.id,
            name: data.name,
            category: data.category,
            description: data.description,
            image: data.image,
            fallbackImage: data.fallback_image,
            price: Number(data.price),
            originalPrice: Number(data.original_price),
            rating: Number(data.rating),
            reviews: data.reviews_count,
            availableWeights: data.available_weights,
            defaultWeight: data.default_weight,
            badge: data.badge,
            farmOrigin: data.farm_origin,
            stock: data.stock_quantity === null || data.stock_quantity === undefined
              ? data.is_in_stock !== false
              : data.is_in_stock !== false && Number(data.stock_quantity) > 0,
            stockType: data.stock_quantity === null || data.stock_quantity === undefined ? 'unlimited' : 'quantity',
            stockQuantity: data.stock_quantity,
            featured: data.is_featured,
            organicCert: data.organic_cert,
            tags: data.tags || [],
            nutritionHighlights: data.nutrition_highlights || [],
          },
        });
        return;
      }
    }

    const prod = localProducts.find((p) => String(p.id) === idParam);
    if (prod) {
      res.json({ ok: true, source: 'local_seeded', product: prod });
    } else {
      res.status(404).json({ ok: false, error: 'Product not found' });
    }
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/products/bulk-visibility (Admin Only)
router.post('/bulk-visibility', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { hidden } = req.body;
    const isHidden = Boolean(hidden);
    const client = getSupabase();

    if (client) {
      const { error } = await client
        .from('products')
        .update({
          is_active: !isHidden,
          updated_at: new Date().toISOString(),
        })
        .neq('id', 0);

      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }
    }

    localProducts.forEach((p) => {
      (p as any).hidden = isHidden;
      (p as any).is_active = !isHidden;
    });

    await auditLog(req.user.email, 'product.bulk_visibility', 'products', 'all', { hidden: isHidden });
    res.json({
      ok: true,
      message: isHidden ? 'All products are now hidden from the store.' : 'All products are now visible in the store.',
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/products (Admin Only)
router.post('/', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body;
    const client = getSupabase();

    if (!body.name || !body.category || !body.price) {
      res.status(400).json({ ok: false, error: 'Name, category, and price are required.' });
      return;
    }

    if (client) {
      const slug = `${slugify(body.name)}-${Date.now().toString().slice(-4)}`;

      // Fetch the max current product ID to prevent primary key sequence collision
      const { data: maxRows } = await client
        .from('products')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

      const maxId = maxRows && maxRows.length > 0 ? Number(maxRows[0].id) : 0;
      const nextId = maxId + 1;

      const productPayload: any = {
        id: nextId,
        slug,
        name: body.name,
        category: body.category,
        short_description: body.short_description || body.description?.slice(0, 120),
        description: body.description || body.name,
        image: body.image || 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
        price: body.price,
        original_price: body.originalPrice || body.price,
        available_weights: body.availableWeights || ['1kg'],
        default_weight: body.defaultWeight || '1kg',
        farm_origin: body.farmOrigin || 'Garuda Sanctuary, Chevella',
        is_in_stock: body.stockType === 'unlimited' ? true : (body.stockQuantity !== undefined && body.stockQuantity !== null ? Number(body.stockQuantity) > 0 : body.stock !== false),
        stock_quantity: body.stockType === 'unlimited' ? null : (body.stockQuantity !== undefined && body.stockQuantity !== null ? Number(body.stockQuantity) : null),
        is_featured: Boolean(body.featured),
        badge: body.badge || null,
        tags: body.tags || [],
        nutrition_highlights: body.nutritionHighlights || [],
      };

      let { data, error } = await client
        .from('products')
        .insert(productPayload)
        .select()
        .single();

      // Retry fallback without explicit ID if sequence was fixed, or with fallback ID
      if (error && (error.code === '23505' || error.message.includes('products_pkey'))) {
        delete productPayload.id;
        const retry = await client
          .from('products')
          .insert(productPayload)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }

      await auditLog(req.user.email, 'product.create', 'product', String(data.id), { name: data.name, price: data.price });
      res.status(201).json({ ok: true, product: data, message: 'Product created successfully.' });
      return;
    }

    // Local fallback
    const newId = Math.max(...localProducts.map((p) => p.id), 0) + 1;
    const newProduct = {
      id: newId,
      name: body.name,
      category: body.category,
      description: body.description || body.name,
      image: body.image || 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
      price: Number(body.price),
      originalPrice: Number(body.originalPrice || body.price),
      rating: 5.0,
      reviews: 0,
      availableWeights: body.availableWeights || ['1kg'],
      defaultWeight: body.defaultWeight || '1kg',
      badge: body.badge,
      farmOrigin: body.farmOrigin || 'Garuda Sanctuary',
      stock: body.stock !== false,
      featured: Boolean(body.featured),
      tags: body.tags || [],
    };
    localProducts.unshift(newProduct);

    res.status(201).json({ ok: true, product: newProduct, message: 'Product created in local store.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT /api/products/:id (Admin Only)
router.put('/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const body = req.body;
    const client = getSupabase();

    if (client) {
      const updates: any = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.price !== undefined) updates.price = Number(body.price);
      if (body.originalPrice !== undefined) updates.original_price = Number(body.originalPrice);
      if (body.stockType === 'unlimited') {
        updates.stock_quantity = null;
        updates.is_in_stock = true;
      } else if (body.stockQuantity !== undefined) {
        const qty = body.stockQuantity === null || body.stockQuantity === '' ? null : Number(body.stockQuantity);
        updates.stock_quantity = qty;
        if (qty !== null) updates.is_in_stock = qty > 0;
      }
      if (body.stock !== undefined && body.stockType !== 'unlimited' && body.stockQuantity === undefined) {
        updates.is_in_stock = Boolean(body.stock);
      }
      if (body.category !== undefined) updates.category = body.category;
      if (body.badge !== undefined) updates.badge = body.badge;
      if (body.featured !== undefined) updates.is_featured = Boolean(body.featured);
      if (body.hidden !== undefined) {
        updates.is_active = !body.hidden;
      }
      if (body.description !== undefined) updates.description = body.description;
      if (body.shortDescription !== undefined) updates.short_description = body.shortDescription;
      if (body.image !== undefined) updates.image = body.image;
      if (body.availableWeights !== undefined) updates.available_weights = body.availableWeights;
      if (body.defaultWeight !== undefined) updates.default_weight = body.defaultWeight;
      if (body.farmOrigin !== undefined) updates.farm_origin = body.farmOrigin;
      updates.updated_at = new Date().toISOString();

      const { data, error } = await client
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }

      // Keep local memory mirror updated as well
      const localIdx = localProducts.findIndex((p) => p.id === id);
      if (localIdx !== -1) {
        localProducts[localIdx] = {
          ...localProducts[localIdx],
          stock: data.stock_quantity === null || data.stock_quantity === undefined
            ? data.is_in_stock !== false
            : data.is_in_stock !== false && Number(data.stock_quantity) > 0,
          stockType: data.stock_quantity === null || data.stock_quantity === undefined ? 'unlimited' : 'quantity',
          stockQuantity: data.stock_quantity,
          price: Number(data.price),
          name: data.name,
          hidden: data.is_hidden === true || data.is_active === false,
        };
      }

      await auditLog(req.user.email, 'product.update', 'product', String(id), updates);
      res.json({ ok: true, product: data, message: 'Product updated in Supabase.' });
      return;
    }

    // Local update
    const idx = localProducts.findIndex((p) => p.id === id);
    if (idx !== -1) {
      localProducts[idx] = { ...localProducts[idx], ...body };
      res.json({ ok: true, product: localProducts[idx], message: 'Product updated in local store.' });
    } else {
      res.status(404).json({ ok: false, error: 'Product not found.' });
    }
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/products/:id (Admin Only)
router.delete('/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const client = getSupabase();

    if (client) {
      const { error } = await client.from('products').delete().eq('id', id);
      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }
      res.json({ ok: true, message: `Product ${id} deleted successfully.` });
      return;
    }

    localProducts = localProducts.filter((p) => p.id !== id);
    res.json({ ok: true, message: `Product ${id} deleted from local store.` });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
