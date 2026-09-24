import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function BrandLogo({ size = 'md', showText = true }: BrandLogoProps) {
  const iconDimensions = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="inline-flex items-center gap-2 select-none group">
      <div
        className={`${iconDimensions[size]} flex items-center justify-center rounded-lg bg-zinc-100 text-zinc-950 font-bold shadow-sm transition-transform group-hover:scale-105`}
      >
        <svg
          className="w-4 h-4 text-zinc-950"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </div>

      {showText && (
        <span className={`${textSizes[size]} font-semibold tracking-tight text-zinc-100 font-sans`}>
          DevFlow
        </span>
      )}
    </div>
  );
}
