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

/**
 * A faint background grid with light beams tracing across it. The grid is pure CSS; two beams (one
 * vertical, one horizontal) sweep on a loop. Under reduced motion only the still grid renders.
 * Pointer-events off; place in a `position: relative` parent.
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
      {!reduced && (
        <>
          <motion.div
            initial={{ left: '-10%' }}
            animate={{ left: '110%' }}
            transition={{ duration: speed, ease: 'linear', repeat: Infinity, repeatDelay: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              width: 2,
              height: '100%',
              background: `linear-gradient(to bottom, transparent, ${beamColor}, transparent)`,
              opacity: 0.6,
            }}
          />
          <motion.div
            initial={{ top: '-10%' }}
            animate={{ top: '110%' }}
            transition={{ duration: speed * 1.4, ease: 'linear', repeat: Infinity, repeatDelay: 1.6, delay: 0.8 }}
            style={{
              position: 'absolute',
              left: 0,
              height: 2,
              width: '100%',
              background: `linear-gradient(to right, transparent, ${beamColor}, transparent)`,
              opacity: 0.5,
            }}
          />
        </>
      )}
    </div>
  );
}
