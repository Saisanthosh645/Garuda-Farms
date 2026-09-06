import { Router, Request, Response } from 'express';
import { getSupabase } from '../db/supabase';
import { requireAdmin } from '../middleware/auth';
import { CATEGORIES } from '../../src/data/products';
import { auditLog } from './admin';

const router = Router();

// In-memory categories fallback
let localCategories = [...CATEGORIES];

// GET /api/categories
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const client = getSupabase();

    if (client) {
      const { data: catData, error: catError } = await client
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (!catError && catData) {
        const { data: prodData } = await client.from('products').select('category').eq('is_active', true);
        const counts: Record<string, number> = {};
        if (prodData) {
          prodData.forEach((p) => {
            counts[p.category] = (counts[p.category] || 0) + 1;
          });
        }

        const formatted = catData
          .filter((c) => c.is_active !== false)
          .map((c) => ({
            id: c.id,
            name: c.name,
            icon: c.icon,
            description: c.description,
            imageUrl: c.image_url,
            displayOrder: c.display_order,
            isActive: c.is_active,
            count: counts[c.name] || 0,
          }));

        const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);
        const categoriesWithAll = [
          { id: 'all', name: 'All', icon: '🌾', count: totalCount },
          ...formatted,
        ];

        res.json({ ok: true, source: 'supabase', categories: categoriesWithAll });
        return;
      }
    }

    res.json({ ok: true, source: 'local_seeded', categories: localCategories });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/categories/admin — All categories including inactive (admin only)
router.get('/admin', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const client = getSupabase();
    if (!client) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

    const { data, error } = await client
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) { res.status(500).json({ ok: false, error: error.message }); return; }

    const { data: prodData } = await client.from('products').select('category');
    const counts: Record<string, number> = {};
    if (prodData) prodData.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });

    res.json({
      ok: true,
      categories: (data || []).map((c) => ({
        ...c,
        count: counts[c.name] || 0,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/categories (Admin Only)
router.post('/', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, name, icon, description, imageUrl, displayOrder } = req.body;
    const client = getSupabase();

    if (!name) {
      res.status(400).json({ ok: false, error: 'Category name is required.' });
      return;
    }

    const catId = id || name.toLowerCase().replace(/\s+/g, '-');

    if (client) {
      const { data, error } = await client
        .from('categories')
        .insert({
          id: catId,
          name,
          icon: icon || '🌾',
          description,
          image_url: imageUrl,
          display_order: displayOrder || 10,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }

      await auditLog(req.user.email, 'category.create', 'category', catId, { name });
      res.status(201).json({ ok: true, category: data, message: 'Category created in Supabase.' });
      return;
    }

    const newCat = { id: catId, name, icon: icon || '🌾', count: 0 };
    localCategories.push(newCat as any);
    res.status(201).json({ ok: true, category: newCat, message: 'Category created in local store.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT /api/categories/:id (Admin Only)
router.put('/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const client = getSupabase();
    if (!client) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

    const updates: any = { updated_at: new Date().toISOString() };
    const allowedFields: Record<string, string> = {
      name: 'name', icon: 'icon', description: 'description',
      imageUrl: 'image_url', displayOrder: 'display_order', isActive: 'is_active',
    };
    Object.entries(allowedFields).forEach(([jsField, dbField]) => {
      if (req.body[jsField] !== undefined) updates[dbField] = req.body[jsField];
    });

    const { data, error } = await client
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) { res.status(400).json({ ok: false, error: error.message }); return; }

    await auditLog(req.user.email, 'category.update', 'category', id, updates);
    res.json({ ok: true, category: data, message: 'Category updated.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/categories/:id — Soft disable (Admin Only)
router.delete('/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const client = getSupabase();
    if (!client) { res.status(500).json({ ok: false, error: 'Supabase not configured' }); return; }

    const { data, error } = await client
      .from('categories')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('name')
      .single();

    if (error) { res.status(400).json({ ok: false, error: error.message }); return; }

    await auditLog(req.user.email, 'category.disable', 'category', id, { name: data?.name });
    res.json({ ok: true, message: 'Category disabled (hidden from storefront).' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
