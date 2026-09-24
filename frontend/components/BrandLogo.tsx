import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export function BrandLogo({ size = 'md', showText = true }: BrandLogoProps) {
  const dimensions = {
    sm: { box: 'w-5 h-5', px: 20, text: 'text-xs' },
    md: { box: 'w-6 h-6', px: 24, text: 'text-sm' },
    lg: { box: 'w-10 h-10', px: 40, text: 'text-base' },
    xl: { box: 'w-12 h-12', px: 48, text: 'text-lg' },
  };

  const current = dimensions[size] || dimensions.md;

  return (
    <div className="inline-flex items-center gap-2 select-none group">
      <div
        className={`${current.box} relative flex items-center justify-center flex-shrink-0 transition-opacity group-hover:opacity-90`}
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
        <span className={`${current.text} font-semibold tracking-tight text-zinc-100 font-sans`}>
          DevFlow
        </span>
      )}
    </div>
  );
}
