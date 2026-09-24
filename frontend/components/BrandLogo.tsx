import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export function BrandLogo({ size = 'md', showText = true }: BrandLogoProps) {
  const dimensions = {
    sm: { box: 'w-8 h-8', px: 32, text: 'text-sm' },
    md: { box: 'w-10 h-10', px: 40, text: 'text-base' },
    lg: { box: 'w-20 h-20', px: 80, text: 'text-xl' },
    xl: { box: 'w-24 h-24', px: 96, text: 'text-2xl' },
  };

  const current = dimensions[size] || dimensions.md;

  return (
    <div className="inline-flex items-center gap-3 select-none group">
      <div
        className={`${current.box} relative flex items-center justify-center transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_6px_16px_rgba(0,0,0,0.6)]`}
      >
        <Image
          src="/logo.png"
          alt="DevFlow Logo"
          width={current.px}
          height={current.px}
          priority
          className="w-full h-full object-contain"
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
