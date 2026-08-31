import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CTASectionProps {
  onExploreProducts: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onExploreProducts }) => {
  return (
    <section className="relative py-28 sm:py-36 bg-[#0F2D1F] text-[#FAF8F2] overflow-hidden">
      {/* Background Cinematic Image with Depth Vignette */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 pointer-events-none"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1920&q=80)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F2D1F] via-[#0F2D1F]/70 to-[#0F2D1F] pointer-events-none" />

      {/* Floating Gold Glow Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4A373]/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1B4332] text-[#D4A373] text-xs font-bold tracking-[0.2em] uppercase border border-[#D4A373]/30 mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E9C46A]" />
          FARM-TO-TABLE CONCIERGE
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black text-[#FAF8F2] tracking-tight leading-tight"
        >
          BRING THE FARM HOME.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-[#FAF8F2]/85 font-body max-w-2xl mx-auto leading-relaxed"
        >
          Freshness starts here. Experience the authentic taste, rich golden yolks, A2 bilona ghee, and heirloom crops delivered fresh to your kitchen.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            id="cta-explore-catalog-btn"
            onClick={onExploreProducts}
            className="w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-r from-[#2D6A4F] to-[#52B788] text-[#FAF8F2] text-sm font-extrabold tracking-widest uppercase shadow-[0_10px_30px_rgba(45,106,79,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
          >
            <span>EXPLORE PRODUCTS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
