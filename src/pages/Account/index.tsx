import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { api } from '../../lib/api';
import { Product } from '../../types';
import SproutLoader from '../../components/SproutLoader';
import { InvoiceModal } from '../../components/InvoiceModal';
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  Clock,
  Tag,
  Bell,
  HelpCircle,
  Shield,
  LogOut,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  Search,
  ChevronRight,
  RefreshCw,
  MessageSquare,
  Send,
  Phone,
  Mail,
  ExternalLink,
  Sparkles,
  ArrowRight,
  KeyRound,
  BellOff,
  BellRing,
  Percent,
  FileText,
} from 'lucide-react';

interface AccountPageProps {
  initialTab?: string;
  onNavigateToProducts?: () => void;
  onAddToCart?: (product: Product, weight?: string, quantity?: number) => void;
  allProducts?: Product[];
}

const AUTHORIZED_ADMIN_EMAILS = [
  'garudafarms9427@gmail.com',
  'raminisaisanthosh@gmail.com',
];

const SectionSkeleton: React.FC<{ label?: string }> = ({ label = 'Nurturing harvest data...' }) => (
  <div className="bg-white rounded-2xl border border-[#DCD2C3] p-10 flex flex-col items-center justify-center text-center shadow-sm">
    <SproutLoader size="md" label={label} />
  </div>
);

export const AccountPage: React.FC<AccountPageProps> = ({
  initialTab = 'overview',
  onNavigateToProducts,
  onAddToCart,
  allProducts: passedProducts = [],
}) => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);

