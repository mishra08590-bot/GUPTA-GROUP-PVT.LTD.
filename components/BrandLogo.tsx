
import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const sizes = {
    sm: { icon: 'h-10 w-10', text: 'text-[10px]' },
    md: { icon: 'h-16 w-16', text: 'text-lg' },
    lg: { icon: 'h-32 w-32', text: 'text-3xl' },
    xl: { icon: 'h-48 w-48', text: 'text-5xl' }
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className={`${sizes[size].icon} relative flex items-center justify-center`}>
        {/* Stylized Logo following the uploaded image design */}
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]">
          <defs>
            <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E6C15D" />
              <stop offset="50%" stopColor="#FEF3C7" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="deepBlue" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="black" floodOpacity="0.5"/>
            </filter>
          </defs>
          
          {/* Curved Wings/Orbit */}
          <path 
            d="M90,40 C95,65 75,90 40,90 C10,90 5,65 5,45 C5,20 25,5 55,5 C75,5 92,20 92,40 L75,40 C75,30 65,20 55,20 C40,20 25,35 25,50 C25,65 35,75 50,75 C65,75 78,65 78,45 L55,45 L55,35 L90,35 L90,40 Z" 
            fill="url(#gold)"
            filter="url(#shadow)"
          />

          {/* Buildings Motif */}
          <rect x="38" y="25" width="6" height="45" fill="url(#deepBlue)" rx="1" filter="url(#shadow)" />
          <rect x="46" y="20" width="8" height="50" fill="url(#deepBlue)" rx="1" filter="url(#shadow)" />
          <rect x="56" y="28" width="6" height="42" fill="url(#deepBlue)" rx="1" filter="url(#shadow)" />
          
          {/* Base Accents */}
          <path d="M20,70 L80,70" stroke="url(#gold)" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        </svg>
      </div>
      {showText && (
        <div className="text-center">
          <h1 className={`${sizes[size].text} font-black text-slate-900 uppercase tracking-tighter leading-none`}>
            GUPTA GROUP
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-px w-6 bg-slate-300"></div>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.5em]">
              PVT. LTD.
            </p>
            <div className="h-px w-6 bg-slate-300"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
