'use client';

import type { CSSProperties } from 'react';
import { useReducedMotion } from '../provider';

export interface GrainOverlayProps {
  /** Grain opacity, 0–1. Default `0.12`. */
  opacity?: number;
  /** Grain tint. Default `'#000'` (neutral, filmic). Any CSS color works. */
  color?: string;
  /** Cover the whole viewport (`fixed`) instead of the nearest positioned parent. Default `false`. */
  fixed?: boolean;
  /** Blend mode for the grain. Default `'overlay'`. */
  blendMode?: CSSProperties['mixBlendMode'];
  className?: string;
}

// A tileable fractal-noise texture as an inline SVG (no external asset).
const NOISE = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
     <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/></filter>
     <rect width='100%' height='100%' filter='url(#n)'/>
   </svg>`,
);

/**
 * A subtle, filmic animated noise layer. Sits above content (pointer-events off) and flickers via a
 * stepped CSS keyframe. Under reduced motion the grain holds still. Place inside a `position:
 * relative` parent (or pass `fixed`).
 */
export function GrainOverlay({
  opacity = 0.12,
  color = '#000',
  fixed = false,
  blendMode = 'overlay',
  className,
}: GrainOverlayProps) {
  const reduced = useReducedMotion();
  const noise = `url("data:image/svg+xml,${NOISE}")`;

  // The noise is used as an alpha mask over a solid tint, so the grain can be any color. The mask
  // shifts on a stepped keyframe for a filmic flicker (see `.umbra-grain` in styles.css).
  return (
    <div
      aria-hidden
      className={`umbra-grain ${className ?? ''}`}
      data-animate={reduced ? undefined : ''}
      style={{
        position: fixed ? 'fixed' : 'absolute',
        inset: '-15%', // larger than the box so the flicker translate never reveals an edge
        pointerEvents: 'none',
        opacity,
        mixBlendMode: blendMode,
        backgroundColor: color,
        maskImage: noise,
        WebkitMaskImage: noise,
        maskSize: '160px 160px',
        WebkitMaskSize: '160px 160px',
        zIndex: 1,
      }}
    />
  );
}
