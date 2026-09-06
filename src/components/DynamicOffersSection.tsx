import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Leaf, Star, Tag, ShoppingBag, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';

interface DynamicOffersSectionProps {
  products?: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, weight: string, quantity: number) => void;
  onToggleWishlist?: (product: Product) => void;
  wishlistIds?: number[];
}

export type DynamicOfferTab = 'todays_deals' | 'fresh_arrivals' | 'best_sellers' | 'special_offers';

export const DynamicOffersSection: React.FC<DynamicOffersSectionProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
}) => {
  const [activeTab, setActiveTab] = useState<DynamicOfferTab>('todays_deals');

  const tabs: Array<{ id: DynamicOfferTab; label: string; icon: any; color: string; badge: string }> = [
    { id: 'todays_deals', label: "Today's Deals", icon: Flame, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30', badge: '🔥 UP TO 25% OFF' },
    { id: 'fresh_arrivals', label: 'Fresh Arrivals', icon: Leaf, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30', badge: '🥬 DAWN HARVEST' },
    { id: 'best_sellers', label: 'Best Sellers', icon: Star, color: 'text-[#8C6239] bg-[#8C6239]/10 border-[#8C6239]/30', badge: '⭐ PATRON FAVOURITE' },
    { id: 'special_offers', label: 'Special Offers', icon: Tag, color: 'text-rose-500 bg-rose-500/10 border-rose-500/30', badge: '🏷️ BUNDLE SAVINGS' },
  ];

  const sourceProducts = useMemo(() => {
    return products && products.length > 0 ? products : PRODUCTS;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return sourceProducts.filter((p) => {
      if (activeTab === 'todays_deals') return p.badge?.includes('OFF') || p.price < p.originalPrice || (p as any).is_todays_deal;
      if (activeTab === 'fresh_arrivals') return p.tags?.includes('Fresh') || p.tags?.includes('Organic') || (p as any).is_fresh_arrival;
      if (activeTab === 'best_sellers') return p.featured || p.rating >= 4.8 || (p as any).is_best_seller;
      if (activeTab === 'special_offers') return p.badge || (p as any).is_special_offer;
      return true;
    }).slice(0, 6);
  }, [activeTab, sourceProducts]);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAF8F2] via-white to-[#FAF8F2] border-y border-[#EFE8DC]">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#8C6239] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
              ADMIN CURATED HARVEST OFFERS
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#0F2D1F]">
              Dynamic Farm Offers & Daily Deals
            </h2>
            <p className="text-sm text-[#556960] max-w-xl">
              Freshly harvested A2 dairy, free-range eggs, organic mushrooms, and seasonal produce updated live by our farm curators.
            </p>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#0F2D1F] text-[#FAF8F2] shadow-md scale-[1.02]'
                      : 'bg-white text-[#556960] border border-[#DCD2C3] hover:bg-[#FAF8F2] hover:text-[#0F2D1F]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4A373]' : 'text-[#8C6239]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {filteredProducts.map((product) => {
              const isWish = wishlistIds.includes(product.id);
              const activeBadge = tabs.find((t) => t.id === activeTab)?.badge || product.badge;

              return (
                <motion.div
                  key={`${activeTab}-${product.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-3xl border border-[#DCD2C3] overflow-hidden hover:border-[#2D6A4F] hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Image Container */}
                  <div className="relative aspect-4/3 bg-[#FDFBF7] overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      onClick={() => onSelectProduct(product)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                    />

                    {/* Badge */}
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0F2D1F]/90 backdrop-blur-sm text-[#FAF8F2] text-[10px] font-black uppercase tracking-wider shadow-md">
                      {activeBadge}
                    </span>

                    {/* Wishlist Button */}
                    {onToggleWishlist && (
                      <button
                        onClick={() => onToggleWishlist(product)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white text-[#0F2D1F] shadow-md transition-transform active:scale-90"
                      >
                        <Heart className={`w-4 h-4 ${isWish ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    )}

                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{product.rating}</span>
                      <span className="text-white/60">({product.reviews})</span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5" onClick={() => onSelectProduct(product)}>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6239]">
                        {product.category} • {product.farmOrigin}
                      </span>
                      <h3 className="font-heading font-bold text-lg text-[#0F2D1F] group-hover:text-[#2D6A4F] transition-colors line-clamp-1 cursor-pointer">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#556960] line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="pt-3 border-t border-[#EFE8DC] flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-heading font-black text-xl text-[#0F2D1F]">
                            ₹{product.price}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="text-xs text-[#889B92] line-through font-semibold">
                              ₹{product.originalPrice}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#8C6239] font-bold block">
                          Per {product.defaultWeight}
                        </span>
                      </div>

                      <button
                        onClick={() => onAddToCart(product, product.defaultWeight, 1)}
                        className="px-4 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-[#FAF8F2] text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
