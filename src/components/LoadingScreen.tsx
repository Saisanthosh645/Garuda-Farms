import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LoadingScreenProps {
  onLoaded: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoaded }) => {
  const [stage, setStage] = useState<'growing' | 'branding' | 'complete'>('growing');

  useEffect(() => {
    const t1 = setTimeout(() => setStage('branding'), 700);
    const t2 = setTimeout(() => {
      setStage('complete');
      onLoaded();
    }, 1700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onLoaded]);

  return (
    <AnimatePresence>
      {stage !== 'complete' && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[10000] bg-[#0F2D1F] flex flex-col items-center justify-center text-[#FAF8F2] overflow-hidden select-none"
        >
          {/* Subtle ambient background glow */}
          <div className="absolute w-[500px] h-[500px] rounded-full bg-[#2D6A4F]/30 blur-[100px] pointer-events-none" />

          {/* Animated Growing Leaf Crest */}
          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative w-20 h-20 mb-6 flex items-center justify-center"
            >
              {/* Outer Golden Aura Ring */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full border border-[#D4A373]/40"
              />

              {/* Garuda Eagle / Leaf Hybrid Crest */}
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_0_15px_rgba(212,163,115,0.6)]"
              >
                {/* Eagle Wing Left */}
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, ease: 'easeInOut' }}
                  d="M14 38C14 26 24 16 32 10C26 22 28 32 14 38Z"
                  fill="#D4A373"
                />
                {/* Eagle Wing Right */}
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, ease: 'easeInOut', delay: 0.1 }}
                  d="M50 38C50 26 40 16 32 10C38 22 36 32 50 38Z"
                  fill="#E9C46A"
                />
                {/* Sprout Stem Center */}
                <motion.path
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  d="M32 20V52"
                  stroke="#52B788"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Left Leaf */}
                <motion.path
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                  d="M32 40C26 36 22 42 22 46C26 48 30 46 32 40Z"
                  fill="#52B788"
                />
                {/* Right Leaf */}
                <motion.path
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.55 }}
                  d="M32 34C38 30 42 36 42 40C38 42 34 40 32 34Z"
                  fill="#74C69D"
                />
              </svg>
            </motion.div>

            {/* Brand Title with Cinematic Letter Spacing */}
            <div className="overflow-hidden text-center">
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="font-heading text-2xl sm:text-3xl font-extrabold tracking-[0.25em] text-[#FAF8F2]"
              >
                GARUDA FARMS
              </motion.h1>
            </div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-xs tracking-[0.3em] uppercase text-[#D4A373] mt-2 font-medium"
            >
              Pure Nature • Pure You
            </motion.p>

            {/* Progress line */}
            <div className="w-36 h-[2px] bg-[#1B4332] mt-6 overflow-hidden rounded-full">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.2, ease: 'easeInOut', repeat: Infinity }}
                className="w-full h-full bg-gradient-to-r from-transparent via-[#D4A373] to-transparent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
