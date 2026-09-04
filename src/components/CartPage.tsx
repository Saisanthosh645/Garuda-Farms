import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Tag, 
  Check, 
  Heart, 
  Clock, 
  Leaf, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { CartItem, Product } from '../types';

interface CartPageProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onMoveToWishlist: (product: Product) => void;
  onContinueShopping: () => void;
  onProceedToCheckout: (appliedDiscount: number, couponCode: string, deliverySlot: string, farmNote: string) => void;
}

const AVAILABLE_COUPONS = [
  { code: 'GARUDA10', desc: '10% OFF on all farm harvests', minSpend: 0, discountRate: 0.10 },
  { code: 'FREESHIP', desc: 'Free Delivery on any order', minSpend: 0, freeShipping: true },
  { code: 'FARM20', desc: '20% OFF on orders above ₹600', minSpend: 600, discountRate: 0.20 },
  { code: 'ORGANIC15', desc: '15% OFF for Vedic patrons', minSpend: 350, discountRate: 0.15 },
];

export const CartPage: React.FC<CartPageProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onMoveToWishlist,
  onContinueShopping,
  onProceedToCheckout,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>('GARUDA10'); // Default welcome discount
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string }>({
    type: 'success',
    text: 'Welcome code GARUDA10 applied! (10% OFF)',
  });
  
  // Delivery slot selection
  const [deliverySlot, setDeliverySlot] = useState('Tomorrow Morning (6:00 AM - 9:00 AM) • Fresh Morning Harvest');
  const [farmNote, setFarmNote] = useState('');
  const [ecoCratePackaging, setEcoCratePackaging] = useState(true);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShippingThreshold = 500;
  
  // Calculate discount & shipping
  let activeDiscountAmount = 0;
  let isFreeShippingCoupon = false;

  if (appliedCoupon === 'GARUDA10') {
    activeDiscountAmount = Math.round(subtotal * 0.10);
  } else if (appliedCoupon === 'FREESHIP') {
    isFreeShippingCoupon = true;
  } else if (appliedCoupon === 'FARM20') {
    activeDiscountAmount = subtotal >= 600 ? Math.round(subtotal * 0.20) : 0;
  } else if (appliedCoupon === 'ORGANIC15') {
    activeDiscountAmount = subtotal >= 350 ? Math.round(subtotal * 0.15) : 0;
  }

  const deliveryFee = (subtotal >= freeShippingThreshold || isFreeShippingCoupon || items.length === 0) ? 0 : 40;
  const packagingFee = ecoCratePackaging ? 0 : 15; // 0 for eco returnable crate
  const totalAmount = Math.max(0, subtotal + deliveryFee + packagingFee - activeDiscountAmount);
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;

    const matched = AVAILABLE_COUPONS.find((c) => c.code === code);
    if (matched) {
      if (matched.minSpend > 0 && subtotal < matched.minSpend) {
        setCouponMessage({
          type: 'error',
          text: `Coupon ${code} requires minimum cart total of ₹${matched.minSpend}`,
        });
        return;
      }
      setAppliedCoupon(code);
      setCouponInput('');
      setCouponMessage({
        type: 'success',
        text: `Coupon ${code} applied successfully! (${matched.desc})`,
      });
    } else {
      setCouponMessage({
        type: 'error',
        text: 'Invalid promo code. Try "GARUDA10", "FREESHIP", or "FARM20"',
      });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponMessage({ type: 'success', text: 'Coupon removed' });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F2] text-[#19241C] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#8C6239] mb-6 font-medium">
          <button onClick={onContinueShopping} className="hover:text-[#2D6A4F] flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </button>
          <span>/</span>
          <span className="text-[#0F2D1F] font-bold">Your Harvest Cart</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DCD2C3] mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2D6A4F]/10 flex items-center justify-center text-[#2D6A4F] shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#0F2D1F] tracking-tight">
                Review Your Fresh Harvest
              </h1>
              <p className="text-xs sm:text-sm text-[#556960] mt-0.5">
                Single-origin produce prepared fresh from our fields
              </p>
            </div>
          </div>

          <button
            onClick={onContinueShopping}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FDFBF7] hover:bg-[#EFE8DC] border border-[#DCD2C3] text-xs font-bold text-[#0F2D1F] tracking-wider uppercase transition-all shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#2D6A4F]" />
            <span>Add More Farm Items</span>
          </button>
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="py-20 text-center bg-[#FDFBF7] rounded-3xl border border-[#DCD2C3] max-w-xl mx-auto p-8 shadow-sm">
            <div className="w-24 h-24 rounded-full bg-[#FAF8F2] border-2 border-dashed border-[#DCD2C3] flex items-center justify-center text-4xl mx-auto mb-5 shadow-inner">
              🧺
            </div>
            <h2 className="font-heading text-2xl font-bold text-[#0F2D1F]">
              Your Harvest Cart is Empty
            </h2>
            <p className="text-sm text-[#556960] mt-2 mb-8 max-w-md mx-auto leading-relaxed">
              Experience the pure taste of 50 single-origin harvests — country chicken, cage-free eggs, raw wild honey, cold-pressed oils, and farm vegetables.
            </p>
            <button
              id="empty-cart-shop-now-btn"
              onClick={onContinueShopping}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-[#2D6A4F] to-[#52B788] hover:from-[#1B4332] hover:to-[#2D6A4F] text-[#FAF8F2] text-xs font-extrabold tracking-widest uppercase shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Explore 50 Farm Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left: Cart Items & Delivery Options (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Free Delivery Progress Indicator */}
              <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-[#DCD2C3] shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <div className="flex items-center gap-2 text-[#0F2D1F]">
                    <Truck className="w-4 h-4 text-[#2D6A4F]" />
                    <span>
                      {subtotal >= freeShippingThreshold || isFreeShippingCoupon ? (
                        <span className="text-[#2D6A4F] font-black">🎉 You unlocked FREE Farm Fresh Delivery!</span>
                      ) : (
                        <span>Add <strong>₹{freeShippingThreshold - subtotal}</strong> more for <strong>FREE Delivery</strong></span>
                      )}
                    </span>
                  </div>
                  <span className="text-[#8C6239]">{Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%</span>
                </div>

                <div className="w-full h-2.5 bg-[#EFE8DC] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#2D6A4F] to-[#52B788]"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="bg-[#FDFBF7] rounded-2xl border border-[#DCD2C3] divide-y divide-[#EFE8DC] shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-[#FAF8F2] flex items-center justify-between">
                  <span className="font-heading text-sm font-bold text-[#0F2D1F]">
                    Harvest Items ({totalItemsCount})
                  </span>
                  <span className="text-xs text-[#8C6239]">Harvested within 6-12 hours</span>
                </div>

                <div className="p-6 space-y-5">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EFE8DC] last:border-b-0 last:pb-0"
                      >
                        {/* Thumbnail + Details */}
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#EFE8DC] shrink-0 border border-[#DCD2C3]">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-[#0F2D1F]/80 text-[#FAF8F2] text-[9px] font-bold">
                              {item.product.category}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="font-heading font-bold text-base text-[#0F2D1F] truncate">
                              {item.product.name}
                            </h3>
                            <p className="text-xs text-[#8C6239] font-medium mt-0.5">
                              Origin: {item.product.farmOrigin}
                            </p>
                            <div className="inline-flex items-center gap-2 mt-1 px-2.5 py-0.5 rounded-md bg-[#FAF8F2] border border-[#E5DEC9] text-xs font-semibold text-[#0F2D1F]">
                              <span>Pack: {item.selectedWeight}</span>
                              <span>•</span>
                              <span>₹{item.price} each</span>
                            </div>
                          </div>
                        </div>

                        {/* Quantity Stepper & Price */}
                        <div className="flex items-center justify-between sm:justify-end gap-5">
                          <div className="flex items-center gap-2 bg-[#FAF8F2] rounded-xl border border-[#DCD2C3] px-3 py-1.5 shadow-inner">
                            <button
                              id={`cart-minus-${item.id}`}
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              aria-label="Decrease quantity"
                              className="text-[#0F2D1F] hover:text-[#2D6A4F] p-0.5 active:scale-90"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm font-extrabold w-6 text-center text-[#0F2D1F]">
                              {item.quantity}
                            </span>
                            <button
                              id={`cart-plus-${item.id}`}
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              aria-label="Increase quantity"
                              className="text-[#0F2D1F] hover:text-[#2D6A4F] p-0.5 active:scale-90"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right min-w-[70px]">
                            <span className="font-heading text-lg font-black text-[#0F2D1F] block">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>

                          {/* Action icons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                onMoveToWishlist(item.product);
                                onRemoveItem(item.id);
                              }}
                              title="Save to favorites"
                              className="p-2 rounded-lg text-[#889B92] hover:text-[#E76F51] hover:bg-[#FAF8F2] transition-colors"
                            >
                              <Heart className="w-4 h-4" />
                            </button>
                            <button
                              id={`cart-delete-${item.id}`}
                              onClick={() => onRemoveItem(item.id)}
                              title="Remove item"
                              className="p-2 rounded-lg text-[#889B92] hover:text-[#E76F51] hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Delivery Slot Selector */}
              <div className="bg-[#FDFBF7] p-6 rounded-2xl border border-[#DCD2C3] shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2D6A4F]" />
                  <h4 className="font-heading text-base font-bold text-[#0F2D1F]">
                    Choose Morning Harvest Delivery Slot
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Tomorrow Morning (6:00 AM - 9:00 AM) • Fresh Morning Harvest',
                    'Tomorrow Noon (11:00 AM - 1:00 PM) • Midday Delivery',
                    'Day After Tomorrow (6:00 AM - 9:00 AM) • Advance Batch',
                  ].map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setDeliverySlot(slot)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        deliverySlot === slot
                          ? 'border-[#2D6A4F] bg-[#2D6A4F]/10 text-[#0F2D1F] ring-1 ring-[#2D6A4F]'
                          : 'border-[#DCD2C3] bg-[#FAF8F2] text-[#556960] hover:bg-[#EFE8DC]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{slot.split('•')[0]}</span>
                        {deliverySlot === slot && <Check className="w-3.5 h-3.5 text-[#2D6A4F]" />}
                      </div>
                      <span className="text-[10px] text-[#8C6239] block mt-1">
                        {slot.split('•')[1] || ''}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Eco packaging preference */}
                <div className="pt-3 border-t border-[#EFE8DC] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-[#52B788]" />
                    <div>
                      <span className="text-xs font-bold text-[#0F2D1F] block">Zero-Plastic Returnable Wooden Eco-Crate</span>
                      <span className="text-[11px] text-[#556960]">Collected on next delivery or kept with pride</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={ecoCratePackaging}
                    onChange={(e) => setEcoCratePackaging(e.target.checked)}
                    className="w-4 h-4 accent-[#2D6A4F] rounded"
                  />
                </div>

                {/* Farm harvest note */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-[#8C6239] block mb-1.5">
                    Special Farm Delivery Note / Gate Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Leave crate by front porch flower pot, ring bell twice"
                    value={farmNote}
                    onChange={(e) => setFarmNote(e.target.value)}
                    className="w-full px-4 py-2 text-xs rounded-xl bg-[#FAF8F2] border border-[#DCD2C3] text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                  />
                </div>
              </div>
            </div>

            {/* Right: Order Summary & Coupon Breakdown (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#FDFBF7] p-6 sm:p-7 rounded-3xl border border-[#DCD2C3] shadow-md space-y-6 sticky top-28">
                <h3 className="font-heading text-xl font-extrabold text-[#0F2D1F]">
                  Order Summary
                </h3>

                {/* Coupon Input Form */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#8C6239] block mb-2">
                    Have a Farm Promo Code?
                  </label>

                  {appliedCoupon ? (
                    <div className="p-3 rounded-xl bg-[#2D6A4F]/10 border border-[#2D6A4F]/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#2D6A4F]" />
                        <span className="text-xs font-extrabold text-[#2D6A4F] uppercase tracking-wider">
                          {appliedCoupon}
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-xs text-[#E76F51] hover:underline font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-[#8C6239] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="e.g. GARUDA10 or FARM20"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 text-xs font-bold uppercase rounded-xl bg-[#FAF8F2] border border-[#DCD2C3] text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                        />
                      </div>
                      <button
                        onClick={() => handleApplyCoupon()}
                        className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-[#FAF8F2] text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {couponMessage && (
                    <p
                      className={`text-xs mt-2 font-medium flex items-center gap-1 ${
                        couponMessage.type === 'success' ? 'text-[#2D6A4F]' : 'text-[#E76F51]'
                      }`}
                    >
                      {couponMessage.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {couponMessage.text}
                    </p>
                  )}

                  {/* Quick available codes list */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {AVAILABLE_COUPONS.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => handleApplyCoupon(c.code)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all ${
                          appliedCoupon === c.code
                            ? 'bg-[#2D6A4F] text-[#FAF8F2] border-[#2D6A4F]'
                            : 'bg-[#FAF8F2] text-[#8C6239] border-[#DCD2C3] hover:border-[#2D6A4F]'
                        }`}
                      >
                        {c.code}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown Calculation */}
                <div className="space-y-3 pt-4 border-t border-[#EFE8DC] text-sm text-[#556960]">
                  <div className="flex justify-between">
                    <span>Items Subtotal ({totalItemsCount} items)</span>
                    <span className="font-bold text-[#0F2D1F]">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Eco Returnable Crate Packaging</span>
                    <span className="font-bold text-[#2D6A4F]">FREE</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span>Express Cold-Chain Delivery</span>
                      {deliveryFee === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2D6A4F]/10 text-[#2D6A4F] font-bold">FREE</span>}
                    </div>
                    <span className="font-bold text-[#0F2D1F]">
                      {deliveryFee === 0 ? <strong className="text-[#2D6A4F]">₹0</strong> : `₹${deliveryFee}`}
                    </span>
                  </div>

                  {activeDiscountAmount > 0 && (
                    <div className="flex justify-between text-[#2D6A4F] font-bold">
                      <span>Farm Patron Discount</span>
                      <span>-₹{activeDiscountAmount}</span>
                    </div>
                  )}

                  {/* Net Total */}
                  <div className="flex justify-between items-baseline pt-4 border-t border-[#EFE8DC] text-[#0F2D1F]">
                    <div>
                      <span className="font-heading text-lg font-black block">Total Payable</span>
                      <span className="text-[11px] text-[#8C6239]">Includes all taxes and farm harvest charges</span>
                    </div>
                    <div className="text-right">
                      <span className="font-heading text-3xl font-black text-[#0F2D1F]">
                        ₹{totalAmount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Checkout CTA */}
                <button
                  id="cart-page-checkout-btn"
                  onClick={() => onProceedToCheckout(activeDiscountAmount, appliedCoupon || '', deliverySlot, farmNote)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#2D6A4F] to-[#52B788] hover:from-[#1B4332] hover:to-[#2D6A4F] text-[#FAF8F2] text-sm font-extrabold tracking-widest uppercase shadow-[0_10px_25px_rgba(45,106,79,0.4)] hover:shadow-[0_12px_30px_rgba(82,183,136,0.6)] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-98"
                >
                  <span>PROCEED TO SECURE CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-[#556960] border-t border-[#EFE8DC]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#52B788] shrink-0" />
                    <span>100% Purity & Freshness Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-[#52B788] shrink-0" />
                    <span>Zero Antibiotics or Hormones</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
