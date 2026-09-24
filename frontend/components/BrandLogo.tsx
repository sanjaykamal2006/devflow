import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function BrandLogo({ size = 'md', showText = true }: BrandLogoProps) {
  const dimensions = {
    sm: { box: 'w-7 h-7', px: 28, text: 'text-xs' },
    md: { box: 'w-8 h-8', px: 32, text: 'text-sm' },
    lg: { box: 'w-14 h-14', px: 56, text: 'text-lg' },
  };

  const current = dimensions[size] || dimensions.md;

  return (
    <div className="inline-flex items-center gap-2.5 select-none group">
      <div
        className={`${current.box} relative flex items-center justify-center rounded-lg overflow-hidden border border-zinc-800/80 bg-zinc-950 shadow-sm transition-transform group-hover:scale-105`}
      >
        <Image
          src="/logo.jpg"
          alt="DevFlow Logo"
          width={current.px}
          height={current.px}
          priority
          className="w-full h-full object-cover"
        />
      </div>

      {showText && (
        <span className={`${current.text} font-bold tracking-tight text-white font-sans`}>
          DevFlow
        </span>
      )}
    </div>
  );
}
