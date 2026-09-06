import React from 'react';

interface GarudaLogoProps {
  variant?: 'horizontal' | 'full' | 'emblem';
  theme?: 'light' | 'dark' | 'cream';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPillars?: boolean;
}

export const GarudaLogo: React.FC<GarudaLogoProps> = ({
  variant = 'horizontal',
  theme = 'dark',
  className = '',
  size = 'md',
  showPillars = true,
}) => {
  const isDark = theme === 'dark';

  // Dimensions
  const emblemSizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  // Text Sizes
  const textClasses = {
    sm: {
      title: 'text-base sm:text-lg tracking-[0.18em]',
      sub: 'text-[9px] tracking-[0.32em]',
    },
    md: {
      title: 'text-xl sm:text-2xl tracking-[0.2em]',
      sub: 'text-[10px] sm:text-[11px] tracking-[0.35em]',
    },
    lg: {
      title: 'text-2xl sm:text-3xl tracking-[0.22em]',
      sub: 'text-xs tracking-[0.38em]',
    },
    xl: {
      title: 'text-4xl sm:text-5xl tracking-[0.25em]',
      sub: 'text-sm tracking-[0.4em]',
    },
  };

  // Circular Emblem using the official Garuda Farms logo image (cropped cleanly to symbol only)
  const Emblem = (
    <div
      className={`relative shrink-0 rounded-full p-[1.5px] transition-transform duration-300 group-hover:scale-105 shadow-md ${
        isDark
          ? 'bg-gradient-to-br from-[#DEB86A] via-[#C49A45] to-[#143823]'
          : 'bg-gradient-to-br from-[#C49A45] to-[#143823]'
      } ${emblemSizeClasses[size]}`}
    >
      <div className="w-full h-full rounded-full bg-[#FAF5EB] overflow-hidden flex items-center justify-center relative">
        <img
          src="/garuda-farms-logo.png"
          alt="Garuda Farms Emblem"
          className="w-full h-full object-contain select-none pointer-events-none p-0.5 rounded-full drop-shadow"
        />
      </div>
    </div>
  );

  // Variant: Emblem Only
  if (variant === 'emblem') {
    return <div className={`inline-flex shrink-0 ${className}`}>{Emblem}</div>;
  }

  // Variant: Full Stacked Logo (e.g. Loading Screen)
  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        {/* Emblem */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 mb-3.5">
          <div className="w-full h-full rounded-full p-1 bg-[#FAF5EB] shadow-xl border-2 border-[#C49A45]/40 flex items-center justify-center overflow-hidden relative">
            <img
              src="/garuda-farms-logo.png"
              alt="Garuda Farms Logo"
              className="w-full h-full object-contain select-none pointer-events-none p-0.5 rounded-full drop-shadow"
            />
          </div>
        </div>

        {/* Wordmark GARUDA */}
        <div className="relative inline-block">
          <h2
            className={`font-black tracking-[0.24em] leading-none ${
              isDark ? 'text-[#FAF8F2]' : 'text-[#143823]'
            } text-3xl sm:text-4xl`}
            style={{ fontFamily: "'Cinzel', Georgia, serif" }}
          >
            GARUDA
          </h2>
          {/* Golden Arches over the two 'A's */}
          <div className="absolute inset-0 pointer-events-none flex justify-between px-2.5 sm:px-3.5 -top-1">
            <svg className="w-full h-3 overflow-visible" viewBox="0 0 100 12" fill="none">
              {/* Over 1st A */}
              <path d="M 16 9 Q 23 2 30 9" stroke="#C49A45" strokeWidth="1.8" strokeLinecap="round" />
              {/* Over 2nd A */}
              <path d="M 77 9 Q 84 2 91 9" stroke="#C49A45" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Sub-title — FARMS — */}
        <div className="flex items-center gap-3 mt-2.5 w-full max-w-[240px] justify-center">
          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#C49A45]" />
          <span
            className="font-bold text-xs sm:text-sm tracking-[0.45em] uppercase text-[#C49A45]"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            FARMS
          </span>
          <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#C49A45]" />
        </div>

        {/* Three Value Pillars */}
        {showPillars && (
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-4 pt-3 border-t border-[#C49A45]/20 text-[9.5px] sm:text-[10.5px] font-bold tracking-wider">
            <span className={`flex items-center gap-1 ${isDark ? 'text-[#FAF8F2]/90' : 'text-[#143823]'}`}>
              <span className="text-[#52B788]">🍃</span> PURE BY NATURE
            </span>
            <span className="text-[#C49A45]/50">|</span>
            <span className={`flex items-center gap-1 ${isDark ? 'text-[#FAF8F2]/90' : 'text-[#143823]'}`}>
              <span className="text-[#C49A45]">🛡️</span> ETHICAL BY CHOICE
            </span>
            <span className="text-[#C49A45]/50">|</span>
            <span className={`flex items-center gap-1 ${isDark ? 'text-[#FAF8F2]/90' : 'text-[#143823]'}`}>
              <span>🤝</span> GROWN WITH CARE
            </span>
          </div>
        )}
      </div>
    );
  }

  // Variant: Horizontal (Standard for Navbar and Footer)
  return (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {Emblem}

      <div className="flex flex-col text-left">
        <div className="relative inline-block">
          <span
            className={`font-black leading-none block ${textClasses[size].title} ${
              isDark ? 'text-[#FAF8F2]' : 'text-[#143823]'
            }`}
            style={{ fontFamily: "'Cinzel', Georgia, serif" }}
          >
            GARUDA
          </span>
          {/* Subtle golden accent curve over A's */}
          <div className="absolute inset-x-0 -top-0.5 pointer-events-none">
            <svg className="w-full h-2 overflow-visible" viewBox="0 0 100 8" fill="none">
              <path d="M 16 6 Q 23 1 30 6" stroke="#C49A45" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 77 6 Q 84 1 91 6" stroke="#C49A45" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <span
          className={`font-extrabold uppercase mt-1 leading-none text-[#C49A45] ${textClasses[size].sub}`}
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          FARMS
        </span>
      </div>
    </div>
  );
};
