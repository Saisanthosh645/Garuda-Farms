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

// Interactive Overlays & Modals
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchModal } from './components/SearchModal';
import { CheckoutModal } from './components/CheckoutModal';

// Micro-interactions & 3D Polish
import { LoadingScreen } from './components/LoadingScreen';
import { CustomCursor } from './components/CustomCursor';
import { FloatingLeaves } from './components/FloatingLeaves';
import { ScrollProgress } from './components/ScrollProgress';

// Data & Types
import { PRODUCTS } from './data/products';
import { Product, CartItem, ProductCategory } from './types';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Active view routing: 'home' | 'products' | 'cart' | 'story' | 'sustainability'
  const [activeView, setActiveView] = useState<'home' | 'products' | 'cart' | 'story' | 'sustainability'>('home');
  const [selectedStoreCategory, setSelectedStoreCategory] = useState<ProductCategory | 'All'>('All');

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

  // Toast feedback state
  const [cartToast, setCartToast] = useState<{
    product: Product;
    weight: string;
    quantity: number;
    price: number;
  } | null>(null);

  // Checkout info tracking
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('GARUDA10');

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

  // Cart Handlers
  const handleAddToCart = (product: Product, weight?: string, quantity: number = 1) => {
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

  // Wishlist Handlers
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) =>
      prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id]
    );
  };

  const handleMoveWishlistToCart = (product: Product) => {
    handleAddToCart(product);
    setWishlistIds((prev) => prev.filter((id) => id !== product.id));
  };

  const wishlistProducts = PRODUCTS.filter((p) => wishlistIds.includes(p.id));
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
        onSelectView={(v) => navigateToView(v)}
        onOpenCartDrawer={() => setIsCartDrawerOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
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
              onQuickView={(p) => setQuickViewProduct(p)}
              onAddToCart={(p, w) => handleAddToCart(p, w)}
              onExploreAll={() => navigateToView('products')}
            />

            {/* 3D Farm Fresh Egg Spotlight Showcase with Interactive 3D Canvas */}
            <FeaturedSpotlight
              onAddToCart={(p, w) => handleAddToCart(p, w)}
              onQuickView={(p) => setQuickViewProduct(p)}
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
            wishlistIds={wishlistIds}
            initialCategory={selectedStoreCategory}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={(p) => setQuickViewProduct(p)}
            onAddToCart={(p, w) => handleAddToCart(p, w)}
            onViewCart={() => navigateToView('cart')}
            cartCount={totalCartCount}
          />
        )}

        {activeView === 'cart' && (
          <CartPage
            items={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onMoveToWishlist={handleToggleWishlist}
            onContinueShopping={() => navigateToView('products')}
            onProceedToCheckout={(discount, coupon) => {
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
      />

      {/* Live Cart Toast Notification */}
      <CartToast
        toast={cartToast}
        onClose={() => setCartToast(null)}
        onViewCart={() => navigateToView('cart')}
      />

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
        onClose={() => setIsCartDrawerOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={(discount, coupon) => {
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
        onSelectProduct={(p) => setQuickViewProduct(p)}
      />

      {/* Checkout Modal with Confetti & Receipt */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        items={cart}
        discountAmount={appliedDiscount}
        couponCode={appliedCoupon}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={() => {
          setCart([]);
        }}
      />
    </div>
  );
}
