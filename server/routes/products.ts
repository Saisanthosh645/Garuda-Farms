import { Router, Request, Response } from 'express';
import { getSupabase } from '../db/supabase';
import { requireAdmin } from '../middleware/auth';
import { PRODUCTS } from '../../src/data/products';
import { slugify } from '../db/seed';

const router = Router();

// In-memory runtime cache/mirror of the 50 products when Supabase is not connected
let localProducts = [...PRODUCTS];

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
        // Map database columns to match customer frontend Product interface
        const formatted = data.map((p) => ({
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
          stock: p.is_in_stock,
          stockQuantity: p.stock_quantity,
          featured: p.is_featured,
          organicCert: p.organic_cert,
          tags: p.tags || [],
          nutritionHighlights: p.nutrition_highlights || [],
        }));

        res.json({
          ok: true,
          count: formatted.length,
          source: 'supabase',
          products: formatted,
        });
        return;
      }
    }

    // Fallback to in-memory 50 products if Supabase not configured or query errored
    let list = [...localProducts];

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

    res.json({
      ok: true,
      count: list.length,
      source: 'local_seeded',
      products: list,
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
            stock: data.is_in_stock,
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
      const { data, error } = await client
        .from('products')
        .insert({
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
          is_in_stock: body.stock !== false,
          stock_quantity: body.stockQuantity || 50,
          is_featured: Boolean(body.featured),
          badge: body.badge || null,
          tags: body.tags || [],
          nutrition_highlights: body.nutritionHighlights || [],
        })
        .select()
        .single();

      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }

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
      if (body.stock !== undefined) updates.is_in_stock = Boolean(body.stock);
      if (body.stockQuantity !== undefined) updates.stock_quantity = Number(body.stockQuantity);
      if (body.category !== undefined) updates.category = body.category;
      if (body.badge !== undefined) updates.badge = body.badge;
      if (body.featured !== undefined) updates.is_featured = Boolean(body.featured);
      if (body.description !== undefined) updates.description = body.description;
      if (body.image !== undefined) updates.image = body.image;
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
