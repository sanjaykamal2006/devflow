import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function BrandLogo({ size = 'md', showText = true }: BrandLogoProps) {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
  };

  return (
    <div className="inline-flex items-center gap-2.5 group select-none">
      {/* Sharp Architectural Brand Icon */}
      <div
        className={`${iconDimensions[size]} relative flex items-center justify-center rounded-xl bg-zinc-950 border border-white/15 shadow-sm group-hover:border-[#FFC554]/50 transition-colors`}
      >
        <svg
          className="w-4 h-4 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Minimalist Flow Vectors */}
          <path d="M4 12h8m0 0l-3-3m3 3l-3 3" />
          <path d="M14 6h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4" />
        </svg>
        {/* Loop-inspired Warm Gold Accent Indicator */}
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#FFC554]" />
      </div>

      {showText && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`${textSizes[size]} font-black tracking-tight font-sans text-white uppercase`}>
              DEVFLOW
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFC554]" />
          </div>
          {size === 'lg' && (
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-500 mt-1">
              Engineering Workspace
            </span>
          )}
        </div>
      )}
    </div>
  );
}
