import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Star, Heart, ShoppingBag, Eye, Check, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, weight: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedWeight, setSelectedWeight] = useState(product.defaultWeight);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Dynamic price calculation based on weight index
  const weightIndex = product.availableWeights.indexOf(selectedWeight);
  const multiplier = weightIndex > 0 ? (weightIndex === 1 ? 1.8 : 2.5) : 1;
  const dynamicPrice = Math.round(product.price * multiplier);
  const dynamicOriginalPrice = Math.round(product.originalPrice * multiplier);
  const discountPercent = Math.round(
    ((dynamicOriginalPrice - dynamicPrice) / dynamicOriginalPrice) * 100
  );

  // 3D Card Mouse Follow Tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top; // y position within element
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-8 to +8 degrees)
    const rotX = ((y - centerY) / centerY) * -7;
    const rotY = ((x - centerX) / centerX) * 7;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const handleAdd = () => {
    onAddToCart(product, selectedWeight);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  return (
    <div
      ref={cardRef}
      data-cursor="product"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000 h-full"
    >
      <motion.div
        animate={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          y: isHovered ? -8 : 0,
          scale: isHovered ? 1.01 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
          mass: 0.5,
        }}
        className="h-full bg-[#FDFBF7] rounded-2xl border border-[#DCD2C3]/80 p-5 shadow-[0_4px_16px_rgba(15,45,31,0.04)] hover:shadow-[0_20px_40px_rgba(15,45,31,0.12)] flex flex-col justify-between transition-shadow duration-300 relative group overflow-hidden"
      >
        {/* Top Floating Badges & Wishlist */}
        <div className="relative">
          {/* Image Container with Zoom */}
          <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-[#EFE8DC] mb-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />

            {/* Subtle Gradient vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Category Tag */}
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#0F2D1F]/80 backdrop-blur-md text-[#FAF8F2] text-[10px] font-extrabold uppercase tracking-wider">
              {product.category}
            </span>

            {/* Discount / Special Badge */}
            {product.badge && (
              <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-[#D4A373] text-[#0F2D1F] text-[10px] font-black uppercase tracking-wider shadow-md">
                {product.badge}
              </span>
            )}

            {/* Wishlist Heart Button */}
            <button
              id={`wishlist-toggle-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product);
              }}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#FAF8F2]/90 backdrop-blur-md flex items-center justify-center text-[#0F2D1F] hover:text-[#E76F51] hover:bg-white shadow-sm transition-all active:scale-90"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isWishlisted ? 'fill-[#E76F51] text-[#E76F51]' : 'text-[#0F2D1F]'
                }`}
              />
            </button>

            {/* Quick View Hover Button */}
            <button
              id={`card-quickview-${product.id}`}
              onClick={() => onQuickView(product)}
              className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-[#FAF8F2]/90 hover:bg-[#FAF8F2] text-[#0F2D1F] text-xs font-bold flex items-center gap-1.5 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          {/* Rating & Review count */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex items-center text-[#E9C46A]">
              <Star className="w-3.5 h-3.5 fill-[#E9C46A]" />
            </div>
            <span className="text-xs font-bold text-[#0F2D1F]">{product.rating}</span>
            <span className="text-xs text-[#889B92]">({product.reviews})</span>
            <span className="text-[11px] text-[#52B788] font-bold ml-auto flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Farm Fresh
            </span>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-heading text-lg font-bold text-[#0F2D1F] line-clamp-1 group-hover:text-[#2D6A4F] transition-colors cursor-pointer"
          >
            {product.name}
          </h3>

          {/* Farm Origin */}
          <p className="text-xs text-[#8C6239] font-medium mt-1 truncate">
            {product.farmOrigin}
          </p>

          {/* Description snippet */}
          <p className="text-xs text-[#556960] mt-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Weight Selector & Price Controls */}
        <div className="mt-4 pt-3 border-t border-[#EFE8DC]">
          {/* Weight Variant Pills */}
          <div className="mb-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C6239] block mb-1.5">
              Select Quantity / Weight
            </label>
            <div className="flex flex-wrap gap-1.5">
              {product.availableWeights.map((w) => (
                <button
                  key={w}
                  onClick={() => setSelectedWeight(w)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
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

          {/* Pricing & Add-to-Cart */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-2xl font-black text-[#0F2D1F]">
                  ₹{dynamicPrice}
                </span>
                <span className="text-xs text-[#889B92] line-through">
                  ₹{dynamicOriginalPrice}
                </span>
              </div>
              {discountPercent > 0 && (
                <span className="text-[10px] text-[#2D6A4F] font-bold">
                  Save {discountPercent}% today
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#52B788] block">
                ● In Stock
              </span>
              <span className="text-[10px] text-[#889B92]">Cold Packed</span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            id={`product-add-btn-${product.id}`}
            onClick={handleAdd}
            className={`w-full py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
              isAdded
                ? 'bg-[#52B788] text-[#0F2D1F] scale-98'
                : 'bg-[#2D6A4F] hover:bg-[#1B4332] text-[#FAF8F2] hover:shadow-md active:scale-95'
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
                <span>Add to Cart • ₹{dynamicPrice}</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
