import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GarudaLogo } from './GarudaLogo';

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

          {/* Official Garuda Farms Logo Display */}
          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative mb-4 flex items-center justify-center"
            >
              {/* Outer Golden Aura Ring */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -inset-3 rounded-full border border-[#D4A373]/40"
              />

              <GarudaLogo variant="full" theme="dark" size="lg" showPillars={true} />
            </motion.div>

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
