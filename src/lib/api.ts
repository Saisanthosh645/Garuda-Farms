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
  error?: string;
  is_key_expired?: boolean;
}

export interface RazorpayVerifyResponse {
  ok: boolean;
  verified: boolean;
  message?: string;
  error?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
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
  }): Promise<Product[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.category && params.category !== 'All') searchParams.set('category', params.category);
      if (params?.search) searchParams.set('search', params.search);
      if (params?.featured) searchParams.set('featured', 'true');
      if (params?.sort) searchParams.set('sort', params.sort);

      const res = await fetch(`/api/products?${searchParams.toString()}`);
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      return data.products || PRODUCTS;
    } catch {
      // Graceful fallback to static 50 products if offline or server booting
      return PRODUCTS;
    }
  },

  async getProduct(id: number | string): Promise<Product | null> {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error('Product not found');
      const data = await res.json();
      return data.product;
    } catch {
      return PRODUCTS.find((p) => String(p.id) === String(id)) || null;
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

  // 4. Admin Auth
  async loginAdmin(email: string, password: string): Promise<{ ok: boolean; token?: string; admin?: AdminUser; error?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async getAdminMe(token?: string): Promise<{ ok: boolean; admin?: AdminUser; error?: string }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/auth/me', { headers });
    return res.json();
  },

  async logoutAdmin(): Promise<{ ok: boolean }> {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    return res.json();
  },

  // 5. Razorpay Payments
  async createRazorpayOrder(
    amountInPaise: number,
    currency: string = 'INR',
    receipt?: string,
    notes?: Record<string, any>
  ): Promise<RazorpayOrderResponse> {
    const res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amountInPaise, currency, receipt, notes }),
    });
    return res.json();
  },

  async verifyRazorpayPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    custom_order_id?: string;
  }): Promise<RazorpayVerifyResponse> {
    const res = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async simulateTestPayment(payload: {
    amountInPaise: number;
    order_id?: string;
    receipt?: string;
    custom_order_id?: string;
  }): Promise<{
    ok: boolean;
    verified: boolean;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    key_id: string;
    amount: number;
    currency: string;
    receipt: string;
    error?: string;
  }> {
    const res = await fetch('/api/test-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
