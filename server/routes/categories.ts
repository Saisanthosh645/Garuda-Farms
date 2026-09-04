import { Router, Request, Response } from 'express';
import { getSupabase } from '../db/supabase';
import { requireAdmin } from '../middleware/auth';
import { CATEGORIES } from '../../src/data/products';

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
        // Fetch counts for each category
        const { data: prodData } = await client.from('products').select('category');
        const counts: Record<string, number> = {};
        if (prodData) {
          prodData.forEach((p) => {
            counts[p.category] = (counts[p.category] || 0) + 1;
          });
        }

        const formatted = catData.map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          description: c.description,
          imageUrl: c.image_url,
          displayOrder: c.display_order,
          isActive: c.is_active,
          count: counts[c.name] || 0,
        }));

        // Add 'All' category at start
        const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);
        const categoriesWithAll = [
          { id: 'all', name: 'All', icon: '🌾', count: totalCount },
          ...formatted,
        ];

        res.json({
          ok: true,
          source: 'supabase',
          categories: categoriesWithAll,
        });
        return;
      }
    }

    res.json({
      ok: true,
      source: 'local_seeded',
      categories: localCategories,
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

      res.status(201).json({ ok: true, category: data, message: 'Category created in Supabase.' });
      return;
    }

    const newCat = {
      id: catId,
      name,
      icon: icon || '🌾',
      count: 0,
    };
    localCategories.push(newCat as any);
    res.status(201).json({ ok: true, category: newCat, message: 'Category created in local store.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
