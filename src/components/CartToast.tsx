import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowRight, X, Check } from 'lucide-react';
import { Product } from '../types';

interface CartToastProps {
  toast: {
    product: Product;
    weight: string;
    quantity: number;
    price: number;
  } | null;
  onClose: () => void;
  onViewCart: () => void;
}

export const CartToast: React.FC<CartToastProps> = ({ toast, onClose, onViewCart }) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#0F2D1F] text-[#FAF8F2] p-4 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.35)] border border-[#52B788]/40 backdrop-blur-xl flex items-center gap-3.5"
        >
          {/* Thumbnail */}
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#1B4332] shrink-0 border border-[#52B788]/30">
            <img
              src={toast.product.image}
              alt={toast.product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#52B788] rounded-full flex items-center justify-center text-[#0F2D1F]">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#52B788]">
              Added to Harvest Cart
            </p>
            <h4 className="font-heading font-bold text-sm text-[#FAF8F2] truncate">
              {toast.product.name}
            </h4>
            <p className="text-xs text-[#D4A373] font-medium">
              {toast.weight} • ₹{toast.price}
            </p>
          </div>

          {/* View Cart Action */}
          <div className="flex flex-col gap-1 shrink-0">
            <button
              onClick={() => {
                onViewCart();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#52B788] hover:bg-[#74C69D] text-[#0F2D1F] text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-md transition-all active:scale-95"
            >
              <span>Cart</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={onClose}
              className="text-[10px] text-[#FAF8F2]/60 hover:text-[#FAF8F2] text-center pt-0.5"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
