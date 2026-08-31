import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { Product } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');

  const results = useMemo(() => {
    if (!query.trim() && selectedCat === 'All') return PRODUCTS.slice(0, 8); // show popular initial items

    return PRODUCTS.filter((p) => {
      const matchCat = selectedCat === 'All' || p.category.toLowerCase() === selectedCat.toLowerCase();
      const matchQuery =
        !query.trim() ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [query, selectedCat]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 sm:pt-20 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="relative bg-[#FDFBF7] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-[#DCD2C3] z-10 p-6 sm:p-8"
          >
            {/* Top Search Input Box */}
            <div className="relative mb-6">
              <Search className="w-5 h-5 text-[#8C6239] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                id="global-search-input"
                autoFocus
                type="text"
                placeholder="Search country eggs, A2 milk, bilona ghee, ragi..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#FAF8F2] border border-[#DCD2C3] text-[#0F2D1F] text-base placeholder-[#889B92] focus:outline-none focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F] shadow-inner font-medium"
              />
              <button
                id="search-modal-close-btn"
                onClick={onClose}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#889B92] hover:text-[#0F2D1F] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Category Suggestion Chips */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
              {CATEGORIES.slice(0, 7).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    selectedCat === cat.name
                      ? 'bg-[#0F2D1F] text-[#FAF8F2]'
                      : 'bg-[#FAF8F2] text-[#4A5D53] border border-[#DCD2C3] hover:bg-[#EFE8DC]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Results Section */}
            <div className="max-h-[380px] overflow-y-auto space-y-3 pr-1">
              <div className="text-xs font-bold uppercase tracking-wider text-[#8C6239] mb-2 flex items-center justify-between">
                <span>
                  {query ? `Search Results (${results.length})` : 'Popular Farm Harvests'}
                </span>
                {query && (
                  <button onClick={() => setQuery('')} className="text-[#2D6A4F] normal-case">
                    Clear text
                  </button>
                )}
              </div>

              {results.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm font-semibold text-[#0F2D1F]">
                    No harvest produce found for "{query}"
                  </p>
                  <p className="text-xs text-[#556960] mt-1">
                    Try searching for "Eggs", "Milk", "Chicken", "Honey", or "Rice"
                  </p>
                </div>
              ) : (
                results.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-[#FAF8F2] border border-[#E5DEC9] hover:bg-white hover:border-[#2D6A4F] transition-all flex items-center justify-between gap-4 cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-14 h-14 rounded-xl object-cover bg-[#EFE8DC] shrink-0 border border-[#DCD2C3]"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-[#8C6239] uppercase tracking-wider">
                          {product.category}
                        </span>
                        <h4 className="font-heading font-bold text-sm text-[#0F2D1F] truncate group-hover:text-[#2D6A4F] transition-colors">
                          {product.name}
                        </h4>
                        <span className="text-xs text-[#556960]">{product.defaultWeight}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-heading font-black text-sm text-[#0F2D1F]">
                        ₹{product.price}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[#2D6A4F]/10 group-hover:bg-[#2D6A4F] text-[#2D6A4F] group-hover:text-white flex items-center justify-center transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
