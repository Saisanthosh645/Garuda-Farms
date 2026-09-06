import React from 'react';
import { motion } from 'motion/react';
import { Sprout, ShieldCheck, Trees, Truck, ArrowUpRight } from 'lucide-react';
import { FARM_BENEFITS } from '../data/farmData';

import { MugguDivider, MugguFlower } from './MugguCurves';

interface BenefitsSectionProps {
  onLearnMore?: () => void;
}

export const BenefitsSection: React.FC<BenefitsSectionProps> = ({ onLearnMore }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sprout':
        return <Sprout className="w-8 h-8 text-[#2D6A4F]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-8 h-8 text-[#D4A373]" />;
      case 'Trees':
        return <Trees className="w-8 h-8 text-[#52B788]" />;
      case 'Truck':
        return <Truck className="w-8 h-8 text-[#8C6239]" />;
      default:
        return <Sprout className="w-8 h-8 text-[#2D6A4F]" />;
    }
  };

  return (
    <section id="benefits" className="relative py-24 sm:py-32 text-[#19241C] overflow-hidden" style={{ background: 'linear-gradient(160deg, #f5ede0 0%, #faf6ee 50%, #f0ebe0 100%)' }}>
      {/* Decorative subtle background elements */}
      {/* Organic leaf blob decorators */}
      <div className="absolute top-[-8%] right-[-5%] w-[500px] h-[500px] rounded-[55%_45%_60%_40%/50%_60%_40%_50%] blur-[80px] pointer-events-none" style={{ background: 'rgba(45,106,79,0.06)' }} />
      <div className="absolute bottom-[-8%] left-[-6%] w-[420px] h-[420px] rounded-[45%_55%_40%_60%/60%_40%_55%_45%] blur-[70px] pointer-events-none" style={{ background: 'rgba(200,168,130,0.12)' }} />
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-[60%_40%_55%_45%/45%_60%_40%_55%] blur-[90px] pointer-events-none" style={{ background: 'rgba(233,196,106,0.06)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <MugguFlower color="#B85D38" size={52} className="mb-2 opacity-85" />
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-xs font-bold tracking-widest uppercase mb-4"
          >
            THE GARUDA DISTINCTION
          </motion.div>
          <MugguDivider color="#B85D38" className="my-3 opacity-75" />

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0F2D1F]"
          >
            WHY GARUDA FARMS?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-[#556960] font-normal leading-relaxed"
          >
            We believe you and your family deserve food free from compromises. Here is how we preserve authentic flavor, nutrient purity, and farm freshness every day.
          </motion.p>
        </div>

        {/* 4 Benefits Cards Grid with 3D Tilt and Hover Effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {FARM_BENEFITS.map((benefit, index) => (
            <motion.div
              key={benefit.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.12 }}
              whileHover={{ y: -10, transition: { duration: 0.35 } }}
              className="group relative p-8 border flex flex-col justify-between overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #fdfbf7 0%, #f8f0e4 60%, #f2e8d6 100%)',
                borderColor: 'rgba(200,168,130,0.45)',
                borderRadius: '24px 8px 24px 8px',
                boxShadow: '0 6px 24px rgba(59,47,30,0.07), 0 2px 8px rgba(200,168,130,0.15), inset 0 1px 0 rgba(255,255,255,0.8)',
                transition: 'all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
              }}
            >
              {/* Animated golden top accent */}
              <div className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-400" style={{ background: 'linear-gradient(90deg, transparent, #D4A373 30%, #E9C46A 60%, #C8A882 80%, transparent)', borderRadius: '24px 8px 0 0' }} />
              {/* Subtle grain overlay */}
              <div className="absolute inset-0 bg-noise pointer-events-none opacity-60" style={{ borderRadius: 'inherit' }} />

              <div>
                {/* Organic Icon Container */}
                <div
                  className="w-16 h-16 flex items-center justify-center mb-6 transition-all duration-400 group-hover:scale-110 relative"
                  style={{
                    background: 'linear-gradient(145deg, #faf8f2, #f0e8d8)',
                    border: '1.5px solid rgba(200,168,130,0.5)',
                    borderRadius: '50% 40% 55% 45% / 45% 55% 45% 55%',
                    boxShadow: '0 4px 16px rgba(200,168,130,0.2), inset 0 1px 0 rgba(255,255,255,0.8)',
                  }}
                >
                  <div className="transition-all duration-300 group-hover:scale-110">
                    {getIcon(benefit.iconName)}
                  </div>
                </div>

                {/* Badge Tag */}
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#8C6239] block mb-1">
                  {benefit.highlight}
                </span>

                {/* Title */}
                <h3 className="font-heading text-xl font-bold text-[#0F2D1F] mb-3 group-hover:text-[#2D6A4F] transition-colors">
                  {benefit.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-[#4F6358] leading-relaxed">
                  {benefit.description}
                </p>
              </div>

              {/* Bottom row */}
              <div className="mt-8 pt-4 flex items-center justify-between text-xs font-semibold text-[#5C7A6A]" style={{ borderTop: '1px solid rgba(200,168,130,0.35)' }}>
                <span>Certified Standard</span>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
