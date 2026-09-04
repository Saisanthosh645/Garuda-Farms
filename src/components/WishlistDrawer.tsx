import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  wishlistProducts: Product[];
  onClose: () => void;
  onRemoveFromWishlist: (product: Product) => void;
  onMoveToCart: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  wishlistProducts,
  onClose,
  onRemoveFromWishlist,
  onMoveToCart,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 32 }}
              className="w-screen max-w-md bg-[#FDFBF7] shadow-2xl flex flex-col justify-between border-l border-[#DCD2C3]"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#EFE8DC] flex items-center justify-between bg-[#FAF8F2]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#8C6239]/10 flex items-center justify-center text-[#8C6239]">
                    <Heart className="w-5 h-5 fill-[#8C6239]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-lg text-[#0F2D1F] leading-none">
                      Saved Favorites
                    </h3>
                    <p className="text-[11px] text-[#556960] font-medium mt-1">
                      {wishlistProducts.length} Items Saved
                    </p>
                  </div>
                </div>

                <button
                  id="wishlist-drawer-close-btn"
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-[#E5DEC9] text-[#0F2D1F] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {wishlistProducts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-20 h-20 rounded-full bg-[#FAF8F2] border border-[#DCD2C3] flex items-center justify-center text-3xl mb-4 shadow-inner">
                      🤍
                    </div>
                    <h4 className="font-heading font-bold text-lg text-[#0F2D1F]">
                      Your Wishlist is Empty
                    </h4>
                    <p className="text-xs text-[#556960] mt-1 mb-6 max-w-xs">
                      Tap the heart icon on any product to save it for your next harvest order.
                    </p>
                    <button
                      onClick={onClose}
                      className="px-6 py-3 rounded-full bg-[#2D6A4F] hover:bg-[#1B4332] text-[#FAF8F2] text-xs font-bold uppercase tracking-wider"
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  wishlistProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#E5DEC9] flex gap-3.5 items-center justify-between shadow-sm"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover bg-[#EFE8DC] shrink-0 border border-[#DCD2C3]"
                      />

                      <div className="flex-1 min-w-0">
                        <h5 className="font-heading font-bold text-sm text-[#0F2D1F] truncate">
                          {product.name}
                        </h5>
                        <p className="text-xs text-[#8C6239] font-medium mt-0.5">
                          {product.defaultWeight} • ₹{product.price}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => onMoveToCart(product)}
                            className="px-3 py-1 rounded-lg bg-[#2D6A4F] hover:bg-[#1B4332] text-[#FAF8F2] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Move to Cart</span>
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveFromWishlist(product)}
                        className="p-2 rounded-lg text-[#889B92] hover:text-[#E76F51] hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Bottom Quick Action */}
              {wishlistProducts.length > 0 && (
                <div className="p-6 border-t border-[#EFE8DC] bg-[#FAF8F2]">
                  <button
                    onClick={() => {
                      wishlistProducts.forEach((p) => onMoveToCart(p));
                      onClose();
                    }}
                    className="w-full py-3.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-[#FAF8F2] text-xs font-bold tracking-wider uppercase shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Move All Items to Cart</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
