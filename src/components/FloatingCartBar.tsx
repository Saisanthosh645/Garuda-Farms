import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { CartItem } from '../types';

interface FloatingCartBarProps {
  cart: CartItem[];
  onOpenCart: () => void;
  onCheckout: () => void;
  isVisible?: boolean;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  cart,
  onOpenCart,
  onCheckout,
  isVisible = true,
}) => {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Extract up to 3 mini product image thumbnails for stacked preview
  const productImages = Array.from(new Set(cart.map((i) => i.product.image))).slice(0, 3);

  if (totalItems === 0 || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg"
      >
        <div className="relative bg-[#0F2D1F]/90 backdrop-blur-xl border border-[#52B788]/40 shadow-[0_20px_50px_rgba(15,45,31,0.6)] rounded-full p-2.5 sm:p-3 flex items-center justify-between gap-3 text-white overflow-hidden group">
          {/* Subtle animated green glow border shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#52B788]/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

          {/* Left: Stacked Product Thumbnails & Item Count Badge */}
          <div
            onClick={onOpenCart}
            className="flex items-center gap-3 cursor-pointer pl-1.5 shrink-0"
          >
            <div className="relative flex items-center">
              {productImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt="Cart product preview"
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-[#0F2D1F] shadow-md transition-transform ${
                    idx > 0 ? '-ml-3' : ''
                  }`}
                  style={{ zIndex: 10 - idx }}
                />
              ))}
              <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-md animate-bounce border border-amber-300 z-20">
                {totalItems}
              </span>
            </div>

            <div className="hidden min-[380px]:block">
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading font-black text-base sm:text-lg text-white">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-[#52B788] font-bold uppercase tracking-wider hidden sm:inline">
                  • Free Delivery Eligible
                </span>
              </div>
              <p className="text-[10px] text-[#FAF8F2]/75 font-medium leading-none">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} in harvest bag
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenCart}
              className="px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold transition-all hidden sm:flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#52B788]" />
              <span>Bag</span>
            </button>

            <button
              onClick={onCheckout}
              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#2D6A4F] via-[#40916C] to-[#52B788] hover:brightness-110 text-white text-xs font-black tracking-wider uppercase transition-all shadow-lg flex items-center gap-1.5 group/btn cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Checkout</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
