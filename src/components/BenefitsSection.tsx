import React from 'react';
import { motion } from 'motion/react';
import { Sprout, ShieldCheck, Trees, Truck, ArrowUpRight } from 'lucide-react';
import { FARM_BENEFITS } from '../data/farmData';

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
    <section id="benefits" className="relative py-24 sm:py-32 bg-[#FAF8F2] text-[#19241C] overflow-hidden">
      {/* Decorative subtle background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#2D6A4F]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4A373]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-xs font-bold tracking-widest uppercase mb-4"
          >
            THE GARUDA DISTINCTION
          </motion.div>

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
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative bg-[#FDFBF7] rounded-2xl p-8 border border-[#DCD2C3]/60 shadow-[0_4px_20px_rgba(15,45,31,0.04)] hover:shadow-[0_16px_35px_rgba(15,45,31,0.09)] transition-all duration-300 flex flex-col justify-between"
            >
              {/* Subtle top accent line */}
              <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#D4A373]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div>
                {/* Icon Container */}
                <div className="w-16 h-16 rounded-2xl bg-[#FAF8F2] border border-[#E5DEC9] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#0F2D1F] transition-all duration-300 shadow-sm">
                  <div className="transition-colors duration-300 group-hover:brightness-200">
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

              {/* Bottom Subtle Indicator */}
              <div className="mt-8 pt-4 border-t border-[#EFE8DC] flex items-center justify-between text-xs font-semibold text-[#2D6A4F]">
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
