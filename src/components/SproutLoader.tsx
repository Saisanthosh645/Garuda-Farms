import React from 'react';

interface SproutLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const SproutLoader: React.FC<SproutLoaderProps> = ({
  size = 'md',
  label,
  className = '',
}) => {
  const dimensions = {
    sm: { box: 36, font: 'text-[11px]' },
    md: { box: 56, font: 'text-xs font-medium' },
    lg: { box: 80, font: 'text-sm font-semibold' },
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-2 select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Ambient Warm Golden Glow behind Soil */}
        <div className="absolute w-12 h-12 bg-[#E9C46A]/20 rounded-full blur-md animate-pulse" />

        {/* Floating Organic Dust / Sunlit Pollen Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1 left-2 w-1 h-1 bg-[#E9C46A] opacity-70 rounded-full animate-[floatUp_2.8s_ease-in-out_infinite]" />
          <div className="absolute top-3 right-2 w-1.5 h-1.5 bg-[#D4A373] opacity-60 rounded-full animate-[floatUp_3.4s_ease-in-out_0.6s_infinite]" />
          <div className="absolute bottom-2 left-4 w-1 h-1 bg-[#52B788] opacity-50 rounded-full animate-[floatUp_2.2s_ease-in-out_1.2s_infinite]" />
        </div>

        {/* SVG Growing Seed & Swaying Sprout */}
        <svg
          width={dimensions.box}
          height={dimensions.box}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 overflow-visible"
        >
          {/* Soft Soil Base Arc */}
          <path
            d="M 12 50 C 22 46, 42 46, 52 50 C 44 54, 20 54, 12 50 Z"
            fill="#5C3D2E"
            opacity="0.85"
          />
          <ellipse cx="32" cy="50" rx="16" ry="3.5" fill="#3D261C" opacity="0.6" />

          {/* Seed Resting in Soil */}
          <ellipse
            cx="32"
            cy="49"
            rx="3.5"
            ry="2.5"
            fill="#D4A373"
            stroke="#8C6239"
            strokeWidth="0.8"
            className="animate-[seedPulse_2s_ease-in-out_infinite]"
          />

          {/* Growing Stem */}
          <path
            d="M 32 49 Q 31 38, 32 26"
            stroke="#52B788"
            strokeWidth="2.8"
            strokeLinecap="round"
            className="animate-[stemGrow_1.8s_cubic-bezier(0.4,0,0.2,1)_infinite]"
            style={{ strokeDasharray: 30, strokeDashoffset: 0 }}
          />

          {/* Unfurling Left Leaf */}
          <g className="origin-[32px_32px] animate-[leafSwayLeft_2.6s_ease-in-out_infinite]">
            <path
              d="M 32 32 C 24 30, 18 20, 24 16 C 30 18, 31 28, 32 32 Z"
              fill="#40916C"
              stroke="#2D6A4F"
              strokeWidth="0.8"
            />
            {/* Leaf Vein */}
            <path d="M 32 32 Q 27 25, 23 18" stroke="#74C69D" strokeWidth="0.8" opacity="0.8" />
          </g>

          {/* Unfurling Right Tender Leaf */}
          <g className="origin-[32px_28px] animate-[leafSwayRight_2.8s_ease-in-out_0.4s_infinite]">
            <path
              d="M 32 28 C 40 25, 47 16, 41 12 C 35 14, 33 24, 32 28 Z"
              fill="#52B788"
              stroke="#40916C"
              strokeWidth="0.8"
            />
            {/* Leaf Vein */}
            <path d="M 32 28 Q 37 21, 41 14" stroke="#B7E4C7" strokeWidth="0.8" opacity="0.9" />
          </g>

          {/* Morning Dew Drop on Leaf */}
          <circle cx="41" cy="14" r="1" fill="#FAF8F2" opacity="0.85" className="animate-pulse" />
        </svg>
      </div>

      {label && (
        <p className={`${dimensions.font} text-[#2D6A4F] tracking-wide animate-pulse font-medium text-center`}>
          {label}
        </p>
      )}

      {/* Global CSS Keyframe styles */}
      <style>{`
        @keyframes stemGrow {
          0% { stroke-dashoffset: 30; opacity: 0.3; }
          40% { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes leafSwayLeft {
          0%, 100% { transform: rotate(0deg) scale(0.92); }
          50% { transform: rotate(-6deg) scale(1.04); }
        }
        @keyframes leafSwayRight {
          0%, 100% { transform: rotate(0deg) scale(0.92); }
          50% { transform: rotate(7deg) scale(1.05); }
        }
        @keyframes seedPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes floatUp {
          0% { transform: translateY(8px) scale(0.6); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-16px) scale(1.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default SproutLoader;
