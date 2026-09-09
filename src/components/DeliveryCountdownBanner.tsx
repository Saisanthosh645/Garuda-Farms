import React, { useState, useEffect } from 'react';
import { Clock, Truck, Sparkles, ChevronRight } from 'lucide-react';

interface DeliveryCountdownBannerProps {
  onExploreClick?: () => void;
}

export const DeliveryCountdownBanner: React.FC<DeliveryCountdownBannerProps> = ({ onExploreClick }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 45, seconds: 20 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 4, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const format = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="bg-gradient-to-r from-[#1B4332] via-[#2D6A4F] to-[#1B4332] text-[#FDFBF7] text-xs py-2 px-4 border-b border-[#E9C46A]/20 font-medium relative overflow-hidden z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-center md:text-left">
        {/* Left Badge */}
        <div className="flex items-center gap-2 mx-auto md:mx-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E9C46A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E9C46A]"></span>
          </span>
          <Truck className="w-3.5 h-3.5 text-[#E9C46A] shrink-0" />
          <span className="text-white/90">
            <strong>Fresh Morning Farm Express Delivery</strong> • Orders Placed Now Delivered By 7:00 AM Tomorrow
          </span>
        </div>

        {/* Right Countdown & Action */}
        <div className="flex items-center gap-3 mx-auto md:mx-0">
          <div className="flex items-center gap-1.5 bg-black/25 px-2.5 py-0.5 rounded-full border border-white/10 font-mono text-[11px] text-[#E9C46A]">
            <Clock className="w-3 h-3 text-[#E9C46A]" />
            <span>Cutoff in:</span>
            <span className="font-bold tracking-wider">
              {format(timeLeft.hours)}h {format(timeLeft.minutes)}m {format(timeLeft.seconds)}s
            </span>
          </div>

          {onExploreClick && (
            <button
              onClick={onExploreClick}
              className="hidden lg:flex items-center gap-1 text-[11px] text-[#E9C46A] hover:text-white transition-colors underline font-semibold"
            >
              Order Now <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
