import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function BrandLogo({ size = 'md', showText = true }: BrandLogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className="inline-flex items-center gap-2.5 group">
      {/* Sleek Layered Icon */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 shadow-lg shadow-indigo-500/25 border border-indigo-400/30 transition-transform duration-200 group-hover:scale-105`}
      >
        {/* Subtle Inner Glow */}
        <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Flow SVG Glyph */}
        <svg
          className="w-5 h-5 text-white transform -rotate-45"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left leading-none">
          <span className={`${textSizes[size]} font-extrabold tracking-tight font-mono text-white flex items-center gap-0.5`}>
            DEV<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400">FLOW</span>
          </span>
          {size === 'lg' && (
            <span className="text-[11px] text-zinc-400 mt-1 font-sans">
              Engineering Workspace
            </span>
          )}
        </div>
      )}
    </div>
  );
}
