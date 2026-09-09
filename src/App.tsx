import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BenefitsSection } from './components/BenefitsSection';
import { HorizontalProductShowcase } from './components/HorizontalProductShowcase';
import { ProductCatalog } from './components/ProductCatalog';
import { FeaturedSpotlight } from './components/FeaturedSpotlight';
import { FarmStory } from './components/FarmStory';
import { AboutSection } from './components/AboutSection';
import { SustainabilitySection } from './components/SustainabilitySection';
import { FarmNumbers } from './components/FarmNumbers';
import { TestimonialsSection } from './components/TestimonialsSection';
import { CTASection } from './components/CTASection';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { CartPage } from './components/CartPage';
import { CartToast } from './components/CartToast';
import { DynamicOffersSection } from './components/DynamicOffersSection';

// Interactive Overlays & Modals
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchModal } from './components/SearchModal';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminModal } from './components/AdminModal';
import { PoliciesModal, PolicyTab } from './components/PoliciesModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { ContactModal } from './components/ContactModal';
import { WhatsAppButton } from './components/WhatsAppButton';
import { FloatingCartBar } from './components/FloatingCartBar';

// Micro-interactions & 3D Polish
import { LoadingScreen } from './components/LoadingScreen';
import { CustomCursor } from './components/CustomCursor';
import { FloatingLeaves } from './components/FloatingLeaves';
import { ScrollProgress } from './components/ScrollProgress';

// Data & Types
import { PRODUCTS } from './data/products';
import { Product, CartItem, ProductCategory } from './types';
import { api } from './lib/api';
import LoginPage from './pages/Auth/Login';
import SignupPage from './pages/Auth/Signup';
import ForgotPasswordPage from './pages/Auth/ForgotPassword';
import AccountPage from './pages/Account';
import OrdersPage from './pages/Orders';
import AdminPanel from './pages/Admin';
import { useAuth } from './auth/AuthProvider';
import AuthModal from './components/AuthModal';

