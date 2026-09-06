import { Product, ProductCategory } from '../types';
import { PRODUCTS, CATEGORIES } from '../data/products';

export interface HealthCheckResponse {
  status: string;
  service: string;
  environment: string;
  database: {
    provider: string;
    configured: boolean;
    connected: boolean;
    statusMessage: string;
  };
  auth: {
    singleAdminConfigured: boolean;
    adminEmail: string;
  };
  payments: {
    razorpayConfigured: boolean;
    mode: string;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

export interface RazorpayOrderResponse {
  ok: boolean;
  order_id?: string;
  amount?: number;
  currency?: string;
  key_id?: string;
  receipt?: string;
  calculatedTotal?: number;
  subtotal?: number;
  deliveryFee?: number;
  discount?: number;
  error?: string;
}

export interface RazorpayVerifyResponse {
  ok: boolean;
  verified: boolean;
  message?: string;
  error?: string;
  orderId?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const { supabase } = await import('./supabaseClient');
    const { data } = await supabase.auth.getSession();
    const token = (data as any)?.session?.access_token;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch (e) {
    // ignore
  }
  return headers;
}

export const api = {
  // 1. Health & Status
  async getHealth(): Promise<HealthCheckResponse> {
    const res = await fetch('/api/health');
    return res.json();
  },

  async getDbStatus(): Promise<any> {
    const res = await fetch('/api/db/status');
    return res.json();
  },

  async seedDatabase(): Promise<any> {
    const res = await fetch('/api/db/seed', { method: 'POST' });
    return res.json();
  },

  // 2. Products
  async getProducts(params?: {
    category?: ProductCategory | 'All';
    search?: string;
    featured?: boolean;
    sort?: string;
    active_only?: boolean;
  }): Promise<Product[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.category && params.category !== 'All') searchParams.set('category', params.category);
      if (params?.search) searchParams.set('search', params.search);
      if (params?.featured) searchParams.set('featured', 'true');
      if (params?.sort) searchParams.set('sort', params.sort);
      if (params?.active_only === false) searchParams.set('active_only', 'false');

      const res = await fetch(`/api/products?${searchParams.toString()}`);
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      return data.products || PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  },


  async getProduct(id: number | string): Promise<Product | null> {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.product || null;
    } catch {
      return null;
    }
  },

