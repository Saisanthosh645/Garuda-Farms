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
}

export const FloatingLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<LeafParticle[]>([]);
  const { scrollY } = useScroll();
  const yOffset = useTransform(scrollY, [0, 4000], [0, -400]);

  useEffect(() => {
    // Determine count based on screen width
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 8 : 16;
    const colors = ['#2D6A4F', '#52B788', '#D4A373', '#74C69D', '#E9C46A'];

    const generated: LeafParticle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      initialX: Math.random() * 95,
      initialY: Math.random() * 95,
      size: Math.random() * 18 + 14,
      rotation: Math.random() * 360,
      duration: Math.random() * 8 + 10,
      delay: Math.random() * 4,
      opacity: Math.random() * 0.35 + 0.15,
      color: colors[i % colors.length]
    }));

    setLeaves(generated);
  }, []);

  return (
    <motion.div
      style={{ y: yOffset }}
      className="fixed inset-0 pointer-events-none z-20 overflow-hidden"
      aria-hidden="true"
    >
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          className="absolute"
          style={{
            left: `${leaf.initialX}%`,
            top: `${leaf.initialY}%`,
            opacity: leaf.opacity,
          }}
          animate={{
            y: [0, -35, 10, -25, 0],
            x: [0, 25, -20, 15, 0],
            rotate: [leaf.rotation, leaf.rotation + 45, leaf.rotation - 30, leaf.rotation + 60, leaf.rotation],
          }}
          transition={{
            duration: leaf.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: leaf.delay,
          }}
        >
          <svg
            width={leaf.size}
            height={leaf.size}
            viewBox="0 0 24 24"
            fill={leaf.color}
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-sm"
          >
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C12 18 18 15 21 8C19 8 18 8 17 8Z" />
            <path d="M3 21C6 14 11 8 20 4C19.5 4 19 4 18 4C11 5 6 10 3 21Z" fillOpacity="0.4" fill="#FAF8F2" />
          </svg>
        </motion.div>
      ))}
    </motion.div>
  );
};