export default function App() {
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  // Live products from API — single source of truth for the entire storefront
  const [liveProducts, setLiveProducts] = useState<Product[]>(PRODUCTS);

  // Fetch fresh products from the backend (bypasses browser cache via no-store header)
  const refreshProducts = async () => {
    try {
      const data = await api.getProducts();
      if (data && data.length > 0) setLiveProducts(data);
    } catch {
      // Keep current products if fetch fails
    }
  };

  // Initial product load + fast polling + real-time cross-tab event listeners
  useEffect(() => {
    refreshProducts();
    // Poll every 3s so admin availability changes propagate rapidly to open storefronts
    const pollInterval = setInterval(refreshProducts, 3_000);

    const handleSync = () => refreshProducts();
    window.addEventListener('garuda_products_updated', handleSync);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'garuda_products_sync') refreshProducts();
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('garuda_products_updated', handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);
  // Auto-clean cart whenever liveProducts changes:
  // Remove items whose product is now unavailable (admin turned it off)
  useEffect(() => {
    if (!liveProducts || liveProducts.length === 0) return;
    const availableIds = new Set(liveProducts.map((p) => p.id));
    setCart((prev) => {
      const cleaned = prev.filter((item) => availableIds.has(item.product.id));
      if (cleaned.length < prev.length) {
        const removedNames = prev
          .filter((item) => !availableIds.has(item.product.id))
          .map((item) => item.product.name)
          .join(', ');
        // Show a dismissible banner via console (toast shown separately below)
        console.warn(`[Cart] Removed unavailable items: ${removedNames}`);
        // Trigger a visible notification in the UI
        setRemovedFromCartNotice(removedNames);
        setTimeout(() => setRemovedFromCartNotice(null), 6000);
      }
      return cleaned;
    });
  }, [liveProducts]);

  // Sync wishlist from database whenever user logs in
  useEffect(() => {
    if (auth?.user) {
      api.getWishlist().then((res) => {
        if (res.ok && Array.isArray(res.productIds)) {
          setWishlistIds(res.productIds);
        }
      }).catch(() => { });
    }
  }, [auth?.user]);


  // Auth modal and intent state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authIntent, setAuthIntent] = useState<any>(null);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'signup'>('login');

  const getInitialView = (): 'home' | 'products' | 'cart' | 'story' | 'sustainability' | 'account' | 'orders' | 'login' | 'signup' | 'forgot' | 'admin' => {
    if (typeof window === 'undefined') return 'home';
    const path = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
    const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
    const target = path || hash;
    if (target === 'admin') return 'admin';
    if (target === 'account') return 'account';
    if (target === 'orders') return 'orders';
    if (target === 'products' || target === 'store' || target === 'shop') return 'products';
    if (target === 'cart') return 'cart';
    if (target === 'story' || target === 'about') return 'story';
    if (target === 'sustainability') return 'sustainability';
    if (target === 'login') return 'login';
    if (target === 'signup') return 'signup';
    if (target === 'forgot') return 'forgot';
    return 'home';
  };

  // Active view routing: initialized from current URL path/hash so reloads stay on current page
  const [activeView, setActiveView] = useState<'home' | 'products' | 'cart' | 'story' | 'sustainability' | 'account' | 'orders' | 'login' | 'signup' | 'forgot' | 'admin'>(getInitialView);
  const [selectedStoreCategory, setSelectedStoreCategory] = useState<ProductCategory | 'All'>('All');

  // Sync activeView with browser URL history
  useEffect(() => {
    const path = activeView === 'home' ? '/' : `/${activeView}`;
    if (window.location.pathname !== path) {
      window.history.pushState({ view: activeView }, '', path);
    }
  }, [activeView]);

  // Handle browser back/forward and reload navigation
  useEffect(() => {
    const handlePopState = () => {
      setActiveView(getInitialView());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Cart & Wishlist state with localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('garuda_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('garuda_wishlist');
      return saved ? JSON.parse(saved) : [1, 19, 27];
    } catch {
      return [1, 19, 27];
    }
  });

  // Modal & Drawer visibility
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);
  const [policyInitialTab, setPolicyInitialTab] = useState<PolicyTab>('shipping');
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState<string | undefined>(undefined);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Toast feedback state
  const [cartToast, setCartToast] = useState<{
    product: Product;
    weight: string;
    quantity: number;
    price: number;
  } | null>(null);

  // Unavailability notice — shown when admin disables a product that's in cart or being added
  const [removedFromCartNotice, setRemovedFromCartNotice] = useState<string | null>(null);


  // Checkout info tracking
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('garuda_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Persist wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('garuda_wishlist', JSON.stringify(wishlistIds));
    } catch (e) {
      console.error(e);
    }
  }, [wishlistIds]);

  // View Navigation Helper
  const navigateToView = (view: 'home' | 'products' | 'cart' | 'story' | 'sustainability', category?: ProductCategory | 'All') => {
    if (category) {
      setSelectedStoreCategory(category);
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Overload for auth views
  const navigateToAuthView = (view: 'account' | 'orders' | 'login' | 'signup' | 'forgot') => {
    // If account/orders require auth, gate them
    if ((view === 'account' || view === 'orders') && !auth?.user) {
      setAuthInitialTab('login');
      setAuthIntent({ type: 'openView', payload: { view } });
      setIsAuthModalOpen(true);
      return;
    }

    setActiveView(view as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart Handlers — performs live async backend verification before adding item
  const handleAddToCart = async (product: Product, weight?: string, quantity: number = 1) => {
    // If not authenticated, open auth modal and remember intent
    if (!auth?.user) {
      setAuthInitialTab('login');
      setAuthIntent({ type: 'addToCart', payload: { product, weight, quantity } });
      setIsAuthModalOpen(true);
      return;
    }

    // Perform live backend check right at the moment user clicks Add to Cart
    try {
      const freshProduct = await api.getProduct(product.id);
      if (freshProduct && freshProduct.stock === false) {
        setRemovedFromCartNotice(`"${product.name}" is currently out of stock / unavailable and cannot be added to cart.`);
        setTimeout(() => setRemovedFromCartNotice(null), 5000);
        refreshProducts();
        return;
      }
    } catch {
      // Fallback check against local liveProducts state if offline
    }

    if (product.stock === false) {
      setRemovedFromCartNotice(`"${product.name}" is currently unavailable and cannot be added to cart.`);
      setTimeout(() => setRemovedFromCartNotice(null), 5000);
      return;
    }

    const selectedWeight = weight || product.defaultWeight;
    const weightIndex = product.availableWeights.indexOf(selectedWeight);
    const multiplier = weightIndex > 0 ? (weightIndex === 1 ? 1.8 : 2.5) : 1;
    const dynamicPrice = Math.round(product.price * multiplier);

    const cartItemId = `${product.id}-${selectedWeight}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [
        ...prevCart,
        {
          id: cartItemId,
          product,
          quantity,
          selectedWeight,
          price: dynamicPrice,
        },
      ];
    });

    // Show live Toast Notification
    setCartToast({
      product,
      weight: selectedWeight,
      quantity,
      price: dynamicPrice,
    });

    // Auto dismiss after 3.5s
    setTimeout(() => {
      setCartToast((curr) => (curr?.product.id === product.id ? null : curr));
    }, 3500);
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Wishlist Handlers — persisted to database
  const handleToggleWishlist = async (product: Product) => {
    if (!auth?.user) {
      setAuthInitialTab('login');
      setAuthIntent({ type: 'toggleWishlist', payload: { product } });
      setIsAuthModalOpen(true);
      return;
    }

    const isWishlisted = wishlistIds.includes(product.id);
    if (isWishlisted) {
      setWishlistIds((prev) => prev.filter((id) => id !== product.id));
      await api.removeFromWishlist(product.id);
    } else {
      setWishlistIds((prev) => [...prev, product.id]);
      await api.addToWishlist(product.id);
    }
  };

  const handleMoveWishlistToCart = (product: Product) => {
    // preserve behavior: adding to cart requires auth and will remove wishlist entry afterwards
    handleAddToCart(product);
    setWishlistIds((prev) => prev.filter((id) => id !== product.id));
  };

  const wishlistProducts = liveProducts.filter((p) => wishlistIds.includes(p.id));
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const runAuthIntent = () => {
    if (!authIntent) return;
    const intent = authIntent;
    setAuthIntent(null);
    setIsAuthModalOpen(false);

    switch (intent.type) {
      case 'addToCart': {
        const { product, weight, quantity } = intent.payload;
        // call original handler but now user is authenticated
        handleAddToCart(product, weight, quantity);
        break;
      }
      case 'toggleWishlist': {
        const { product } = intent.payload;
        handleToggleWishlist(product);
        break;
      }
      case 'openView': {
        const { view } = intent.payload;
        setActiveView(view);
        break;
      }
      case 'checkout': {
        const { discount, coupon } = intent.payload;
        setAppliedDiscount(discount);
        setAppliedCoupon(coupon);
        setIsCheckoutOpen(true);
        break;
      }
      default:
        break;
    }
  };

  // Admin Panel full-page view — renders instead of the storefront
  if (activeView === 'admin') {
    return <AdminPanel onBack={() => {
      setActiveView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Re-fetch products so any admin changes reflect immediately on the storefront
      refreshProducts();
    }} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F2] text-[#19241C] relative selection:bg-[#2D6A4F] selection:text-[#FAF8F2] font-body overflow-x-hidden">
      {/* 1. Loading Entrance Screen */}
      <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />

      {/* 2. Custom 3D Cursor */}
      <CustomCursor />

      {/* 3. Reading Scroll Progress Bar */}
      <ScrollProgress />

      {/* 4. Ambient Floating Autumn Leaves Particles */}
      <FloatingLeaves />

      {/* 5. Sticky Glassmorphism Header / Navigation with View Switcher */}
      <Navbar
        activeView={activeView}
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        onSelectView={(v) => {
          // Route between main and auth views
          if (v === 'account' || v === 'orders' || v === 'login' || v === 'signup' || v === 'forgot') {
            navigateToAuthView(v as any);
          } else {
            navigateToView(v as any);
          }
        }}
        onOpenCartDrawer={() => setIsCartDrawerOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAdmin={() => { setActiveView('admin'); window.scrollTo({ top: 0 }); }}
        onOpenTrackOrder={() => {
          setTrackOrderId(undefined);
          setIsTrackOrderOpen(true);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authInitialTab}
        onClose={() => { setIsAuthModalOpen(false); setAuthIntent(null); }}
        onAuthenticated={() => runAuthIntent()}
      />

      {/* Main View Router */}
      <main className="min-h-screen">
        {activeView === 'home' && (
          <>
            {/* Cinematic 3D Hero with Nature Farm Video and "BUY NOW" CTA */}
            <Hero
              onBuyNow={() => navigateToView('products')}
              onExploreFarm={() => navigateToView('story')}
              onViewCart={() => navigateToView('cart')}
            />

            {/* Why Choose Garuda Farms Benefits */}
            <BenefitsSection />

            {/* Curated Harvest Showcase with Direct "Buy Now" Links */}
            <HorizontalProductShowcase
              products={liveProducts}
              onQuickView={(p) => setQuickViewProduct(p)}
              onAddToCart={(p, w) => handleAddToCart(p, w)}
              onExploreAll={() => navigateToView('products')}
            />

            {/* 3D Farm Fresh Egg Spotlight Showcase with Interactive 3D Canvas */}
            <FeaturedSpotlight
              products={liveProducts}
              onAddToCart={(p, w) => handleAddToCart(p, w)}
              onQuickView={(p) => setQuickViewProduct(p)}
            />

            {/* Dynamic Offers & Daily Deals Section */}
            <DynamicOffersSection
              products={liveProducts}
              onSelectProduct={(p) => setQuickViewProduct(p)}
              onAddToCart={(p, w, q) => handleAddToCart(p, w, q)}
              onToggleWishlist={handleToggleWishlist}
              wishlistIds={wishlistIds}
            />

            {/* Farm Story & Heritage Teaser */}
            <FarmStory />

            {/* About Garuda Sanctuary Ethos */}
            <AboutSection onExploreProducts={() => navigateToView('products')} />

            {/* Sustainability with 3D Ecosystem Model */}
            <SustainabilitySection />

            {/* Farm Impact Numbers */}
            <FarmNumbers />

            {/* Patron Voices / Testimonials */}
            <TestimonialsSection />

            {/* Bottom Call to Action Section */}
            <CTASection onExploreProducts={() => navigateToView('products')} />

            {/* Newsletter */}
            <Newsletter />
          </>
        )}

        {activeView === 'products' && (
          <ProductCatalog
            initialProducts={liveProducts}
            wishlistIds={wishlistIds}
            initialCategory={selectedStoreCategory}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={(p) => setQuickViewProduct(p)}
            onAddToCart={(p, w) => handleAddToCart(p, w)}
            onViewCart={() => navigateToView('cart')}
            cartCount={totalCartCount}
          />
        )}

        {activeView === 'login' && (
          <div className="pt-24 pb-12">
            <LoginPage
              onSwitchToSignup={() => navigateToAuthView('signup')}
              onSwitchToForgot={() => navigateToAuthView('forgot')}
              onSuccess={() => navigateToAuthView('account')}
            />
          </div>
        )}

        {activeView === 'signup' && (
          <div className="pt-24 pb-12">
            <SignupPage
              onSwitchToLogin={() => navigateToAuthView('login')}
              onSuccess={() => navigateToAuthView('account')}
            />
          </div>
        )}

        {activeView === 'forgot' && (
          <div className="pt-24 pb-12">
            <ForgotPasswordPage
              onSwitchToLogin={() => navigateToAuthView('login')}
            />
          </div>
        )}

        {activeView === 'account' && (
          <div className="pt-24">
            <AccountPage
              initialTab="overview"
              allProducts={liveProducts}
              onNavigateToProducts={() => navigateToView('products')}
              onAddToCart={(p, w, q) => handleAddToCart(p, w, q)}
            />
          </div>
        )}

        {activeView === 'orders' && (
          <div className="pt-24">
            <AccountPage
              initialTab="orders"
              allProducts={liveProducts}
              onNavigateToProducts={() => navigateToView('products')}
              onAddToCart={(p, w, q) => handleAddToCart(p, w, q)}
            />
          </div>
        )}

        {activeView === 'cart' && (
          <CartPage
            items={cart}
            liveProducts={liveProducts}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onMoveToWishlist={handleToggleWishlist}
            onContinueShopping={() => navigateToView('products')}
            onProceedToCheckout={(discount, coupon) => {
              if (!auth?.user) {
                setAuthInitialTab('login');
                setAuthIntent({ type: 'checkout', payload: { discount, coupon } });
                setIsAuthModalOpen(true);
                return;
              }
              setAppliedDiscount(discount);
              setAppliedCoupon(coupon);
              setIsCheckoutOpen(true);
            }}
          />
        )}


        {activeView === 'story' && (
          <div className="pt-20">
            <FarmStory />
            <AboutSection onExploreProducts={() => navigateToView('products')} />
            <CTASection onExploreProducts={() => navigateToView('products')} />
          </div>
        )}

        {activeView === 'sustainability' && (
          <div className="pt-20">
            <SustainabilitySection />
            <FarmNumbers />
            <CTASection onExploreProducts={() => navigateToView('products')} />
          </div>
        )}
      </main>

      {/* Brand Footer */}
      <Footer
        onNavigate={(sectionId) => {
          if (sectionId === 'products') navigateToView('products');
          else if (sectionId === 'farm-story' || sectionId === 'about') navigateToView('story');
          else if (sectionId === 'sustainability') navigateToView('sustainability');
          else if (sectionId === 'cart') navigateToView('cart');
          else navigateToView('home');
        }}
        onOpenAdmin={() => { setActiveView('admin'); window.scrollTo({ top: 0 }); }}
        onOpenPolicies={(tab) => {
          setPolicyInitialTab(tab);
          setIsPoliciesOpen(true);
        }}
        onOpenTrackOrder={() => {
          setTrackOrderId(undefined);
          setIsTrackOrderOpen(true);
        }}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Floating Direct WhatsApp Farm Help Button */}
      <WhatsAppButton />

      {/* Live Cart Toast Notification */}
      <CartToast
        toast={cartToast}
        onClose={() => setCartToast(null)}
        onViewCart={() => navigateToView('cart')}
      />

      {/* Real-time Unavailability Notice — shown when admin disables a product */}
      {removedFromCartNotice && (
        <div
          style={{
            position: 'fixed',
            bottom: '96px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'linear-gradient(135deg, #7F1D1D, #991B1B)',
            color: '#FEF2F2',
            padding: '14px 20px',
            borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(127,29,29,0.45)',
            maxWidth: '480px',
            width: 'calc(100vw - 32px)',
            fontFamily: 'inherit',
            fontSize: '13px',
            fontWeight: 500,
            lineHeight: 1.4,
            animation: 'slideUpFade 0.35s ease',
          }}
        >
          <span style={{ fontSize: '20px', flexShrink: 0 }}>⚠️</span>
          <span style={{ flex: 1 }}>
            <strong style={{ display: 'block', marginBottom: '2px' }}>Product Unavailable</strong>
            {removedFromCartNotice}
          </span>
          <button
            onClick={() => setRemovedFromCartNotice(null)}
            style={{ background: 'none', border: 'none', color: '#FEF2F2', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '0 4px', flexShrink: 0 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick View Modal */}
      <ProductModal
        product={quickViewProduct}
        isWishlisted={quickViewProduct ? wishlistIds.includes(quickViewProduct.id) : false}
        onClose={() => setQuickViewProduct(null)}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
      />

      {/* Quick Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        items={cart}
        liveProducts={liveProducts}
        onClose={() => setIsCartDrawerOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={(discount, coupon) => {
          if (!auth?.user) {
            setAuthInitialTab('login');
            setAuthIntent({ type: 'checkout', payload: { discount, coupon } });
            setIsCartDrawerOpen(false);
            setIsAuthModalOpen(true);
            return;
          }
          setAppliedDiscount(discount);
          setAppliedCoupon(coupon);
          setIsCartDrawerOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        wishlistProducts={wishlistProducts}
        onClose={() => setIsWishlistOpen(false)}
        onRemoveFromWishlist={handleToggleWishlist}
        onMoveToCart={handleMoveWishlistToCart}
      />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={liveProducts}
        onSelectProduct={(p) => setQuickViewProduct(p)}
      />

      {/* Checkout Modal with Confetti, Receipt & Seamless Payment */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        items={cart}
        discountAmount={appliedDiscount}
        couponCode={appliedCoupon}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={() => {
          // 1. Clear cart so it's empty for the next order
          setCart([]);
          // 2. Reset discount/coupon state
          setAppliedDiscount(0);
          setAppliedCoupon('');
          // 3. If user was on cart page, navigate away so empty cart isn't shown behind modal
          if (activeView === 'cart') {
            setActiveView('home');
          }
        }}
        onTrackOrder={(orderId) => {
          setIsCheckoutOpen(false);
          setTrackOrderId(orderId);
          setIsTrackOrderOpen(true);
        }}
      />

      {/* Admin Panel — now a full-page view (see activeView === 'admin' above) */}

      {/* Legal & Trust Policies Modal (Shipping, Refunds, Certifications, Privacy, Terms) */}
      <PoliciesModal
        isOpen={isPoliciesOpen}
        initialTab={policyInitialTab}
        onClose={() => setIsPoliciesOpen(false)}
      />

      {/* Live Order Tracking & Chilled Dispatch Timeline Modal */}
      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        initialOrderId={trackOrderId}
        onClose={() => {
          setIsTrackOrderOpen(false);
          setTrackOrderId(undefined);
        }}
      />

      {/* Contact & Farm Sanctum Visit Booking Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* Floating Sticky Quick-Checkout Bar on Scroll */}
      <FloatingCartBar
        cart={cart}
        isVisible={!isCartDrawerOpen && !isCheckoutOpen && activeView !== 'cart' && activeView !== 'admin'}
        onOpenCart={() => setIsCartDrawerOpen(true)}
        onCheckout={() => {
          if (!auth?.user) {
            setAuthInitialTab('login');
            setAuthIntent({ type: 'checkout' });
            setIsAuthModalOpen(true);
            return;
          }
          setIsCheckoutOpen(true);
        }}
      />
    </div>
  );
}
