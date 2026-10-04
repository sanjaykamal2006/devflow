'use client';

import React from 'react';

interface NeonGlassLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function NeonGlassLogo({ size = 'lg', className = '' }: NeonGlassLogoProps) {
  const dimension = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
  }[size];

  return (
    <div className={`relative flex items-center justify-center ${dimension} ${className}`}>
      {/* Ambient Neon Glow behind the 3D isometric glass cards */}
      <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/40 via-blue-600/30 to-purple-600/30 blur-xl rounded-full scale-125 pointer-events-none" />

      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_4px_24px_rgba(56,189,248,0.55)]"
      >
        <defs>
          {/* Card 1 (Left / Back) Gradient */}
          <linearGradient id="neonCard1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#1e293b" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
          </linearGradient>

          {/* Card 2 (Middle) Gradient */}
          <linearGradient id="neonCard2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#2563eb" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.95" />
          </linearGradient>

          {/* Card 3 (Right / Front) Gradient */}
          <linearGradient id="neonCard3" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="40%" stopColor="#0284c7" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
          </linearGradient>

          {/* Top Edge Highlight Gradients */}
          <linearGradient id="topGlint" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
          </linearGradient>

          <filter id="neonBlurGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- Card 1: Left / Rear Frosted Plate --- */}
        <g opacity="0.85">
          {/* Back body */}
          <path
            d="M 22 42 L 38 30 L 38 68 L 22 80 Z"
            fill="url(#neonCard1)"
            stroke="rgba(56, 189, 248, 0.4)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Top Rim Glow */}
          <path
            d="M 22 42 L 38 30"
            stroke="#93c5fd"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Left Vertical Edge */}
          <path
            d="M 22 42 L 22 80"
            stroke="rgba(56, 189, 248, 0.6)"
            strokeWidth="1.2"
          />
        </g>

        {/* --- Card 2: Center Electric Blue Plate --- */}
        <g opacity="0.95">
          {/* Center body */}
          <path
            d="M 40 32 L 56 20 L 56 58 L 40 70 Z"
            fill="url(#neonCard2)"
            stroke="rgba(96, 165, 250, 0.75)"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* Top Rim Glow */}
          <path
            d="M 40 32 L 56 20"
            stroke="#dbeafe"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Left vertical edge glint */}
          <path
            d="M 40 32 L 40 70"
            stroke="rgba(147, 197, 253, 0.85)"
            strokeWidth="1.4"
          />
        </g>

        {/* --- Card 3: Right Front Radiant Cyan Plate --- */}
        <g>
          {/* Front body */}
          <path
            d="M 58 22 L 74 10 L 74 48 L 58 60 Z"
            fill="url(#neonCard3)"
            stroke="rgba(56, 189, 248, 0.95)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* Top Rim Brilliant Glint */}
          <path
            d="M 58 22 L 74 10"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Left Vertical High-Gloss Rim */}
          <path
            d="M 58 22 L 58 60"
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Inset Specular Reflection Stripe */}
          <path
            d="M 62 26 L 68 21.5 L 68 46 L 62 50.5 Z"
            fill="rgba(255, 255, 255, 0.18)"
          />
        </g>
      </svg>
    </div>
  );
}
