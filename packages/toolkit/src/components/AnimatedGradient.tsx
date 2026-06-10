'use client';

import { motion } from 'motion/react';
import type { Transition } from 'motion/react';
import { useMotionTokens, useReducedMotion } from '../provider';

export interface AnimatedGradientProps {
  /** Blob colors. Default a cool aurora palette. */
  colors?: string[];
  /** Seconds for one drift cycle. Higher = calmer. Default `16`. */
  speed?: number;
  /** Blur radius of the blobs in pixels. Default `60`. */
  blur?: number;
  className?: string;
}

const DEFAULT_COLORS = ['#5b6b8c', '#e0457b', '#3b82f6'];

// Per-blob drift paths (percent of container), so each moves independently.
const PATHS = [
  { x: ['-10%', '30%', '-10%'], y: ['0%', '25%', '0%'], top: '5%', left: '0%' },
  { x: ['20%', '-15%', '20%'], y: ['10%', '-10%', '10%'], top: '30%', left: '40%' },
  { x: ['-5%', '15%', '-5%'], y: ['20%', '-5%', '20%'], top: '0%', left: '55%' },
];

/**
 * An ambient, slowly drifting aurora/mesh gradient for hero backgrounds. Soft blurred color blobs
 * ease around on a long loop using the active preset's emphasized easing. Under reduced motion the
 * blobs hold a fixed, still composition. Pointer-events are off so it never blocks content.
 */
export function AnimatedGradient({
  colors = DEFAULT_COLORS,
  speed = 16,
  blur = 60,
  className,
}: AnimatedGradientProps) {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden
      className={className}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}
    >
      {colors.map((color, i) => {
        const path = PATHS[i % PATHS.length]!;
        const transition: Transition = {
          duration: speed + i * 2,
          ease: [...tokens.easing.emphasized],
          repeat: Infinity,
          repeatType: 'mirror',
        };
        return (
          <motion.div
            key={i}
            initial={false}
            animate={reduced ? undefined : { x: path.x, y: path.y }}
            transition={transition}
            style={{
              position: 'absolute',
              top: path.top,
              left: path.left,
              width: '55%',
              height: '55%',
              borderRadius: '50%',
              background: color,
              filter: `blur(${blur}px)`,
              opacity: 0.55,
            }}
          />
        );
      })}
    </div>
  );
}
