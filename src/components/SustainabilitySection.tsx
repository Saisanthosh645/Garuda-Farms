import React from 'react';
import { motion } from 'motion/react';
import { SustainabilityCanvas } from './3d/SustainabilityCanvas';
import { SUSTAINABILITY_PILLARS } from '../data/farmData';
import { Leaf, Droplets, SunMedium, Users2 } from 'lucide-react';

export const SustainabilitySection: React.FC = () => {
  const getIcon = (id: number) => {
    switch (id) {
      case 1:
        return <Leaf className="w-5 h-5 text-[#52B788]" />;
      case 2:
        return <Droplets className="w-5 h-5 text-[#52B788]" />;
      case 3:
        return <SunMedium className="w-5 h-5 text-[#E9C46A]" />;
      case 4:
        return <Users2 className="w-5 h-5 text-[#D4A373]" />;
      default:
        return <Leaf className="w-5 h-5 text-[#52B788]" />;
    }
  };

  return (
    <section
      id="sustainability"
      className="py-28 sm:py-36 bg-[#0F2D1F] text-[#FAF8F2] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1B4332] text-[#52B788] text-xs font-bold tracking-[0.2em] uppercase border border-[#52B788]/30 mb-4"
          >
            PLANETARY & SOIL REGENERATION
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-[#FAF8F2]"
          >
            GOOD FOR YOU. <br />
            <span className="text-[#52B788]">GOOD FOR THE EARTH.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-base sm:text-lg text-[#FAF8F2]/80 leading-relaxed font-body"
          >
            Agriculture shouldn't deplete the future. Every acre farmed by Garuda Farms leaves the ground richer in microbial life, carbon capture, and clean groundwater.
          </motion.p>
        </div>

        {/* Interactive 3D Canvas + Pillars Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* 3D Organic Plant Model */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[#143D2B]/80 rounded-3xl p-6 border border-[#2D6A4F]/60 shadow-2xl relative backdrop-blur-md">
            <div className="absolute top-4 left-4 text-[10px] uppercase font-bold tracking-widest text-[#D4A373]">
              ✦ Ecological Orbit Model ✦
            </div>
            <SustainabilityCanvas />
            <div className="text-center mt-2">
              <span className="text-xs font-heading font-bold text-[#52B788] tracking-widest uppercase">
                Zero Waste Closed-Loop Ecology
              </span>
              <p className="text-[11px] text-[#FAF8F2]/60 mt-1">
                Crop residues feed cattle; cattle compost enriches crops.
              </p>
            </div>
          </div>

          {/* 4 Pillars Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {SUSTAINABILITY_PILLARS.map((pillar, idx) => (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-[#143D2B]/90 p-6 rounded-2xl border border-[#2D6A4F]/60 flex flex-col justify-between hover:border-[#52B788]/60 transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#0F2D1F] border border-[#2D6A4F] flex items-center justify-center">
                      {getIcon(pillar.id)}
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#0F2D1F] text-[#E9C46A] text-[11px] font-black border border-[#D4A373]/20">
                      {pillar.stat}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg font-bold text-[#FAF8F2] mb-2">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#FAF8F2]/75 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-[#52B788] font-bold tracking-wider uppercase">
                  Verified Green Standard ✓
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
