import React from 'react';
import { motion } from 'motion/react';

interface MugguProps {
  className?: string;
  color?: string;
}

// 1. Traditional Muggu Horizontal Section Divider (Rice Powder Loop Art)
export const MugguDivider: React.FC<MugguProps> = ({ 
  className = '', 
  color = '#C8A882' 
}) => {
  return (
    <div className={`w-full flex items-center justify-center my-6 opacity-85 select-none pointer-events-none ${className}`}>
      <svg 
        viewBox="0 0 1200 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full max-w-4xl h-8 text-current"
      >
        {/* Left repeating curve loop */}
        <path 
          d="M 50 24 Q 100 4, 150 24 T 250 24 T 350 24 T 450 24 C 480 24, 510 12, 540 24" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round"
          fill="none" 
        />
        <path 
          d="M 50 24 Q 100 44, 150 24 T 250 24 T 350 24 T 450 24 C 480 24, 510 36, 540 24" 
          stroke={color} 
          strokeWidth="1.5" 
          strokeDasharray="4 4" 
          strokeLinecap="round"
          fill="none" 
        />

        {/* Center Lotus Muggu Mandala Loop */}
        <g transform="translate(600, 24)">
          {/* Outer floral loop petals */}
          <path d="M 0 -20 C 12 -12, 12 12, 0 20 C -12 12, -12 -12, 0 -20 Z" fill="none" stroke={color} strokeWidth="2" />
          <path d="M -20 0 C -12 12, 12 12, 20 0 C 12 -12, -12 -12, -20 0 Z" fill="none" stroke={color} strokeWidth="2" />
          <path d="M -14 -14 C 0 -6, 6 0, 14 14 C 0 6, -6 0, -14 -14 Z" fill="none" stroke={color} strokeWidth="1.5" />
          <path d="M 14 -14 C 6 0, 0 6, -14 14 C 0 -6, 6 0, 14 -14 Z" fill="none" stroke={color} strokeWidth="1.5" />
          
          {/* Rice powder dots */}
          <circle cx="0" cy="0" r="3.5" fill={color} />
          <circle cx="0" cy="-24" r="2.5" fill={color} />
          <circle cx="0" cy="24" r="2.5" fill={color} />
          <circle cx="-24" cy="0" r="2.5" fill={color} />
          <circle cx="24" cy="0" r="2.5" fill={color} />
        </g>

        {/* Right repeating curve loop */}
        <path 
          d="M 1150 24 Q 1100 4, 1050 24 T 950 24 T 850 24 T 750 24 C 720 24, 690 12, 660 24" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round"
          fill="none" 
        />
        <path 
          d="M 1150 24 Q 1100 44, 1050 24 T 950 24 T 850 24 T 750 24 C 720 24, 690 36, 660 24" 
          stroke={color} 
          strokeWidth="1.5" 
          strokeDasharray="4 4" 
          strokeLinecap="round"
          fill="none" 
        />
      </svg>
    </div>
  );
};

// 2. Traditional Muggu Flower / Mandala Accent
export const MugguFlower: React.FC<MugguProps & { size?: number }> = ({ 
  className = '', 
  color = '#C8A882',
  size = 64
}) => {
  return (
    <motion.div 
      whileHover={{ rotate: 90 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`inline-block select-none pointer-events-auto cursor-pointer ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* 8 Petal Muggu Loops */}
        <g stroke={color} strokeWidth="2" fill="none">
          <path d="M 50 10 C 62 25, 62 75, 50 90 C 38 75, 38 25, 50 10 Z" />
          <path d="M 10 50 C 25 62, 75 62, 90 50 C 75 38, 25 38, 10 50 Z" />
          <path d="M 22 22 C 42 32, 68 58, 78 78 C 58 68, 32 42, 22 22 Z" />
          <path d="M 78 22 C 68 42, 42 68, 22 78 C 32 58, 58 32, 78 22 Z" />
        </g>
        {/* Rice powder dots */}
        <circle cx="50" cy="50" r="5" fill={color} />
        <circle cx="50" cy="18" r="3" fill={color} />
        <circle cx="50" cy="82" r="3" fill={color} />
        <circle cx="18" cy="50" r="3" fill={color} />
        <circle cx="82" cy="50" r="3" fill={color} />
      </svg>
    </motion.div>
  );
};

// 3. Traditional Clay Art / Terracotta Pitcher Line Motif
export const ClayArtMotif: React.FC<MugguProps & { size?: number }> = ({
  className = '',
  color = '#B85D38',
  size = 48
}) => {
  return (
    <div className={`inline-block select-none pointer-events-none ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Clay Pot Outline */}
        <path 
          d="M 22 12 C 22 12, 24 8, 32 8 C 40 8, 42 12, 42 12 L 40 18 C 48 24, 52 36, 46 48 C 42 56, 22 56, 18 48 C 12 36, 16 24, 24 18 Z" 
          stroke={color} 
          strokeWidth="2.2" 
          strokeLinejoin="round"
          fill="none" 
        />
        {/* Rim */}
        <path d="M 20 12 L 44 12" stroke={color} strokeWidth="3" strokeLinecap="round" />
        {/* Muggu white art wave on clay belly */}
        <path d="M 20 34 Q 26 28, 32 34 T 44 34" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
        <circle cx="32" cy="42" r="2.5" fill="#FFF" />
      </svg>
    </div>
  );
};