  // 3. Categories
  async getCategories(): Promise<typeof CATEGORIES> {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Categories fetch failed');
      const data = await res.json();
      return data.categories || CATEGORIES;
    } catch {
      return CATEGORIES;
    }
  },

  // 4. Admin Auth & Management
  async loginAdmin(email: string, password: string): Promise<{ ok: boolean; token?: string; admin?: AdminUser; error?: string }> {
    try {
      const { supabase } = await import('./supabaseClient');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: error.message };
      const session = (data as any)?.session;
      const user = (data as any)?.user;
      return {
        ok: true,
        token: session?.access_token,
        admin: user
          ? { id: user.id, email: user.email || '', name: (user.user_metadata as any)?.fullName || 'Garuda Admin', role: 'admin' }
          : undefined,
      };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Authentication failed' };
    }
  },

  async getAdminMe(token?: string): Promise<{ ok: boolean; admin?: AdminUser; error?: string }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/auth/me', { headers });
    return res.json();
  },

  // 5. Payments (Razorpay & COD)
  async createRazorpayOrder(payload: {
    items: Array<{ product_id: number; quantity: number; selected_weight?: string }>;
    couponCode?: string;
    receipt?: string;
    notes?: Record<string, any>;
  }): Promise<RazorpayOrderResponse> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (!text) return { ok: false, error: `Empty response (status ${res.status})` };
      try {
        return JSON.parse(text) as RazorpayOrderResponse;
      } catch (e) {
        return { ok: false, error: 'Invalid JSON response from server' };
      }
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Network error' };
    }
  },

  async verifyRazorpayPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    custom_order_id?: string;
    orderPayload?: any;
  }): Promise<RazorpayVerifyResponse> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (!text) return { ok: false, verified: false, error: `Empty response (status ${res.status})` };
      try {
        return JSON.parse(text) as RazorpayVerifyResponse;
      } catch (e) {
        return { ok: false, verified: false, error: 'Invalid JSON response from server' };
      }
    } catch (err: any) {
      return { ok: false, verified: false, error: err?.message || 'Network error' };
    }
  },

  async createCodOrder(orderPayload: any): Promise<any> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/payments/create-cod', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload),
      });

      const text = await res.text();
      if (!text) return { ok: false, error: `Empty response (status ${res.status})` };
      try {
        return JSON.parse(text);
      } catch (e) {
        return { ok: false, error: 'Invalid JSON response from server' };
      }
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Network error' };
    }
  },

  async validateSmartCoupon(payload: { code: string; subtotal: number; items?: any[]; customerEmail?: string }): Promise<{ ok: boolean; coupon?: any; discountAmount?: number; netTotal?: number; error?: string; message?: string }> {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (!text) return { ok: false, error: 'Empty response from server.' };
      try {
        return JSON.parse(text);
      } catch (e) {
        return { ok: false, error: 'Invalid JSON response from server.' };
      }
    } catch (err: any) {
      return { ok: false, error: err.message || 'Network error' };
    }
  },

  async getProductReviews(productId: number): Promise<{ ok: boolean; productId?: number; avgRating?: number; totalReviews?: number; ratingCounts?: Record<number, number>; reviews?: any[]; error?: string }> {
    try {
      const res = await fetch(`/api/reviews/product/${productId}`);
      const text = await res.text();
      if (!text) return { ok: false, error: 'Empty response' };
      return JSON.parse(text);
    } catch (err: any) {
      return { ok: false, error: err.message || 'Network error' };
    }
  },

  async submitProductReview(payload: { productId: number; customerName: string; customerEmail: string; rating: number; title?: string; comment: string; photoUrl?: string }): Promise<{ ok: boolean; review?: any; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (!text) return { ok: false, error: 'Empty response' };
      return JSON.parse(text);
    } catch (err: any) {
      return { ok: false, error: err.message || 'Network error' };
    }
  },

  async deleteProductReview(reviewId: string, customerEmail: string): Promise<{ ok: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`/api/reviews/${reviewId}?email=${encodeURIComponent(customerEmail)}`, {
        method: 'DELETE',
      });
      const text = await res.text();
      if (!text) return { ok: false, error: 'Empty response' };
      return JSON.parse(text);
    } catch (err: any) {
      return { ok: false, error: err.message || 'Network error' };
    }
  },

  async getAdminReviews(statusFilter?: string): Promise<{ ok: boolean; reviews?: any[]; error?: string }> {
    const headers = await getAuthHeader();
    const params = statusFilter && statusFilter !== 'All' ? `?status=${encodeURIComponent(statusFilter)}` : '';
    try {
      const res = await fetch(`/api/admin/reviews${params}`, { headers });
      const text = await res.text();
      if (!text) return { ok: false, error: 'Empty response' };
      return JSON.parse(text);
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async updateAdminReviewStatus(reviewId: string, status: string): Promise<{ ok: boolean; review?: any; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status }),
      });
      const text = await res.text();
      if (!text) return { ok: false, error: 'Empty response' };
      return JSON.parse(text);
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async deleteAdminReview(reviewId: string): Promise<{ ok: boolean; message?: string; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers,
      });
      const text = await res.text();
      if (!text) return { ok: false, error: 'Empty response' };
      return JSON.parse(text);
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async updateProductDynamicOffers(productId: number, payload: { is_todays_deal?: boolean; deal_price?: number; is_fresh_arrival?: boolean; is_best_seller?: boolean; is_special_offer?: boolean }): Promise<{ ok: boolean; product?: any; message?: string; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch(`/api/admin/products/${productId}/dynamic-offers`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (!text) return { ok: false, error: 'Empty response' };
      return JSON.parse(text);
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async trackOrder(query: string): Promise<{ ok: boolean; order?: any; currentStatus?: string; paymentStatus?: string; createdAt?: string; updatedAt?: string; history?: any[]; matchingOrders?: any[]; error?: string }> {
    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(query)}`);
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message || 'Network error' };
    }
  },

  // 6. Admin Panel Order & Inventory Endpoints
  async getAdminOrders(status?: string, search?: string): Promise<{ ok: boolean; orders?: any[]; error?: string }> {
    const headers = await getAuthHeader();
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (search) params.set('search', search);

    try {
      const res = await fetch(`/api/orders/admin?${params.toString()}`, { headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async getAdminOrderStats(): Promise<{ ok: boolean; stats?: any; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/orders/admin/stats', { headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async updateOrderStatus(orderId: string, order_status: string, payment_status?: string): Promise<{ ok: boolean; order?: any; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch(`/api/orders/admin/${orderId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ order_status, payment_status }),
      });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async updateProduct(id: number, payload: any): Promise<{ ok: boolean; product?: any; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok && typeof window !== 'undefined') {
        window.dispatchEvent(new Event('garuda_products_updated'));
        try {
          localStorage.setItem('garuda_products_sync', Date.now().toString());
        } catch {}
      }
      return data;
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async createProduct(payload: any): Promise<{ ok: boolean; product?: any; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async createCategory(payload: any): Promise<{ ok: boolean; category?: any; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async updateCategory(id: string, payload: any): Promise<{ ok: boolean; category?: any; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async deleteCategory(id: string): Promise<{ ok: boolean; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE', headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async getAdminCategories(): Promise<{ ok: boolean; categories?: any[]; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/categories/admin', { headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async deleteProduct(id: number): Promise<{ ok: boolean; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE', headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  // Admin Stats
  async getAdminStats(): Promise<{ ok: boolean; stats?: any; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/admin/stats', { headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  // Admin Me
  async getAdminIdentity(): Promise<{ ok: boolean; admin?: any; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/admin/me', { headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  // Customers
  async getCustomers(search?: string, page?: number): Promise<{ ok: boolean; customers?: any[]; error?: string }> {
    const headers = await getAuthHeader();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (page) params.set('page', String(page));
    try {
      const res = await fetch(`/api/admin/customers?${params.toString()}`, { headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  // Coupons
  async getCoupons(): Promise<{ ok: boolean; coupons?: any[]; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/admin/coupons', { headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async createCoupon(payload: any): Promise<{ ok: boolean; coupon?: any; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST', headers, body: JSON.stringify(payload),
      });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async updateCoupon(id: string, payload: any): Promise<{ ok: boolean; coupon?: any; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PUT', headers, body: JSON.stringify(payload),
      });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async deleteCoupon(id: string): Promise<{ ok: boolean; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE', headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  // Store Settings
  async getStoreSettings(): Promise<{ ok: boolean; settings?: Record<string, any>; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/admin/store-settings', { headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async updateStoreSettings(updates: Record<string, any>): Promise<{ ok: boolean; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/admin/store-settings', {
        method: 'PUT', headers, body: JSON.stringify(updates),
      });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  // Image Upload
  async uploadImage(file: File): Promise<{ ok: boolean; url?: string; error?: string }> {
    try {
      const { supabase } = await import('./supabaseClient');
      const { data } = await supabase.auth.getSession();
      const token = (data as any)?.session?.access_token;
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  // Audit Logs
  async getAuditLogs(): Promise<{ ok: boolean; logs?: any[]; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/admin/audit-logs', { headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  // ==========================================
  // CUSTOMER ACCOUNT & E-COMMERCE ENDPOINTS
  // ==========================================

  // Customer Profile
  async getProfile(): Promise<{ ok: boolean; profile?: any; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/account/profile', { headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async updateProfile(payload: { full_name?: string; phone?: string; avatar_url?: string; dob?: string; gender?: string }): Promise<{ ok: boolean; profile?: any; message?: string; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  // Address Book
  async getAddresses(): Promise<{ ok: boolean; addresses?: any[]; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/addresses', { headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async addAddress(payload: any): Promise<{ ok: boolean; address?: any; message?: string; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async updateAddress(id: string, payload: any): Promise<{ ok: boolean; address?: any; message?: string; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async deleteAddress(id: string): Promise<{ ok: boolean; message?: string; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE', headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async setDefaultAddress(id: string): Promise<{ ok: boolean; message?: string; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch(`/api/addresses/${id}/default`, { method: 'PATCH', headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  // Wishlist DB
  async getWishlist(): Promise<{ ok: boolean; productIds?: number[]; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/wishlist', { headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async addToWishlist(productId: number): Promise<{ ok: boolean; productId?: number; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers,
        body: JSON.stringify({ productId }),
      });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async removeFromWishlist(productId: number): Promise<{ ok: boolean; productId?: number; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch(`/api/wishlist/${productId}`, { method: 'DELETE', headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  // Customer Order Cancellation, Reorder & Tracking
  async cancelOrder(orderId: string): Promise<{ ok: boolean; order?: any; message?: string; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST', headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async reorderItems(orderId: string): Promise<{ ok: boolean; items?: any[]; unavailable?: string[]; message?: string; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch(`/api/orders/${orderId}/reorder`, { method: 'POST', headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async getOrderTracking(orderId: string): Promise<{ ok: boolean; currentStatus?: string; paymentStatus?: string; createdAt?: string; history?: any[]; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch(`/api/orders/${orderId}/tracking`, { headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  // Notifications
  async getNotifications(): Promise<{ ok: boolean; notifications?: any[]; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/notifications', { headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async markNotificationAsRead(id: string): Promise<{ ok: boolean; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH', headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async markAllNotificationsRead(): Promise<{ ok: boolean; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'PATCH', headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  // Support Tickets
  async getSupportTickets(): Promise<{ ok: boolean; tickets?: any[]; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/support/tickets', { headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  async createSupportTicket(payload: { subject: string; category?: string; message: string; order_id?: string }): Promise<{ ok: boolean; ticket?: any; message?: string; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  // Orders (customer-facing)
  async getOrders(): Promise<{ ok: boolean; orders?: any[]; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/orders', { headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  // Active Coupons for customers
  async getActiveCoupons(): Promise<{ ok: boolean; coupons?: any[]; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/coupons/active', { headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  // Send password reset email via Supabase Auth
  async sendPasswordReset(email: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const { supabase } = await import('./supabaseClient');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/account?tab=security`,
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  },

  // ─── Delivery Engine API Methods ────────────────────────────────────────────────
  async calculateDeliveryFee(pincode: string, subtotal: number): Promise<{
    ok: boolean;
    serviceable: boolean;
    pincode?: string;
    locationName?: string;
    distanceKm?: number;
    ratePerKm?: number;
    calculatedFee?: number;
    finalFee?: number;
    isFreeDelivery?: boolean;
    freeShippingThreshold?: number;
    amountNeededForFreeDelivery?: number;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/delivery/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode, subtotal }),
      });
      const text = await res.text();
      if (!text) return { ok: false, serviceable: false, error: 'Empty response' };
      return JSON.parse(text);
    } catch (err: any) {
      return { ok: false, serviceable: false, error: err.message || 'Network error' };
    }
  },

  async getServiceablePincodes(): Promise<{
    ok: boolean;
    pincodes?: Array<{ pincode: string; area_name: string; distance_km: number; is_enabled: boolean }>;
    ratePerKm?: number;
    freeThreshold?: number;
    originAddress?: string;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/delivery/pincodes');
      const text = await res.text();
      if (!text) return { ok: false, error: 'Empty response' };
      return JSON.parse(text);
    } catch (err: any) {
      return { ok: false, error: err.message || 'Network error' };
    }
  },

  async getAdminDeliverySettings(): Promise<{ ok: boolean; settings?: { ratePerKm: number; freeThreshold: number; originAddress: string; originPincode: string }; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/admin/delivery/settings', { headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message || 'Network error' };
    }
  },

  async updateAdminDeliverySettings(settings: { ratePerKm: number; freeThreshold: number; originAddress: string; originPincode?: string }): Promise<{ ok: boolean; message?: string; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/admin/delivery/settings', {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message || 'Network error' };
    }
  },

  async getAdminPincodes(): Promise<{ ok: boolean; pincodes?: any[]; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/admin/delivery/pincodes', { headers });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message || 'Network error' };
    }
  },

  async addAdminPincode(payload: { pincode: string; area_name: string; distance_km: number; is_enabled?: boolean }): Promise<{ ok: boolean; pincode?: any; message?: string; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch('/api/admin/delivery/pincodes', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message || 'Network error' };
    }
  },

  async updateAdminPincode(id: string, payload: { pincode?: string; area_name?: string; distance_km?: number; is_enabled?: boolean }): Promise<{ ok: boolean; pincode?: any; message?: string; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch(`/api/admin/delivery/pincodes/${id}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message || 'Network error' };
    }
  },

  async deleteAdminPincode(id: string): Promise<{ ok: boolean; message?: string; error?: string }> {
    const headers = await getAuthHeader();
    try {
      const res = await fetch(`/api/admin/delivery/pincodes/${id}`, {
        method: 'DELETE',
        headers,
      });
      return res.json();
    } catch (err: any) {
      return { ok: false, error: err.message || 'Network error' };
    }
  },
};

