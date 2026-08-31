import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, Tag, Check } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: (appliedDiscount: number, couponCode: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShippingThreshold = 500;
  const deliveryFee = subtotal >= freeShippingThreshold || items.length === 0 ? 0 : 40;
  const discountAmount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + deliveryFee - discountAmount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.toUpperCase() === 'GARUDA10' || couponInput.toUpperCase() === 'NATURE10') {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon. Try "GARUDA10"');
    }
  };

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
                  <div className="w-9 h-9 rounded-full bg-[#2D6A4F] text-[#FAF8F2] flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-lg text-[#0F2D1F]">
                      Your Harvest Cart
                    </h3>
                    <p className="text-xs text-[#8C6239] font-medium">
                      {items.reduce((c, i) => c + i.quantity, 0)} Items from Garuda Sanctuary
                    </p>
                  </div>
                </div>

                <button
                  id="cart-drawer-close-btn"
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-[#E5DEC9] text-[#0F2D1F] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Delivery Bar */}
              {subtotal > 0 && subtotal < freeShippingThreshold && (
                <div className="bg-[#FAF8F2] px-6 py-2.5 border-b border-[#EFE8DC] text-xs text-[#2D6A4F] font-semibold flex items-center justify-between">
                  <span>
                    Add <strong>₹{freeShippingThreshold - subtotal}</strong> more for{' '}
                    <strong>FREE Delivery</strong>
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-[#E9C46A]" />
                </div>
              )}

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-20 h-20 rounded-full bg-[#FAF8F2] border border-[#DCD2C3] flex items-center justify-center text-3xl mb-4 shadow-inner">
                      🧺
                    </div>
                    <h4 className="font-heading font-bold text-lg text-[#0F2D1F]">
                      Your cart is empty
                    </h4>
                    <p className="text-xs text-[#556960] mt-1 mb-6 max-w-xs">
                      Explore our 50 single-origin harvests — eggs, poultry, A2 ghee, wild honey, and freshly plucked greens.
                    </p>
                    <button
                      onClick={onClose}
                      className="px-6 py-3 rounded-full bg-[#2D6A4F] hover:bg-[#1B4332] text-[#FAF8F2] text-xs font-bold uppercase tracking-wider"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#E5DEC9] flex gap-3.5 items-center justify-between shadow-sm"
                    >
                      {/* Product Thumbnail */}
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover bg-[#EFE8DC] shrink-0 border border-[#DCD2C3]"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-heading font-bold text-sm text-[#0F2D1F] truncate">
                          {item.product.name}
                        </h5>
                        <p className="text-xs text-[#8C6239] font-medium mt-0.5">
                          {item.selectedWeight} • ₹{item.price}
                        </p>

                        {/* Stepper Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-2 bg-[#FDFBF7] rounded-lg border border-[#DCD2C3] px-2 py-0.5">
                            <button
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="text-[#0F2D1F] hover:text-[#2D6A4F] p-0.5"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="text-[#0F2D1F] hover:text-[#2D6A4F] p-0.5"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs font-bold text-[#0F2D1F]">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-2 rounded-lg text-[#889B92] hover:text-[#E76F51] hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Bottom Summary & Checkout */}
              {items.length > 0 && (
                <div className="p-6 border-t border-[#EFE8DC] bg-[#FAF8F2] space-y-4">
                  {/* Promo Code Input */}
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-[#8C6239] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Coupon code (e.g. GARUDA10)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        disabled={couponApplied}
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-[#FDFBF7] border border-[#DCD2C3] uppercase font-bold focus:outline-none focus:border-[#2D6A4F]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={couponApplied || !couponInput}
                      className="px-4 py-2 rounded-xl bg-[#2D6A4F] text-[#FAF8F2] text-xs font-bold disabled:opacity-50"
                    >
                      {couponApplied ? 'Applied' : 'Apply'}
                    </button>
                  </form>

                  {couponApplied && (
                    <div className="text-[11px] text-[#2D6A4F] font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> 10% Farm Patron Discount Active
                    </div>
                  )}
                  {couponError && (
                    <div className="text-[11px] text-[#E76F51] font-semibold">
                      {couponError}
                    </div>
                  )}

                  {/* Calculations */}
                  <div className="space-y-1.5 text-xs text-[#556960] pt-2 border-t border-[#EFE8DC]">
                    <div className="flex justify-between">
                      <span>Item Subtotal</span>
                      <span className="font-bold text-[#0F2D1F]">₹{subtotal}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Farm Fresh Delivery</span>
                      <span>
                        {deliveryFee === 0 ? (
                          <strong className="text-[#2D6A4F]">FREE</strong>
                        ) : (
                          `₹${deliveryFee}`
                        )}
                      </span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-[#2D6A4F]">
                        <span>Coupon Discount (10%)</span>
                        <span>-₹{discountAmount}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm font-extrabold text-[#0F2D1F] pt-2 border-t border-[#EFE8DC]">
                      <span>Net Payable Amount</span>
                      <span className="font-heading text-lg">₹{total}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    id="cart-proceed-checkout-btn"
                    onClick={() => {
                      onProceedToCheckout(discountAmount, couponApplied ? couponInput.toUpperCase() : '');
                    }}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#2D6A4F] to-[#52B788] hover:from-[#1B4332] hover:to-[#2D6A4F] text-[#FAF8F2] text-xs font-extrabold tracking-widest uppercase shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98 transition-all"
                  >
                    <span>Proceed to Checkout • ₹{total}</span>
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
