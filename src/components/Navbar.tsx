import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Heart, ShoppingBag, Menu, X, ArrowRight, Sparkles, ShieldCheck, Truck, User, ChevronDown, Check, Phone } from 'lucide-react';
import { GarudaLogo } from './GarudaLogo';
import { useAuth } from '../auth/AuthProvider';

interface NavbarProps {
  activeView: string;
  cartCount: number;
  wishlistCount: number;
  onSelectView: (view: 'home' | 'products' | 'cart' | 'story' | 'sustainability' | 'account' | 'orders' | 'login' | 'signup' | 'forgot') => void;
  onOpenCartDrawer: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
  onOpenAdmin?: () => void;
  onOpenTrackOrder?: () => void;
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
  onOpenTrackOrder,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [topBannerDismissed, setTopBannerDismissed] = useState(false);

  const auth = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { label: string; view: 'home' | 'products' | 'story' | 'sustainability'; badge?: string }[] = [
    { label: 'HOME', view: 'home' },
    { label: 'STORE (50 PRODUCTS)', view: 'products', badge: '50 Fresh' },
    { label: 'OUR SANCTUARY', view: 'story' },
    { label: 'SUSTAINABILITY', view: 'sustainability' },
  ];

  const handleNav = (view: 'home' | 'products' | 'cart' | 'story' | 'sustainability') => {
    onSelectView(view);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthNav = (view: 'account' | 'orders' | 'login' | 'signup' | 'forgot') => {
    onSelectView(view as any);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Fixed Header Wrapper */}
      <div className="fixed top-0 left-0 right-0 z-40 flex flex-col">
        {/* Top Luxury Announcement Bar */}
        {!topBannerDismissed && (
          <div className="bg-gradient-to-r from-[#0B2317] via-[#143823] to-[#0B2317] border-b border-[#C49A45]/25 text-[#FAF8F2] py-1.5 px-3 sm:px-6 text-[10.5px] sm:text-xs font-bold tracking-wide transition-all shadow-inner">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
              {/* Left Badge */}
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1 bg-[#C49A45]/20 text-[#DEB86A] px-2 py-0.5 rounded-full border border-[#C49A45]/30 text-[9.5px] font-black uppercase tracking-widest">
                  <Sparkles className="w-3 h-3 text-[#DEB86A] animate-spin-slow" />
                  Farm Direct
                </span>
                <span className="text-[#FAF8F2]/75">100% Organic & Chemical-Free</span>
              </div>

              {/* Center Announcement Ticker */}
              <div className="flex-1 text-center truncate px-2 font-medium">
                <span className="text-[#DEB86A] font-extrabold mr-1.5">🍃 FRESH HARVEST:</span>
                <span className="text-[#FAF8F2]">Complimentary Cold-Chain Express Shipping on orders over ₹499!</span>
              </div>

              {/* Right Quick Controls */}
              <div className="flex items-center gap-3 shrink-0">
                {onOpenTrackOrder && (
                  <button
                    onClick={onOpenTrackOrder}
                    className="hidden md:flex items-center gap-1 text-[#DEB86A] hover:text-white transition-colors cursor-pointer"
                  >
                    <Truck className="w-3 h-3" />
                    <span>Track Order</span>
                  </button>
                )}
                <button
                  onClick={() => setTopBannerDismissed(true)}
                  className="text-stone-400 hover:text-white transition-colors p-0.5"
                  title="Dismiss banner"
                  aria-label="Dismiss banner"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation Bar */}
        <header
          className={`w-full transition-all duration-300 ${
            isScrolled || activeView !== 'home'
              ? 'py-2.5 sm:py-3 bg-[#0F2D1F]/95 backdrop-blur-md shadow-2xl border-b border-[#D4A373]/25 text-[#FAF8F2]'
              : 'py-3 sm:py-4 bg-gradient-to-b from-[#0F2D1F]/95 via-[#0F2D1F]/70 to-transparent text-[#FAF8F2]'
          }`}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
            {/* Brand Logo (Left) */}
            <button
              id="nav-logo-btn"
              onClick={() => handleNav('home')}
              className="flex items-center text-left focus:outline-none cursor-pointer shrink-0 group"
            >
              <GarudaLogo variant="horizontal" theme="dark" size={isScrolled ? 'sm' : 'md'} />
            </button>

            {/* Desktop Navigation Links (Center) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2.5">
              {navItems.map((item) => {
                const isActive = activeView === item.view;
                return (
                  <button
                    key={item.view}
                    id={`nav-link-${item.view}`}
                    onClick={() => handleNav(item.view)}
                    className={`text-[11px] xl:text-xs font-extrabold tracking-[0.12em] uppercase transition-all py-1.5 px-3 rounded-full flex items-center gap-1.5 relative group cursor-pointer ${
                      isActive
                        ? 'bg-[#2D6A4F] text-[#FAF8F2] shadow-sm border border-[#52B788]/40'
                        : 'text-[#FAF8F2]/90 hover:text-[#FAF8F2] hover:bg-white/10'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
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

            {/* Action Group & BUY NOW CTA (Right) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Desktop User Account Pill Dropdown */}
              {!auth.loading && (
                <div className="hidden lg:block relative">
                  {auth.user ? (
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold transition-all border ${
                        activeView === 'account' || activeView === 'orders'
                          ? 'bg-[#2D6A4F] text-white border-[#52B788]/40 shadow-sm'
                          : 'bg-white/10 text-[#FAF8F2] hover:bg-white/20 border-white/10'
                      }`}
                    >
                      <User className="w-3.5 h-3.5 text-[#52B788]" />
                      <span className="max-w-[80px] truncate">{auth.user.full_name?.split(' ')[0] || 'Account'}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAuthNav('login')}
                        className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full text-[#FAF8F2]/90 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => handleAuthNav('signup')}
                        className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#D4A373]/20 text-[#D4A373] hover:bg-[#D4A373] hover:text-[#0F2D1F] transition-all border border-[#D4A373]/30"
                      >
                        Sign Up
                      </button>
                    </div>
                  )}

                  {/* Account Dropdown Menu */}
                  <AnimatePresence>
                    {userDropdownOpen && auth.user && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 mt-2 w-48 bg-[#0F2D1F] border border-[#D4A373]/30 rounded-2xl shadow-2xl p-2 z-50 text-xs"
                      >
                        <div className="px-3 py-2 border-b border-[#2D6A4F]/40 mb-1">
                          <p className="font-bold text-[#FAF8F2] truncate">{auth.user.full_name}</p>
                          <p className="text-[10px] text-stone-400 truncate">{auth.user.email}</p>
                        </div>
                        <button
                          onClick={() => handleAuthNav('orders')}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-[#FAF8F2] font-semibold flex items-center gap-2"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-[#52B788]" />
                          My Orders
                        </button>
                        <button
                          onClick={() => handleAuthNav('account')}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-[#FAF8F2] font-semibold flex items-center gap-2"
                        >
                          <User className="w-3.5 h-3.5 text-[#52B788]" />
                          Account Settings
                        </button>
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            auth.signOut();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-900/30 text-rose-300 font-semibold mt-1 border-t border-[#2D6A4F]/30"
                        >
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Track Order Live Dispatch (Desktop) */}
              {onOpenTrackOrder && (
                <button
                  id="nav-track-order-btn"
                  onClick={onOpenTrackOrder}
                  title="Track Live Order Dispatch"
                  aria-label="Track Live Order"
                  className="hidden lg:flex p-2 rounded-full hover:bg-white/10 text-[#FAF8F2] transition-colors group"
                >
                  <Truck className="w-4 h-4 group-hover:text-[#52B788] transition-colors" />
                </button>
              )}

              {/* Admin Console Trigger (Desktop) */}
              {onOpenAdmin && (
                <button
                  id="nav-admin-btn"
                  onClick={onOpenAdmin}
                  title="Admin Control Center"
                  aria-label="Open Admin Console"
                  className="hidden lg:flex p-2 rounded-full hover:bg-white/10 text-[#FAF8F2] transition-colors group"
                >
                  <ShieldCheck className="w-4 h-4 group-hover:text-[#52B788] transition-colors" />
                </button>
              )}

              {/* Search Button */}
              <button
                id="nav-search-btn"
                onClick={onOpenSearch}
                aria-label="Search products"
                className="p-2 sm:p-2.5 rounded-full hover:bg-white/10 text-[#FAF8F2] transition-colors"
              >
                <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>

              {/* Wishlist Button */}
              <button
                id="nav-wishlist-btn"
                onClick={onOpenWishlist}
                aria-label="View Wishlist"
                className="p-2 sm:p-2.5 rounded-full hover:bg-white/10 text-[#FAF8F2] transition-colors relative"
              >
                <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#E76F51] text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart Drawer Toggle */}
              <button
                id="nav-cart-btn"
                onClick={onOpenCartDrawer}
                aria-label="Open Cart Drawer"
                className={`p-2 sm:p-2.5 rounded-full transition-all relative group ${
                  activeView === 'cart' ? 'bg-[#2D6A4F] text-[#FAF8F2]' : 'hover:bg-white/10 text-[#FAF8F2]'
                }`}
              >
                <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.4, rotate: -20 }}
                    animate={{
                      scale: [1, 1.45, 1.1, 1],
                      rotate: [0, 15, -15, 0],
                    }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-gradient-to-r from-[#D4A373] via-[#E9C46A] to-[#D4A373] text-[#0F2D1F] text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border border-[#FAF8F2]/60 shrink-0"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              {/* Primary "BUY NOW" Button (Fits smoothly on all screens, never overflows) */}
              <button
                id="nav-buy-now-cta"
                onClick={() => handleNav('products')}
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-[#2D6A4F] via-[#387656] to-[#52B788] hover:from-[#1B4332] hover:to-[#2D6A4F] text-[#FAF8F2] text-[11px] sm:text-xs font-black tracking-wider uppercase border border-[#74C69D]/40 shadow-[0_4px_14px_rgba(45,106,79,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 ml-1"
              >
                <span>BUY NOW</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Mobile Menu Hamburger Toggle */}
              <button
                id="nav-mobile-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F2] transition-colors ml-1 focus:outline-none shrink-0"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Spacer so content doesn't get hidden behind fixed header */}
      <div className={topBannerDismissed ? 'h-16 sm:h-20' : 'h-24 sm:h-28'} />

      {/* Mobile Navigation Slide-over Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 bg-[#0F2D1F] flex flex-col justify-between p-5 sm:p-6 lg:hidden overflow-y-auto"
          >
            {/* Top Header inside Drawer */}
            <div className="flex items-center justify-between border-b border-[#2D6A4F]/40 pb-4">
              <GarudaLogo variant="horizontal" theme="dark" size="sm" />
              <button
                id="mobile-menu-close"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full bg-white/10 text-[#FAF8F2] hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-2 py-4 my-auto">
              {navItems.map((item, idx) => {
                const isActive = activeView === item.view;
                return (
                  <motion.button
                    key={item.view}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 + 0.05 }}
                    onClick={() => handleNav(item.view)}
                    className={`text-left font-heading text-base font-extrabold tracking-wider py-3 px-4 rounded-xl flex items-center justify-between transition-colors ${
                      isActive ? 'bg-[#2D6A4F] text-[#FAF8F2] border border-[#52B788]/30' : 'text-[#FAF8F2]/90 hover:bg-white/5'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4A373] text-[#0F2D1F] font-black">
                        {item.badge}
                      </span>
                    )}
                  </motion.button>
                );
              })}

              {/* Wishlist Mobile Link */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenWishlist();
                }}
                className="text-left font-heading text-base font-extrabold tracking-wider py-3 px-4 rounded-xl flex items-center justify-between text-[#FAF8F2]/90 hover:bg-white/5 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Heart className="w-4.5 h-4.5 text-[#E76F51]" />
                  <span>WISHLIST</span>
                </span>
                {wishlistCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E76F51] text-white font-black">
                    {wishlistCount} Saved
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Drawer Bottom Actions */}
            <div className="space-y-2.5 pt-3 border-t border-[#2D6A4F]/40">
              {/* Prominent BUY NOW Button */}
              <button
                onClick={() => handleNav('products')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#2D6A4F] via-[#387656] to-[#52B788] text-[#FAF8F2] font-black tracking-widest text-center shadow-xl uppercase text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
              >
                <span>BUY NOW • EXPLORE ALL 50 HARVESTS</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onOpenTrackOrder && (
                <button
                  id="mobile-track-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenTrackOrder();
                  }}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F2] font-bold tracking-wider text-center text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-[#52B788]" />
                  <span>Track Live Dispatch</span>
                </button>
              )}

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
                  <span>Admin Console</span>
                </button>
              )}

              {/* Mobile Auth Buttons */}
              {!auth.loading && !auth.user && (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => handleAuthNav('login')} className="w-1/2 py-2.5 rounded-xl bg-white/10 text-[#FAF8F2] font-bold text-xs">Login</button>
                  <button onClick={() => handleAuthNav('signup')} className="w-1/2 py-2.5 rounded-xl bg-[#D4A373] text-[#0F2D1F] font-bold text-xs">Create Account</button>
                </div>
              )}

              {!auth.loading && auth.user && (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => handleAuthNav('orders')} className="w-1/2 py-2.5 rounded-xl bg-white/10 text-[#FAF8F2] font-bold text-xs">My Orders</button>
                  <button onClick={() => handleAuthNav('account')} className="w-1/2 py-2.5 rounded-xl bg-[#2D6A4F] text-[#FAF8F2] font-bold text-xs">My Account</button>
                </div>
              )}

              <div className="text-center text-[10.5px] text-[#FAF8F2]/60 pt-1">
                🌿 Farm-Gate Freshness • Express Morning Delivery
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
