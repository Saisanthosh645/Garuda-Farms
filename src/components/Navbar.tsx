import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Heart, ShoppingBag, Menu, X, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { GarudaLogo } from './GarudaLogo';

interface NavbarProps {
  activeView: string;
  cartCount: number;
  wishlistCount: number;
  onSelectView: (view: 'home' | 'products' | 'cart' | 'story' | 'sustainability') => void;
  onOpenCartDrawer: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  cartCount,
  wishlistCount,
  onSelectView,
  onOpenCartDrawer,
  onOpenWishlist,
  onOpenSearch,
  onOpenAdmin,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { label: string; view: 'home' | 'products' | 'cart' | 'story' | 'sustainability'; badge?: string }[] = [
    { label: 'HOME', view: 'home' },
    { label: 'STORE (50 PRODUCTS)', view: 'products', badge: '50 Fresh' },
    { label: 'OUR SANCTUARY', view: 'story' },
    { label: 'SUSTAINABILITY', view: 'sustainability' },
    { label: 'CART', view: 'cart', badge: cartCount > 0 ? `${cartCount}` : undefined },
  ];

  const handleNav = (view: 'home' | 'products' | 'cart' | 'story' | 'sustainability') => {
    onSelectView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-400 ${
          isScrolled || activeView !== 'home'
            ? 'py-3 bg-[#0F2D1F]/95 backdrop-blur-md shadow-xl border-b border-[#D4A373]/20 text-[#FAF8F2]'
            : 'py-4.5 bg-gradient-to-b from-[#0F2D1F]/90 via-[#0F2D1F]/50 to-transparent text-[#FAF8F2]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <button
            id="nav-logo-btn"
            onClick={() => handleNav('home')}
            className="flex items-center text-left focus:outline-none cursor-pointer"
          >
            <GarudaLogo variant="horizontal" theme="dark" size="md" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = activeView === item.view;
              return (
                <button
                  key={item.view}
                  id={`nav-link-${item.view}`}
                  onClick={() => handleNav(item.view)}
                  className={`text-xs font-bold tracking-[0.14em] uppercase transition-all py-1.5 px-3 rounded-full flex items-center gap-1.5 relative group ${
                    isActive
                      ? 'bg-[#2D6A4F] text-[#FAF8F2] shadow-sm'
                      : 'text-[#FAF8F2]/80 hover:text-[#FAF8F2] hover:bg-white/10'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        isActive ? 'bg-[#52B788] text-[#0F2D1F]' : 'bg-[#D4A373] text-[#0F2D1F]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Icons & "BUY NOW" Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Console Trigger */}
            {onOpenAdmin && (
              <button
                id="nav-admin-btn"
                onClick={onOpenAdmin}
                title="Admin Control Center"
                aria-label="Open Admin Console"
                className="p-2.5 rounded-full hover:bg-white/10 text-[#FAF8F2] transition-colors relative group"
              >
                <ShieldCheck className="w-4.5 h-4.5 group-hover:text-[#52B788] transition-colors" />
                <span className="sr-only">Admin Console</span>
              </button>
            )}

            {/* Search */}
            <button
              id="nav-search-btn"
              onClick={onOpenSearch}
              aria-label="Search products"
              className="p-2.5 rounded-full hover:bg-white/10 text-[#FAF8F2] transition-colors"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* Wishlist */}
            <button
              id="nav-wishlist-btn"
              onClick={onOpenWishlist}
              aria-label="View Wishlist"
              className="p-2.5 rounded-full hover:bg-white/10 text-[#FAF8F2] transition-colors relative"
            >
              <Heart className="w-4.5 h-4.5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#E76F51] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Direct Cart Button (opens Dedicated Cart Page or Drawer) */}
            <button
              id="nav-cart-btn"
              onClick={() => handleNav('cart')}
              aria-label="View Cart Page"
              className={`p-2.5 rounded-full transition-all relative group ${
                activeView === 'cart' ? 'bg-[#2D6A4F] text-[#FAF8F2]' : 'hover:bg-white/10 text-[#FAF8F2]'
              }`}
            >
              <ShoppingBag className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-4.5 h-4.5 bg-[#D4A373] text-[#0F2D1F] text-[10px] font-black rounded-full flex items-center justify-center shadow-md"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* Primary "BUY NOW" Button */}
            <button
              id="nav-buy-now-cta"
              onClick={() => handleNav('products')}
              className="hidden sm:inline-flex items-center gap-2 px-4.5 py-2 rounded-full bg-gradient-to-r from-[#2D6A4F] to-[#52B788] hover:from-[#1B4332] hover:to-[#2D6A4F] text-[#FAF8F2] text-xs font-black tracking-wider uppercase border border-[#74C69D]/40 shadow-[0_4px_14px_rgba(45,106,79,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              <span>BUY NOW</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="nav-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="lg:hidden p-2 rounded-full hover:bg-white/10 text-[#FAF8F2]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 bg-[#0F2D1F]/98 backdrop-blur-xl flex flex-col justify-between p-6 lg:hidden"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-[#2D6A4F]/40 pb-4">
              <GarudaLogo variant="horizontal" theme="dark" size="sm" />
              <button
                id="mobile-menu-close"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full bg-white/10 text-[#FAF8F2]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Links */}
            <div className="flex flex-col gap-4 py-6">
              {navItems.map((item, idx) => {
                const isActive = activeView === item.view;
                return (
                  <motion.button
                    key={item.view}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 + 0.1 }}
                    onClick={() => handleNav(item.view)}
                    className={`text-left font-heading text-lg font-bold tracking-wider py-2.5 px-3 rounded-xl flex items-center justify-between transition-colors ${
                      isActive ? 'bg-[#2D6A4F] text-[#FAF8F2]' : 'text-[#FAF8F2]/90 hover:text-[#D4A373]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#D4A373] text-[#0F2D1F] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Mobile Bottom Action */}
            <div className="space-y-3 pt-4 border-t border-[#2D6A4F]/40">
              <button
                onClick={() => handleNav('products')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#2D6A4F] to-[#52B788] text-[#FAF8F2] font-black tracking-widest text-center shadow-lg uppercase text-xs flex items-center justify-center gap-2"
              >
                <span>BUY NOW • EXPLORE ALL 50 HARVESTS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {onOpenAdmin && (
                <button
                  id="mobile-admin-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F2] font-bold tracking-wider text-center text-xs flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#52B788]" />
                  <span>Admin Console & Database</span>
                </button>
              )}
              <div className="text-center text-[11px] text-[#FAF8F2]/60">
                🌿 Farm-Gate Freshness • Express Morning Delivery
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
