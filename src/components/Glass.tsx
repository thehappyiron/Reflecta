'use client';

import React, { useEffect, useRef, useState, useId } from 'react';

export interface GlassProps {
  radius?: number;          // Border radius in px (default: 28)
  bevelDepth?: number;      // Bevel/refraction band depth in px (default: 24)
  scale?: number;           // Displacement scale (default: 55)
  aberration?: number;      // Chromatic aberration magnitude (default: 5)
  frost?: number;           // Background blur amount 0..1 (default: 0.02)
  tint?: number;            // White/ivory body tint opacity 0..1 (default: 0.08)
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * Generate a physical rounded-box displacement map encoded into PNG Data URL.
 * R = X-axis normal vector displacement
 * G = Y-axis normal vector displacement
 * B = Height/bevel depth
 */
function generateDisplacementMap(
  width: number,
  height: number,
  radius: number,
  bevelDepth: number
): string {
  if (width <= 0 || height <= 0) return '';

  const maxDim = 512;
  const aspect = width / height;
  let canvasW = width;
  let canvasH = height;

  if (width > maxDim || height > maxDim) {
    if (aspect >= 1) {
      canvasW = maxDim;
      canvasH = Math.round(maxDim / aspect);
    } else {
      canvasH = maxDim;
      canvasW = Math.round(maxDim * aspect);
    }
  }

  canvasW = Math.max(32, canvasW);
  canvasH = Math.max(32, canvasH);

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const imgData = ctx.createImageData(canvasW, canvasH);
  const data = imgData.data;

  const scaleX = canvasW / width;
  const scaleY = canvasH / height;
  const r = radius * Math.min(scaleX, scaleY);
  const bevel = Math.max(1, bevelDepth * Math.min(scaleX, scaleY));

  const cx = canvasW / 2;
  const cy = canvasH / 2;
  const halfW = canvasW / 2;
  const halfH = canvasH / 2;

  const innerW = halfW - r;
  const innerH = halfH - r;

  for (let y = 0; y < canvasH; y++) {
    const dy = y - cy;
    const absY = Math.abs(dy);
    const signY = dy >= 0 ? 1 : -1;

    for (let x = 0; x < canvasW; x++) {
      const dx = x - cx;
      const absX = Math.abs(dx);
      const signX = dx >= 0 ? 1 : -1;

      const px = absX - innerW;
      const py = absY - innerH;

      let nx = 0;
      let ny = 0;
      let distToEdge = 0;

      if (px > 0 && py > 0) {
        const cornerDist = Math.sqrt(px * px + py * py);
        if (cornerDist > 0) {
          nx = (px / cornerDist) * signX;
          ny = (py / cornerDist) * signY;
        }
        distToEdge = r - cornerDist;
      } else if (px > py) {
        nx = signX;
        ny = 0;
        distToEdge = halfW - absX;
      } else {
        nx = 0;
        ny = signY;
        distToEdge = halfH - absY;
      }

      let m = 0;
      if (distToEdge < bevel && distToEdge >= -10) {
        const t = Math.max(0, Math.min(1, 1 - distToEdge / bevel));
        m = Math.sin(t * Math.PI * 0.5);
      }

      const index = (y * canvasW + x) * 4;
      data[index]     = Math.min(255, Math.max(0, Math.round(128 + 127 * nx * m)));
      data[index + 1] = Math.min(255, Math.max(0, Math.round(128 + 127 * ny * m)));
      data[index + 2] = Math.min(255, Math.max(0, Math.round(255 * (1 - m * 0.8))));
      data[index + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

export function Glass({
  radius = 28,
  bevelDepth = 24,
  scale = 55,
  aberration = 5,
  frost = 0.02,
  tint = 0.08,
  className = '',
  style = {},
  children,
}: GlassProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapUrl, setMapUrl] = useState<string>('');
  const rawId = useId();
  const filterId = `glass-refract-${rawId.replace(/:/g, '')}`;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateMap = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const url = generateDisplacementMap(rect.width, rect.height, radius, bevelDepth);
        setMapUrl(url);
      }
    };

    updateMap();

    const ro = new ResizeObserver(() => {
      updateMap();
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
    };
  }, [radius, bevelDepth]);

  return (
    <>
      {/* SVG Filter Pipeline for Optical Refraction & 3-Channel Chromatic Aberration */}
      <svg
        style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none', visibility: 'hidden' }}
        aria-hidden="true"
      >
        <filter id={filterId} colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
          {mapUrl && <feImage href={mapUrl} result="map" preserveAspectRatio="none" />}

          {frost > 0 && <feGaussianBlur in="SourceGraphic" stdDeviation={frost * 10} result="blurred" />}

          {/* Red Channel Displacement */}
          <feDisplacementMap
            in={frost > 0 ? 'blurred' : 'SourceGraphic'}
            in2="map"
            xChannelSelector="R"
            yChannelSelector="G"
            scale={scale - aberration}
            result="displacedR"
          />

          {/* Green Channel Displacement */}
          <feDisplacementMap
            in={frost > 0 ? 'blurred' : 'SourceGraphic'}
            in2="map"
            xChannelSelector="R"
            yChannelSelector="G"
            scale={scale}
            result="displacedG"
          />

          {/* Blue Channel Displacement */}
          <feDisplacementMap
            in={frost > 0 ? 'blurred' : 'SourceGraphic'}
            in2="map"
            xChannelSelector="R"
            yChannelSelector="G"
            scale={scale + aberration}
            result="displacedB"
          />

          {/* Extract Color Channels */}
          <feColorMatrix in="displacedR" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="redOnly" />
          <feColorMatrix in="displacedG" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="greenOnly" />
          <feColorMatrix in="displacedB" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blueOnly" />

          {/* Recombine Chromatic Channels */}
          <feBlend in="redOnly" in2="greenOnly" mode="screen" result="rg" />
          <feBlend in="rg" in2="blueOnly" mode="screen" result="refracted" />
        </filter>
      </svg>

      {/* Main Glass Surface Element */}
      <div
        ref={containerRef}
        className={`glass-surface-container ${className}`}
        style={{
          position: 'relative',
          borderRadius: `${radius}px`,
          backdropFilter: mapUrl ? `url(#${filterId}) blur(${frost * 10}px)` : `blur(20px) saturate(140%)`,
          WebkitBackdropFilter: mapUrl ? `url(#${filterId}) blur(${frost * 10}px)` : `blur(20px) saturate(140%)`,
          background: `linear-gradient(155deg, rgba(255, 252, 255, ${tint * 2.8}) 0%, rgba(248, 244, 252, ${tint * 2.0}) 45%, rgba(255, 250, 248, ${tint * 2.4}) 80%, rgba(248, 244, 255, ${tint * 2.6}) 100%)`,
          border: '1px solid rgba(255, 255, 255, 0.48)',
          boxShadow: `
            0 14px 40px -6px rgba(59, 7, 100, 0.10),
            0 4px 14px -2px rgba(59, 7, 100, 0.06),
            0 0 0 0.5px rgba(255, 255, 255, 0.55),
            inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.88),
            inset 0 -1.5px 1px 0 rgba(184, 167, 217, 0.22),
            inset 1.5px 0 3px 0 rgba(255, 255, 255, 0.35),
            inset -1.5px 0 3px 0 rgba(255, 255, 255, 0.25)
          `,
          ...style,
        }}
      >
        {/* Specular sheen highlight layer */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '45%',
            borderRadius: `${radius}px ${radius}px 0 0`,
            pointerEvents: 'none',
            zIndex: 0,
            background: 'radial-gradient(ellipse at 25% 0%, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.15) 50%, transparent 80%)',
          }}
        />

        {/* Bottom edge refraction layer */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '38%',
            borderRadius: `0 0 ${radius}px ${radius}px`,
            pointerEvents: 'none',
            zIndex: 0,
            background: 'linear-gradient(0deg, rgba(184, 167, 217, 0.14) 0%, rgba(255, 216, 200, 0.05) 50%, transparent 100%)',
          }}
        />

        {/* Crisp Navbar Content Layer */}
        <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
      </div>
    </>
  );
}

export default Glass;
