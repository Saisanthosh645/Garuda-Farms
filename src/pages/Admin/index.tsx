// Garuda Farms Admin Panel v1.1.0 — Analytics & Control Center
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabaseClient';
import { signOut } from '../../lib/frontendAuth';
import {
  LayoutDashboard, Package, Layers, ShoppingBag, Users, Tag, Home, Settings,
  LogOut, RefreshCw, Plus, Edit2, Trash2, Eye, Search, Filter, Check, X,
  AlertCircle, CheckCircle2, Upload, Image, ToggleLeft, ToggleRight,
  ChevronDown, ChevronUp, ArrowLeft, IndianRupee, TrendingUp, Clock,
  Truck, Star, Shield, Activity, BarChart3, Bell, Save, RotateCcw,
  ExternalLink, FileText, Lock
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
type AdminSection =
  | 'dashboard' | 'products' | 'categories' | 'orders'
  | 'customers' | 'coupons' | 'offers' | 'reviews' | 'delivery' | 'settings' | 'audit';

interface Toast { id: number; type: 'success' | 'error' | 'info'; message: string; }

// ─── Toast System ─────────────────────────────────────────────────────────────
let toastCounter = 0;
function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((type: Toast['type'], message: string) => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  return { toasts, show };
}

function notifyProductsUpdated() {
  window.dispatchEvent(new Event('garuda_products_updated'));
  try { localStorage.setItem('garuda_products_sync', String(Date.now())); } catch {}
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-800',
    Confirmed: 'bg-blue-100 text-blue-800',
    Processing: 'bg-indigo-100 text-indigo-800',
    Packed: 'bg-purple-100 text-purple-800',
    Shipped: 'bg-cyan-100 text-cyan-800',
    'Out for Delivery': 'bg-orange-100 text-orange-800',
    Delivered: 'bg-emerald-100 text-emerald-800',
    Cancelled: 'bg-red-100 text-red-800',
    Paid: 'bg-emerald-100 text-emerald-800',
    Failed: 'bg-red-100 text-red-800',
    COD: 'bg-amber-100 text-amber-800',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${map[status] || 'bg-stone-100 text-stone-700'}`}>
      {status}
    </span>
  );
}

// ─── SECTION: Dashboard & Analytics ───────────────────────────────────────────
function RevenueTrendChart({ dailyTrends, metric }: { dailyTrends: any[]; metric: 'revenue' | 'orders' }) {
  const [hoverPoint, setHoverPoint] = useState<any | null>(null);

  if (!dailyTrends || dailyTrends.length === 0) {
    return <div className="h-48 flex items-center justify-center text-xs text-stone-400">No chart data available</div>;
  }

  const values = dailyTrends.map((d) => (metric === 'revenue' ? Number(d.revenue || 0) : Number(d.orders || 0)));
  const maxVal = Math.max(...values, 10);

  const width = 800;
  const height = 220;
  const paddingX = 45;
  const paddingY = 30;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const points = dailyTrends.map((d, i) => {
    const x = paddingX + (i / Math.max(1, dailyTrends.length - 1)) * chartW;
    const val = metric === 'revenue' ? Number(d.revenue || 0) : Number(d.orders || 0);
    const y = height - paddingY - (val / maxVal) * chartH;
    return { x, y, val, label: d.label, date: d.date, raw: d };
  });

  const pathD = points.reduce((acc, p, i, a) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = a[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  const gridRatios = [0, 0.33, 0.66, 1];

  return (
    <div className="relative w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[550px] overflow-visible">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2D6A4F" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2D6A4F" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {gridRatios.map((ratio, i) => {
          const y = height - paddingY - ratio * chartH;
          const val = Math.round(maxVal * ratio);
          return (
            <g key={i}>
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#f5f5f4" strokeDasharray="3 3" strokeWidth="1.5" />
              <text x={paddingX - 8} y={y + 3} textAnchor="end" className="text-[9px] fill-stone-400 font-mono">
                {metric === 'revenue' ? `₹${val.toLocaleString('en-IN')}` : val}
              </text>
            </g>
          );
        })}

        <path d={areaD} fill="url(#chartGrad)" />
        <path d={pathD} fill="none" stroke="#2D6A4F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <g key={i} className="group cursor-pointer" onMouseEnter={() => setHoverPoint(p)} onMouseLeave={() => setHoverPoint(null)}>
            <circle cx={p.x} cy={p.y} r="4.5" className="fill-white stroke-[#2D6A4F] stroke-[2.5] group-hover:r-6 group-hover:stroke-emerald-600 transition-all" />
            {i % Math.ceil(dailyTrends.length / 7) === 0 && (
              <text x={p.x} y={height - 8} textAnchor="middle" className="text-[10px] fill-stone-500 font-medium">
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>

      {hoverPoint && (
        <div
          className="absolute z-30 bg-stone-900/95 text-white text-xs rounded-xl px-3 py-2 shadow-2xl pointer-events-none -translate-x-1/2 -translate-y-[120%] border border-stone-700 backdrop-blur-md transition-all"
          style={{ left: `${(hoverPoint.x / width) * 100}%`, top: `${(hoverPoint.y / height) * 100}%` }}
        >
          <p className="font-bold text-stone-300 text-[10px] uppercase tracking-wider">{hoverPoint.label} ({hoverPoint.date})</p>
          <p className="text-emerald-400 font-black mt-0.5 text-sm">
            {metric === 'revenue' ? `₹${hoverPoint.val.toLocaleString('en-IN')}` : `${hoverPoint.val} orders`}
          </p>
          {metric === 'revenue' && (
            <p className="text-[10px] text-stone-400">{hoverPoint.raw.orders} orders ({hoverPoint.raw.paidOrders} paid)</p>
          )}
        </div>
      )}
    </div>
  );
}

function DashboardSection({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');

  const loadData = useCallback(async (selectedDays = days) => {
    setLoading(true);
    const [sRes, aRes] = await Promise.all([
      api.getAdminStats(),
      api.getAdminAnalytics(selectedDays),
    ]);

    if (sRes.ok) setStats(sRes.stats);
    else toast.show('error', sRes.error || 'Failed to load stats');

    if (aRes.ok) setAnalytics(aRes.analytics);
    else toast.show('error', aRes.error || 'Failed to load analytics');

    setLoading(false);
  }, [days, toast]);

  useEffect(() => {
    loadData(days);
  }, [days]);

  const cards = stats ? [
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', sub: `${stats.todayOrders || 0} today` },
    { label: 'Total Revenue', value: `₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: `₹${Number(stats.todayRevenue || 0).toLocaleString('en-IN')} today` },
    { label: 'Avg Order Value', value: `₹${analytics?.kpis?.averageOrderValue || 0}`, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50', sub: 'Per paid order' },
    { label: 'Repeat Customer', value: `${analytics?.kpis?.repeatRate || 0}%`, icon: Users, color: 'text-pink-600', bg: 'bg-pink-50', sub: `${stats.totalCustomers || 0} total users` },
    { label: 'Available Products', value: stats.activeProducts, icon: Package, color: 'text-teal-600', bg: 'bg-teal-50', sub: `Out of ${stats.totalProducts}` },
    { label: 'Fulfillment Rate', value: `${analytics?.kpis?.fulfillmentRate || 0}%`, icon: Truck, color: 'text-orange-600', bg: 'bg-orange-50', sub: `${stats.Delivered || 0} delivered` },
  ] : [];

  const statusRows = stats ? [
    { label: 'Pending', value: stats.Pending, color: 'bg-amber-400' },
    { label: 'Confirmed', value: stats.Confirmed, color: 'bg-blue-400' },
    { label: 'Processing', value: stats.Processing, color: 'bg-indigo-400' },
    { label: 'Packed', value: stats.Packed, color: 'bg-purple-400' },
    { label: 'Shipped', value: stats.Shipped, color: 'bg-cyan-400' },
    { label: 'Out for Delivery', value: stats['Out for Delivery'], color: 'bg-orange-400' },
    { label: 'Delivered', value: stats.Delivered, color: 'bg-emerald-400' },
    { label: 'Cancelled', value: stats.Cancelled, color: 'bg-red-400' },
  ] : [];

  if (loading && !stats) {
    return <div className="flex items-center justify-center h-64"><RefreshCw className="w-8 h-8 animate-spin text-[#2D6A4F]" /></div>;
  }

  const categoryBreakdown = analytics?.categoryBreakdown || [];
  const maxCatRev = Math.max(...categoryBreakdown.map((c: any) => c.revenue), 1);
  const paymentMethods = analytics?.paymentMethods || {};
  const totalPaymentOrders = (paymentMethods.COD?.count || 0) + (paymentMethods.Razorpay?.count || 0) + (paymentMethods.Online?.count || 0) || 1;
  const codPct = Math.round(((paymentMethods.COD?.count || 0) / totalPaymentOrders) * 100);
  const onlinePct = 100 - codPct;

  return (
    <div className="space-y-6">
      {/* Analytics Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#2D6A4F]" /> Sales & Revenue Analytics Hub
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">Real-time performance metrics and trend charts</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                days === d
                  ? 'bg-[#2D6A4F] text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {d === 7 ? '7 Days' : d === 30 ? '30 Days' : '90 Days'}
            </button>
          ))}
          <button
            onClick={() => loadData(days)}
            disabled={loading}
            className="p-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-stone-200 p-3.5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{c.label}</span>
              <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
                <c.icon className={`w-3.5 h-3.5 ${c.color}`} />
              </div>
            </div>
            <p className={`text-xl font-black ${c.color}`}>{c.value}</p>
            <p className="text-[10px] text-stone-500 font-medium mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Interactive Trend Chart Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2D6A4F]" /> Performance Trends ({days} Days)
            </h4>
            <p className="text-xs text-stone-400">Daily sales revenue and order volume curve</p>
          </div>
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setChartMetric('revenue')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                chartMetric === 'revenue' ? 'bg-white text-[#2D6A4F] shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Revenue (₹)
            </button>
            <button
              onClick={() => setChartMetric('orders')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                chartMetric === 'orders' ? 'bg-white text-[#2D6A4F] shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Order Count
            </button>
          </div>
        </div>

        <RevenueTrendChart dailyTrends={analytics?.dailyTrends || []} metric={chartMetric} />
      </div>

      {/* 2-Column Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Sales Distribution */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
          <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2D6A4F]" /> Category Sales Breakdown
          </h4>
          {categoryBreakdown.length === 0 ? (
            <p className="text-xs text-stone-400 py-6 text-center">No category sales data recorded</p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map((cat: any, idx: number) => {
                const pct = Math.round((cat.revenue / maxCatRev) * 100);
                const colors = ['bg-[#2D6A4F]', 'bg-amber-500', 'bg-indigo-500', 'bg-teal-500', 'bg-rose-500', 'bg-purple-500'];
                const color = colors[idx % colors.length];
                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-stone-800">{cat.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-stone-400">{cat.count} items sold</span>
                        <span className="font-black text-stone-900">₹{Number(cat.revenue).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${color} transition-all duration-500 rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Methods & Operational KPI Split */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-5">
          <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#2D6A4F]" /> Payment Method & Channel Split
          </h4>
          <div className="bg-stone-50 p-4 rounded-xl space-y-3 border border-stone-100">
            <div className="flex justify-between items-center text-xs font-bold text-stone-700">
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Online Payments ({onlinePct}%)</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Cash on Delivery ({codPct}%)</span>
            </div>
            <div className="w-full bg-amber-500 h-3 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${onlinePct}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                <p className="text-[10px] text-stone-400 font-bold uppercase">Online / Razorpay</p>
                <p className="font-black text-emerald-700 mt-0.5">₹{Number((paymentMethods.Razorpay?.revenue || 0) + (paymentMethods.Online?.revenue || 0)).toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-stone-500">{(paymentMethods.Razorpay?.count || 0) + (paymentMethods.Online?.count || 0)} transactions</p>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                <p className="text-[10px] text-stone-400 font-bold uppercase">Cash on Delivery</p>
                <p className="font-black text-amber-700 mt-0.5">₹{Number(paymentMethods.COD?.revenue || 0).toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-stone-500">{paymentMethods.COD?.count || 0} orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products Leaderboard Table */}
      {analytics?.topProducts?.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
          <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Top Selling Products
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="p-2.5 pl-3">Rank</th>
                  <th className="p-2.5">Product</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Units Sold</th>
                  <th className="p-2.5 pr-3 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {analytics.topProducts.map((p: any, idx: number) => (
                  <tr key={p.name} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-2.5 pl-3 font-bold text-stone-400">#{idx + 1}</td>
                    <td className="p-2.5 font-bold text-stone-900">{p.name}</td>
                    <td className="p-2.5"><span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium text-[10px]">{p.category}</span></td>
                    <td className="p-2.5 font-semibold text-stone-700">{p.count} units</td>
                    <td className="p-2.5 pr-3 text-right font-black text-emerald-700">₹{Number(p.revenue).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Status Breakdown Grid */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
        <h3 className="font-bold text-stone-800 mb-4 text-sm">Order Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statusRows.map((s) => (
            <div key={s.label} className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-50/50 border border-stone-100">
              <div className={`w-2.5 h-2.5 rounded-full ${s.color} shrink-0`} />
              <span className="text-xs text-stone-600 flex-1">{s.label}</span>
              <span className="text-xs font-extrabold text-stone-900">{s.value ?? 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SECTION: Products ────────────────────────────────────────────────────────
function ProductsSection({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAvail, setFilterAvail] = useState<'all' | 'available' | 'unavailable'>('all');
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const emptyForm = {
    name: '', category: 'Eggs', price: '', originalPrice: '', description: '',
    image: '', badge: '', farmOrigin: 'Garuda Sanctuary, Chevella',
    availableWeights: 'Standard Pack', defaultWeight: 'Standard Pack',
    stock: true, featured: false, isActive: true,
  };
  const [form, setForm] = useState({ ...emptyForm });

  const load = async () => {
    setLoading(true);
    const data = await api.getProducts({ active_only: false } as any);
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchAvail = filterAvail === 'all' || (filterAvail === 'available' ? p.stock : !p.stock);
    const matchFeat = !filterFeatured || p.featured;
    return matchSearch && matchAvail && matchFeat;
  });

  const handleImageUpload = async (file: File, isEdit = false) => {
    setUploadingImage(true);
    const res = await api.uploadImage(file);
    setUploadingImage(false);
    if (res.ok && res.url) {
      if (isEdit && editProduct) setEditProduct({ ...editProduct, image: res.url });
      else setForm((f) => ({ ...f, image: res.url || '' }));
      toast.show('success', 'Image uploaded!');
    } else {
      toast.show('error', res.error || 'Upload failed');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await api.createProduct({
      name: form.name,
      category: form.category,
      price: Number(form.price),
      originalPrice: Number(form.originalPrice || form.price),
      description: form.description,
      image: form.image || 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
      badge: form.badge || null,
      farmOrigin: form.farmOrigin,
      availableWeights: form.availableWeights.split(',').map((s) => s.trim()),
      defaultWeight: form.defaultWeight,
      stock: form.stock,
      featured: form.featured,
    });
    setSaving(false);
    if (res.ok) {
      toast.show('success', 'Product created successfully!');
      setShowCreate(false);
      setForm({ ...emptyForm });
      notifyProductsUpdated();
      load();
    } else {
      toast.show('error', res.error || 'Create failed');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    setSaving(true);
    const res = await api.updateProduct(editProduct.id, {
      name: editProduct.name,
      price: Number(editProduct.price),
      originalPrice: Number(editProduct.originalPrice),
      description: editProduct.description,
      image: editProduct.image,
      badge: editProduct.badge || null,
      farmOrigin: editProduct.farmOrigin,
      stock: editProduct.stock,
      featured: editProduct.featured,
      category: editProduct.category,
    });
    setSaving(false);
    if (res.ok) {
      toast.show('success', 'Product saved!');
      setEditProduct(null);
      notifyProductsUpdated();
      load();
    } else {
      toast.show('error', res.error || 'Update failed');
    }
  };

  const handleToggleAvail = async (product: any) => {
    const res = await api.updateProduct(product.id, { stock: !product.stock });
    if (res.ok) {
      toast.show('success', `${product.name} is now ${!product.stock ? 'available' : 'unavailable'}`);
      notifyProductsUpdated();
      load();
    }
    else toast.show('error', res.error || 'Toggle failed');
  };

  const handleToggleFeatured = async (product: any) => {
    const res = await api.updateProduct(product.id, { featured: !product.featured });
    if (res.ok) {
      toast.show('success', `${product.name} featured: ${!product.featured}`);
      notifyProductsUpdated();
      load();
    }
    else toast.show('error', res.error || 'Toggle failed');
  };

  const handleArchive = async (product: any) => {
    const res = await api.deleteProduct(product.id);
    if (res.ok) { toast.show('success', 'Product archived'); setConfirmDelete(null); load(); }
    else toast.show('error', res.error || 'Archive failed');
  };

  const CATEGORIES_LIST = ['Eggs', 'Meat', 'Chicken', 'Mushroom', 'Honey', 'Dairy', 'Vegetables', 'Fruits', 'Rice', 'Grains',
    'Fresh A2 Milk & Dairy', 'Traditional Artisanal Ghee', 'Cold-Pressed Oils', 'Natural Sweeteners', 'Organic Pulses & Grains', 'Artisanal Spices'];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
        </div>
        <select value={filterAvail} onChange={(e) => setFilterAvail(e.target.value as any)}
          className="px-3 py-2 rounded-xl border border-stone-200 text-sm font-medium focus:outline-none focus:border-[#2D6A4F]">
          <option value="all">All Availability</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <button onClick={() => setFilterFeatured(!filterFeatured)}
          className={`px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${filterFeatured ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-stone-200 text-stone-600 hover:bg-stone-50'}`}>
          ⭐ Featured Only
        </button>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-sm font-bold flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /><span>Add Product</span>
        </button>
      </div>

      {/* Create Product Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-stone-200">
              <h3 className="font-bold text-stone-900 text-lg">Create New Product</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-stone-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-stone-600 mb-1">Product Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]">
                    {CATEGORIES_LIST.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Badge (optional)</label>
                  <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="e.g. Bestseller"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Price (₹) *</label>
                  <input required type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Original Price (₹)</label>
                  <input type="number" min="1" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="Same as price if no discount"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-stone-600 mb-1">Description *</label>
                  <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3} className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F] resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-stone-600 mb-1">Product Image</label>
                  <div className="flex items-center gap-3">
                    <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https:// or upload below"
                      className="flex-1 px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingImage}
                      className="px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-600 text-sm font-medium flex items-center gap-2 hover:bg-stone-100">
                      {uploadingImage ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Upload
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                  </div>
                  {form.image && <img src={form.image} alt="preview" className="mt-2 h-16 w-16 object-cover rounded-xl border" />}
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Available Weights (comma-separated)</label>
                  <input value={form.availableWeights} onChange={(e) => setForm({ ...form, availableWeights: e.target.value })} placeholder="250g, 500g, 1kg"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Default Weight</label>
                  <input value={form.defaultWeight} onChange={(e) => setForm({ ...form, defaultWeight: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Farm Origin</label>
                  <input value={form.farmOrigin} onChange={(e) => setForm({ ...form, farmOrigin: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.checked })} className="w-4 h-4 accent-[#2D6A4F]" />
                    Available
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-amber-500" />
                    Featured
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-medium hover:bg-stone-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-[#2D6A4F] text-white text-sm font-bold hover:bg-[#1B4332] flex items-center gap-2">
                  {saving && <RefreshCw className="w-4 h-4 animate-spin" />} Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-stone-200">
              <h3 className="font-bold text-stone-900 text-lg">Edit: {editProduct.name}</h3>
              <button onClick={() => setEditProduct(null)} className="p-1.5 hover:bg-stone-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-stone-600 mb-1">Product Name</label>
                  <input value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Price (₹)</label>
                  <input type="number" value={editProduct.price} onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Original Price (₹)</label>
                  <input type="number" value={editProduct.originalPrice} onChange={(e) => setEditProduct({ ...editProduct, originalPrice: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Category</label>
                  <select value={editProduct.category} onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]">
                    {CATEGORIES_LIST.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Badge</label>
                  <input value={editProduct.badge || ''} onChange={(e) => setEditProduct({ ...editProduct, badge: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-stone-600 mb-1">Description</label>
                  <textarea value={editProduct.description} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                    rows={3} className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F] resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-stone-600 mb-1">Image URL</label>
                  <div className="flex items-center gap-3">
                    <input value={editProduct.image || ''} onChange={(e) => setEditProduct({ ...editProduct, image: e.target.value })}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
                    <button type="button" onClick={() => editFileRef.current?.click()} disabled={uploadingImage}
                      className="px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm font-medium flex items-center gap-2 hover:bg-stone-100">
                      {uploadingImage ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Replace
                    </button>
                    <input ref={editFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, true); }} />
                  </div>
                  {editProduct.image && <img src={editProduct.image} alt="preview" className="mt-2 h-16 w-16 object-cover rounded-xl border" />}
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={editProduct.stock} onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.checked })} className="w-4 h-4 accent-[#2D6A4F]" />
                    Available in Stock
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={editProduct.featured} onChange={(e) => setEditProduct({ ...editProduct, featured: e.target.checked })} className="w-4 h-4 accent-amber-500" />
                    Featured
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditProduct(null)} className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-medium hover:bg-stone-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-[#2D6A4F] text-white text-sm font-bold hover:bg-[#1B4332] flex items-center gap-2">
                  {saving && <RefreshCw className="w-4 h-4 animate-spin" />} Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Archive Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900">Archive Product?</h4>
                <p className="text-xs text-stone-500">This hides the product from the storefront. Historical orders are preserved.</p>
              </div>
            </div>
            <p className="text-sm text-stone-700 mb-4 font-medium">{confirmDelete.name}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-medium hover:bg-stone-50">Cancel</button>
              <button onClick={() => handleArchive(confirmDelete)} className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700">Archive</button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><RefreshCw className="w-7 h-7 animate-spin text-[#2D6A4F]" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="p-3 pl-4">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3 text-center">Available</th>
                  <th className="p-3 text-center">Featured</th>
                  <th className="p-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-stone-400 text-sm">No products found.</td></tr>
                ) : filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-3 pl-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-stone-200"
                          onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80'; }} />
                        <div>
                          <p className="text-sm font-semibold text-stone-900 leading-tight">{p.name}</p>
                          <p className="text-[10px] text-stone-400">ID #{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-stone-600">{p.category}</td>
                    <td className="p-3">
                      <span className="text-sm font-bold text-stone-900">₹{p.price}</span>
                      {p.originalPrice > p.price && <span className="text-[10px] text-stone-400 line-through ml-1">₹{p.originalPrice}</span>}
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleToggleAvail(p)}
                        className={`w-8 h-5 rounded-full transition-colors relative ${p.stock ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${p.stock ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleToggleFeatured(p)}
                        className={`text-sm transition-colors ${p.featured ? 'text-amber-500' : 'text-stone-300 hover:text-amber-400'}`}>
                        ⭐
                      </button>
                    </td>
                    <td className="p-3 text-right pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditProduct({ ...p })}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmDelete(p)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-stone-100 text-xs text-stone-400">
            Showing {filtered.length} of {products.length} products
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SECTION: Categories ──────────────────────────────────────────────────────
function CategoriesSection({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCat, setEditCat] = useState<any | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ id: '', name: '', icon: '🌾', description: '', displayOrder: 10 });

  const load = async () => {
    setLoading(true);
    const res = await api.getAdminCategories();
    if (res.ok) setCategories(res.categories || []);
    else toast.show('error', res.error || 'Failed to load categories');
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await api.createCategory({ name: form.name, icon: form.icon, description: form.description, displayOrder: form.displayOrder });
    setSaving(false);
    if (res.ok) { toast.show('success', 'Category created!'); setShowCreate(false); setForm({ id: '', name: '', icon: '🌾', description: '', displayOrder: 10 }); load(); }
    else toast.show('error', res.error || 'Create failed');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCat) return;
    setSaving(true);
    const res = await api.updateCategory(editCat.id, { name: editCat.name, icon: editCat.icon, description: editCat.description, displayOrder: editCat.display_order });
    setSaving(false);
    if (res.ok) { toast.show('success', 'Category updated!'); setEditCat(null); load(); }
    else toast.show('error', res.error || 'Update failed');
  };

  const handleDisable = async (cat: any) => {
    const res = await api.deleteCategory(cat.id);
    if (res.ok) { toast.show('success', `"${cat.name}" disabled`); load(); }
    else toast.show('error', res.error || 'Failed');
  };

  const handleEnable = async (cat: any) => {
    const res = await api.updateCategory(cat.id, { isActive: true });
    if (res.ok) { toast.show('success', `"${cat.name}" enabled`); load(); }
    else toast.show('error', res.error || 'Failed');
  };

  if (loading) return <div className="flex items-center justify-center h-48"><RefreshCw className="w-7 h-7 animate-spin text-[#2D6A4F]" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-sm font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-900">New Category</h3>
              <button onClick={() => setShowCreate(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="flex gap-3">
                <div className="w-16">
                  <label className="text-xs font-bold text-stone-600 block mb-1">Icon</label>
                  <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full px-2 py-2.5 rounded-xl border border-stone-200 text-center text-lg focus:outline-none focus:border-[#2D6A4F]" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-stone-600 block mb-1">Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">Display Order</label>
                <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-medium">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-[#2D6A4F] text-white text-sm font-bold flex items-center gap-2">
                  {saving && <RefreshCw className="w-4 h-4 animate-spin" />} Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-900">Edit Category</h3>
              <button onClick={() => setEditCat(null)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-3">
              <div className="flex gap-3">
                <div className="w-16">
                  <label className="text-xs font-bold text-stone-600 block mb-1">Icon</label>
                  <input value={editCat.icon || ''} onChange={(e) => setEditCat({ ...editCat, icon: e.target.value })}
                    className="w-full px-2 py-2.5 rounded-xl border border-stone-200 text-center text-lg focus:outline-none focus:border-[#2D6A4F]" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-stone-600 block mb-1">Name</label>
                  <input value={editCat.name} onChange={(e) => setEditCat({ ...editCat, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">Description</label>
                <input value={editCat.description || ''} onChange={(e) => setEditCat({ ...editCat, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">Display Order</label>
                <input type="number" value={editCat.display_order || 0} onChange={(e) => setEditCat({ ...editCat, display_order: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditCat(null)} className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-medium">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-[#2D6A4F] text-white text-sm font-bold flex items-center gap-2">
                  {saving && <RefreshCw className="w-4 h-4 animate-spin" />} Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className={`bg-white rounded-2xl border p-4 shadow-sm ${cat.is_active === false ? 'opacity-50 border-stone-200' : 'border-stone-200'}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{cat.icon}</span>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">{cat.name}</h4>
                  <p className="text-[10px] text-stone-400">{cat.count || 0} products · Order: {cat.display_order}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setEditCat({ ...cat })} className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-900">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {cat.is_active !== false ? (
                  <button onClick={() => handleDisable(cat)} className="p-1.5 hover:bg-red-50 rounded-lg text-stone-400 hover:text-red-600">
                    <ToggleRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={() => handleEnable(cat)} className="p-1.5 hover:bg-emerald-50 rounded-lg text-stone-400 hover:text-emerald-600">
                    <ToggleLeft className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            {cat.description && <p className="text-xs text-stone-500 mt-1 line-clamp-2">{cat.description}</p>}
            <div className="mt-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                {cat.is_active !== false ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SECTION: Orders ──────────────────────────────────────────────────────────
function OrdersSection({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async (status = statusFilter, q = search) => {
    setLoading(true);
    const res = await api.getAdminOrders(status, q);
    if (res.ok) setOrders(res.orders || []);
    else toast.show('error', res.error || 'Failed to load orders');
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (orderId: string, orderStatus?: string, paymentStatus?: string) => {
    setUpdatingId(orderId);
    let targetPaymentStatus = paymentStatus;
    const ord = orders.find((o) => o.id === orderId);

    // Auto-mark payment as Paid when order status is marked Delivered for COD orders
    if (orderStatus === 'Delivered' && !paymentStatus && (ord?.payment_status === 'Pending' || selectedOrder?.payment_status === 'Pending')) {
      targetPaymentStatus = 'Paid';
    }

    const res = await api.updateOrderStatus(orderId, orderStatus, targetPaymentStatus);
    if (res.ok) {
      const label = targetPaymentStatus && !orderStatus
        ? `Payment status → ${targetPaymentStatus}`
        : `Order #${orderId} → ${orderStatus || 'Updated'}${targetPaymentStatus ? ` (Payment: ${targetPaymentStatus})` : ''}`;
      toast.show('success', label);
      load();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          ...(orderStatus ? { order_status: orderStatus } : {}),
          ...(targetPaymentStatus ? { payment_status: targetPaymentStatus } : {}),
        });
      }
    } else {
      toast.show('error', res.error || 'Status update failed');
    }
    setUpdatingId(null);
  };

  const handleDeleteSingleOrder = async (orderId: string) => {
    if (!window.confirm(`Are you sure you want to delete order #${orderId}?`)) return;
    const res = await api.deleteAdminOrder(orderId);
    if (res.ok) {
      toast.show('success', `Order #${orderId} deleted successfully`);
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      load();
    } else {
      toast.show('error', res.error || 'Failed to delete order');
    }
  };

  const handleClearAllOrders = async () => {
    if (!window.confirm('Are you sure you want to clear ALL test orders? This action cannot be undone!')) return;
    const res = await api.clearAllAdminOrders();
    if (res.ok) {
      toast.show('success', res.message || 'All test orders cleared successfully');
      setSelectedOrder(null);
      load();
    } else {
      toast.show('error', res.error || 'Failed to clear test orders');
    }
  };

  const STATUSES = ['All', 'Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

  return (
    <div className="space-y-4">
      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-stone-200">
              <h3 className="font-bold text-stone-900">Order #{selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 hover:bg-stone-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-5">
              {/* Status Control */}
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                <span className="text-xs font-bold text-stone-600">Order Status:</span>
                <select value={selectedOrder.order_status}
                  onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-stone-200 text-sm font-bold bg-white focus:outline-none focus:border-[#2D6A4F]">
                  {STATUSES.filter((s) => s !== 'All').map((s) => <option key={s}>{s}</option>)}
                </select>
                <StatusBadge status={selectedOrder.order_status} />
              </div>

              {/* Customer */}
              <div>
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Customer</h4>
                <div className="bg-stone-50 rounded-xl p-3 space-y-1 text-sm">
                  <p><span className="font-semibold">Name:</span> {selectedOrder.customer_name}</p>
                  <p><span className="font-semibold">Email:</span> {selectedOrder.customer_email}</p>
                  <p><span className="font-semibold">Phone:</span> {selectedOrder.customer_phone}</p>
                </div>
              </div>

              {/* Delivery */}
              <div>
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Delivery Address</h4>
                <div className="bg-stone-50 rounded-xl p-3 text-sm">
                  <p>{selectedOrder.shipping_address}</p>
                  <p>{selectedOrder.city}, {selectedOrder.state} — {selectedOrder.pincode}</p>
                  {selectedOrder.delivery_slot && <p className="text-stone-500 mt-1">Slot: {selectedOrder.delivery_slot}</p>}
                  {selectedOrder.delivery_instructions && <p className="text-stone-500 italic">{selectedOrder.delivery_instructions}</p>}
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Order Items</h4>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between bg-stone-50 rounded-xl p-3 text-sm">
                      <div>
                        <p className="font-semibold text-stone-900">{item.product_name}</p>
                        <p className="text-xs text-stone-500">{item.selected_weight} × {item.quantity}</p>
                      </div>
                      <p className="font-bold text-stone-900">₹{item.total_price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div>
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Payment</h4>
                <div className="bg-stone-50 rounded-xl p-3 space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Method:</span>
                    <span className="font-semibold">{selectedOrder.payment_method}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span>Payment Status:</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedOrder.payment_status || 'Pending'}
                        onChange={(e) => updateStatus(selectedOrder.id, undefined, e.target.value)}
                        disabled={updatingId === selectedOrder.id}
                        className="px-2.5 py-1 rounded-lg border border-stone-200 text-xs font-bold bg-white focus:outline-none focus:border-[#2D6A4F] disabled:opacity-50"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Failed">Failed</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                      {selectedOrder.payment_status !== 'Paid' && (
                        <button
                          onClick={() => updateStatus(selectedOrder.id, undefined, 'Paid')}
                          disabled={updatingId === selectedOrder.id}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          ✓ Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                  {selectedOrder.razorpay_order_id && <div className="flex justify-between text-xs pt-1 border-t border-stone-200"><span>Razorpay Order:</span><span className="font-mono text-stone-600">{selectedOrder.razorpay_order_id}</span></div>}
                  {selectedOrder.razorpay_payment_id && <div className="flex justify-between text-xs"><span>Payment ID:</span><span className="font-mono text-stone-600">{selectedOrder.razorpay_payment_id}</span></div>}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-stone-200 pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>₹{Number(selectedOrder.subtotal).toFixed(2)}</span></div>
                {Number(selectedOrder.discount_amount) > 0 && <div className="flex justify-between text-emerald-600"><span>Discount ({selectedOrder.coupon_code})</span><span>-₹{Number(selectedOrder.discount_amount).toFixed(2)}</span></div>}
                <div className="flex justify-between text-stone-600"><span>Delivery</span><span>₹{Number(selectedOrder.delivery_charge).toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-stone-900 text-base pt-1 border-t border-stone-200"><span>Total</span><span>₹{Number(selectedOrder.total_amount).toFixed(2)}</span></div>
              </div>
              <button 
                onClick={() => handleDeleteSingleOrder(selectedOrder.id)}
                className="w-full mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 hover:bg-red-100 transition-colors"
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); load(statusFilter, e.target.value); }}
              placeholder="Search by ID, name, email, phone..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); load(e.target.value, search); }}
            className="px-3 py-2 rounded-xl border border-stone-200 text-sm font-medium focus:outline-none focus:border-[#2D6A4F]">
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button onClick={() => load()} className="px-3 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <button
          onClick={handleClearAllOrders}
          disabled={orders.length === 0}
          className="px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear All Test Orders
        </button>
      </div>


      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><RefreshCw className="w-7 h-7 animate-spin text-[#2D6A4F]" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="p-3 pl-4">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-stone-400 text-sm">No orders found.</td></tr>
                ) : orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-3 pl-4 font-mono text-xs font-bold text-stone-900">#{ord.id}</td>
                    <td className="p-3">
                      <p className="text-sm font-semibold text-stone-900">{ord.customer_name}</p>
                      <p className="text-[10px] text-stone-400">{ord.customer_phone}</p>
                    </td>
                    <td className="p-3 font-bold text-sm text-stone-900">₹{Number(ord.total_amount).toFixed(2)}</td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-stone-500 uppercase">{ord.payment_method}</span>
                          <StatusBadge status={ord.payment_status} />
                        </div>
                        <select
                          value={ord.payment_status || 'Pending'}
                          onChange={(e) => updateStatus(ord.id, undefined, e.target.value)}
                          disabled={updatingId === ord.id}
                          className="px-2 py-0.5 rounded-md border border-stone-200 text-[11px] font-bold bg-white focus:outline-none focus:border-[#2D6A4F] disabled:opacity-50"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Failed">Failed</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={ord.order_status}
                          onChange={(e) => updateStatus(ord.id, e.target.value)}
                          disabled={updatingId === ord.id}
                          className="px-2 py-1 rounded-lg border border-stone-200 text-xs font-bold bg-white focus:outline-none focus:border-[#2D6A4F] disabled:opacity-50"
                        >
                          {STATUSES.filter((s) => s !== 'All').map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>

                        {/* Quick 1-Click Status Advance */}
                        {(() => {
                          const nextMap: Record<string, string> = {
                            Pending: 'Confirmed',
                            Confirmed: 'Packed',
                            Processing: 'Packed',
                            Packed: 'Shipped',
                            Shipped: 'Out for Delivery',
                            'Out for Delivery': 'Delivered',
                          };
                          const next = nextMap[ord.order_status];
                          if (!next) return null;
                          return (
                            <button
                              onClick={() => updateStatus(ord.id, next)}
                              disabled={updatingId === ord.id}
                              title={`Advance to ${next}`}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 disabled:opacity-50 flex items-center gap-1 shadow-sm"
                            >
                              <span>→ {next}</span>
                            </button>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="p-3 text-xs text-stone-500">{new Date(ord.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="p-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setSelectedOrder(ord)}
                          className="px-2.5 py-1 rounded-lg bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#1B4332] flex items-center gap-1">
                          <Eye className="w-3 h-3" /> View
                        </button>
                        <button onClick={() => handleDeleteSingleOrder(ord.id)}
                          title="Delete Order"
                          className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-stone-100 text-xs text-stone-400">{orders.length} orders</div>
        </div>
      )}
    </div>
  );
}

// ─── SECTION: Customers ───────────────────────────────────────────────────────
function CustomersSection({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async (q = search) => {
    setLoading(true);
    const res = await api.getCustomers(q);
    if (res.ok) setCustomers(res.customers || []);
    else toast.show('error', res.error || 'Failed to load customers');
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); load(e.target.value); }}
            placeholder="Search by name, email, phone..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><RefreshCw className="w-7 h-7 animate-spin text-[#2D6A4F]" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="p-3 pl-4">Customer</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3 text-center">Orders</th>
                  <th className="p-3 text-right">Total Spend</th>
                  <th className="p-3 pr-4 text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {customers.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-stone-400 text-sm">No customers found.</td></tr>
                ) : customers.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/50">
                    <td className="p-3 pl-4">
                      <p className="text-sm font-semibold text-stone-900">{c.name}</p>
                      <p className="text-xs text-stone-400">{c.email}</p>
                    </td>
                    <td className="p-3 text-sm text-stone-600">{c.phone}</td>
                    <td className="p-3 text-center text-sm font-bold text-stone-900">{c.orderCount}</td>
                    <td className="p-3 text-right text-sm font-bold text-emerald-700">₹{Number(c.totalSpend).toLocaleString('en-IN')}</td>
                    <td className="p-3 pr-4 text-right text-xs text-stone-400">{new Date(c.registeredAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-stone-100 text-xs text-stone-400">{customers.length} customers</div>
        </div>
      )}
    </div>
  );
}

// ─── SECTION: Coupons ─────────────────────────────────────────────────────────
function CouponsSection({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editCoupon, setEditCoupon] = useState<any | null>(null);
  const emptyForm = {
    code: '', discount_type: 'percentage', discount_value: '', minimum_order_amount: '',
    maximum_discount_amount: '', usage_limit: '', per_customer_limit: '', first_order_only: false,
    applicable_category: '', applicable_product_id: '', expires_at: '', is_active: true
  };
  const [form, setForm] = useState({ ...emptyForm });

  const load = async () => {
    setLoading(true);
    const [resCoupons, prodData] = await Promise.all([
      api.getCoupons(),
      api.getProducts({ active_only: false } as any)
    ]);
    if (resCoupons.ok) setCoupons(resCoupons.coupons || []);
    else toast.show('error', resCoupons.error || 'Failed to load coupons');
    setProducts(prodData || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await api.createCoupon({
      ...form,
      discount_value: Number(form.discount_value),
      minimum_order_amount: Number(form.minimum_order_amount || 0),
      maximum_discount_amount: form.maximum_discount_amount ? Number(form.maximum_discount_amount) : undefined,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : undefined,
      per_customer_limit: form.per_customer_limit ? Number(form.per_customer_limit) : undefined,
      applicable_product_id: form.applicable_product_id ? Number(form.applicable_product_id) : undefined,
    });
    setSaving(false);
    if (res.ok) { toast.show('success', 'Smart coupon created!'); setShowCreate(false); setForm({ ...emptyForm }); load(); }
    else toast.show('error', res.error || 'Create failed');
  };

  const handleToggle = async (coupon: any) => {
    const res = await api.updateCoupon(coupon.id, { is_active: !coupon.is_active });
    if (res.ok) { toast.show('success', `Coupon ${!coupon.is_active ? 'enabled' : 'disabled'}`); load(); }
    else toast.show('error', res.error || 'Failed');
  };

  const handleDelete = async (id: string) => {
    const res = await api.deleteCoupon(id);
    if (res.ok) { toast.show('success', 'Coupon deleted'); load(); }
    else toast.show('error', res.error || 'Delete failed');
  };

  const CouponForm = ({ data, onChange, onSubmit, onCancel, title }: any) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-stone-900">{title}</h3>
          <button onClick={onCancel}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold text-stone-600 block mb-1">Coupon Code *</label>
              <input required value={data.code} onChange={(e) => onChange({ ...data, code: e.target.value.toUpperCase() })} placeholder="FIRST100"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm font-mono focus:outline-none focus:border-[#2D6A4F]" />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">Type</label>
              <select value={data.discount_type} onChange={(e) => onChange({ ...data, discount_type: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">Discount Value *</label>
              <input required type="number" min="0" value={data.discount_value} onChange={(e) => onChange({ ...data, discount_value: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">Min Order Value (₹)</label>
              <input type="number" min="0" value={data.minimum_order_amount} onChange={(e) => onChange({ ...data, minimum_order_amount: e.target.value })} placeholder="e.g. 500"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">Max Discount (₹)</label>
              <input type="number" min="0" value={data.maximum_discount_amount} onChange={(e) => onChange({ ...data, maximum_discount_amount: e.target.value })} placeholder="No limit"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">Global Usage Limit</label>
              <input type="number" min="0" value={data.usage_limit} onChange={(e) => onChange({ ...data, usage_limit: e.target.value })} placeholder="Unlimited"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">Per-Customer Limit</label>
              <input type="number" min="0" value={data.per_customer_limit} onChange={(e) => onChange({ ...data, per_customer_limit: e.target.value })} placeholder="e.g. 1"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
            </div>

            <div className="col-span-2 bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-3">
              <h4 className="text-[11px] font-black text-stone-700 uppercase tracking-wider">Smart Restrictions</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!data.first_order_only} onChange={(e) => onChange({ ...data, first_order_only: e.target.checked })} className="w-4 h-4 accent-[#2D6A4F]" />
                <span className="text-xs font-semibold text-stone-800">First-Order Only (New Customers)</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-stone-600 block mb-1">Category Restriction</label>
                  <input value={data.applicable_category || ''} onChange={(e) => onChange({ ...data, applicable_category: e.target.value })} placeholder="All or e.g. Dairy"
                    className="w-full px-2.5 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-[#2D6A4F]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-600 block mb-1">Product Restriction</label>
                  <select value={data.applicable_product_id || ''} onChange={(e) => onChange({ ...data, applicable_product_id: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-[#2D6A4F]">
                    <option value="">All Products</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <label className="text-xs font-bold text-stone-600 block mb-1">Expiry Date & Time</label>
              <input type="datetime-local" value={data.expires_at ? new Date(data.expires_at).toISOString().slice(0, 16) : ''} onChange={(e) => onChange({ ...data, expires_at: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
            </div>
            <div className="flex items-center gap-2 pt-1 col-span-2">
              <input type="checkbox" checked={data.is_active} onChange={(e) => onChange({ ...data, is_active: e.target.checked })} className="w-4 h-4 accent-[#2D6A4F]" />
              <label className="text-sm font-medium">Active & Enabled</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-medium">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-[#2D6A4F] text-white text-sm font-bold flex items-center gap-2">
              {saving && <RefreshCw className="w-4 h-4 animate-spin" />} Save Coupon
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-stone-200">
        <div>
          <h3 className="font-bold text-stone-900 text-sm">🎟️ Smart Coupons Engine</h3>
          <p className="text-xs text-stone-500">Configure flat/percentage discounts, minimum orders, first-order limits, and product targeting.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-sm font-bold flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Create Smart Coupon
        </button>
      </div>

      {showCreate && <CouponForm data={form} onChange={setForm} title="Create Smart Coupon"
        onSubmit={handleCreate} onCancel={() => { setShowCreate(false); setForm({ ...emptyForm }); }} />}
      {editCoupon && <CouponForm data={editCoupon} onChange={setEditCoupon} title="Edit Smart Coupon"
        onSubmit={async (e: React.FormEvent) => {
          e.preventDefault(); setSaving(true);
          const res = await api.updateCoupon(editCoupon.id, editCoupon);
          setSaving(false);
          if (res.ok) { toast.show('success', 'Coupon updated!'); setEditCoupon(null); load(); }
          else toast.show('error', res.error || 'Failed');
        }}
        onCancel={() => setEditCoupon(null)} />}

      {loading ? (
        <div className="flex items-center justify-center h-48"><RefreshCw className="w-7 h-7 animate-spin text-[#2D6A4F]" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-stone-400 bg-white rounded-2xl border border-stone-200">No coupons yet. Click "Create Smart Coupon" to add one.</div>
          ) : coupons.map((c) => (
            <div key={c.id} className={`bg-white rounded-2xl border p-4 shadow-sm ${!c.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-mono font-bold text-lg text-[#2D6A4F]">{c.code}</span>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                      {c.is_active ? 'Active' : 'Disabled'}
                    </span>
                    {c.first_order_only && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        First-Order Only
                      </span>
                    )}
                    {c.applicable_category && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        Category: {c.applicable_category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditCoupon({ ...c })} className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleToggle(c)} className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500">
                    {c.is_active ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-stone-400" />}
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-stone-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <p className="text-sm font-bold text-stone-900 mt-2">
                {c.discount_type === 'percentage' ? `${c.discount_value}% off` : `₹${c.discount_value} off`}
                {Number(c.minimum_order_amount) > 0 && <span className="text-xs font-normal text-stone-500 ml-1">on orders above ₹{c.minimum_order_amount}</span>}
              </p>
              <div className="text-xs text-stone-500 space-y-0.5 mt-2 pt-2 border-t border-stone-100">
                <p>Usage: <strong>{c.used_count || 0}</strong> {c.usage_limit ? `/ ${c.usage_limit} total limit` : 'uses'}</p>
                {c.per_customer_limit && <p>Per-customer limit: <strong>{c.per_customer_limit}</strong></p>}
                {c.expires_at && <p className="text-stone-400">Expires: {new Date(c.expires_at).toLocaleString('en-IN')}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SECTION: Dynamic Offers ──────────────────────────────────────────────────
function OffersSection({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await api.getProducts({ active_only: false } as any);
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleToggleOffer = async (product: any, field: string, value: any) => {
    setSavingId(product.id);
    const payload = {
      is_todays_deal: field === 'is_todays_deal' ? value : product.is_todays_deal,
      deal_price: field === 'deal_price' ? Number(value) : (product.deal_price || product.price),
      is_fresh_arrival: field === 'is_fresh_arrival' ? value : product.is_fresh_arrival,
      is_best_seller: field === 'is_best_seller' ? value : product.is_best_seller,
      is_special_offer: field === 'is_special_offer' ? value : product.is_special_offer,
    };
    const res = await api.updateProductDynamicOffers(product.id, payload);
    setSavingId(null);
    if (res.ok) {
      toast.show('success', `Updated dynamic offers for ${product.name}`);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, ...payload } : p));
      window.dispatchEvent(new Event('garuda_products_updated'));
      try { localStorage.setItem('garuda_products_sync', String(Date.now())); } catch {}
    } else {
      toast.show('error', res.error || 'Failed to update offer');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-48"><RefreshCw className="w-7 h-7 animate-spin text-[#2D6A4F]" /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-[#0F2D1F] text-white p-5 rounded-2xl flex items-center justify-between shadow-sm">
        <div>
          <h3 className="font-bold text-base flex items-center gap-2">
            💰 Dynamic Homepage Offers
          </h3>
          <p className="text-xs text-[#52B788] mt-0.5">Control 🔥 Today's Deals, 🥬 Fresh Arrivals, ⭐ Best Sellers, and 🏷️ Special Offers without writing code.</p>
        </div>
        <button onClick={load} className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0" />
              <div>
                <h4 className="font-bold text-stone-900 text-sm">{p.name}</h4>
                <p className="text-xs text-stone-500">Category: <strong className="text-stone-700">{p.category}</strong> · MRP: ₹{p.price}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Today's Deal */}
              <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${p.is_todays_deal ? 'bg-amber-50 border-amber-300' : 'bg-stone-50 border-stone-200'}`}>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-amber-900">
                  <input type="checkbox" checked={!!p.is_todays_deal} onChange={(e) => handleToggleOffer(p, 'is_todays_deal', e.target.checked)} className="w-4 h-4 accent-amber-600" />
                  🔥 Today's Deal
                </label>
                {p.is_todays_deal && (
                  <input type="number" min="0" placeholder="Deal Price" defaultValue={p.deal_price || p.price}
                    onBlur={(e) => handleToggleOffer(p, 'deal_price', e.target.value)}
                    className="w-20 px-2 py-1 bg-white rounded-lg border border-amber-300 text-xs font-bold text-amber-900 focus:outline-none" />
                )}
              </div>

              {/* Fresh Arrival */}
              <label className={`px-3.5 py-2.5 rounded-xl border flex items-center gap-1.5 cursor-pointer text-xs font-bold ${p.is_fresh_arrival ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-stone-50 border-stone-200 text-stone-600'}`}>
                <input type="checkbox" checked={!!p.is_fresh_arrival} onChange={(e) => handleToggleOffer(p, 'is_fresh_arrival', e.target.checked)} className="w-4 h-4 accent-emerald-600" />
                🥬 Fresh Arrival
              </label>

              {/* Best Seller */}
              <label className={`px-3.5 py-2.5 rounded-xl border flex items-center gap-1.5 cursor-pointer text-xs font-bold ${p.is_best_seller ? 'bg-indigo-50 border-indigo-300 text-indigo-900' : 'bg-stone-50 border-stone-200 text-stone-600'}`}>
                <input type="checkbox" checked={!!p.is_best_seller} onChange={(e) => handleToggleOffer(p, 'is_best_seller', e.target.checked)} className="w-4 h-4 accent-indigo-600" />
                ⭐ Best Seller
              </label>

              {/* Special Offer */}
              <label className={`px-3.5 py-2.5 rounded-xl border flex items-center gap-1.5 cursor-pointer text-xs font-bold ${p.is_special_offer ? 'bg-purple-50 border-purple-300 text-purple-900' : 'bg-stone-50 border-stone-200 text-stone-600'}`}>
                <input type="checkbox" checked={!!p.is_special_offer} onChange={(e) => handleToggleOffer(p, 'is_special_offer', e.target.checked)} className="w-4 h-4 accent-purple-600" />
                🏷️ Special Offer
              </label>

              {savingId === p.id && <RefreshCw className="w-4 h-4 animate-spin text-[#2D6A4F]" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SECTION: Reviews Moderation ──────────────────────────────────────────────
function ReviewsSection({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await api.getAdminReviews(statusFilter);
    if (res.ok) setReviews(res.reviews || []);
    else toast.show('error', res.error || 'Failed to load reviews');
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    const res = await api.updateAdminReviewStatus(id, status);
    setUpdatingId(null);
    if (res.ok) {
      toast.show('success', `Review status changed to ${status}!`);
      load();
    } else {
      toast.show('error', res.error || 'Failed to update review status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review permanently?')) return;
    setUpdatingId(id);
    const res = await api.deleteAdminReview(id);
    setUpdatingId(null);
    if (res.ok) {
      toast.show('success', 'Review deleted');
      load();
    } else {
      toast.show('error', res.error || 'Failed to delete review');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 gap-3">
        <div className="flex items-center gap-2">
          {['All', 'pending', 'approved', 'rejected'].map((st) => (
            <button key={st} onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${statusFilter === st ? 'bg-[#2D6A4F] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              {st}
            </button>
          ))}
        </div>
        <button onClick={load} className="p-2 hover:bg-stone-100 rounded-xl text-stone-600 self-end sm:self-auto">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><RefreshCw className="w-7 h-7 animate-spin text-[#2D6A4F]" /></div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-stone-400 bg-white rounded-2xl border border-stone-200">No customer product reviews found for this status.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#2D6A4F] block">{r.product_name || `Product #${r.product_id}`}</span>
                    <h4 className="font-bold text-stone-900 text-sm mt-0.5">{r.customer_name}</h4>
                    <p className="text-[11px] text-stone-400">{r.customer_email} · {new Date(r.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                    r.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {r.status}
                  </span>
                </div>

                <div className="flex items-center gap-1 mt-2 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-4 h-4 fill-current ${star <= r.rating ? 'text-amber-400' : 'text-stone-200 fill-none'}`} />
                  ))}
                </div>

                {r.title && <p className="font-bold text-stone-800 text-xs mt-2">{r.title}</p>}
                <p className="text-xs text-stone-600 mt-1 italic">"{r.comment}"</p>

                {r.photo_url && (
                  <img src={r.photo_url} alt="Review attachment" className="w-20 h-20 rounded-xl object-cover border border-stone-200 mt-2" />
                )}
              </div>

              <div className="flex items-center justify-between border-t border-stone-100 pt-3 mt-2">
                <div className="flex items-center gap-2">
                  {r.status !== 'approved' && (
                    <button onClick={() => handleStatus(r.id, 'approved')} disabled={updatingId === r.id}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                  {r.status !== 'rejected' && (
                    <button onClick={() => handleStatus(r.id, 'rejected')} disabled={updatingId === r.id}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1">
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  )}
                </div>
                <button onClick={() => handleDelete(r.id)} disabled={updatingId === r.id}
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SECTION: Store Settings ───────────────────────────────────────────────────
function StoreSettingsSection({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingSheet, setTestingSheet] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await api.getStoreSettings();
      if (res.ok) setSettings(res.settings || {});
      else toast.show('error', res.error || 'Failed to load settings');
      setLoading(false);
    })();
  }, []);

  const update = (key: string, value: any) => { setSettings((s) => ({ ...s, [key]: value })); setDirty(true); };

  const save = async () => {
    setSaving(true);
    const res = await api.updateStoreSettings(settings);
    setSaving(false);
    if (res.ok) { toast.show('success', 'Settings saved!'); setDirty(false); }
    else toast.show('error', res.error || 'Save failed');
  };

  const handleTestSheet = async () => {
    setTestingSheet(true);
    const url = settings.google_sheets_webhook_url;
    const res = await api.testGoogleSheets(url);
    setTestingSheet(false);
    if (res.ok) {
      toast.show('success', res.message || 'Test row sent to Google Sheets!');
    } else {
      toast.show('error', res.error || 'Failed to connect to Google Sheets Webhook');
    }
  };

  const Field = ({ label, k, type = 'text', placeholder = '' }: { label: string; k: string; type?: string; placeholder?: string }) => (
    <div>
      <label className="text-xs font-bold text-stone-600 block mb-1">{label}</label>
      <input type={type} value={settings[k] || ''} onChange={(e) => update(k, e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
    </div>
  );

  if (loading) return <div className="flex items-center justify-center h-48"><RefreshCw className="w-7 h-7 animate-spin text-[#2D6A4F]" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-stone-800 text-sm border-b border-stone-100 pb-3">Store Information</h3>
        <Field label="Store Name" k="store_name" />
        <Field label="Store Tagline" k="store_tagline" />
        <Field label="Contact Email" k="store_email" type="email" />
        <Field label="Contact Phone" k="store_phone" placeholder="+91 XXXXX XXXXX" />
        <Field label="WhatsApp Number" k="store_whatsapp" placeholder="+91 XXXXX XXXXX" />
        <Field label="Store Address" k="store_address" />
      </div>

      {/* Google Sheets Real-Time Backup */}
      <div className="bg-emerald-950 text-white rounded-2xl border border-emerald-900 p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#52B788]" />
              Google Sheets Live Order Backup
            </h3>
            <p className="text-[11px] text-emerald-300/80 mt-0.5">
              Automatically backs up every order to your Google Sheet in real time.
            </p>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            settings.google_sheets_webhook_url ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}>
            {settings.google_sheets_webhook_url ? '● Connected' : '○ Not Configured'}
          </span>
        </div>

        <div>
          <label className="text-xs font-bold text-emerald-200 block mb-1">
            Google Apps Script Web App URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={settings.google_sheets_webhook_url || ''}
              onChange={(e) => update('google_sheets_webhook_url', e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="flex-1 px-3 py-2.5 rounded-xl bg-emerald-900/60 border border-emerald-700/60 text-white text-xs font-mono focus:outline-none focus:border-[#52B788] placeholder-emerald-700"
            />
            <button
              type="button"
              onClick={handleTestSheet}
              disabled={testingSheet || !settings.google_sheets_webhook_url}
              className="px-3.5 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#52B788] hover:text-emerald-950 text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 shrink-0"
            >
              {testingSheet ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
              <span>Test Connection</span>
            </button>
          </div>
        </div>

        <div className="bg-emerald-900/40 rounded-xl p-3 border border-emerald-800/40 text-[11px] text-emerald-200/90 space-y-1.5">
          <p className="font-bold text-emerald-300">📋 Setup Steps for Google Sheets Backup:</p>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-emerald-200/80">
            <li>Create a new Google Sheet on your Google Drive.</li>
            <li>Go to <strong>Extensions &gt; Apps Script</strong>.</li>
            <li>Paste the 8-line script code (see documentation or ask support).</li>
            <li>Click <strong>Deploy &gt; New deployment &gt; Select type: Web App</strong>.</li>
            <li>Set <em>Execute as: Me</em> and <em>Who has access: <strong>Anyone</strong></em>.</li>
            <li>Copy the Web App URL (ends with <code>/exec</code>) and paste it above, then click <strong>Save Settings</strong>.</li>
          </ol>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-stone-800 text-sm border-b border-stone-100 pb-3">Delivery Settings</h3>
        <Field label="Delivery Fee (₹)" k="delivery_fee" type="number" />
        <Field label="Free Delivery Threshold (₹)" k="free_delivery_threshold" type="number" />
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-stone-800 text-sm border-b border-stone-100 pb-3">Homepage Content</h3>
        <Field label="Hero Title" k="hero_title" />
        <Field label="Hero Subtitle" k="hero_subtitle" />
        <Field label="Hero CTA Button Text" k="hero_cta_text" />
        <div>
          <label className="text-xs font-bold text-stone-600 block mb-1">Announcement Bar Text</label>
          <input value={settings.announcement_bar || ''} onChange={(e) => update('announcement_bar', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={settings.announcement_active === 'true' || settings.announcement_active === true}
            onChange={(e) => update('announcement_active', String(e.target.checked))} className="w-4 h-4 accent-[#2D6A4F]" />
          Show Announcement Bar
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving || !dirty}
          className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-sm font-bold hover:bg-[#1B4332] flex items-center gap-2 disabled:opacity-50 transition-all">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {dirty && <span className="text-xs text-amber-600 font-medium">⚠ Unsaved changes</span>}
      </div>
    </div>
  );
}


// ─── SECTION: Audit Log ───────────────────────────────────────────────────────
function AuditLogSection({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await api.getAuditLogs();
      if (res.ok) setLogs(res.logs || []);
      else toast.show('error', res.error || 'Failed to load audit logs');
      setLoading(false);
    })();
  }, []);

  const actionColors: Record<string, string> = {
    'product.create': 'bg-emerald-100 text-emerald-700',
    'product.update': 'bg-blue-100 text-blue-700',
    'product.archive': 'bg-red-100 text-red-700',
    'order.status_change': 'bg-amber-100 text-amber-700',
    'coupon.create': 'bg-purple-100 text-purple-700',
    'coupon.update': 'bg-indigo-100 text-indigo-700',
    'coupon.delete': 'bg-red-100 text-red-700',
    'category.create': 'bg-teal-100 text-teal-700',
    'category.update': 'bg-cyan-100 text-cyan-700',
    'store_settings.update': 'bg-stone-100 text-stone-700',
    'image.upload': 'bg-pink-100 text-pink-700',
  };

  if (loading) return <div className="flex items-center justify-center h-48"><RefreshCw className="w-7 h-7 animate-spin text-[#2D6A4F]" /></div>;

  return (
    <div className="space-y-2">
      {logs.length === 0 ? (
        <div className="text-center py-12 text-stone-400 bg-white rounded-2xl border border-stone-200">No audit logs yet.</div>
      ) : logs.map((log) => (
        <div key={log.id} className="bg-white rounded-xl border border-stone-200 p-3 flex items-start gap-3 text-sm">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap ${actionColors[log.action] || 'bg-stone-100 text-stone-600'}`}>
            {log.action}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-stone-700 text-xs truncate">{log.admin_email} · {log.entity_type} {log.entity_id && `#${log.entity_id}`}</p>
            {log.details && <p className="text-stone-400 text-[10px] mt-0.5 truncate">{JSON.stringify(log.details)}</p>}
          </div>
          <span className="text-[10px] text-stone-400 shrink-0">{new Date(log.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
        </div>
      ))}
    </div>
  );
}

// ─── SECTION: Delivery & Serviceable PIN Codes ──────────────────────────────
function DeliverySection({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [settings, setSettings] = useState({
    ratePerKm: 10,
    freeThreshold: 1000,
    originAddress: 'Garuda Sanctuary, Mudimyala, Chevella (501503)',
    originPincode: '501503',
  });
  const [pincodes, setPincodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Enabled' | 'Disabled'>('All');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPin, setEditingPin] = useState<any | null>(null);
  const [formPin, setFormPin] = useState('');
  const [formArea, setFormArea] = useState('');
  const [formDistance, setFormDistance] = useState('10');
  const [formEnabled, setFormEnabled] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadDeliveryData = useCallback(async () => {
    setLoading(true);
    const [setRes, pinRes] = await Promise.all([
      api.getAdminDeliverySettings(),
      api.getAdminPincodes(),
    ]);

    if (setRes.ok && setRes.settings) {
      setSettings(setRes.settings);
    }
    if (pinRes.ok && pinRes.pincodes) {
      setPincodes(pinRes.pincodes);
    } else {
      toast.show('error', pinRes.error || 'Failed to load PIN codes');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDeliveryData();
  }, [loadDeliveryData]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    const res = await api.updateAdminDeliverySettings(settings);
    if (res.ok) {
      toast.show('success', 'Delivery fee settings updated successfully!');
    } else {
      toast.show('error', res.error || 'Failed to update settings');
    }
    setSavingSettings(false);
  };

  const handleOpenAddModal = () => {
    setEditingPin(null);
    setFormPin('');
    setFormArea('');
    setFormDistance('10');
    setFormEnabled(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: any) => {
    setEditingPin(item);
    setFormPin(item.pincode);
    setFormArea(item.area_name);
    setFormDistance(String(item.distance_km));
    setFormEnabled(item.is_enabled);
    setIsModalOpen(true);
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    if (editingPin) {
      const res = await api.updateAdminPincode(editingPin.id, {
        pincode: formPin,
        area_name: formArea,
        distance_km: Number(formDistance),
        is_enabled: formEnabled,
      });
      if (res.ok) {
        toast.show('success', `PIN code ${formPin} updated.`);
        setIsModalOpen(false);
        loadDeliveryData();
      } else {
        toast.show('error', res.error || 'Failed to update PIN code.');
      }
    } else {
      const res = await api.addAdminPincode({
        pincode: formPin,
        area_name: formArea,
        distance_km: Number(formDistance),
        is_enabled: formEnabled,
      });
      if (res.ok) {
        toast.show('success', `PIN code ${formPin} added successfully.`);
        setIsModalOpen(false);
        loadDeliveryData();
      } else {
        toast.show('error', res.error || 'Failed to add PIN code.');
      }
    }
    setFormSubmitting(false);
  };

  const handleToggleEnable = async (item: any) => {
    const res = await api.updateAdminPincode(item.id, { is_enabled: !item.is_enabled });
    if (res.ok) {
      toast.show('success', `PIN ${item.pincode} ${!item.is_enabled ? 'enabled' : 'disabled'}.`);
      loadDeliveryData();
    } else {
      toast.show('error', res.error || 'Failed to update status.');
    }
  };

  const handleDeletePin = async (item: any) => {
    if (!window.confirm(`Are you sure you want to delete PIN code ${item.pincode} (${item.area_name})?`)) return;
    const res = await api.deleteAdminPincode(item.id);
    if (res.ok) {
      toast.show('success', `PIN code ${item.pincode} deleted.`);
      loadDeliveryData();
    } else {
      toast.show('error', res.error || 'Failed to delete PIN code.');
    }
  };

  const filteredPincodes = pincodes.filter((item) => {
    const matchesSearch =
      item.pincode.includes(search.trim()) ||
      item.area_name.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === 'Enabled') return matchesSearch && item.is_enabled;
    if (statusFilter === 'Disabled') return matchesSearch && !item.is_enabled;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2D6A4F]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Config Header */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#2D6A4F]" />
              Dynamic Distance Delivery Fee Engine
            </h3>
            <p className="text-xs text-stone-500">
              Calculate customer delivery charges dynamically at ₹{settings.ratePerKm}/km from Garuda Farms origin.
            </p>
          </div>
          <button
            onClick={loadDeliveryData}
            className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Store / Farm Origin Location
            </label>
            <input
              type="text"
              required
              value={settings.originAddress}
              onChange={(e) => setSettings({ ...settings, originAddress: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Delivery Charge Rate per Kilometer (₹/km)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-stone-400 font-bold text-sm">₹</span>
              <input
                type="number"
                min="1"
                step="0.5"
                required
                value={settings.ratePerKm}
                onChange={(e) => setSettings({ ...settings, ratePerKm: Number(e.target.value) })}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>
            <p className="text-[10px] text-stone-400 mt-1">Default rule: 5 km = ₹50, 10 km = ₹100</p>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Free Delivery Threshold (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-stone-400 font-bold text-sm">₹</span>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={settings.freeThreshold}
                onChange={(e) => setSettings({ ...settings, freeThreshold: Number(e.target.value) })}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>
            <p className="text-[10px] text-stone-400 mt-1">Orders above this subtotal get 100% FREE delivery (0 to disable)</p>
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-60"
            >
              {savingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Delivery Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Serviceable PIN Codes Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-stone-900 text-base">Serviceable PIN Codes</h3>
            <p className="text-xs text-stone-500">
              Manage serviceable Hyderabad & Ranga Reddy postal areas ({filteredPincodes.length} total)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Search PIN code or Area..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>

            <div className="flex border border-stone-200 rounded-xl overflow-hidden p-0.5 bg-stone-50">
              {(['All', 'Enabled', 'Disabled'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    statusFilter === st ? 'bg-white text-[#2D6A4F] shadow-xs' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add PIN Code</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">PIN Code</th>
                <th className="py-3.5 px-4">Service Area / Landmark</th>
                <th className="py-3.5 px-4">Distance (km)</th>
                <th className="py-3.5 px-4">Delivery Charge (₹)</th>
                <th className="py-3.5 px-4">Service Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs text-stone-700 font-medium">
              {filteredPincodes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    No matching PIN codes found.
                  </td>
                </tr>
              ) : (
                filteredPincodes.map((item) => {
                  const estimatedFee = Math.round(item.distance_km * settings.ratePerKm);
                  return (
                    <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">
                        {item.pincode}
                      </td>
                      <td className="py-3 px-4 font-semibold text-stone-900">
                        {item.area_name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-stone-800">{item.distance_km} km</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-[#2D6A4F]">₹{estimatedFee}</span>
                        <span className="text-[10px] text-stone-400 block">({item.distance_km} km × ₹{settings.ratePerKm})</span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleEnable(item)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                            item.is_enabled
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {item.is_enabled ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>{item.is_enabled ? 'Serviceable' : 'Disabled'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-200 transition-colors"
                            title="Edit PIN details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePin(item)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete PIN code"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit PIN Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-[#0F2D1F] p-4 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm">
                {editingPin ? `Edit PIN Code ${editingPin.pincode}` : 'Add New Serviceable PIN Code'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePin} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  6-Digit Postal PIN Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={formPin}
                  onChange={(e) => setFormPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 500032"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-mono font-bold text-stone-900 focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Area / Landmark Name
                </label>
                <input
                  type="text"
                  required
                  value={formArea}
                  onChange={(e) => setFormArea(e.target.value)}
                  placeholder="e.g. Gachibowli / Financial District"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Distance from Garuda Farms origin (km)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  required
                  value={formDistance}
                  onChange={(e) => setFormDistance(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 focus:outline-none focus:border-[#2D6A4F]"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Estimated Delivery Fee: ₹{Math.round(Number(formDistance || 0) * settings.ratePerKm)}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-xs font-bold text-stone-700">Enable Delivery for this PIN</span>
                <button
                  type="button"
                  onClick={() => setFormEnabled(!formEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formEnabled ? 'bg-[#2D6A4F]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-60"
                >
                  {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingPin ? 'Update PIN Code' : 'Save PIN Code'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN Admin Panel ─────────────────────────────────────────────────────────
export default function AdminPanel({ onBack }: { onBack?: () => void }) {
  const [section, setSection] = useState<AdminSection>('dashboard');
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(true);
  const toast = useToast();

  useEffect(() => {
    (async () => {
      setVerifying(true);
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (token) {
        const res = await api.getAdminIdentity();
        if (res.ok && res.admin) setAdminUser(res.admin);
      }
      setVerifying(false);
    })();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setLoginError(error.message); setLoginLoading(false); return; }
      const token = data.session?.access_token;
      if (token) {
        const res = await api.getAdminIdentity();
        if (res.ok && res.admin) { setAdminUser(res.admin); }
        else { await signOut(); setLoginError('You are not authorized to access the Admin Panel.'); }
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    setAdminUser(null);
    setEmail('');
    setPassword('');
  };

  const nav: Array<{ key: AdminSection; label: string; icon: React.ElementType }> = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'products', label: 'Products', icon: Package },
    { key: 'categories', label: 'Categories', icon: Layers },
    { key: 'orders', label: 'Orders', icon: ShoppingBag },
    { key: 'customers', label: 'Customers', icon: Users },
    { key: 'coupons', label: 'Smart Coupons', icon: Tag },
    { key: 'offers', label: 'Dynamic Offers', icon: TrendingUp },
    { key: 'reviews', label: 'Product Reviews', icon: Star },
    { key: 'delivery', label: 'Delivery & PINs', icon: Truck },
    { key: 'settings', label: 'Store Settings', icon: Settings },
    { key: 'audit', label: 'Audit Log', icon: Activity },
  ];

  const sectionTitles: Record<AdminSection, string> = {
    dashboard: 'Dashboard', products: 'Product Management', categories: 'Category Management',
    orders: 'Order Management', customers: 'Customer Management', coupons: 'Smart Coupons Engine',
    offers: 'Homepage Dynamic Offers', reviews: 'Product Reviews Moderation',
    delivery: 'Delivery Management & Serviceable PIN Codes', settings: 'Store Settings', audit: 'Audit Log',
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <RefreshCw className="w-10 h-10 animate-spin text-[#2D6A4F]" />
      </div>
    );
  }

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F2D1F] to-[#1B4332] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-[#0F2D1F] px-8 py-6 text-center">
            <div className="w-14 h-14 bg-[#2D6A4F] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-7 h-7 text-[#52B788]" />
            </div>
            <h1 className="text-xl font-black text-white">Garuda Farms</h1>
            <p className="text-[#52B788] text-sm mt-1">Admin Control Center</p>
          </div>
          <div className="p-8 space-y-5">
            {onBack && (
              <button onClick={onBack} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Store
              </button>
            )}
            <div>
              <h2 className="text-lg font-bold text-stone-900">Sign in to Admin</h2>
              <p className="text-xs text-stone-500 mt-1">Only authorized administrators can access this panel.</p>
            </div>
            {loginError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /><span>{loginError}</span>
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#2D6A4F]" />
              </div>
              <button type="submit" disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60">
                {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {loginLoading ? 'Signing in...' : 'Sign In to Admin Panel'}
              </button>
            </form>
            <p className="text-center text-xs text-stone-400">Protected • Authorized Administrators Only</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toast.toasts.map((t) => (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-xs animate-[slideIn_0.2s_ease] ${
            t.type === 'success' ? 'bg-emerald-600 text-white' : t.type === 'error' ? 'bg-red-600 text-white' : 'bg-stone-800 text-white'
          }`}>
            {t.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <aside className="w-64 bg-[#0F2D1F] text-white flex flex-col shrink-0 min-h-screen sticky top-0">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#2D6A4F] rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-[#52B788]" />
            </div>
            <div>
              <p className="font-black text-sm leading-tight">Garuda Farms</p>
              <p className="text-[10px] text-[#52B788] leading-tight">Admin Control Center</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setSection(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                section === key ? 'bg-[#2D6A4F] text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}>
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-2">
          {onBack && (
            <button onClick={onBack}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all">
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span>Back to Store</span>
            </button>
          )}
          <div className="px-3 py-2">
            <p className="text-[10px] text-white/40 truncate">{adminUser.email}</p>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all">
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h1 className="font-black text-stone-900 text-lg">{sectionTitles[section]}</h1>
            <p className="text-xs text-stone-400">Garuda Farms Store Control Center</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-500 hidden sm:block">
              Signed in as <strong className="text-stone-900">{adminUser.name || adminUser.email}</strong>
            </span>
            <div className="w-8 h-8 bg-[#2D6A4F] rounded-full flex items-center justify-center text-white text-xs font-bold">
              {(adminUser.name || adminUser.email || 'A')[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-6">
          {section === 'dashboard' && <DashboardSection toast={toast} />}
          {section === 'products' && <ProductsSection toast={toast} />}
          {section === 'categories' && <CategoriesSection toast={toast} />}
          {section === 'orders' && <OrdersSection toast={toast} />}
          {section === 'customers' && <CustomersSection toast={toast} />}
          {section === 'coupons' && <CouponsSection toast={toast} />}
          {section === 'offers' && <OffersSection toast={toast} />}
          {section === 'reviews' && <ReviewsSection toast={toast} />}
          {section === 'delivery' && <DeliverySection toast={toast} />}
          {section === 'settings' && <StoreSettingsSection toast={toast} />}
          {section === 'audit' && <AuditLogSection toast={toast} />}
        </div>
      </main>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
