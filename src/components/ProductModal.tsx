import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Heart, ShoppingBag, Check, ShieldCheck, Sparkles, Plus, Minus, MapPin } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, weight: string, quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onAddToCart,
}) => {
  if (!product) return null;

  const [selectedWeight, setSelectedWeight] = useState(product.defaultWeight);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const weightIndex = product.availableWeights.indexOf(selectedWeight);
  const multiplier = weightIndex > 0 ? (weightIndex === 1 ? 1.8 : 2.5) : 1;
  const unitPrice = Math.round(product.price * multiplier);
  const originalUnitPrice = Math.round(product.originalPrice * multiplier);
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    onAddToCart(product, selectedWeight, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 900);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="relative bg-[#FDFBF7] w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-[#DCD2C3] z-10 my-8"
        >
          {/* Close Button */}
          <button
            id="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[#FAF8F2]/90 hover:bg-white text-[#0F2D1F] flex items-center justify-center shadow-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Product Image Column */}
            <div className="relative aspect-square md:aspect-auto bg-[#EFE8DC]">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="px-3 py-1 rounded-full bg-[#0F2D1F]/90 text-[#FAF8F2] text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                  {product.category}
                </span>
                {product.badge && (
                  <span className="px-3 py-1 rounded-full bg-[#D4A373] text-[#0F2D1F] text-xs font-black uppercase tracking-wider shadow-sm">
                    {product.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Product Info Column */}
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                {/* Rating & Origin */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs text-[#8C6239] font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#D4A373]" />
                    <span className="truncate max-w-[180px]">{product.farmOrigin}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#E9C46A]">
                    <Star className="w-4 h-4 fill-[#E9C46A]" />
                    <span className="text-xs font-bold text-[#0F2D1F]">{product.rating}</span>
                    <span className="text-xs text-[#889B92]">({product.reviews})</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#0F2D1F]">
                  {product.name}
                </h3>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="font-heading text-3xl font-black text-[#0F2D1F]">
                    ₹{unitPrice}
                  </span>
                  <span className="text-sm text-[#889B92] line-through">
                    ₹{originalUnitPrice}
                  </span>
                  <span className="text-xs font-bold text-[#2D6A4F] bg-[#2D6A4F]/10 px-2 py-0.5 rounded">
                    Save ₹{originalUnitPrice - unitPrice}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#556960] mt-3 leading-relaxed">
                  {product.description}
                </p>

                {/* Nutritional / Natural Tags */}
                {product.nutritionHighlights && (
                  <div className="mt-4 pt-3 border-t border-[#EFE8DC]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6239] block mb-1.5">
                      Nutrient Highlights
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {product.nutritionHighlights.map((n, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-[#FAF8F2] border border-[#DCD2C3] text-[11px] text-[#2D6A4F] font-semibold flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-[#D4A373]" /> {n}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weight Selector */}
                <div className="mt-4 pt-3 border-t border-[#EFE8DC]">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C6239] block mb-1.5">
                    Package Variant
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.availableWeights.map((w) => (
                      <button
                        key={w}
                        onClick={() => setSelectedWeight(w)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          selectedWeight === w
                            ? 'bg-[#2D6A4F] text-[#FAF8F2] shadow-sm'
                            : 'bg-[#F0EAE1] text-[#4A5D53] hover:bg-[#E5DEC9]'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quantity and Actions */}
              <div className="pt-4 border-t border-[#EFE8DC] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F2D1F]">Quantity:</span>
                  <div className="flex items-center gap-3 bg-[#F0EAE1] rounded-xl p-1 border border-[#DCD2C3]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0F2D1F] hover:bg-[#E5DEC9] transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-heading font-bold text-sm w-6 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0F2D1F] hover:bg-[#E5DEC9] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Wishlist Toggle Button */}
                  <button
                    onClick={() => onToggleWishlist(product)}
                    className="p-3.5 rounded-xl border border-[#DCD2C3] bg-[#FAF8F2] hover:bg-white text-[#0F2D1F] flex items-center justify-center shadow-sm"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isWishlisted ? 'fill-[#E76F51] text-[#E76F51]' : 'text-[#0F2D1F]'
                      }`}
                    />
                  </button>

                  {/* Add to Cart CTA */}
                  <button
                    id="modal-add-cart-btn"
                    onClick={handleAdd}
                    className={`flex-1 py-3.5 rounded-xl text-xs font-extrabold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-md ${
                      isAdded
                        ? 'bg-[#52B788] text-[#0F2D1F]'
                        : 'bg-[#2D6A4F] hover:bg-[#1B4332] text-[#FAF8F2] hover:scale-[1.02] active:scale-98'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add {quantity} to Cart • ₹{totalPrice}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
