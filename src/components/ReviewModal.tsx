import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, Upload, CheckCircle2, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { api } from '../lib/api';
import { Product } from '../types';

interface ReviewModalProps {
  isOpen: boolean;
  product: Product;
  userEmail?: string;
  userName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  product,
  userEmail = '',
  userName = '',
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState(userName || '');
  const [email, setEmail] = useState(userEmail || '');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !comment.trim()) {
      setError('Please fill in your name, email, and review comment.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitProductReview({
        productId: product.id,
        customerName: name,
        customerEmail: email,
        rating,
        title,
        comment,
        photoUrl: photoUrl.trim() || undefined,
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'Could not submit review. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Error submitting review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F2D1F]/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[#FAF8F2] rounded-3xl shadow-2xl border border-[#DCD2C3] overflow-hidden z-10 p-6 sm:p-8 space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EFE8DC] pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#DCD2C3] bg-white shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold text-[#8C6239] uppercase tracking-wider block">
                    Write a Review
                  </span>
                  <h3 className="font-heading font-bold text-base text-[#0F2D1F] truncate max-w-[240px]">
                    {product.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/50 text-[#556960] hover:text-[#0F2D1F] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Star Selector */}
              <div>
                <label className="font-bold text-[#0F2D1F] block mb-1.5">
                  Overall Rating *
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-125 cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            active
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 font-bold text-sm text-[#0F2D1F]">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0F2D1F] block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#DCD2C3] focus:border-[#2D6A4F] outline-none font-semibold text-[#0F2D1F]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0F2D1F] block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#DCD2C3] focus:border-[#2D6A4F] outline-none font-semibold text-[#0F2D1F]"
                  />
                </div>
              </div>

              {/* Review Headline */}
              <div>
                <label className="font-bold text-[#0F2D1F] block mb-1">Review Headline (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Purest A2 milk with rich cream layer!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#DCD2C3] focus:border-[#2D6A4F] outline-none font-semibold text-[#0F2D1F]"
                />
              </div>

              {/* Review Comment */}
              <div>
                <label className="font-bold text-[#0F2D1F] block mb-1">Detailed Review *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us about the purity, taste, packing, and freshness of your harvest..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#DCD2C3] focus:border-[#2D6A4F] outline-none font-semibold text-[#0F2D1F]"
                />
              </div>

              {/* Product Photo Link */}
              <div>
                <label className="font-bold text-[#0F2D1F] block mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>Product Photo URL (Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#DCD2C3] focus:border-[#2D6A4F] outline-none font-semibold text-[#0F2D1F]"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#2D6A4F] to-[#52B788] hover:from-[#1B4332] hover:to-[#2D6A4F] text-[#FAF8F2] text-xs font-extrabold tracking-widest uppercase shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? 'SUBMITTING REVIEW...' : 'SUBMIT VERIFIED REVIEW'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
