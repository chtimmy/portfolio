'use client';

import { motion } from 'motion/react';
import { useReducedMotion } from '../provider';

export interface BeamGridProps {
  /** Grid cell size in pixels. Default `48`. */
  cell?: number;
  /** Grid line color. Default a faint ink. */
  lineColor?: string;
  /** Beam color. Defaults to `currentColor`. */
  beamColor?: string;
  /** Seconds for a beam to cross. Default `6`. */
  speed?: number;
  className?: string;
}

// A few beams of varying length/speed/brightness so the sweep reads as a living field, not a single
// line. `axis` v = vertical beam moving left→right; h = horizontal beam moving top→bottom. `pos`/
// `span` are percentages of the cross axis; `dur` scales `speed`; `glow` is the blur radius (px).
const BEAMS = [
  { axis: 'v' as const, pos: 0, span: 100, thick: 2, dur: 1, gap: 0.8, delay: 0, glow: 8, opacity: 0.7 },
  { axis: 'v' as const, pos: 12, span: 64, thick: 1, dur: 1.6, gap: 1.4, delay: 1.2, glow: 5, opacity: 0.4 },
  { axis: 'v' as const, pos: 40, span: 80, thick: 3, dur: 0.78, gap: 2.2, delay: 2.6, glow: 12, opacity: 0.85 },
  { axis: 'h' as const, pos: 0, span: 100, thick: 2, dur: 1.4, gap: 1.2, delay: 0.6, glow: 8, opacity: 0.5 },
  { axis: 'h' as const, pos: 30, span: 70, thick: 1, dur: 2, gap: 1.8, delay: 1.8, glow: 5, opacity: 0.35 },
];

/**
 * A faint background grid with light beams tracing across it. The grid is pure CSS; several glowing
 * beams of varying length/speed sweep on staggered loops. Under reduced motion only the still grid
 * renders. Pointer-events off; place in a `position: relative` parent.
 */
export function BeamGrid({
  cell = 48,
  lineColor = 'rgba(20,22,27,0.06)',
  beamColor = 'currentColor',
  speed = 6,
  className,
}: BeamGridProps) {
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        backgroundImage: `linear-gradient(${lineColor} 1px, transparent 1px), linear-gradient(90deg, ${lineColor} 1px, transparent 1px)`,
        backgroundSize: `${cell}px ${cell}px`,
      }}
    >
      {!reduced &&
        BEAMS.map((b, i) =>
          b.axis === 'v' ? (
            <motion.div
              key={i}
              initial={{ left: '-8%' }}
              animate={{ left: '108%' }}
              transition={{ duration: speed * b.dur, ease: 'linear', repeat: Infinity, repeatDelay: b.gap, delay: b.delay }}
              style={{
                position: 'absolute',
                top: `${b.pos}%`,
                height: `${b.span}%`,
                width: b.thick,
                background: `linear-gradient(to bottom, transparent, ${beamColor}, transparent)`,
                boxShadow: `0 0 ${b.glow}px ${beamColor}`,
                opacity: b.opacity,
              }}
            />
          ) : (
            <motion.div
              key={i}
              initial={{ top: '-8%' }}
              animate={{ top: '108%' }}
              transition={{ duration: speed * b.dur, ease: 'linear', repeat: Infinity, repeatDelay: b.gap, delay: b.delay }}
              style={{
                position: 'absolute',
                left: `${b.pos}%`,
                width: `${b.span}%`,
                height: b.thick,
                background: `linear-gradient(to right, transparent, ${beamColor}, transparent)`,
                boxShadow: `0 0 ${b.glow}px ${beamColor}`,
                opacity: b.opacity,
              }}
            />
          ),
        )}
    </div>
  );
}
