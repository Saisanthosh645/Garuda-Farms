import React from 'react';
import { motion } from 'motion/react';
import { HeartHandshake, ShieldCheck, Sun, Sprout, ArrowRight } from 'lucide-react';

interface AboutSectionProps {
  onExploreProducts: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onExploreProducts }) => {
  return (
    <section id="about" className="py-28 sm:py-36 bg-[#FAF8F2] text-[#19241C] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Editorial Visual Collage */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border border-[#DCD2C3] aspect-[4/3] group">
              <img
                src="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1000&q=80"
                alt="Garuda Farms Pasture"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F2D1F]/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 text-[#FAF8F2]">
                <p className="text-xs uppercase tracking-widest text-[#D4A373] font-bold">
                  Single Origin Sanctuary
                </p>
                <h4 className="font-heading text-xl font-bold">Chevella & Nallamala Foothills</h4>
              </div>
            </div>

            {/* Overlapping Floating Inset Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute -bottom-8 -right-4 sm:-right-8 z-20 bg-[#FDFBF7] p-5 sm:p-6 rounded-2xl border border-[#DCD2C3] shadow-xl max-w-xs"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center text-[#2D6A4F]">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-heading font-bold text-sm text-[#0F2D1F]">
                    Indigenous Heritage
                  </h5>
                  <p className="text-[11px] text-[#8C6239] font-medium">Vedic Agricultural Science</p>
                </div>
              </div>
              <p className="text-xs text-[#556960] leading-relaxed">
                Zero hybrid GMO modifications. We preserve heirloom Indian crops and pure native breeds.
              </p>
            </motion.div>
          </motion.div>

          {/* Right Narrative Story */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 space-y-6"
          >
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-xs font-bold tracking-widest uppercase">
              ABOUT GARUDA FARMS
            </span>

            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0F2D1F] leading-tight tracking-tight">
              MORE THAN A FARM. <br />
              <span className="text-[#2D6A4F]">IT'S A SACRED PROMISE.</span>
            </h2>

            <p className="text-base sm:text-lg text-[#4A5D53] leading-relaxed font-body">
              Garuda Farms is built around the idea of connecting families with fresh, pure farm products while respecting nature, farmers, and traditional agricultural wisdom.
            </p>

            <p className="text-sm sm:text-base text-[#556960] leading-relaxed">
              We saw how modern industrialized food chains stripped food of aroma, vital minerals, and natural vitality in exchange for artificial shelf life. Garuda Farms was founded to restore the direct bond between conscious eaters and regenerative Indian soil.
            </p>

            {/* Ethos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E5DEC9]">
                <div className="flex items-center gap-2.5 mb-1.5 text-[#2D6A4F] font-bold text-sm">
                  <Sun className="w-4 h-4 text-[#D4A373]" />
                  <span>Solar Harvested</span>
                </div>
                <p className="text-xs text-[#556960]">
                  Harvested in tune with natural solar circadian rhythm for maximum botanical nutrition.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E5DEC9]">
                <div className="flex items-center gap-2.5 mb-1.5 text-[#2D6A4F] font-bold text-sm">
                  <HeartHandshake className="w-4 h-4 text-[#8C6239]" />
                  <span>Farmer First</span>
                </div>
                <p className="text-xs text-[#556960]">
                  Fair guaranteed livelihood and direct dignified partnerships with over 320 farming families.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <button
                onClick={onExploreProducts}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#0F2D1F] hover:bg-[#1B4332] text-[#FAF8F2] text-xs font-extrabold tracking-widest uppercase shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <span>Taste the Purity • Explore Catalog</span>
                <ArrowRight className="w-4 h-4 text-[#D4A373]" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
