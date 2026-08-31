import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle, Sparkles } from 'lucide-react';
import { TESTIMONIALS } from '../data/farmData';

export const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((prevIdx) => (prevIdx === 0 ? TESTIMONIALS.length - 1 : prevIdx - 1));
  };

  const next = () => {
    setCurrentIndex((prevIdx) => (prevIdx === TESTIMONIALS.length - 1 ? 0 : prevIdx + 1));
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <section id="testimonials" className="py-28 sm:py-36 bg-[#FAF8F2] text-[#19241C] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-xs font-bold tracking-widest uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            PATRON STORIES
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-[#0F2D1F] tracking-tight">
            VOICES OF CONSCIOUS HOMES
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#556960]">
            Read how thousands of families made the shift to 100% natural, unadulterated farm produce.
          </p>
        </div>

        {/* Featured Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-[#FDFBF7] rounded-3xl p-8 sm:p-12 lg:p-16 border border-[#DCD2C3] shadow-[0_10px_35px_rgba(15,45,31,0.06)]">
            <Quote className="w-16 h-16 text-[#D4A373]/30 absolute top-8 right-8 pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="relative z-10"
              >
                {/* Rating Stars */}
                <div className="flex items-center gap-1.5 mb-6 text-[#E9C46A]">
                  {[...Array(current.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#E9C46A]" />
                  ))}
                </div>

                {/* Quote text */}
                <blockquote className="font-display italic text-lg sm:text-2xl lg:text-3xl text-[#0F2D1F] leading-relaxed mb-8">
                  "{current.comment}"
                </blockquote>

                {/* User details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-[#EFE8DC]">
                  <div className="flex items-center gap-4">
                    <img
                      src={current.avatar}
                      alt={current.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#D4A373] shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-bold text-base text-[#0F2D1F]">
                          {current.name}
                        </h4>
                        <CheckCircle className="w-4 h-4 text-[#52B788]" />
                      </div>
                      <p className="text-xs text-[#8C6239] font-medium">{current.location}</p>
                      <span className="text-[11px] text-[#556960] block mt-0.5">
                        Purchased: {current.productPurchased}
                      </span>
                    </div>
                  </div>

                  <span className="self-start sm:self-center px-3 py-1.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-xs font-bold tracking-wider">
                    {current.badge}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#EFE8DC]">
              <div className="flex gap-2">
                {TESTIMONIALS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentIndex === idx ? 'w-8 bg-[#2D6A4F]' : 'w-2 bg-[#DCD2C3]'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  id="testimonial-prev-btn"
                  onClick={prev}
                  aria-label="Previous testimonial"
                  className="w-10 h-10 rounded-full border border-[#DCD2C3] bg-[#FAF8F2] hover:bg-[#0F2D1F] hover:text-[#FAF8F2] flex items-center justify-center transition-colors shadow-sm text-[#0F2D1F]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  id="testimonial-next-btn"
                  onClick={next}
                  aria-label="Next testimonial"
                  className="w-10 h-10 rounded-full border border-[#DCD2C3] bg-[#FAF8F2] hover:bg-[#0F2D1F] hover:text-[#FAF8F2] flex items-center justify-center transition-colors shadow-sm text-[#0F2D1F]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
