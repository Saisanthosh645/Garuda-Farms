import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, Sparkles, X, Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { Product, ProductCategory } from '../types';
import { ProductCard } from './ProductCard';

interface ProductCatalogProps {
  wishlistIds: number[];
  initialCategory?: ProductCategory | 'All';
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, weight?: string) => void;
  onViewCart?: () => void;
  cartCount?: number;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  wishlistIds,
  initialCategory = 'All',
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onViewCart,
  cartCount = 0,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [organicOnly, setOrganicOnly] = useState(false);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        product.farmOrigin.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOrganic = !organicOnly || Boolean(product.organicCert);

      return matchesCategory && matchesSearch && matchesOrganic;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.id - b.id;
    });
  }, [selectedCategory, searchQuery, sortBy, organicOnly]);

  return (
    <section id="products" className="py-20 sm:py-28 bg-[#FAF8F2] text-[#19241C] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Store Title & Narrative */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-xs font-extrabold tracking-widest uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#E9C46A]" />
            GARUDA HARVEST STORE
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-[#0F2D1F] tracking-tight">
            FRESH HARVESTS. REAL PURITY.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#556960] font-normal leading-relaxed">
            Explore all 50 single-origin harvests — country eggs, free-range poultry, raw forest honey, cold-pressed oils, and heirloom crops.
          </p>
        </div>

        {/* Category Filter Pills Bar */}
        <div className="flex items-center justify-start lg:justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                id={`cat-filter-${cat.id}`}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wider transition-all duration-200 flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-[#0F2D1F] text-[#FAF8F2] shadow-md scale-105'
                    : 'bg-[#FDFBF7] text-[#4A5D53] border border-[#DCD2C3] hover:bg-[#EFE8DC]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-[#2D6A4F] text-[#FAF8F2]' : 'bg-[#E5DEC9] text-[#0F2D1F]'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search and Filters Container */}
        <div className="bg-[#FDFBF7] rounded-2xl p-4 sm:p-5 border border-[#DCD2C3] shadow-sm mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Live Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[#8C6239] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="catalog-search-input"
              type="text"
              placeholder="Search honey, country chicken, ragi, milk, ghee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#FAF8F2] border border-[#DCD2C3] text-sm text-[#0F2D1F] placeholder-[#889B92] focus:outline-none focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#889B92] hover:text-[#0F2D1F]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters and Sorting */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Organic/Vedic filter toggle */}
            <button
              onClick={() => setOrganicOnly(!organicOnly)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 ${
                organicOnly
                  ? 'bg-[#2D6A4F] text-[#FAF8F2] border-[#2D6A4F]'
                  : 'bg-[#FAF8F2] text-[#4A5D53] border-[#DCD2C3] hover:bg-[#EFE8DC]'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                  organicOnly ? 'bg-white border-white text-[#2D6A4F]' : 'border-[#8C6239]'
                }`}
              >
                {organicOnly && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span>Certified Organic / Vedic</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#8C6239]" />
              <select
                id="catalog-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-2 px-3 rounded-xl bg-[#FAF8F2] border border-[#DCD2C3] text-xs font-bold text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
              >
                <option value="featured">Featured Curations</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter Info */}
        <div className="flex items-center justify-between text-xs font-semibold text-[#556960] mb-6">
          <span>
            Showing <strong className="text-[#0F2D1F]">{filteredProducts.length}</strong> of 50 Farm Harvests
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </span>
          {(searchQuery || selectedCategory !== 'All' || organicOnly) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setOrganicOnly(false);
              }}
              className="text-[#2D6A4F] hover:underline font-bold"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Products 3D Grid */}
        {filteredProducts.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
          >
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                >
                  <ProductCard
                    product={product}
                    isWishlisted={wishlistIds.includes(product.id)}
                    onToggleWishlist={onToggleWishlist}
                    onQuickView={onQuickView}
                    onAddToCart={(p, w) => onAddToCart(p, w)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Empty Search State */
          <div className="py-20 text-center bg-[#FDFBF7] rounded-3xl border border-[#DCD2C3] max-w-lg mx-auto p-8 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#F0EAE1] flex items-center justify-center text-3xl mx-auto mb-4">
              🌾
            </div>
            <h3 className="font-heading text-xl font-bold text-[#0F2D1F]">
              No farm harvests found
            </h3>
            <p className="text-sm text-[#556960] mt-2 mb-6">
              We couldn't find any produce matching your filters. Try selecting another category or clear search.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setOrganicOnly(false);
              }}
              className="px-6 py-3 rounded-full bg-[#2D6A4F] text-[#FAF8F2] text-xs font-bold tracking-widest uppercase hover:bg-[#1B4332]"
            >
              Show All 50 Products
            </button>
          </div>
        )}

        {/* Floating Cart Quick Bar if items present */}
        {cartCount > 0 && onViewCart && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-md w-[90%] bg-[#0F2D1F] text-[#FAF8F2] p-3.5 rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.35)] border border-[#52B788]/40 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3 pl-2">
              <div className="w-8 h-8 rounded-full bg-[#2D6A4F] flex items-center justify-center text-[#52B788]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold block">{cartCount} Harvest Items in Cart</span>
                <span className="text-[10px] text-[#D4A373]">Direct farm gate pricing</span>
              </div>
            </div>

            <button
              onClick={onViewCart}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#52B788] to-[#2D6A4F] text-[#0F2D1F] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <span>View Cart & Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
