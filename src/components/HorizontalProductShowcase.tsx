import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { Product } from '../types';

interface HorizontalProductShowcaseProps {
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, weight?: string) => void;
  onExploreAll: () => void;
}

export const HorizontalProductShowcase: React.FC<HorizontalProductShowcaseProps> = ({
  onQuickView,
  onAddToCart,
  onExploreAll,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Pick top signature items from across the 10 categories
  const featuredShowcase = PRODUCTS.filter((p) => p.featured || [1, 6, 11, 19, 23, 27, 31, 34, 39, 43, 47, 49].includes(p.id));

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-24 bg-[#FAF8F2] text-[#19241C] relative overflow-hidden border-b border-[#E8DFC8]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-xs font-bold tracking-widest uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              CURATED FARM HARVEST
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0F2D1F]">
              HARVEST SPOTLIGHT
            </h2>
            <p className="text-[#556960] mt-2 max-w-xl text-sm sm:text-base">
              Swipe across our most celebrated daily harvests — plucked, cold-packed, and ready to dispatch to your kitchen.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            <button
              id="showcase-prev-btn"
              onClick={() => scroll('left')}
              aria-label="Previous items"
              className="w-12 h-12 rounded-full border border-[#DCD2C3] bg-[#FDFBF7] hover:bg-[#0F2D1F] hover:text-[#FAF8F2] hover:border-[#0F2D1F] flex items-center justify-center transition-colors shadow-sm text-[#0F2D1F]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              id="showcase-next-btn"
              onClick={() => scroll('right')}
              aria-label="Next items"
              className="w-12 h-12 rounded-full border border-[#DCD2C3] bg-[#FDFBF7] hover:bg-[#0F2D1F] hover:text-[#FAF8F2] hover:border-[#0F2D1F] flex items-center justify-center transition-colors shadow-sm text-[#0F2D1F]"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              id="showcase-explore-all-btn"
              onClick={onExploreAll}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#2D6A4F] hover:bg-[#1B4332] text-[#FAF8F2] text-xs font-bold tracking-widest uppercase transition-all shadow-md ml-2"
            >
              <span>View All 50</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Row */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-6 pt-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
      >
        {featuredShowcase.map((product) => (
          <motion.div
            key={product.id}
            data-cursor="product"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
            className="w-[280px] sm:w-[320px] shrink-0 bg-[#FDFBF7] rounded-2xl border border-[#DCD2C3]/80 p-5 shadow-[0_4px_20px_rgba(15,45,31,0.05)] hover:shadow-[0_16px_35px_rgba(15,45,31,0.12)] flex flex-col justify-between group snap-start transition-all"
          >
            <div>
              {/* Product Image */}
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] mb-4 bg-[#F0EAE1]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#0F2D1F]/85 text-[#FAF8F2] text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-sm">
                    {product.badge}
                  </span>
                )}
                <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-[#FAF8F2]/90 text-[#2D6A4F] text-[11px] font-bold">
                  {product.category}
                </span>
              </div>

              {/* Title & Origin */}
              <h3 className="font-heading text-lg font-bold text-[#0F2D1F] line-clamp-1 group-hover:text-[#2D6A4F] transition-colors">
                {product.name}
              </h3>
              <p className="text-xs text-[#8C6239] mt-1 font-medium truncate">
                {product.farmOrigin}
              </p>
              <p className="text-xs text-[#556960] mt-2 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Bottom Price & Actions */}
            <div className="mt-5 pt-4 border-t border-[#EFE8DC]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs text-[#8C6239] font-medium block">Starting from</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading text-xl font-bold text-[#0F2D1F]">
                      ₹{product.price}
                    </span>
                    <span className="text-xs text-[#889B92] line-through">
                      ₹{product.originalPrice}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-[#556960] font-semibold bg-[#F0EAE1] px-2 py-1 rounded-md">
                  {product.defaultWeight}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  id={`showcase-quickview-${product.id}`}
                  onClick={() => onQuickView(product)}
                  className="py-2.5 px-3 rounded-xl border border-[#2D6A4F]/30 text-[#2D6A4F] hover:bg-[#2D6A4F]/10 text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Quick View
                </button>
                <button
                  id={`showcase-add-${product.id}`}
                  onClick={() => onAddToCart(product, product.defaultWeight)}
                  className="py-2.5 px-3 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-[#FAF8F2] text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
