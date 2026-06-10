'use client';

import { useRef } from 'react';
import { motion, useSpring } from 'motion/react';
import type { PointerEvent, ReactNode } from 'react';
import { useMotionTokens, useReducedMotion } from '../provider';

export interface TiltCardProps {
  children: ReactNode;
  /** Maximum tilt in degrees at the corners. Default `12`. */
  max?: number;
  /** Perspective depth in pixels (smaller = stronger 3D). Default `600`. */
  perspective?: number;
  className?: string;
}

/**
 * Tilts toward the pointer in 3D, spring-smoothed on the active preset's snappy spring, and settles
 * flat on leave. Under reduced motion it renders as a plain, static card (no tilt, no listeners).
 */
export function TiltCard({ children, max = 12, perspective = 600, className }: TiltCardProps) {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();
  const rotateX = useSpring(0, tokens.spring.snappy);
  const rotateY = useSpring(0, tokens.spring.snappy);
  const ref = useRef<HTMLDivElement>(null);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * max * 2);
    rotateX.set(-py * max * 2);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: perspective, transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  );
}
