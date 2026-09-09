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
        className="h-full clay-card p-5 flex flex-col justify-between relative group overflow-hidden"
        style={{ borderRadius: '18px' }}
      >
        {/* Top Floating Badges & Wishlist */}
        <div className="relative">
          {/* Image Container with Zoom */}
          <div className="relative overflow-hidden aspect-[4/3] mb-4" style={{ background: 'linear-gradient(145deg, #efe8d6, #e8ddc8)', borderRadius: '56% 44% 60% 40% / 48% 52% 48% 52%', transition: 'border-radius 0.6s ease' }}>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-105 group-hover:saturate-110"
              loading="lazy"
            />

            {/* Subtle Gradient vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Category & Organic Seal Badge */}
            <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
              <span className="px-2.5 py-1 text-[#FAF8F2] text-[10px] font-extrabold uppercase tracking-wider shadow-md" style={{ background: 'linear-gradient(135deg, rgba(15,45,31,0.92),rgba(45,106,79,0.85))', backdropFilter: 'blur(10px)', border: '1px solid rgba(212,163,115,0.3)', borderRadius: '20px 20px 20px 4px' }}>
                🌿 {product.category}
              </span>
              <span className="px-2 py-0.5 text-[#1B4332] text-[9px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1" style={{ background: 'rgba(216,243,220,0.95)', border: '1px solid rgba(82,183,136,0.5)', borderRadius: '4px 20px 20px 20px' }}>
                🌾 100% Pure Organic
              </span>
            </div>

            {/* Hurry Up Low Stock Badge (< 5 left) */}
            {product.stockQuantity !== undefined && product.stockQuantity !== null && product.stockQuantity > 0 && product.stockQuantity <= 5 ? (
              <span className="absolute bottom-3 left-3 px-2.5 py-1 text-white text-[10px] font-black uppercase tracking-wider shadow-lg bg-gradient-to-r from-amber-600 via-rose-600 to-red-600 animate-pulse rounded-xl flex items-center gap-1 z-20">
                🔥 Hurry up! Only {product.stockQuantity} left
              </span>
            ) : product.badge ? (
              <span className="absolute bottom-3 left-3 px-2.5 py-1 text-[#0F2D1F] text-[10px] font-black uppercase tracking-wider shadow-md" style={{ background: 'linear-gradient(135deg, #E9C46A, #D4A373)', borderRadius: '6px 20px 20px 20px' }}>
                {product.badge}
              </span>
            ) : null}

            {/* Wishlist Heart Button */}
            <button
              id={`wishlist-toggle-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product);
              }}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#FAF8F2]/90 backdrop-blur-md flex items-center justify-center text-[#0F2D1F] hover:text-[#E76F51] hover:bg-white shadow-sm transition-all active:scale-90 z-10"
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
              className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-[#FAF8F2]/90 hover:bg-[#FAF8F2] text-[#0F2D1F] text-xs font-bold flex items-center gap-1.5 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-10"
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
            <span className="text-[11px] text-[#2D6A4F] font-extrabold ml-auto flex items-center gap-1 px-2 py-0.5" style={{ background: 'linear-gradient(135deg,rgba(233,237,201,0.7),rgba(200,168,130,0.2))', border: '1px solid rgba(212,163,115,0.35)', borderRadius: '20px' }}>
              <Sparkles className="w-2.5 h-2.5 text-[#2D6A4F]" /> Dawn Harvest
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
          <p className="text-xs text-[#8C6239] font-bold mt-1 truncate flex items-center gap-1">
            <span>🏡</span> {product.farmOrigin || 'Garuda Organic Sanctuary, Chevella'}
          </p>

          {/* Description snippet */}
          <p className="text-xs text-[#556960] mt-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Weight Selector & Price Controls */}
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(200,168,130,0.4)' }}>
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
              {product.stock === false ? (
                <span className="text-[10px] uppercase font-bold text-amber-700 block">
                  ● Out of Stock
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold text-[#52B788] block">
                  ● In Stock
                </span>
              )}
              <span className="text-[10px] text-[#889B92]">Cold Packed</span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            id={`product-add-btn-${product.id}`}
            disabled={product.stock === false || product.stockQuantity === 0}
            onClick={handleAdd}
            className={`w-full py-3 text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
              product.stock === false || product.stockQuantity === 0
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : isAdded
                ? 'scale-[0.98]'
                : 'hover:scale-[1.02] active:scale-95'
            }`}
            style={product.stock !== false && product.stockQuantity !== 0 ? (isAdded ? {
              background: 'linear-gradient(135deg,#52B788,#40916C)',
              color: '#0F2D1F',
              border: '1px solid rgba(82,183,136,0.5)',
              borderRadius: '14px',
              boxShadow: '0 4px 16px rgba(82,183,136,0.35)',
            } : {
              background: 'linear-gradient(135deg,#1B4332 0%,#2D6A4F 50%,#40916C 100%)',
              color: '#FAF8F2',
              border: '1px solid rgba(116,198,157,0.4)',
              borderRadius: '14px',
              boxShadow: '0 6px 20px rgba(45,106,79,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
            }) : { borderRadius: '14px' }}
          >
            {product.stock === false || product.stockQuantity === 0 ? (
              <span>Out of Stock</span>
            ) : isAdded ? (
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
