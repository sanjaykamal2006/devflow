import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export function BrandLogo({ size = 'md', showText = true, className = '' }: BrandLogoProps) {
  const dimensions = {
    sm: { box: 'w-5 h-5', icon: 'w-3 h-3', text: 'text-xs' },
    md: { box: 'w-6 h-6', icon: 'w-3.5 h-3.5', text: 'text-sm' },
    lg: { box: 'w-9 h-9', icon: 'w-5 h-5', text: 'text-base' },
    xl: { box: 'w-11 h-11', icon: 'w-6 h-6', text: 'text-lg' },
  };

  const current = dimensions[size] || dimensions.md;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none group ${className}`}>
      {/* Precision Geometric Emblem */}
      <div
        className={`${current.box} relative flex items-center justify-center rounded-lg bg-gradient-to-b from-zinc-800 to-zinc-950 border border-white/[0.12] shadow-sm group-hover:border-white/[0.25] group-hover:shadow-[0_0_12px_rgba(255,255,255,0.12)] transition-all duration-200 shrink-0`}
      >
        <svg
          className={`${current.icon} text-white transition-transform duration-200 group-hover:scale-105`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>

      {showText && (
        <span className={`${current.text} font-semibold tracking-tight text-white font-sans flex items-center gap-1.5`}>
          <span>DevFlow</span>
        </span>
      )}
    </div>
  );
}
