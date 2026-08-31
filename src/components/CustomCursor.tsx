import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export const CustomCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'product'>('default');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on non-touch devices with fine pointer
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (target.closest('[data-cursor="product"]')) {
        setCursorType('product');
      } else if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT'
      ) {
        setCursorType('pointer');
      } else {
        setCursorType('default');
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="hidden lg:block pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Outer subtle follower ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border border-[#D4A373]/60 pointer-events-none flex items-center justify-center"
        animate={{
          x: mousePosition.x - (cursorType === 'product' ? 36 : cursorType === 'pointer' ? 24 : 16),
          y: mousePosition.y - (cursorType === 'product' ? 36 : cursorType === 'pointer' ? 24 : 16),
          width: cursorType === 'product' ? 72 : cursorType === 'pointer' ? 48 : 32,
          height: cursorType === 'product' ? 72 : cursorType === 'pointer' ? 48 : 32,
          backgroundColor:
            cursorType === 'product'
              ? 'rgba(15, 45, 31, 0.85)'
              : cursorType === 'pointer'
              ? 'rgba(45, 106, 79, 0.15)'
              : 'rgba(212, 163, 115, 0.05)',
          scale: 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 28,
          mass: 0.2,
        }}
      >
        {cursorType === 'product' && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#FAF8F2]">
            VIEW
          </span>
        )}
      </motion.div>

      {/* Center sharp dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-[#D4A373] pointer-events-none"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
          scale: cursorType === 'product' ? 0 : cursorType === 'pointer' ? 1.5 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 800,
          damping: 35,
        }}
      />
    </div>
  );
};
