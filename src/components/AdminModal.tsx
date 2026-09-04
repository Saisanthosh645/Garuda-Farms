import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Lock,
  Unlock,
  ShieldCheck,
  Database,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  Search,
  Check,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { api, HealthCheckResponse, AdminUser } from '../lib/api';
import { Product } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductsUpdated?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  onProductsUpdated,
}) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('garuda_admin_token'));
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Login form
  const [email, setEmail] = useState('admin@garudafarms.com');
  const [password, setPassword] = useState('GarudaAdmin@2026!');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // System & DB Status
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false);
  const [isSeedingDb, setIsSeedingDb] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  // Product Inventory Tab
  const [activeTab, setActiveTab] = useState<'system' | 'inventory' | 'test-payment'>('system');
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdatingStock, setIsUpdatingStock] = useState<number | null>(null);

  // Check auth session on mount/open
  useEffect(() => {
    if (!isOpen) return;

    fetchHealth();

    const savedToken = localStorage.getItem('garuda_admin_token');
    if (savedToken) {
      verifyAdmin(savedToken);
    }
  }, [isOpen]);

  const fetchHealth = async () => {
    setIsRefreshingHealth(true);
    try {
      const [healthRes, dbRes] = await Promise.all([
        api.getHealth(),
        api.getDbStatus(),
      ]);
      setHealthData(healthRes);
      setDbStatus(dbRes);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshingHealth(false);
    }
  };

  const verifyAdmin = async (authToken: string) => {
    setIsVerifying(true);
    try {
      const res = await api.getAdminMe(authToken);
      if (res.ok && res.admin) {
        setAdminUser(res.admin);
        setToken(authToken);
        fetchAdminProducts();
      } else {
        localStorage.removeItem('garuda_admin_token');
        setToken(null);
        setAdminUser(null);
      }
    } catch {
      localStorage.removeItem('garuda_admin_token');
      setToken(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await api.loginAdmin(email, password);
      if (res.ok && res.token && res.admin) {
        localStorage.setItem('garuda_admin_token', res.token);
        setToken(res.token);
        setAdminUser(res.admin);
        fetchAdminProducts();
      } else {
        setLoginError(res.error || 'Authentication failed. Invalid admin credentials.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Server error during login.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logoutAdmin();
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('garuda_admin_token');
    setToken(null);
    setAdminUser(null);
  };

  const fetchAdminProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeedingDb(true);
    setSeedMessage(null);
    try {
      const res = await api.seedDatabase();
      if (res.ok) {
        setSeedMessage(res.message || 'Database seeded successfully with 50 products!');
        await fetchHealth();
        await fetchAdminProducts();
        if (onProductsUpdated) onProductsUpdated();
      } else {
        setSeedMessage(res.error || 'Could not seed database. Please check SUPABASE_URL in .env.');
      }
    } catch (err: any) {
      setSeedMessage(err.message || 'Database sync request failed.');
    } finally {
      setIsSeedingDb(false);
    }
  };

  const handleToggleStock = async (product: Product) => {
    if (!token) return;
    setIsUpdatingStock(product.id);
    const newStock = !product.stock;

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stock: newStock }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p))
        );
        if (onProductsUpdated) onProductsUpdated();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingStock(null);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-[#FDFBF7] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-[#DCD2C3] z-10 my-8 flex flex-col max-h-[90vh]"
        >
          {/* Top Bar */}
          <div className="p-6 bg-[#0F2D1F] text-[#FAF8F2] flex items-center justify-between border-b border-[#2D6A4F]/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2D6A4F] flex items-center justify-center text-[#52B788] shadow-inner">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-extrabold text-lg leading-none">
                    Garuda Farms Admin Portal
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2D6A4F]/80 text-[#FAF8F2] font-mono uppercase tracking-wider">
                    Single-Admin Mode
                  </span>
                </div>
                <p className="text-xs text-[#FAF8F2]/70 mt-1">
                  Full-stack control center • Supabase PostgreSQL & Razorpay Standard Gateway
                </p>
              </div>
            </div>

            <button
              id="admin-modal-close-btn"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-[#FAF8F2]/80 hover:text-[#FAF8F2] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!adminUser ? (
            /* Login Screen */
            <div className="p-8 sm:p-12 max-w-md mx-auto w-full space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-[#2D6A4F]/10 text-[#2D6A4F] rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-7 h-7" />
                </div>
                <h4 className="font-heading text-2xl font-bold text-[#0F2D1F]">
                  Admin Authentication
                </h4>
                <p className="text-xs text-[#556960]">
                  Restricted access. Authenticate with the configured single admin master credentials.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#8C6239] block mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF8F2] border border-[#DCD2C3] text-sm text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-[#8C6239] block mb-1">
                    Master Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF8F2] border border-[#DCD2C3] text-sm text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                  />
                </div>

                <div className="p-3 bg-[#FAF8F2] rounded-xl border border-[#E5DEC9] text-[11px] text-[#556960] space-y-1.5">
                  <span className="font-bold text-[#0F2D1F] block">Quick Autofill Single Admin:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('admin@garudafarms.com');
                        setPassword('GarudaAdmin@2026!');
                      }}
                      className="text-[10px] bg-[#2D6A4F]/10 hover:bg-[#2D6A4F]/20 text-[#2D6A4F] font-bold px-2.5 py-1 rounded-lg transition-colors"
                    >
                      admin@garudafarms.com
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('raminiacademy@gmail.com');
                        setPassword('26082007@Saisanthosh');
                      }}
                      className="text-[10px] bg-[#2D6A4F]/10 hover:bg-[#2D6A4F]/20 text-[#2D6A4F] font-bold px-2.5 py-1 rounded-lg transition-colors"
                    >
                      raminiacademy@gmail.com
                    </button>
                  </div>
                </div>

                <button
                  id="admin-login-submit-btn"
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-[#FAF8F2] text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {loginLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span>Unlock Admin Console</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Logged In Console */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Navigation Tabs */}
              <div className="px-6 bg-[#FAF8F2] border-b border-[#EFE8DC] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('system')}
                    className={`py-3.5 px-4 text-xs font-bold tracking-wider uppercase border-b-2 flex items-center gap-2 transition-all ${
                      activeTab === 'system'
                        ? 'border-[#2D6A4F] text-[#2D6A4F]'
                        : 'border-transparent text-[#556960] hover:text-[#0F2D1F]'
                    }`}
                  >
                    <Database className="w-4 h-4" />
                    <span>Infrastructure & Health</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('inventory')}
                    className={`py-3.5 px-4 text-xs font-bold tracking-wider uppercase border-b-2 flex items-center gap-2 transition-all ${
                      activeTab === 'inventory'
                        ? 'border-[#2D6A4F] text-[#2D6A4F]'
                        : 'border-transparent text-[#556960] hover:text-[#0F2D1F]'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>Inventory ({products.length})</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#556960] hidden sm:inline">
                    Logged in as <strong>{adminUser.email}</strong>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'system' && (
                  <div className="space-y-6">
                    {/* Live System Status Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Database Card */}
                      <div className="p-5 rounded-2xl bg-[#FAF8F2] border border-[#DCD2C3] space-y-2 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6239]">
                            Database Engine
                          </span>
                          <Database className="w-4 h-4 text-[#2D6A4F]" />
                        </div>
                        <h5 className="font-heading font-black text-lg text-[#0F2D1F]">
                          {healthData?.database.provider || 'Supabase PostgreSQL'}
                        </h5>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            healthData?.database.connected ? 'bg-emerald-500' : 'bg-amber-500'
                          }`} />
                          <span className="text-xs text-[#556960]">
                            {healthData?.database.connected ? 'Active & Connected' : 'Standby / Local Seeded'}
                          </span>
                        </div>
                        {dbStatus && (
                          <div className="pt-2 text-[11px] text-[#556960] border-t border-[#EFE8DC] space-y-0.5">
                            <div>Products in Catalog: <strong>{dbStatus.productsInDatabase ?? 50}</strong></div>
                            <div>Categories: <strong>{dbStatus.categoriesInDatabase ?? 10}</strong></div>
                          </div>
                        )}
                      </div>

                      {/* Razorpay Gateway Card */}
                      <div className="p-5 rounded-2xl bg-[#FAF8F2] border border-[#DCD2C3] space-y-2 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6239]">
                            Payment Gateway
                          </span>
                          <CreditCard className="w-4 h-4 text-[#2D6A4F]" />
                        </div>
                        <h5 className="font-heading font-black text-lg text-[#0F2D1F]">
                          Razorpay Standard
                        </h5>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="text-xs font-bold text-emerald-700">
                            {healthData?.payments.mode || 'Live Gateway'}
                          </span>
                        </div>
                        <div className="pt-2 text-[11px] text-[#556960] border-t border-[#EFE8DC]">
                          Key ID: <code className="font-mono text-[#0F2D1F]">rzp_test_TXrc...</code>
                        </div>
                      </div>

                      {/* Admin Guard Card */}
                      <div className="p-5 rounded-2xl bg-[#FAF8F2] border border-[#DCD2C3] space-y-2 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6239]">
                            Security Policy
                          </span>
                          <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
                        </div>
                        <h5 className="font-heading font-black text-lg text-[#0F2D1F]">
                          JWT + bcrypt
                        </h5>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="text-xs text-[#556960]">
                            Single-Admin Enforced
                          </span>
                        </div>
                        <div className="pt-2 text-[11px] text-[#556960] border-t border-[#EFE8DC] truncate">
                          Admin: {healthData?.auth.adminEmail || 'admin@garudafarms.com'}
                        </div>
                      </div>
                    </div>

                    {/* Migration / Database Seeding Action */}
                    <div className="p-6 rounded-2xl bg-[#0F2D1F] text-[#FAF8F2] space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-heading font-bold text-base flex items-center gap-2">
                            <Database className="w-5 h-5 text-[#52B788]" />
                            <span>Supabase Database Migration & Seeding</span>
                          </h4>
                          <p className="text-xs text-[#FAF8F2]/75 mt-1 max-w-xl">
                            Executes automated schema verification and bulk-seeds all 50 single-origin harvests, 10 categories, and the single admin account into your Supabase PostgreSQL cluster.
                          </p>
                        </div>

                        <button
                          id="seed-db-btn"
                          onClick={handleSeedDatabase}
                          disabled={isSeedingDb}
                          className="px-5 py-3 rounded-xl bg-[#2D6A4F] hover:bg-[#52B788] hover:text-[#0F2D1F] text-[#FAF8F2] text-xs font-bold uppercase tracking-wider shrink-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isSeedingDb ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                          <span>Sync / Seed Supabase</span>
                        </button>
                      </div>

                      {seedMessage && (
                        <div className="p-3 bg-white/10 rounded-xl text-xs text-[#52B788] border border-[#52B788]/30 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{seedMessage}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'inventory' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C6239]" />
                        <input
                          type="text"
                          placeholder="Search 50 products by name or category..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F2] border border-[#DCD2C3] text-xs text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                        />
                      </div>
                      <span className="text-xs text-[#556960]">
                        Showing {filteredProducts.length} of {products.length} Items
                      </span>
                    </div>

                    <div className="border border-[#DCD2C3] rounded-2xl overflow-hidden bg-[#FAF8F2]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#EFE8DC] text-[#0F2D1F] font-bold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="p-3">Product</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Origin</th>
                            <th className="p-3 text-center">In Stock</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5DEC9]">
                          {filteredProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-[#FAF8F2]/60">
                              <td className="p-3 font-semibold text-[#0F2D1F] flex items-center gap-2.5">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-8 h-8 rounded-lg object-cover"
                                  onError={(e) => {
                                    (e.target as any).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80';
                                  }}
                                />
                                <div>
                                  <span className="block leading-tight">{product.name}</span>
                                  <span className="text-[10px] text-[#8C6239]">ID: #{product.id}</span>
                                </div>
                              </td>
                              <td className="p-3 text-[#556960]">{product.category}</td>
                              <td className="p-3 font-bold text-[#0F2D1F]">₹{product.price}</td>
                              <td className="p-3 text-[#556960]">{product.farmOrigin}</td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => handleToggleStock(product)}
                                  disabled={isUpdatingStock === product.id}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                    product.stock
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                                  }`}
                                >
                                  {isUpdatingStock === product.id
                                    ? 'Updating...'
                                    : product.stock
                                    ? 'In Stock'
                                    : 'Out of Stock'}
                                </button>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleToggleStock(product)}
                                  className="text-[11px] text-[#2D6A4F] hover:underline font-bold"
                                >
                                  Toggle Stock
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
