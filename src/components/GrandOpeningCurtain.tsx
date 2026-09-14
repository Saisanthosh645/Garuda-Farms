import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles as SparklesIcon, ArrowRight, ShoppingBag } from 'lucide-react';

interface GrandOpeningCurtainProps {
  onClose?: () => void;
  isTestPreview?: boolean;
}

export default function GrandOpeningCurtain({ onClose, isTestPreview = false }: GrandOpeningCurtainProps) {
  const [opening, setOpening] = useState(false);
  const [hidden, setHidden] = useState(false);

  const fireGrandConfetti = () => {
    // Stage 1: Side Cannons
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#2D6A4F', '#52B788', '#D4AF37', '#FFD700', '#FFFFFF'],
    });
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#2D6A4F', '#52B788', '#D4AF37', '#FFD700', '#FFFFFF'],
    });

    // Stage 2: Center Explosion (200ms later)
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#2D6A4F', '#52B788', '#D4AF37', '#F4A261', '#E76F51'],
        scalar: 1.2,
      });
    }, 200);

    // Stage 3: Golden Star Rain (500ms later)
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 90,
        spread: 120,
        startVelocity: 25,
        origin: { x: 0.5, y: 0.2 },
        colors: ['#FFD700', '#D4AF37', '#FFF'],
        shapes: ['circle'],
        ticks: 200,
      });
    }, 500);
  };

  const handleOpenCurtain = () => {
    if (opening) return;
    setOpening(true);
    fireGrandConfetti();

    // After animation completes (1.2s), unmount/hide curtain
    setTimeout(() => {
      setHidden(true);
      if (onClose) onClose();
    }, 1200);
  };

  // Keyboard shortcut listener ('g' or 'G' or Space or Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'g' || e.key === 'G' || e.key === ' ' || e.key === 'Enter') {
        if (!opening && !hidden) {
          handleOpenCurtain();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [opening, hidden]);

  if (hidden) return null;

  return (
    <div className="fixed inset-0 z-[999999] overflow-hidden flex items-center justify-center select-none font-sans">
      {/* ─── LEFT CURTAIN ──────────────────────────────────────────────────────── */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-[#071911] via-[#0F2D1F] to-[#1B4332] shadow-[10px_0_30px_rgba(0,0,0,0.8)] z-10 transition-transform duration-1000 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          opening ? '-translate-x-full' : 'translate-x-0'
        }`}
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(7,25,17,0.95) 0%, rgba(15,45,31,0.9) 50%, rgba(27,67,50,0.85) 100%),
            repeating-linear-gradient(90deg, rgba(212,175,55,0.05) 0px, rgba(212,175,55,0.05) 30px, transparent 30px, transparent 60px)
          `,
        }}
      >
        {/* Decorative Gold Trim Edge */}
        <div className="absolute top-0 bottom-0 right-0 w-3 bg-gradient-to-b from-[#D4AF37] via-[#FFF5C0] to-[#997A15] shadow-lg border-r border-[#FFE58F]/50" />
        <div className="absolute top-0 bottom-0 right-3 w-8 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Velvet Fold Texture Overlays */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-black/60" />
      </div>

      {/* ─── RIGHT CURTAIN ─────────────────────────────────────────────────────── */}
      <div
        className={`absolute top-0 bottom-0 right-0 w-1/2 bg-gradient-to-l from-[#071911] via-[#0F2D1F] to-[#1B4332] shadow-[-10px_0_30px_rgba(0,0,0,0.8)] z-10 transition-transform duration-1000 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          opening ? 'translate-x-full' : 'translate-x-0'
        }`}
        style={{
          backgroundImage: `
            linear-gradient(270deg, rgba(7,25,17,0.95) 0%, rgba(15,45,31,0.9) 50%, rgba(27,67,50,0.85) 100%),
            repeating-linear-gradient(90deg, rgba(212,175,55,0.05) 0px, rgba(212,175,55,0.05) 30px, transparent 30px, transparent 60px)
          `,
        }}
      >
        {/* Decorative Gold Trim Edge */}
        <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-b from-[#D4AF37] via-[#FFF5C0] to-[#997A15] shadow-lg border-l border-[#FFE58F]/50" />
        <div className="absolute top-0 bottom-0 left-3 w-8 bg-gradient-to-l from-black/40 to-transparent" />

        {/* Velvet Fold Texture Overlays */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-black/60" />
      </div>

      {/* ─── TOP THEATER VALANCE / CANOPY ────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#071911] to-[#0F2D1F] z-20 border-b-2 border-[#D4AF37] shadow-xl flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
          <span className="text-[11px] uppercase tracking-widest font-bold text-[#E2C775]">Garuda Farms Premiere</span>
        </div>
        {isTestPreview && (
          <span className="bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#FFE58F] text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Admin Preview Mode
          </span>
        )}
      </div>

      {/* ─── CENTER HERO LAUNCH CARD ─────────────────────────────────────────── */}
      <div
        className={`relative z-30 flex flex-col items-center text-center max-w-lg px-6 transition-all duration-700 ${
          opening ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        {/* Logo Badge */}
        <div className="relative mb-6 group cursor-pointer" onClick={handleOpenCurtain}>
          <div className="absolute -inset-3 bg-gradient-to-r from-[#D4AF37] via-[#52B788] to-[#D4AF37] rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#0F2D1F] p-1 border-2 border-[#D4AF37] shadow-2xl flex items-center justify-center overflow-hidden">
            <img
              src="/garuda-farms-logo.png"
              alt="Garuda Farms Logo"
              className="w-full h-full object-contain rounded-full p-1 bg-[#FAF5EB]"
            />
          </div>
        </div>

        {/* Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37]/30 via-[#2D6A4F]/60 to-[#D4AF37]/30 border border-[#D4AF37]/60 shadow-lg text-[#FFE58F] text-xs font-bold uppercase tracking-widest mb-3 backdrop-blur-md">
          <SparklesIcon className="w-3.5 h-3.5 text-[#FFE58F] animate-spin" style={{ animationDuration: '4s' }} />
          Grand Opening
          <SparklesIcon className="w-3.5 h-3.5 text-[#FFE58F] animate-spin" style={{ animationDuration: '4s' }} />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md mb-2 leading-tight">
          Welcome to <br />
          <span className="bg-gradient-to-r from-[#FFE58F] via-[#D4AF37] to-[#52B788] bg-clip-text text-transparent">
            Garuda Farms
          </span>
        </h1>

        {/* Subtitle / Tagline */}
        <p className="text-xs sm:text-sm text-stone-200/90 font-medium max-w-md mb-8 drop-shadow leading-relaxed">
          100% Pure, Organic Country Eggs & Farm-Fresh Produce Delivered Directly to Your Doorstep.
        </p>

        {/* Main Action Button */}
        <button
          onClick={handleOpenCurtain}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E2C775] to-[#B89228] text-[#071911] font-black text-base shadow-[0_10px_30px_rgba(212,175,55,0.4)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 border border-[#FFF5C0]"
        >
          <ShoppingBag className="w-5 h-5 text-[#071911]" />
          <span>ENTER STORE NOW</span>
          <ArrowRight className="w-5 h-5 text-[#071911] group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Hint text */}
        <p className="text-[11px] text-stone-400 mt-4 font-mono">
          Press <kbd className="px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">G</kbd> or tap anywhere to unroll
        </p>
      </div>
    </div>
  );
}
