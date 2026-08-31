import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, ShieldCheck, Sparkles, Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { EggSpotlightCanvas } from './3d/EggSpotlightCanvas';
import { PRODUCTS } from '../data/products';
import { Product } from '../types';

interface FeaturedSpotlightProps {
  onAddToCart: (product: Product, weight?: string) => void;
  onQuickView: (product: Product) => void;
}

export const FeaturedSpotlight: React.FC<FeaturedSpotlightProps> = ({
  onAddToCart,
  onQuickView,
}) => {
  const eggProduct = PRODUCTS[0]; // Farm Fresh Eggs
  const [selectedPack, setSelectedPack] = useState('12 Eggs');
  const [isAdded, setIsAdded] = useState(false);

  const priceMap: Record<string, number> = {
    '6 Eggs': 65,
    '12 Eggs': 120,
    '30 Tray': 280,
  };
  const currentPrice = priceMap[selectedPack] || 120;

  const handleAdd = () => {
    onAddToCart(eggProduct, selectedPack);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <section className="py-28 sm:py-36 bg-[#0F2D1F] text-[#FAF8F2] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4A373]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* 3D Interactive Spotlight Canvas Left/Center */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-md bg-gradient-to-b from-[#143D2B]/80 to-[#0F2D1F] rounded-3xl p-6 border border-[#D4A373]/30 shadow-2xl backdrop-blur-xl">
              {/* Badge */}
              <div className="absolute top-6 left-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A373] text-[#0F2D1F] text-[10px] font-black uppercase tracking-wider shadow-md">
                <Sparkles className="w-3 h-3" />
                SIGNATURE HARVEST
              </div>

              {/* 3D WebGL Canvas */}
              <EggSpotlightCanvas />

              {/* Bottom specification banner */}
              <div className="mt-2 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#FAF8F2]/75">
                <span>Free-Range Pasture Flock</span>
                <span className="text-[#D4A373] font-bold">Deep Amber Yolk</span>
              </div>
            </div>
          </motion.div>

          {/* Editorial Content Right */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1B4332] text-[#D4A373] text-xs font-bold tracking-[0.2em] uppercase border border-[#D4A373]/30">
              FEATURED HARVEST SPOTLIGHT
            </div>

            <div className="space-y-1">
              <span className="font-heading text-xl sm:text-2xl font-bold tracking-widest text-[#D4A373] block uppercase">
                FRESH. SIMPLE. NATURAL.
              </span>
              <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-[#FAF8F2] leading-tight">
                FARM FRESH EGGS
              </h2>
            </div>

            {/* Ratings */}
            <div className="flex items-center gap-3">
              <div className="flex items-center text-[#E9C46A]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#E9C46A]" />
                ))}
              </div>
              <span className="text-sm font-bold text-[#FAF8F2]">4.9 / 5.0</span>
              <span className="text-xs text-[#FAF8F2]/60">(248 Verified Patrons)</span>
            </div>

            <p className="text-base sm:text-lg text-[#FAF8F2]/85 leading-relaxed font-body">
              Laid by pasture-raised hens roaming open grasslands under the Telangana sun. Fed on sprouted grains, greens, and mineral seeds with zero antibiotics or chemical hormones.
            </p>

            {/* Key Quality Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 text-sm text-[#FAF8F2]/90">
                <Check className="w-4 h-4 text-[#52B788] shrink-0" />
                <span>Deep Orange Golden Yolk</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-[#FAF8F2]/90">
                <Check className="w-4 h-4 text-[#52B788] shrink-0" />
                <span>Collected Daily at Dawn</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-[#FAF8F2]/90">
                <Check className="w-4 h-4 text-[#52B788] shrink-0" />
                <span>Zero Synthetic Carotenoid Dye</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-[#FAF8F2]/90">
                <Check className="w-4 h-4 text-[#52B788] shrink-0" />
                <span>6.5g Bioactive Protein per Egg</span>
              </div>
            </div>

            {/* Pack Size Selector */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#D4A373] block">
                Choose Pack Size
              </label>
              <div className="flex gap-3">
                {['6 Eggs', '12 Eggs', '30 Tray'].map((pack) => (
                  <button
                    key={pack}
                    onClick={() => setSelectedPack(pack)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      selectedPack === pack
                        ? 'bg-[#D4A373] text-[#0F2D1F] shadow-lg scale-105'
                        : 'bg-[#143D2B] text-[#FAF8F2]/80 border border-[#2D6A4F] hover:bg-[#1B4332]'
                    }`}
                  >
                    {pack} • ₹{priceMap[pack]}
                  </button>
                ))}
              </div>
            </div>

            {/* Price & Action CTA */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              <button
                id="spotlight-add-cart-btn"
                onClick={handleAdd}
                className={`w-full sm:w-auto px-8 py-4 rounded-full text-xs sm:text-sm font-extrabold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 shadow-xl ${
                  isAdded
                    ? 'bg-[#52B788] text-[#0F2D1F]'
                    : 'bg-gradient-to-r from-[#2D6A4F] to-[#52B788] hover:from-[#1B4332] hover:to-[#2D6A4F] text-[#FAF8F2] hover:scale-105 active:scale-95'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Shop Fresh Eggs • ₹{currentPrice}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onQuickView(eggProduct)}
                className="w-full sm:w-auto px-6 py-4 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF8F2] text-xs font-bold tracking-widest uppercase border border-white/20 flex items-center justify-center gap-2"
              >
                <span>Full Farm Lab Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
