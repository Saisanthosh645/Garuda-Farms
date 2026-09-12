import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface LeafParticle {
  id: number;
  initialX: number;
  initialY: number;
  size: number;
  rotation: number;
  duration: number;
  delay: number;
  opacity: number;
  color: string;
  shape: 'leaf' | 'blob' | 'petal';
}

const LeafSVG: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2C10 6 4 12 4 20C4 26 9 30 16 30C23 30 28 26 28 20C28 12 22 6 16 2Z" opacity="0.9" />
    <path d="M16 6C13 10 11 14 12 20C13 24 15 27 16 30C17 27 19 24 20 20C21 14 19 10 16 6Z" fill="rgba(255,255,255,0.3)" />
  </svg>
);

const BlobSVG: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="50" rx="38" ry="30" fill={color} opacity="0.8" transform="rotate(25 50 50)" />
    <ellipse cx="50" cy="50" rx="28" ry="22" fill={color} opacity="0.5" transform="rotate(-15 50 50)" />
  </svg>
);

const PetalSVG: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4 C26 8 30 14 28 22 C26 30 20 36 20 36 C20 36 14 30 12 22 C10 14 14 8 20 4Z" fill={color} opacity="0.85" />
    <path d="M20 8 C22 12 23 16 22 22 C21 26 20 30 20 30 C20 30 19 26 18 22 C17 16 18 12 20 8Z" fill="rgba(255,255,255,0.25)" />
  </svg>
);

export const FloatingLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<LeafParticle[]>([]);
  const { scrollY } = useScroll();

  // Detect mobile and reduced-motion preferences once on mount
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Disable scroll-driven parallax on mobile (no-op transform keeps it static)
  const yOffset = useTransform(scrollY, [0, 4000], isMobile ? [0, 0] : [0, -300]);

  useEffect(() => {
    // No leaves on mobile or when user prefers reduced motion
    if (isMobile || prefersReducedMotion) {
      setLeaves([]);
      return;
    }

    const count = 20; // desktop only
    const colors = ['#2D6A4F', '#52B788', '#D4A373', '#74C69D', '#7DAA8C', '#C8A882', '#40916C'];
    const shapes: Array<'leaf' | 'blob' | 'petal'> = ['leaf', 'leaf', 'blob', 'petal', 'leaf'];

    const generated: LeafParticle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      initialX: Math.random() * 95,
      initialY: Math.random() * 90,
      size: Math.random() * 22 + 12,
      rotation: Math.random() * 360,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.28 + 0.10,
      color: colors[i % colors.length],
      shape: shapes[i % shapes.length],
    }));

    setLeaves(generated);
  }, [isMobile, prefersReducedMotion]);

  // Nothing to render on mobile or reduced-motion
  if (leaves.length === 0) return null;

  return (
    <motion.div
      style={{ y: yOffset }}
      className="fixed inset-0 pointer-events-none z-[2] overflow-hidden"
      aria-hidden="true"
    >
      {leaves.map((leaf) => {
        const floatX = [0, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 40, 0];
        const floatY = [0, -28 - Math.random() * 16, -14 - Math.random() * 8, -22 - Math.random() * 12, 0];
        const rotations = [
          leaf.rotation,
          leaf.rotation + 30 + Math.random() * 40,
          leaf.rotation - 20,
          leaf.rotation + 50 + Math.random() * 30,
          leaf.rotation,
        ];

        return (
          <motion.div
            key={leaf.id}
            className="absolute"
            style={{
              left: `${leaf.initialX}%`,
              top: `${leaf.initialY}%`,
              opacity: leaf.opacity,
              filter: 'blur(0.3px)',
            }}
            animate={{
              y: floatY,
              x: floatX,
              rotate: rotations,
              scale: [1, 1.05, 0.97, 1.03, 1],
            }}
            transition={{
              duration: leaf.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: leaf.delay,
            }}
          >
            {leaf.shape === 'leaf' && <LeafSVG color={leaf.color} size={leaf.size} />}
            {leaf.shape === 'blob' && <BlobSVG color={leaf.color} size={leaf.size * 1.5} />}
            {leaf.shape === 'petal' && <PetalSVG color={leaf.color} size={leaf.size * 1.2} />}
          </motion.div>
        );
      })}
    </motion.div>
  );
};
