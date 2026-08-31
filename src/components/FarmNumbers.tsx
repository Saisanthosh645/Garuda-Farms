import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { FARM_METRICS } from '../data/farmData';

const AnimatedCounterItem: React.FC<{
  value: number;
  suffix: string;
  label: string;
  description: string;
}> = ({ value, suffix, label, description }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 2000; // ms
    const stepTime = 20; // ms
    const totalSteps = duration / stepTime;
    const increment = value / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, value]);

  const formattedCount = count > 999 ? count.toLocaleString() : count;

  return (
    <div ref={ref} className="text-center p-6 sm:p-8 bg-[#FDFBF7] rounded-3xl border border-[#DCD2C3] shadow-[0_4px_20px_rgba(15,45,31,0.04)] hover:shadow-lg transition-all duration-300">
      <div className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-[#0F2D1F] tracking-tight">
        {formattedCount}
        <span className="text-[#D4A373] ml-1">{suffix}</span>
      </div>
      <h3 className="font-heading text-base sm:text-lg font-bold text-[#0F2D1F] mt-3">
        {label}
      </h3>
      <p className="text-xs sm:text-sm text-[#556960] mt-1 font-normal">
        {description}
      </p>
    </div>
  );
};

export const FarmNumbers: React.FC = () => {
  return (
    <section className="py-24 sm:py-32 bg-[#FAF8F2] text-[#19241C] relative border-b border-[#E8DFC8]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#8C6239] block mb-2">
            IMPACT IN NUMBERS
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#0F2D1F]">
            DECADE OF DEVOTION TO PURITY
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {FARM_METRICS.map((metric) => (
            <AnimatedCounterItem
              key={metric.id}
              value={metric.value}
              suffix={metric.suffix}
              label={metric.label}
              description={metric.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