const mergeLocalOrders = (serverOrders: any[], currentUserEmail?: string): any[] => {
  try {
    // Use per-user scoped key to prevent cross-account order bleed
    const userKey = currentUserEmail
      ? `garuda_orders_${currentUserEmail.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      : null;
    const cached = userKey
      ? JSON.parse(localStorage.getItem(userKey) || '[]')
      : [];
    if (!Array.isArray(cached) || cached.length === 0) return serverOrders;
    const serverMap = new Set(serverOrders.map((o) => String(o.id)));
    const merged = [...serverOrders];
    cached.forEach((loc: any) => {
      const id = String(loc.orderId || loc.id || '');
      // Extra safety: only include cached orders belonging to this email
      const locEmail = (loc.email || '').toLowerCase();
      if (id && !serverMap.has(id) && (!locEmail || !currentUserEmail || locEmail === currentUserEmail.toLowerCase())) {
        merged.push({
          id,
          customer_name: loc.customerName,
          customer_email: loc.email,
          customer_phone: loc.phone,
          shipping_address: loc.address,
          city: loc.city,
          pincode: loc.pincode,
          delivery_slot: loc.deliverySlot,
          total_amount: loc.total || 0,
          subtotal: loc.subtotal || loc.total || 0,
          delivery_charge: loc.deliveryFee || 0,
          discount_amount: loc.discount || 0,
          payment_method: loc.paymentMethod || 'COD',
          payment_status: loc.paymentStatus || 'Pending',
          order_status: 'Confirmed',
          created_at: loc.timestamp || new Date().toISOString(),
          items: (loc.items || []).map((it: any) => ({
            id: String(it.product?.id || Math.random()),
            product_id: Number(it.product?.id || 0),
            product_name: it.product?.name || 'Farm Product',
            selected_weight: it.selectedWeight || '',
            unit_price: Number(it.price || 0),
            quantity: Number(it.quantity || 1),
            total_price: Number((it.price || 0) * (it.quantity || 1)),
          })),
        });
      }
    });
    return merged.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  } catch {
    return serverOrders;
  }
};

  // States for DB data
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>(passedProducts);
  const [coupons, setCoupons] = useState<any[]>([]);

  // Section loading states for lazy fetching
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [loadedSections, setLoadedSections] = useState<Record<string, boolean>>({});

  // Modals & UI controls
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [trackingData, setTrackingData] = useState<any | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<any | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    address_line: '',
    city: '',
    state: 'Telangana',
    pincode: '',
    label: 'Home',
    is_default: false,
  });

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    dob: '',
    gender: 'Prefer not to say',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Support Ticket Form
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'Order Issue',
    message: '',
    order_id: '',
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Security Tab State
  const [sendingPasswordReset, setSendingPasswordReset] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  // Address delete confirmation
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);

  // Filters & Toast
  const [orderFilter, setOrderFilter] = useState<'All' | 'Active' | 'Delivered' | 'Cancelled'>('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Keep passedProducts synced with allProducts
  useEffect(() => {
    if (Array.isArray(passedProducts)) {
      setAllProducts(passedProducts);
    }
  }, [passedProducts]);

  // Load user profile (non-blocking)
  const loadProfile = async () => {
    if (!user) return;
    try {
      const profRes = await api.getProfile();
      if (profRes.ok && profRes.profile) {
        setProfile(profRes.profile);
        setProfileForm({
          full_name: profRes.profile.full_name || (user.user_metadata as any)?.fullName || '',
          phone: profRes.profile.phone || '',
          dob: profRes.profile.dob || '',
          gender: profRes.profile.gender || 'Prefer not to say',
        });
      } else {
        setProfileForm({
          full_name: (user.user_metadata as any)?.fullName || user.email?.split('@')[0] || '',
          phone: '',
          dob: '',
          gender: 'Prefer not to say',
        });
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
  };

  // Lazy-load section data on demand when tab opens
  // NOTE: orders and addresses ALWAYS reload on each navigation to keep data fresh
  const fetchSectionData = async (tab: string, force = false) => {
    if (!user) return;
    if (tab === 'overview' || tab === 'orders') {
      // Always force-reload orders — never use stale cache so new orders appear immediately
      setLoadingOrders(true);
      try {
        const res = await api.getOrders();
        if (res.ok && Array.isArray(res.orders)) setOrders(mergeLocalOrders(res.orders, user?.email));
      } catch (e) {}
      setLoadingOrders(false);
      setLoadedSections((prev) => ({ ...prev, orders: true }));
    }
    if (tab === 'overview' || tab === 'addresses') {
      if (!loadedSections['addresses'] || force) {
        setLoadingAddresses(true);
        try {
          const res = await api.getAddresses();
          if (res.ok && Array.isArray(res.addresses)) setAddresses(res.addresses);
        } catch (e) {}
        setLoadingAddresses(false);
        setLoadedSections((prev) => ({ ...prev, addresses: true }));
      }
    }
    if (tab === 'wishlist') {
      if (!loadedSections['wishlist'] || force) {
        setLoadingWishlist(true);
        try {
          const res = await api.getWishlist();
          if (res.ok && Array.isArray(res.productIds)) setWishlistIds(res.productIds);
        } catch (e) {}
        setLoadingWishlist(false);
        setLoadedSections((prev) => ({ ...prev, wishlist: true }));
      }
    }
    if (tab === 'notifications' || tab === 'overview') {
      if (!loadedSections['notifications'] || force) {
        setLoadingNotifications(true);
        try {
          const res = await api.getNotifications();
          if (res.ok && Array.isArray(res.notifications)) setNotifications(res.notifications);
        } catch (e) {}
        setLoadingNotifications(false);
        setLoadedSections((prev) => ({ ...prev, notifications: true }));
      }
    }
    if (tab === 'help') {
      if (!loadedSections['tickets'] || force) {
        setLoadingTickets(true);
        try {
          const res = await api.getSupportTickets();
          if (res.ok && Array.isArray(res.tickets)) setSupportTickets(res.tickets);
        } catch (e) {}
        setLoadingTickets(false);
        setLoadedSections((prev) => ({ ...prev, tickets: true }));
      }
    }
    if (tab === 'coupons') {
      if (!loadedSections['coupons'] || force) {
        setLoadingCoupons(true);
        try {
          const res = await api.getActiveCoupons();
          if (res.ok && Array.isArray(res.coupons)) setCoupons(res.coupons);
        } catch (e) {}
        setLoadingCoupons(false);
        setLoadedSections((prev) => ({ ...prev, coupons: true }));
      }
    }
  };

  const loadAccountData = () => {
    loadProfile();
    fetchSectionData(activeTab, true);
  };

  // Clear ALL section state immediately when user changes (logout/switch account)
  // This prevents the previous user's data from flashing for the new user
  useEffect(() => {
    setOrders([]);
    setAddresses([]);
    setWishlistIds([]);
    setWishlistProducts([]);
    setNotifications([]);
    setSupportTickets([]);
    setLoadedSections({});
  }, [user?.id]);

  useEffect(() => {
    loadProfile();
  }, [user]);

  useEffect(() => {
    fetchSectionData(activeTab);
  }, [user, activeTab]);

  // Listen for new order placed event (fired from CheckoutModal after success)
  // so My Orders auto-refreshes without needing a manual page reload
  useEffect(() => {
    const handleOrderPlaced = () => {
      if (!user) return;
      setLoadingOrders(true);
      api.getOrders().then((res) => {
        if (res.ok && Array.isArray(res.orders)) setOrders(mergeLocalOrders(res.orders, user?.email));
        setLoadingOrders(false);
      }).catch(() => setLoadingOrders(false));
    };
    window.addEventListener('garuda_order_placed', handleOrderPlaced);
    return () => window.removeEventListener('garuda_order_placed', handleOrderPlaced);
  }, [user]);

  // Sync Wishlist products when wishlistIds or allProducts update
  useEffect(() => {
    if (wishlistIds.length > 0 && allProducts.length > 0) {
      const filtered = allProducts.filter((p) => wishlistIds.includes(p.id) && !p.hidden);
      setWishlistProducts(filtered);
    } else {
      setWishlistProducts([]);
    }
  }, [wishlistIds, allProducts]);

  // Load recently viewed from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('garuda_recently_viewed');
      if (stored) setRecentlyViewed(JSON.parse(stored));
    } catch {}
  }, []);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-[#2D6A4F]/10 text-[#2D6A4F] rounded-3xl flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="font-heading text-3xl font-bold text-[#0F2D1F]">Please Sign In</h2>
        <p className="text-sm text-[#556960] max-w-md mx-auto">
          Access your personal Garuda Farms Customer Control Center, saved addresses, order tracking, and wishlist.
        </p>
      </div>
    );
  }

  const isAdminUser = AUTHORIZED_ADMIN_EMAILS.includes(user.email?.toLowerCase() || '');

  // Derived order counts
  const totalOrdersCount = orders.length;
  const activeOrders = orders.filter((o) => ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery'].includes(o.order_status));
  const deliveredOrders = orders.filter((o) => o.order_status === 'Delivered');
  const unreadNotifications = notifications.filter((n) => !n.read);

  // Address Save Handler
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddress) {
      const res = await api.updateAddress(editingAddress.id, addressForm);
      if (res.ok) {
        showToast('Address updated successfully');
        setIsAddressModalOpen(false);
        setEditingAddress(null);
        loadAccountData();
      } else {
        showToast(res.error || 'Failed to update address', 'error');
      }
    } else {
      const res = await api.addAddress(addressForm);
      if (res.ok) {
        showToast('New address saved to your account');
        setIsAddressModalOpen(false);
        loadAccountData();
      } else {
        showToast(res.error || 'Failed to save address', 'error');
      }
    }
  };

  // Profile Save Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const res = await api.updateProfile(profileForm);
    setSavingProfile(false);
    if (res.ok) {
      showToast('Profile updated successfully');
      setIsEditingProfile(false);
      loadAccountData();
    } else {
      showToast(res.error || 'Failed to update profile', 'error');
    }
  };

  // Cancel Order Handler
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm(`Are you sure you want to cancel Order #${orderId}?`)) return;
    const res = await api.cancelOrder(orderId);
    if (res.ok) {
      showToast(`Order #${orderId} has been cancelled.`);
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      loadAccountData();
    } else {
      showToast(res.error || 'Could not cancel order.', 'error');
    }
  };

  // Reorder Handler
  const handleReorder = async (orderId: string) => {
    const res = await api.reorderItems(orderId);
    if (res.ok && res.items) {
      let addedCount = 0;
      res.items.forEach((item: any) => {
        if (onAddToCart) {
          onAddToCart(item.product, item.weight, item.quantity);
          addedCount++;
        }
      });
      if (res.unavailable && res.unavailable.length > 0) {
        showToast(`Added ${addedCount} items. (Out of stock: ${res.unavailable.join(', ')})`);
      } else {
        showToast(`Added ${addedCount} items from Order #${orderId} to your cart.`);
      }
    } else {
      showToast(res.error || 'Could not reorder items.', 'error');
    }
  };

  // View Tracking Timeline Modal
  const handleViewTracking = async (order: any) => {
    setSelectedOrder(order);
    const trackRes = await api.getOrderTracking(order.id);
    if (trackRes.ok) {
      setTrackingData(trackRes);
    }
  };

  // Submit Support Ticket
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTicket(true);
    const res = await api.createSupportTicket(ticketForm);
    setSubmittingTicket(false);
    if (res.ok) {
      showToast('Support request submitted. Our team will contact you shortly.');
      setTicketForm({ subject: '', category: 'Order Issue', message: '', order_id: '' });
      loadAccountData();
    } else {
      showToast(res.error || 'Could not submit support ticket.', 'error');
    }
  };

  // Copy Coupon Code
  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  // Mark notification as read
  const handleMarkNotificationRead = async (id: string) => {
    const notification = notifications.find((n) => n.id === id);
    if (notification?.read) return;
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await api.markNotificationAsRead(id);
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await api.markAllNotificationsRead();
  };

  // Delete address with confirmation
  const handleDeleteAddress = async (id: string) => {
    setDeletingAddressId(id);
  };

  const handleConfirmDeleteAddress = async () => {
    if (!deletingAddressId) return;
    const res = await api.deleteAddress(deletingAddressId);
    setDeletingAddressId(null);
    if (res.ok) {
      showToast('Address deleted successfully');
      loadAccountData();
    } else {
      showToast('Failed to delete address', 'error');
    }
  };

  // Send password reset
  const handleSendPasswordReset = async () => {
    if (!user.email) return;
    setSendingPasswordReset(true);
    const res = await api.sendPasswordReset(user.email);
    setSendingPasswordReset(false);
    if (res.ok) {
      setPasswordResetSent(true);
      showToast(`Password reset email sent to ${user.email}`);
    } else {
      showToast(res.error || 'Failed to send password reset email', 'error');
    }
  };

  // Status color helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Cancelled': return 'bg-red-50 text-red-800 border-red-200';
      case 'Shipped':
      case 'Out for Delivery': return 'bg-blue-50 text-blue-800 border-blue-200';
      default: return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F2] py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Banner & User Welcome Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-[#0F2D1F] to-[#143D2B] rounded-3xl p-6 sm:p-8 text-[#FAF8F2] shadow-xl border border-[#D4A373]/30 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#D4A373]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4A373] to-[#8C6239] p-0.5 shadow-lg flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-[#0F2D1F] rounded-[14px] flex items-center justify-center font-heading font-black text-2xl text-[#D4A373]">
                  {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#FAF8F2]">
                    Welcome back, {profile?.full_name || (user.user_metadata as any)?.fullName || user.email?.split('@')[0]}
                  </h1>
                  {isAdminUser && (
                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#D4A373] text-[#0F2D1F] rounded-full uppercase tracking-wider">
                      Authorized Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#FAF8F2]/70 mt-1">
                  Garuda Patron ID: <code className="text-[#D4A373] font-mono">{user.id.slice(0, 8)}</code> • Member since {user.created_at ? new Date(user.created_at).toLocaleDateString() : '2026'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isAdminUser && (
                <a
                  href="#admin"
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#D4A373] hover:bg-[#c39262] text-[#0F2D1F] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Control Center</span>
                </a>
              )}
              <button
                onClick={() => signOut()}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-[#FAF8F2] text-xs font-bold rounded-xl transition-colors border border-white/20 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Account Grid Container */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-2">
          <div className="bg-white rounded-2xl border border-[#DCD2C3] p-3 shadow-sm space-y-1 sticky top-24">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6239] px-3 py-1.5 block">
              Customer Center
            </span>

            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'profile', label: 'My Profile', icon: User },
              { id: 'orders', label: 'My Orders', icon: ShoppingBag, badge: orders.length > 0 ? orders.length : undefined },
              { id: 'addresses', label: 'Saved Addresses', icon: MapPin, badge: addresses.length > 0 ? addresses.length : undefined },
              { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: wishlistIds.length > 0 ? wishlistIds.length : undefined },
              { id: 'recently-viewed', label: 'Recently Viewed', icon: Clock },
              { id: 'coupons', label: 'Coupons & Offers', icon: Tag },
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications.length > 0 ? unreadNotifications.length : undefined },
              { id: 'support', label: 'Help & Support', icon: HelpCircle },
              { id: 'security', label: 'Security & Auth', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#2D6A4F] text-[#FAF8F2] shadow-sm'
                      : 'text-[#4A5D53] hover:bg-[#FAF8F2] hover:text-[#0F2D1F]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4A373]' : 'text-[#8C6239]'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                        isActive ? 'bg-white/20 text-[#FAF8F2]' : 'bg-[#EFE8DC] text-[#2D6A4F]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Main Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className={`p-4 rounded-2xl shadow-lg border flex items-center justify-between text-xs animate-in fade-in ${
              toastType === 'error'
                ? 'bg-red-900 text-white border-red-700/40'
                : 'bg-[#0F2D1F] text-[#FAF8F2] border-[#D4A373]/40'
            }`}>
              <div className="flex items-center gap-2">
                <Sparkles className={`w-4 h-4 ${toastType === 'error' ? 'text-red-300' : 'text-[#D4A373]'}`} />
                <span>{toastMessage}</span>
              </div>
              <button onClick={() => setToastMessage(null)} className="text-white/60 hover:text-white">
                ✕
              </button>
            </div>
          )}


              {/* TAB 1: OVERVIEW DASHBOARD */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stat Cards Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div
                      onClick={() => setActiveTab('orders')}
                      className="bg-white p-5 rounded-2xl border border-[#DCD2C3] shadow-sm space-y-2 cursor-pointer hover:border-[#2D6A4F] transition-colors"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6239]">Total Orders</span>
                      <div className="font-heading text-3xl font-black text-[#0F2D1F]">{totalOrdersCount}</div>
                    </div>
                    <div
                      onClick={() => { setActiveTab('orders'); setOrderFilter('Active'); }}
                      className="bg-white p-5 rounded-2xl border border-[#DCD2C3] shadow-sm space-y-2 cursor-pointer hover:border-amber-400 transition-colors"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Active Orders</span>
                      <div className="font-heading text-3xl font-black text-amber-800">{activeOrders.length}</div>
                    </div>
                    <div
                      onClick={() => { setActiveTab('orders'); setOrderFilter('Delivered'); }}
                      className="bg-white p-5 rounded-2xl border border-[#DCD2C3] shadow-sm space-y-2 cursor-pointer hover:border-emerald-400 transition-colors"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Delivered</span>
                      <div className="font-heading text-3xl font-black text-emerald-800">{deliveredOrders.length}</div>
                    </div>
                    <div
                      onClick={() => setActiveTab('wishlist')}
                      className="bg-white p-5 rounded-2xl border border-[#DCD2C3] shadow-sm space-y-2 cursor-pointer hover:border-[#2D6A4F] transition-colors"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D6A4F]">Saved Wishlist</span>
                      <div className="font-heading text-3xl font-black text-[#2D6A4F]">{wishlistIds.length}</div>
                    </div>
                  </div>

                  {/* Active Order Widget (if any) */}
                  {activeOrders.length > 0 && (
                    <div className="bg-gradient-to-br from-[#143D2B] to-[#0F2D1F] text-[#FAF8F2] p-6 rounded-2xl border border-[#D4A373]/30 shadow-lg space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <Truck className="w-5 h-5 text-[#D4A373]" />
                          <h3 className="font-heading font-bold text-lg">Active Delivery Status</h3>
                        </div>
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
                          {activeOrders[0].order_status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                        <div>
                          <span className="text-white/60 block">Order Reference</span>
                          <strong className="font-heading text-base font-bold text-white">#{activeOrders[0].id}</strong>
                        </div>
                        <div>
                          <span className="text-white/60 block">Shipping Address</span>
                          <strong className="text-white">{activeOrders[0].shipping_address}, {activeOrders[0].city}</strong>
                        </div>
                        <div>
                          <span className="text-white/60 block">Amount</span>
                          <strong className="text-white text-base">₹{Number(activeOrders[0].total_amount).toFixed(2)}</strong>
                        </div>
                        <button
                          onClick={() => handleViewTracking(activeOrders[0])}
                          className="px-4 py-2 bg-[#D4A373] text-[#0F2D1F] font-bold text-xs rounded-xl hover:bg-white transition-colors"
                        >
                          Track Dispatch Timeline
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Recent Orders Overview */}
                  <div className="bg-white rounded-2xl border border-[#DCD2C3] p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#EFE8DC] pb-4">
                      <h3 className="font-heading text-lg font-bold text-[#0F2D1F]">Recent Orders</h3>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-bold text-[#2D6A4F] hover:underline flex items-center gap-1"
                      >
                        <span>View All Orders ({orders.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {orders.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#556960] space-y-2">
                        <p>No orders placed yet.</p>
                        <button
                          onClick={onNavigateToProducts}
                          className="px-4 py-2 bg-[#2D6A4F] text-[#FAF8F2] font-bold rounded-xl"
                        >
                          Explore Harvest Catalog
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#EFE8DC]">
                        {orders.slice(0, 3).map((order) => (
                          <div key={order.id} className="py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
                            <div>
                              <strong className="font-heading text-sm text-[#0F2D1F]">#{order.id}</strong>
                              <span className="text-[#556960] block">{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getStatusColor(order.order_status)}`}>
                                {order.order_status}
                              </span>
                            </div>
                            <strong className="font-bold text-[#0F2D1F]">₹{Number(order.total_amount).toFixed(2)}</strong>
                            <button
                              onClick={() => handleViewTracking(order)}
                              className="text-[#2D6A4F] font-bold hover:underline"
                            >
                              Details & Track
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick shortcuts */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Browse Products', tab: null, action: onNavigateToProducts, icon: ShoppingBag, color: 'bg-[#2D6A4F]' },
                      { label: 'Manage Addresses', tab: 'addresses', icon: MapPin, color: 'bg-[#8C6239]' },
                      { label: 'View Coupons', tab: 'coupons', icon: Tag, color: 'bg-emerald-700' },
                      { label: 'Get Support', tab: 'support', icon: HelpCircle, color: 'bg-[#0F2D1F]' },
                    ].map((s) => (
                      <button
                        key={s.label}
                        onClick={() => s.action ? s.action() : setActiveTab(s.tab!)}
                        className={`${s.color} text-white p-4 rounded-2xl text-xs font-bold flex flex-col items-center gap-2 hover:opacity-90 transition-opacity shadow-sm`}
                      >
                        <s.icon className="w-5 h-5" />
                        <span className="text-center leading-tight">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: PROFILE */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl border border-[#DCD2C3] p-6 space-y-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#EFE8DC] pb-4">
                    <div>
                      <h3 className="font-heading text-xl font-bold text-[#0F2D1F]">Customer Profile</h3>
                      <p className="text-xs text-[#556960]">Your verified patron information saved in Garuda backend database</p>
                    </div>
                    <button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="px-4 py-2 bg-[#FAF8F2] border border-[#DCD2C3] hover:bg-[#EFE8DC] text-[#0F2D1F] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}</span>
                    </button>
                  </div>

                  {!isEditingProfile ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#0F2D1F]">
                      {[
                        { label: 'Full Name', value: profile?.full_name || (user.user_metadata as any)?.fullName || 'Not specified' },
                        { label: 'Account Email (Supabase Auth)', value: user.email },
                        { label: 'Phone Number', value: profile?.phone || 'Not provided' },
                        { label: 'Gender Identity', value: profile?.gender || 'Prefer not to say' },
                        { label: 'Date of Birth', value: profile?.dob ? new Date(profile.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Not specified' },
                        { label: 'Garuda Patron ID', value: user.id.slice(0, 16) + '...' },
                      ].map(({ label, value }) => (
                        <div key={label} className="space-y-1">
                          <span className="text-[10px] font-bold uppercase text-[#8C6239]">{label}</span>
                          <p className="text-sm font-bold bg-[#FAF8F2] p-3 rounded-xl border border-[#EFE8DC]">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="font-bold text-[#0F2D1F] block mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            value={profileForm.full_name}
                            onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                            className="w-full p-3 rounded-xl border border-[#DCD2C3] focus:ring-2 focus:ring-[#2D6A4F] outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-[#0F2D1F] block mb-1">Phone Number</label>
                          <input
                            type="tel"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            placeholder="+91 9876543210"
                            className="w-full p-3 rounded-xl border border-[#DCD2C3] focus:ring-2 focus:ring-[#2D6A4F] outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-[#0F2D1F] block mb-1">Date of Birth</label>
                          <input
                            type="date"
                            value={profileForm.dob}
                            onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                            className="w-full p-3 rounded-xl border border-[#DCD2C3] focus:ring-2 focus:ring-[#2D6A4F] outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-[#0F2D1F] block mb-1">Gender</label>
                          <select
                            value={profileForm.gender}
                            onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                            className="w-full p-3 rounded-xl border border-[#DCD2C3] focus:ring-2 focus:ring-[#2D6A4F] outline-none bg-white"
                          >
                            <option>Male</option>
                            <option>Female</option>
                            <option>Non-binary</option>
                            <option>Prefer not to say</option>
                          </select>
                        </div>
                      </div>

                      <div className="bg-[#FAF8F2] rounded-xl p-3 border border-[#E5DEC9]">
                        <span className="text-[10px] font-bold uppercase text-[#8C6239] block mb-1">Email (read-only)</span>
                        <p className="text-sm font-bold text-[#0F2D1F]">{user.email}</p>
                        <p className="text-[10px] text-[#556960] mt-1">Email is managed by Supabase Auth and cannot be changed here.</p>
                      </div>

                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-6 py-3 bg-[#2D6A4F] hover:bg-[#1B4332] disabled:opacity-60 text-[#FAF8F2] font-bold rounded-xl text-xs flex items-center gap-2"
                      >
                        {savingProfile ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>{savingProfile ? 'Saving...' : 'Save Profile to Database'}</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 3: ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  {/* Order Controls & Filter */}
                  <div className="bg-white rounded-2xl border border-[#DCD2C3] p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      {['All', 'Active', 'Delivered', 'Cancelled'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setOrderFilter(f as any)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            orderFilter === f
                              ? 'bg-[#2D6A4F] text-[#FAF8F2]'
                              : 'bg-[#FAF8F2] text-[#4A5D53] hover:bg-[#EFE8DC]'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>

                    <div className="relative flex-1 max-w-xs">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#889B92]" />
                      <input
                        type="text"
                        placeholder="Search order ID..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#DCD2C3] focus:ring-2 focus:ring-[#2D6A4F] outline-none"
                      />
                    </div>
                  </div>

                  {/* Orders List */}
                  {orders.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-[#DCD2C3] space-y-3">
                      <ShoppingBag className="w-12 h-12 text-[#8C6239] mx-auto opacity-50" />
                      <h3 className="font-heading text-lg font-bold text-[#0F2D1F]">No orders found</h3>
                      <p className="text-xs text-[#556960]">Place your first order from our farm harvests.</p>
                      <button
                        onClick={onNavigateToProducts}
                        className="px-4 py-2 bg-[#2D6A4F] text-[#FAF8F2] text-xs font-bold rounded-xl"
                      >
                        Explore Harvest Catalog
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders
                        .filter((o) => {
                          if (orderFilter === 'Active') return ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery'].includes(o.order_status);
                          if (orderFilter === 'Delivered') return o.order_status === 'Delivered';
                          if (orderFilter === 'Cancelled') return o.order_status === 'Cancelled';
                          return true;
                        })
                        .filter((o) => !orderSearch || String(o.id).toLowerCase().includes(orderSearch.toLowerCase()))
                        .map((order) => (
                          <div
                            key={order.id}
                            className="bg-white rounded-2xl border border-[#DCD2C3] p-6 space-y-4 shadow-sm"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFE8DC] pb-4">
                              <div>
                                <span className="text-[10px] font-bold text-[#8C6239] uppercase">Order Reference</span>
                                <strong className="font-heading text-lg font-black text-[#0F2D1F] block">#{order.id}</strong>
                                <span className="text-[11px] text-[#556960]">{new Date(order.created_at).toLocaleString()}</span>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(order.order_status)}`}>
                                  {order.order_status}
                                </span>
                                <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
                                  {order.payment_method} • {order.payment_status}
                                </span>
                              </div>
                            </div>

                            {/* Items list snippet */}
                            <div className="bg-[#FAF8F2] rounded-xl p-3 border border-[#E5DEC9] space-y-2 text-xs">
                              {(order.items || []).length === 0 ? (
                                <p className="text-[#556960] text-center py-2">No item details available</p>
                              ) : (
                                (order.items || []).map((it: any) => (
                                  <div key={it.id} className="flex items-center justify-between text-[#0F2D1F]">
                                    <span><strong>{it.product_name}</strong> ({it.selected_weight}) × {it.quantity}</span>
                                    <strong className="font-bold">₹{Number(it.total_price).toFixed(2)}</strong>
                                  </div>
                                ))
                              )}
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#EFE8DC]">
                              <div>
                                <span className="text-[10px] text-[#8C6239] font-bold uppercase block">Grand Total</span>
                                <strong className="font-heading text-xl font-black text-[#0F2D1F]">₹{Number(order.total_amount).toFixed(2)}</strong>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                {['Pending', 'Confirmed'].includes(order.order_status) && (
                                  <button
                                    onClick={() => handleCancelOrder(order.id)}
                                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 flex items-center gap-1.5"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Cancel</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleReorder(order.id)}
                                  className="px-3.5 py-2 bg-[#FAF8F2] hover:bg-[#EFE8DC] text-[#0F2D1F] text-xs font-bold rounded-xl border border-[#DCD2C3] flex items-center gap-1.5"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-[#2D6A4F]" />
                                  <span>Buy Again</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setInvoiceOrder(order);
                                    setIsInvoiceModalOpen(true);
                                  }}
                                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#0F2D1F] text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5 cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Tax Invoice</span>
                                </button>
                                <button
                                  onClick={() => handleViewTracking(order)}
                                  className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-[#FAF8F2] text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Package className="w-3.5 h-3.5" />
                                  <span>Track Live</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ADDRESSES */}
              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-xl font-bold text-[#0F2D1F]">Saved Delivery Addresses</h3>
                      <p className="text-xs text-[#556960]">Manage your saved address book for fast 1-click checkout</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingAddress(null);
                        setAddressForm({
                          full_name: profile?.full_name || '',
                          phone: profile?.phone || '',
                          address_line: '',
                          city: 'Hyderabad',
                          state: 'Telangana',
                          pincode: '500001',
                          label: 'Home',
                          is_default: addresses.length === 0,
                        });
                        setIsAddressModalOpen(true);
                      }}
                      className="px-4 py-2.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-[#FAF8F2] text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Address</span>
                    </button>
                  </div>

                  {/* Address Cards Grid */}
                  {addresses.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-[#DCD2C3] space-y-2">
                      <MapPin className="w-10 h-10 text-[#8C6239] mx-auto opacity-50" />
                      <p className="text-xs text-[#556960]">No addresses saved yet.</p>
                      <p className="text-[10px] text-[#889B92]">Add a delivery address to speed up checkout.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`bg-white rounded-2xl border p-5 space-y-3 relative shadow-sm ${
                            addr.is_default ? 'border-[#2D6A4F] ring-1 ring-[#2D6A4F]' : 'border-[#DCD2C3]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-[#FAF8F2] border border-[#DCD2C3] text-[#2D6A4F]">
                              {addr.label}
                            </span>
                            {addr.is_default && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                ★ Default
                              </span>
                            )}
                          </div>

                          <div>
                            <strong className="font-heading text-sm text-[#0F2D1F] block">{addr.full_name}</strong>
                            <p className="text-xs text-[#556960] mt-1">{addr.address_line}, {addr.city}, {addr.state} - {addr.pincode}</p>
                            <span className="text-[11px] text-[#8C6239] block mt-1">📞 {addr.phone}</span>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-[#EFE8DC] text-xs">
                            {!addr.is_default && (
                              <button
                                onClick={async () => {
                                  const res = await api.setDefaultAddress(addr.id);
                                  if (res.ok) { showToast('Default address updated'); loadAccountData(); }
                                }}
                                className="text-[#2D6A4F] font-bold hover:underline"
                              >
                                Set Default
                              </button>
                            )}
                            <div className="flex items-center gap-3 ml-auto">
                              <button
                                onClick={() => {
                                  setEditingAddress(addr);
                                  setAddressForm({
                                    full_name: addr.full_name,
                                    phone: addr.phone,
                                    address_line: addr.address_line,
                                    city: addr.city,
                                    state: addr.state,
                                    pincode: addr.pincode,
                                    label: addr.label,
                                    is_default: addr.is_default,
                                  });
                                  setIsAddressModalOpen(true);
                                }}
                                className="text-[#0F2D1F] font-bold hover:underline flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="text-red-600 font-bold hover:underline flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: WISHLIST */}
              {activeTab === 'wishlist' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-[#0F2D1F]">My Saved Wishlist</h3>
                    <p className="text-xs text-[#556960]">Items saved to your database account for quick access</p>
                  </div>

                  {wishlistProducts.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-[#DCD2C3] space-y-3">
                      <Heart className="w-10 h-10 text-[#8C6239] mx-auto opacity-50" />
                      <p className="text-xs text-[#556960]">Your wishlist is currently empty.</p>
                      <button
                        onClick={onNavigateToProducts}
                        className="px-4 py-2 bg-[#2D6A4F] text-[#FAF8F2] text-xs font-bold rounded-xl"
                      >
                        Browse Harvest Catalog
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wishlistProducts.map((p) => (
                        <div key={p.id} className="bg-white rounded-2xl border border-[#DCD2C3] p-4 space-y-3 shadow-sm flex flex-col justify-between">
                          <div className="space-y-2">
                            <img src={p.image} alt={p.name} className="w-full h-36 object-cover rounded-xl bg-[#EFE8DC]" />
                            <h4 className="font-heading font-bold text-sm text-[#0F2D1F]">{p.name}</h4>
                            <span className="text-xs font-black text-[#2D6A4F] block">₹{p.price}</span>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-[#EFE8DC]">
                            <button
                              onClick={() => {
                                if (onAddToCart) onAddToCart(p, p.defaultWeight, 1);
                                showToast(`Added "${p.name}" to cart.`);
                              }}
                              className="flex-1 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-[#FAF8F2] text-xs font-bold rounded-xl"
                            >
                              Add to Cart
                            </button>
                            <button
                              onClick={async () => {
                                await api.removeFromWishlist(p.id);
                                showToast(`"${p.name}" removed from wishlist`);
                                loadAccountData();
                              }}
                              className="p-2 text-red-600 border border-red-200 rounded-xl hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: RECENTLY VIEWED */}
              {activeTab === 'recently-viewed' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-xl font-bold text-[#0F2D1F]">Recently Viewed Produce</h3>
                      <p className="text-xs text-[#556960]">Items you explored during your recent browsing session</p>
                    </div>
                    {recentlyViewed.length > 0 && (
                      <button
                        onClick={() => {
                          localStorage.removeItem('garuda_recently_viewed');
                          setRecentlyViewed([]);
                          showToast('Browsing history cleared');
                        }}
                        className="text-xs text-red-600 font-bold hover:underline"
                      >
                        Clear History
                      </button>
                    )}
                  </div>

                  {recentlyViewed.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-[#DCD2C3]">
                      <Clock className="w-10 h-10 text-[#8C6239] mx-auto opacity-50 mb-3" />
                      <p className="text-xs text-[#556960]">No recently viewed products.</p>
                      <p className="text-[10px] text-[#889B92] mt-1">Browse products and they'll appear here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {recentlyViewed.map((p) => (
                        <div key={p.id} className="bg-white rounded-2xl border border-[#DCD2C3] p-4 space-y-2 shadow-sm">
                          <img src={p.image} alt={p.name} className="w-full h-32 object-cover rounded-xl bg-[#EFE8DC]" />
                          <h4 className="font-heading font-bold text-xs text-[#0F2D1F]">{p.name}</h4>
                          <strong className="text-xs text-[#2D6A4F] block">₹{p.price}</strong>
                          <button
                            onClick={() => {
                              if (onAddToCart) onAddToCart(p, p.defaultWeight, 1);
                              showToast(`Added "${p.name}" to cart.`);
                            }}
                            className="w-full py-1.5 bg-[#2D6A4F] text-[#FAF8F2] text-[11px] font-bold rounded-xl"
                          >
                            Add to Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: COUPONS & OFFERS */}
              {activeTab === 'coupons' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-[#0F2D1F]">Available Store Coupons</h3>
                    <p className="text-xs text-[#556960]">1-click copy promo codes for immediate checkout discounts</p>
                  </div>

                  {coupons.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-[#DCD2C3] space-y-2">
                      <Tag className="w-10 h-10 text-[#8C6239] mx-auto opacity-50" />
                      <p className="text-xs text-[#556960]">No active coupons available right now.</p>
                      <p className="text-[10px] text-[#889B92]">Check back later for exclusive farm discounts.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {coupons.map((c: any) => {
                        const discountLabel = c.discount_type === 'percentage'
                          ? `${c.discount_value}% OFF`
                          : `₹${c.discount_value} OFF`;
                        const minOrder = Number(c.minimum_order_amount) > 0
                          ? `₹${c.minimum_order_amount}`
                          : '₹0';
                        const isExpired = c.expires_at && new Date(c.expires_at) < new Date();

                        return (
                          <div key={c.id} className={`bg-white p-5 rounded-2xl border space-y-3 shadow-sm relative overflow-hidden ${isExpired ? 'opacity-60 border-[#DCD2C3]' : 'border-[#DCD2C3] hover:border-[#2D6A4F] transition-colors'}`}>
                            {/* Decorative perforated edge */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#FAF8F2] rounded-r-full border-r border-[#DCD2C3]" />
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#FAF8F2] rounded-l-full border-l border-[#DCD2C3]" />

                            <div className="flex items-center justify-between border-b border-dashed border-[#EFE8DC] pb-3">
                              <span className="font-mono font-black text-lg text-[#2D6A4F] bg-[#FAF8F2] px-3 py-1 rounded-xl border border-[#E5DEC9]">
                                {c.code}
                              </span>
                              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                                isExpired
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {isExpired ? 'Expired' : discountLabel}
                              </span>
                            </div>

                            <p className="text-xs text-[#556960]">
                              {c.description || (c.discount_type === 'percentage'
                                ? `Get ${c.discount_value}% off on your order.`
                                : `Flat ₹${c.discount_value} off on orders above ₹${c.minimum_order_amount}.`
                              )}
                            </p>

                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-[#8C6239]">Min order: {minOrder}</span>
                              {c.expires_at && (
                                <span className="text-[#889B92]">
                                  {isExpired ? 'Expired' : `Valid till ${new Date(c.expires_at).toLocaleDateString()}`}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => !isExpired && handleCopyCoupon(c.code)}
                              disabled={isExpired}
                              className={`w-full py-2 font-bold rounded-xl flex items-center justify-center gap-2 text-xs transition-colors ${
                                isExpired
                                  ? 'bg-[#FAF8F2] text-[#889B92] cursor-not-allowed'
                                  : 'bg-[#2D6A4F] hover:bg-[#1B4332] text-[#FAF8F2]'
                              }`}
                            >
                              {copiedCode === c.code ? <Check className="w-4 h-4 text-[#D4A373]" /> : <Copy className="w-4 h-4" />}
                              <span>{copiedCode === c.code ? 'Copied Code!' : isExpired ? 'Coupon Expired' : 'Copy Code'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 8: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-xl font-bold text-[#0F2D1F]">Notification Center</h3>
                      <p className="text-xs text-[#556960]">Real-time system notices, order status changes, and announcements</p>
                    </div>
                    {unreadNotifications.length > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="px-4 py-2 bg-[#FAF8F2] border border-[#DCD2C3] hover:bg-[#EFE8DC] text-[#0F2D1F] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <BellOff className="w-3.5 h-3.5" />
                        <span>Mark All Read</span>
                      </button>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-[#DCD2C3] shadow-sm overflow-hidden">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center">
                        <Bell className="w-10 h-10 text-[#8C6239] mx-auto opacity-50 mb-3" />
                        <p className="text-xs text-[#556960]">No notifications yet.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#EFE8DC]">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleMarkNotificationRead(n.id)}
                            className={`p-4 flex items-start justify-between gap-4 text-xs cursor-pointer transition-colors ${
                              n.read ? 'bg-white hover:bg-[#FAF8F2]' : 'bg-emerald-50/50 hover:bg-emerald-50'
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-[#DCD2C3]' : 'bg-emerald-500'}`} />
                              <div className="space-y-1">
                                <strong className={`font-bold ${n.read ? 'text-[#556960]' : 'text-[#0F2D1F]'}`}>{n.title}</strong>
                                <p className="text-[#556960]">{n.message}</p>
                                <span className="text-[10px] text-[#889B92] block">{new Date(n.created_at).toLocaleString()}</span>
                              </div>
                            </div>
                            {!n.read && (
                              <span className="shrink-0 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                New
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 9: HELP & SUPPORT */}
              {activeTab === 'support' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-[#0F2D1F]">Garuda Patron Help & Support</h3>
                    <p className="text-xs text-[#556960]">Direct customer desk for order inquiries, delivery help, and payment questions</p>
                  </div>

                  {/* Contact Quick Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { icon: Phone, label: 'Call Support', detail: '+91 98669 29427', href: 'tel:+919866929427', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                      { icon: Mail, label: 'Email Support', detail: 'garudafarms9427@gmail.com', href: 'mailto:garudafarms9427@gmail.com', color: 'text-blue-700 bg-blue-50 border-blue-200' },
                      { icon: MessageSquare, label: 'WhatsApp', detail: 'Quick response', href: 'https://wa.me/919866929427', color: 'text-[#2D6A4F] bg-[#FAF8F2] border-[#DCD2C3]' },
                    ].map((c) => (
                      <a
                        key={c.label}
                        href={c.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${c.color} p-4 rounded-2xl border text-xs flex items-center gap-3 hover:opacity-80 transition-opacity`}
                      >
                        <c.icon className="w-5 h-5 shrink-0" />
                        <div>
                          <strong className="font-bold block">{c.label}</strong>
                          <span className="text-[10px]">{c.detail}</span>
                        </div>
                      </a>
                    ))}
                  </div>

                  {/* Direct Ticket Form */}
                  <div className="bg-white rounded-2xl border border-[#DCD2C3] p-6 space-y-4 shadow-sm">
                    <h4 className="font-heading font-bold text-sm text-[#0F2D1F]">Submit a Support Request</h4>
                    <form onSubmit={handleSubmitTicket} className="space-y-3 text-xs">
                      <div>
                        <label className="font-bold text-[#0F2D1F] block mb-1">Subject</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Delivery slot inquiry for Order #GF-101"
                          value={ticketForm.subject}
                          onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                          className="w-full p-3 rounded-xl border border-[#DCD2C3] focus:ring-2 focus:ring-[#2D6A4F] outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-[#0F2D1F] block mb-1">Category</label>
                          <select
                            value={ticketForm.category}
                            onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                            className="w-full p-3 rounded-xl border border-[#DCD2C3] focus:ring-2 focus:ring-[#2D6A4F] outline-none bg-white"
                          >
                            <option>Order Issue</option>
                            <option>Payment & Refund</option>
                            <option>Delivery Delay</option>
                            <option>Product Quality</option>
                            <option>General Inquiry</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-[#0F2D1F] block mb-1">Related Order Reference (Optional)</label>
                          <select
                            value={ticketForm.order_id}
                            onChange={(e) => setTicketForm({ ...ticketForm, order_id: e.target.value })}
                            className="w-full p-3 rounded-xl border border-[#DCD2C3] focus:ring-2 focus:ring-[#2D6A4F] outline-none bg-white"
                          >
                            <option value="">None / General Inquiry</option>
                            {orders.map((o) => (
                              <option key={o.id} value={o.id}>
                                Order #{o.id} (₹{Number(o.total_amount).toFixed(2)})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-[#0F2D1F] block mb-1">Message Description</label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Please describe your query in detail..."
                          value={ticketForm.message}
                          onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                          className="w-full p-3 rounded-xl border border-[#DCD2C3] focus:ring-2 focus:ring-[#2D6A4F] outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingTicket}
                        className="px-6 py-3 bg-[#2D6A4F] hover:bg-[#1B4332] disabled:opacity-60 text-[#FAF8F2] font-bold rounded-xl flex items-center gap-2 text-xs"
                      >
                        {submittingTicket ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>{submittingTicket ? 'Submitting...' : 'Submit Support Ticket'}</span>
                      </button>
                    </form>
                  </div>

                  {/* Submitted Tickets Log */}
                  {supportTickets.length > 0 && (
                    <div className="bg-white rounded-2xl border border-[#DCD2C3] p-6 space-y-4 shadow-sm">
                      <h4 className="font-heading font-bold text-sm text-[#0F2D1F]">Your Submitted Support Tickets</h4>
                      <div className="divide-y divide-[#EFE8DC] text-xs">
                        {supportTickets.map((t) => (
                          <div key={t.id} className="py-3 space-y-1">
                            <div className="flex items-center justify-between">
                              <strong className="font-bold text-[#0F2D1F]">{t.subject}</strong>
                              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                                t.status === 'Resolved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : t.status === 'In Progress' ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}>
                                {t.status}
                              </span>
                            </div>
                            <p className="text-[#556960]">{t.message}</p>
                            {t.admin_reply && (
                              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 mt-2">
                                <span className="text-[10px] font-bold text-emerald-800 block mb-1">Admin Reply:</span>
                                <p className="text-emerald-900">{t.admin_reply}</p>
                              </div>
                            )}
                            <span className="text-[10px] text-[#889B92] block">{new Date(t.created_at).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 10: SECURITY */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-[#0F2D1F]">Security & Authentication</h3>
                    <p className="text-xs text-[#556960]">Supabase Auth security configuration for account {user.email}</p>
                  </div>

                  {/* Session Info */}
                  <div className="bg-white rounded-2xl border border-[#DCD2C3] p-6 space-y-4 shadow-sm text-xs text-[#0F2D1F]">
                    <h4 className="font-heading font-bold text-sm">Active Session</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: 'Authenticated UID', value: user.id, mono: true },
                        { label: 'Email Address', value: user.email || '', mono: false },
                        { label: 'Email Verification', value: 'Verified ✓', mono: false },
                        { label: 'Auth Provider', value: 'Supabase Auth (JWT)', mono: false },
                        { label: 'Account Created', value: user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A', mono: false },
                        { label: 'Patron Role', value: isAdminUser ? 'Admin + Customer' : 'Customer', mono: false },
                      ].map(({ label, value, mono }) => (
                        <div key={label} className="bg-[#FAF8F2] p-3 rounded-xl border border-[#E5DEC9] space-y-1">
                          <span className="text-[10px] font-bold uppercase text-[#8C6239] block">{label}</span>
                          <p className={`font-bold text-sm break-all ${mono ? 'font-mono text-[#2D6A4F] text-xs' : ''}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Password Reset */}
                  <div className="bg-white rounded-2xl border border-[#DCD2C3] p-6 space-y-4 shadow-sm">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-[#0F2D1F]">Change Password</h4>
                      <p className="text-xs text-[#556960] mt-1">
                        A password reset link will be sent to <strong>{user.email}</strong>. Click the link in the email to set a new password.
                      </p>
                    </div>

                    {passwordResetSent ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-xs text-emerald-800">
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <strong className="font-bold block">Reset email sent!</strong>
                          <span>Check your inbox at <strong>{user.email}</strong> and follow the link to reset your password.</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleSendPasswordReset}
                        disabled={sendingPasswordReset}
                        className="px-6 py-3 bg-[#0F2D1F] hover:bg-[#143D2B] disabled:opacity-60 text-[#FAF8F2] font-bold rounded-xl flex items-center gap-2 text-xs transition-colors"
                      >
                        {sendingPasswordReset ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <KeyRound className="w-4 h-4" />
                        )}
                        <span>{sendingPasswordReset ? 'Sending reset email...' : 'Send Password Reset Email'}</span>
                      </button>
                    )}
                  </div>

                  {/* Sign Out */}
                  <div className="bg-white rounded-2xl border border-red-200 p-6 space-y-3 shadow-sm">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-red-900">Sign Out</h4>
                      <p className="text-xs text-red-600 mt-1">This will sign you out of all sessions and clear your auth token.</p>
                    </div>
                    <button
                      onClick={() => signOut()}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-2 text-xs"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out of All Sessions</span>
                    </button>
                  </div>
                </div>
              )}
        </div>
      </div>

      {/* ORDER TRACKING & DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-[#DCD2C3] relative">
            <button
              onClick={() => { setSelectedOrder(null); setTrackingData(null); }}
              className="absolute right-6 top-6 w-8 h-8 rounded-full bg-[#FAF8F2] border border-[#DCD2C3] flex items-center justify-center font-bold text-[#0F2D1F] hover:bg-[#EFE8DC]"
            >
              ✕
            </button>

            <div className="border-b border-[#EFE8DC] pb-4">
              <span className="text-[10px] font-bold uppercase text-[#8C6239]">Garuda Dispatch Invoice</span>
              <h2 className="font-heading text-2xl font-black text-[#0F2D1F]">Order #{selectedOrder.id}</h2>
              <span className="text-xs text-[#556960]">{new Date(selectedOrder.created_at).toLocaleString()}</span>
            </div>

            {/* VISUAL STEP-BY-STEP TRACKING TIMELINE */}
            <div className="bg-[#0F2D1F] text-[#FAF8F2] p-6 rounded-2xl space-y-4">
              <h4 className="font-heading font-bold text-sm text-[#D4A373]">Live Dispatch Timeline</h4>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center text-[10px] font-bold">
                {[
                  'Pending',
                  'Confirmed',
                  'Processing',
                  'Packed',
                  'Shipped',
                  'Out for Delivery',
                  'Delivered',
                ].map((step, idx) => {
                  const statuses = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
                  const currentIdx = statuses.indexOf(selectedOrder.order_status);
                  const isDone = currentIdx >= idx;
                  const isCurrent = currentIdx === idx;
                  const isCancelled = selectedOrder.order_status === 'Cancelled';

                  return (
                    <div key={step} className="space-y-1.5 flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] ${
                          isCancelled
                            ? 'bg-red-900 border-red-500 text-red-200'
                            : isDone
                            ? 'bg-[#D4A373] border-[#D4A373] text-[#0F2D1F]'
                            : 'bg-white/10 border-white/20 text-white/40'
                        }`}
                      >
                        {isDone && !isCancelled ? '✓' : idx + 1}
                      </div>
                      <span className={isCurrent && !isCancelled ? 'text-[#D4A373]' : isDone && !isCancelled ? 'text-white' : 'text-white/40'}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              {selectedOrder.order_status === 'Cancelled' && (
                <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3 text-xs text-red-300 text-center">
                  This order was cancelled.
                </div>
              )}
            </div>

            {/* Status history from DB */}
            {trackingData && trackingData.history && trackingData.history.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#8C6239] uppercase">Status History</h4>
                <div className="space-y-2">
                  {trackingData.history.map((h: any) => (
                    <div key={h.id} className="flex items-start gap-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-[#2D6A4F] mt-1.5 shrink-0" />
                      <div>
                        <strong className="font-bold text-[#0F2D1F]">{h.status}</strong>
                        {h.notes && <p className="text-[#556960]">{h.notes}</p>}
                        <span className="text-[10px] text-[#889B92]">{new Date(h.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price breakdown */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-[#8C6239] uppercase">Items Summary</span>
              <div className="bg-[#FAF8F2] rounded-xl p-4 border border-[#E5DEC9] divide-y divide-[#EFE8DC]">
                {(selectedOrder.items || []).length === 0 ? (
                  <p className="text-[#556960] text-center py-2">No item details available</p>
                ) : (
                  (selectedOrder.items || []).map((it: any) => (
                    <div key={it.id} className="py-2 flex items-center justify-between">
                      <div>
                        <strong className="font-bold text-[#0F2D1F]">{it.product_name}</strong>
                        <span className="text-[11px] text-[#556960] block">Variant: {it.selected_weight} • Qty: {it.quantity}</span>
                      </div>
                      <strong className="font-bold text-[#0F2D1F]">₹{Number(it.total_price).toFixed(2)}</strong>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 space-y-1 text-right text-xs">
                <div className="flex justify-between"><span>Subtotal:</span><span>₹{Number(selectedOrder.subtotal || selectedOrder.total_amount).toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Delivery Charge:</span><span>₹{Number(selectedOrder.delivery_charge || 0).toFixed(2)}</span></div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-700"><span>Discount:</span><span>-₹{Number(selectedOrder.discount_amount).toFixed(2)}</span></div>
                )}
                <div className="flex justify-between font-bold text-sm text-[#0F2D1F] border-t border-[#EFE8DC] pt-2">
                  <span>Grand Total:</span>
                  <strong>₹{Number(selectedOrder.total_amount).toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {/* Shipping & Payment details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#0F2D1F] border-t border-[#EFE8DC] pt-4">
              <div className="bg-[#FAF8F2] p-3 rounded-xl border border-[#E5DEC9]">
                <strong className="text-[10px] uppercase font-bold text-[#8C6239] block mb-1">Delivery Address</strong>
                <p>{selectedOrder.shipping_address}, {selectedOrder.city} - {selectedOrder.pincode}</p>
                <p className="mt-1 font-bold">Contact: {selectedOrder.customer_phone}</p>
              </div>

              <div className="bg-[#FAF8F2] p-3 rounded-xl border border-[#E5DEC9]">
                <strong className="text-[10px] uppercase font-bold text-[#8C6239] block mb-1">Payment Info</strong>
                <p>Method: <strong>{selectedOrder.payment_method}</strong></p>
                <p>Status: <strong className={selectedOrder.payment_status === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}>{selectedOrder.payment_status}</strong></p>
                {selectedOrder.razorpay_payment_id && (
                  <p className="font-mono text-[10px] text-[#556960] mt-1">Ref: {selectedOrder.razorpay_payment_id}</p>
                )}
                {selectedOrder.coupon_code && (
                  <p className="text-[10px] mt-1 text-[#2D6A4F] font-bold">Coupon: {selectedOrder.coupon_code}</p>
                )}
              </div>
            </div>

            {/* Action buttons in modal */}
            <div className="flex items-center gap-3 pt-2 border-t border-[#EFE8DC]">
              {['Pending', 'Confirmed'].includes(selectedOrder.order_status) && (
                <button
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Cancel Order
                </button>
              )}
              <button
                onClick={() => {
                  setInvoiceOrder(selectedOrder);
                  setIsInvoiceModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300 flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span>Print GST Invoice</span>
              </button>
              <button
                onClick={() => handleReorder(selectedOrder.id)}
                className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-[#FAF8F2] text-xs font-bold rounded-xl flex items-center gap-1.5 ml-auto cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Buy Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAVE/EDIT ADDRESS MODAL */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#DCD2C3] relative">
            <button
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute right-4 top-4 font-bold text-[#0F2D1F] w-8 h-8 rounded-full bg-[#FAF8F2] border border-[#DCD2C3] flex items-center justify-center hover:bg-[#EFE8DC]"
            >
              ✕
            </button>

            <h3 className="font-heading font-bold text-lg text-[#0F2D1F]">
              {editingAddress ? 'Edit Address' : 'Add New Saved Address'}
            </h3>

            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={addressForm.full_name}
                  onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#DCD2C3] outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#DCD2C3] outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Street / House Address</label>
                <input
                  type="text"
                  required
                  value={addressForm.address_line}
                  onChange={(e) => setAddressForm({ ...addressForm, address_line: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#DCD2C3] outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#DCD2C3] outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#DCD2C3] outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">PIN Code</label>
                <input
                  type="text"
                  required
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#DCD2C3] outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  {['Home', 'Work', 'Other'].map((lbl) => (
                    <button
                      type="button"
                      key={lbl}
                      onClick={() => setAddressForm({ ...addressForm, label: lbl })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        addressForm.label === lbl ? 'bg-[#2D6A4F] text-[#FAF8F2]' : 'bg-[#FAF8F2] text-[#0F2D1F] border border-[#DCD2C3]'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addressForm.is_default}
                    onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                    className="accent-[#2D6A4F]"
                  />
                  <span>Default</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-[#FAF8F2] font-bold rounded-xl text-xs mt-2"
              >
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADDRESS DELETE CONFIRMATION MODAL */}
      {deletingAddressId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-[#DCD2C3]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-[#0F2D1F]">Delete Address?</h3>
                <p className="text-xs text-[#556960]">This action cannot be undone. The address will be permanently removed.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingAddressId(null)}
                className="flex-1 py-2.5 bg-[#FAF8F2] border border-[#DCD2C3] text-[#0F2D1F] text-xs font-bold rounded-xl hover:bg-[#EFE8DC] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteAddress}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Delete Address
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Invoice Modal for Customer */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        order={invoiceOrder}
      />
    </div>
  );
};

export default AccountPage;
