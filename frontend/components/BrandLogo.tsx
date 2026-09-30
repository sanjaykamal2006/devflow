import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export function BrandLogo({ size = 'md', showText = true, className = '' }: BrandLogoProps) {
  // Proportions mapped to 1024x928 native aspect ratio (1.103:1)
  const sizeConfig = {
    sm: {
      width: 24,
      height: 22,
      imgClass: 'h-5 w-auto',
      textClass: 'text-xs',
    },
    md: {
      width: 32,
      height: 29,
      imgClass: 'h-6 sm:h-7 w-auto',
      textClass: 'text-sm',
    },
    lg: {
      width: 64,
      height: 58,
      imgClass: 'h-12 w-auto',
      textClass: 'text-lg',
    },
    xl: {
      width: 96,
      height: 87,
      imgClass: 'h-16 sm:h-20 w-auto',
      textClass: 'text-2xl',
    },
  };

  const current = sizeConfig[size] || sizeConfig.md;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none group ${className}`}>
      {/* Official DevFlow Liquid-Glass Layered Logo */}
      <div className="relative flex items-center justify-center shrink-0">
        <Image
          src="/logo.png"
          alt="DevFlow Logo"
          width={current.width}
          height={current.height}
          priority
          className={`${current.imgClass} object-contain transition-transform duration-200 group-hover:scale-105 filter drop-shadow-[0_2px_12px_rgba(56,189,248,0.2)]`}
        />
      </div>

      {showText && (
        <span className={`${current.textClass} font-semibold tracking-tight text-white font-sans flex items-center gap-1.5`}>
          <span>DevFlow</span>
        </span>
      )}
    </div>
  );
}
