import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X, CheckCircle2, ShieldCheck } from 'lucide-react';

const RECENT_ORDERS = [
  { name: 'Priya R.', location: 'Jubilee Hills, Hyderabad', item: '2x Pure Organic Wild Honey (500g)', time: '2 mins ago' },
  { name: 'Rajesh K.', location: 'Gachibowli, Hyderabad', item: '1x Fresh A2 Desi Cow Bilona Ghee', time: '5 mins ago' },
  { name: 'Srinivas V.', location: 'Banjara Hills, Hyderabad', item: '3x Free-Range Country Eggs (Pack of 12)', time: '8 mins ago' },
  { name: 'Ananya M.', location: 'Madhapur, Hyderabad', item: '1x Cold-Pressed Groundnut Oil (5L)', time: '12 mins ago' },
  { name: 'Vikram S.', location: 'Kondapur, Hyderabad', item: '2x Organic Turmeric Powder (Lakadong)', time: '15 mins ago' },
];

export const SocialProofToast: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Show initial toast after 4s
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    // Rotate toasts every 14 seconds
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % RECENT_ORDERS.length);
        setIsVisible(true);
      }, 800);
    }, 14000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isDismissed]);

  if (isDismissed) return null;

  const current = RECENT_ORDERS[currentIndex];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-6 left-6 z-40 max-w-sm bg-white/90 dark:bg-[#1B4332]/95 backdrop-blur-md border border-[#2D6A4F]/20 p-3.5 rounded-2xl shadow-xl shadow-[#2D6A4F]/10 flex items-center gap-3.5 group text-[#0F2D1F]"
        >
          {/* Icon */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#2D6A4F]/10 border border-[#2D6A4F]/20 flex items-center justify-center text-[#2D6A4F]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#2D6A4F] text-white p-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3 text-[#E9C46A]" />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-1.5 text-[11px] text-[#2D6A4F] font-bold">
              <ShieldCheck className="w-3 h-3 text-[#2D6A4F]" />
              <span>Verified Purchase</span>
              <span className="text-[#556960] font-normal">• {current.time}</span>
            </div>
            <p className="text-xs font-bold text-[#0F2D1F] truncate mt-0.5">
              {current.name} <span className="font-normal text-[#556960]">from {current.location}</span>
            </p>
            <p className="text-[11px] text-[#2D6A4F] font-semibold truncate mt-0.5">
              {current.item}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setIsVisible(false);
              setIsDismissed(true);
            }}
            className="p-1 rounded-full text-[#556960] hover:text-[#0F2D1F] hover:bg-[#FAF8F2] transition-colors"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
