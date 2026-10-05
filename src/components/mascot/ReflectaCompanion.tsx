'use client';

import React, { useEffect, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export type CompanionExpression =
  | 'idle'
  | 'curious'
  | 'thinking'
  | 'listening'
  | 'surprised'
  | 'happy'
  | 'encouraging'
  | 'welcoming'
  | 'observing'
  | 'thoughtful'
  | 'calm'
  | 'concerned'
  | 'questioning'
  | 'friendly'
  | 'neutral'
  | 'gentle';

export interface CompanionProps {
  expression?: CompanionExpression;
  size?: number | string;
  className?: string;
  animate?: boolean;
}

const expressionConfigs: Record<
  CompanionExpression,
  { speed: number; scale?: number }
> = {
  idle: { speed: 0.85 },
  neutral: { speed: 0.85 },
  welcoming: { speed: 1.15, scale: 1.05 },
  happy: { speed: 1.1, scale: 1.05 },
  friendly: { speed: 1.0 },
  encouraging: { speed: 1.0 },
  listening: { speed: 0.75 },
  curious: { speed: 1.1, scale: 1.04 },
  questioning: { speed: 1.05 },
  thinking: { speed: 0.9 },
  observing: { speed: 0.8 },
  thoughtful: { speed: 0.85 },
  surprised: { speed: 1.2, scale: 1.05 },
  calm: { speed: 0.7 },
  gentle: { speed: 0.75 },
  concerned: { speed: 0.65 },
};

export function ReflectaCompanion({
  expression = 'neutral',
  size = 96,
  className = '',
  animate = true,
}: CompanionProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const config = expressionConfigs[expression] || expressionConfigs.neutral;
  const shouldAnimate = animate && !prefersReducedMotion;

  const sizeStyle =
    typeof size === 'number'
      ? { width: `${size}px`, height: `${size}px` }
      : { width: size, height: size };

  return (
    <div
      aria-hidden="true"
      className={`inline-flex items-center justify-center select-none aspect-square max-w-full ${className}`}
      style={{
        ...sizeStyle,
        flexShrink: 0,
        transform: config.scale ? `scale(${config.scale})` : undefined,
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {isMounted ? (
        <DotLottieReact
          src="/companion.lottie"
          loop={shouldAnimate}
          autoplay={shouldAnimate}
          speed={shouldAnimate ? config.speed : 0}
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: 'rgba(237, 233, 254, 0.4)',
          }}
        />
      )}
    </div>
  );
}

export default ReflectaCompanion;
