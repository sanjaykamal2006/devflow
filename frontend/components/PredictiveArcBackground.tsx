'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with ssr: false for Next.js App Router client rendering
const PredictiveArcCanvas = dynamic(
  () =>
    import('@/src/shaders/predictive-arc/PredictiveArcCanvas').then(
      (mod) => mod.PredictiveArcCanvas
    ),
  {
    ssr: false,
    loading: () => <div className="threeui-background predictive-arc" />,
  }
);

interface PredictiveArcBackgroundProps {
  className?: string;
  style?: React.CSSProperties;
  opacity?: number;
}

export function PredictiveArcBackground({
  className = '',
  style,
  opacity = 0.6,
}: PredictiveArcBackgroundProps) {
  return (
    <div
      className={`shader-frame pointer-events-none select-none ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity,
        zIndex: 0,
        ...style,
      }}
      aria-hidden="true"
    >
      <PredictiveArcCanvas
        variant="signal-particles"
        mode="dark"
        speed={1.0}
        hue={0}
        saturation={1.0}
        brightness={1.0}
      />
    </div>
  );
}

export default PredictiveArcBackground;
