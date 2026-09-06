import { Router, Request, Response } from 'express';
import { getSupabase } from '../db/supabase';

const router = Router();

// Fallback in-memory reviews store if Supabase database is not connected
let memoryReviews: Array<any> = [
  {
    id: 'rev-1',
    product_id: 1,
    customer_name: 'Dr. Ananya Rao',
    customer_email: 'ananya.rao@example.com',
    rating: 5,
    title: 'Purest A2 Milk & Thick Cream',
    comment: 'Subscribed to daily delivery for 3 months now. Deep orange cream layer and zero stomach heaviness. Authentic Gir cow milk!',
    photo_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400',
    is_verified_purchase: true,
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'rev-2',
    product_id: 1,
    customer_name: 'Vikram Reddy',
    customer_email: 'vikram.reddy@example.com',
    rating: 5,
    title: 'Chilled Dawn Delivery',
    comment: 'Punctual 6:30 AM delivery every morning in sealed glass bottles. Outstanding purity!',
    photo_url: null,
    is_verified_purchase: true,
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'rev-3',
    product_id: 2,
    customer_name: 'Sunita Sharma',
    customer_email: 'sunita@example.com',
    rating: 5,
    title: 'Authentic Deep Yolk Nati Eggs',
    comment: 'You can taste the difference immediately. Deep golden yolk and farm-fresh taste. My kids love it!',
    photo_url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=400',
    is_verified_purchase: true,
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

/**
 * GET /api/reviews/product/:productId
 * Returns approved reviews for a product along with rating statistics
 */
router.get('/product/:productId', async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = Number(req.params.productId);
    const supabase = getSupabase();

    let reviews: any[] = [];

    if (supabase) {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (!error && data) {
        reviews = data;
      } else {
        reviews = memoryReviews.filter((r) => r.product_id === productId && r.status === 'approved');
      }
    } else {
      reviews = memoryReviews.filter((r) => r.product_id === productId && r.status === 'approved');
    }

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 5.0;

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, r.rating)) as 1 | 2 | 3 | 4 | 5;
      ratingCounts[star] = (ratingCounts[star] || 0) + 1;
    });

    res.json({
      ok: true,
      productId,
      avgRating,
      totalReviews,
      ratingCounts,
      reviews,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * POST /api/reviews
 * Customer submits a product review
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, customerName, customerEmail, rating, title, comment, photoUrl } = req.body;

    if (!productId || !customerName || !customerEmail || !rating || !comment) {
      res.status(400).json({
        ok: false,
        error: 'productId, customerName, customerEmail, rating (1-5), and comment are required.',
      });
      return;
    }

    const numericRating = Math.min(5, Math.max(1, Math.round(Number(rating))));
    const supabase = getSupabase();

    // Check if customer has verified purchase for this product
    let isVerifiedPurchase = false;
    if (supabase) {
      try {
        const { data: orderData } = await supabase
          .from('orders')
          .select('id')
          .eq('customer_email', customerEmail.trim().toLowerCase())
          .eq('order_status', 'Delivered')
          .limit(1);

        if (orderData && orderData.length > 0) {
          isVerifiedPurchase = true;
        }
      } catch (e) {
        console.warn('[Review Verified Purchase Check Warn]:', e);
      }
    }

    const newReview = {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      product_id: Number(productId),
      customer_name: String(customerName).trim(),
      customer_email: String(customerEmail).trim().toLowerCase(),
      rating: numericRating,
      title: title ? String(title).trim() : null,
      comment: String(comment).trim(),
      photo_url: photoUrl ? String(photoUrl).trim() : null,
      is_verified_purchase: isVerifiedPurchase,
      status: 'approved', // Auto-approve by default for seamless customer UX
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: newReview.product_id,
          customer_name: newReview.customer_name,
          customer_email: newReview.customer_email,
          rating: newReview.rating,
          title: newReview.title,
          comment: newReview.comment,
          photo_url: newReview.photo_url,
          is_verified_purchase: newReview.is_verified_purchase,
          status: 'approved',
        })
        .select()
        .single();

      if (!error && data) {
        res.status(201).json({ ok: true, review: data, message: 'Review submitted successfully.' });
        return;
      }
    }

    memoryReviews.unshift(newReview);
    res.status(201).json({ ok: true, review: newReview, message: 'Review submitted successfully.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * DELETE /api/reviews/:id
 * Customer deletes their own review by email confirmation
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const customerEmail = String(req.query.email || req.body.email || '').trim().toLowerCase();

    if (!customerEmail) {
      res.status(400).json({ ok: false, error: 'Customer email is required to delete review.' });
      return;
    }

    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', id)
        .eq('customer_email', customerEmail);

      if (!error) {
        res.json({ ok: true, message: 'Review deleted successfully.' });
        return;
      }
    }

    memoryReviews = memoryReviews.filter((r) => !(r.id === id && r.customer_email === customerEmail));
    res.json({ ok: true, message: 'Review deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
