import React from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

export const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#D4A373] via-[#52B788] to-[#E9C46A] origin-left z-50 pointer-events-none shadow-[0_0_8px_rgba(82,183,136,0.6)]"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
};
