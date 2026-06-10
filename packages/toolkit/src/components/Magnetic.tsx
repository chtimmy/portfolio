'use client';

import { useRef } from 'react';
import { motion, useSpring } from 'motion/react';
import type { PointerEvent, ReactNode } from 'react';
import { useMotionTokens, useReducedMotion } from '../provider';

export interface MagneticProps {
  children: ReactNode;
  /** How far the element follows the cursor, as a fraction of the pointer offset. Default `0.4`. */
  strength?: number;
  /** Hit area padding (px) around the element that still attracts. Default `0`. */
  padding?: number;
  className?: string;
}

/**
 * Pulls its child toward the cursor while hovered, spring-smoothed on the active preset's gentle
 * spring, and releases back to center on leave. Great for buttons and links. Under reduced motion
 * it stays put (no listeners, no transform).
 */
export function Magnetic({ children, strength = 0.4, padding = 0, className }: MagneticProps) {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();
  const x = useSpring(0, tokens.spring.gentle);
  const y = useSpring(0, tokens.spring.gentle);
  const ref = useRef<HTMLDivElement>(null);

  if (reduced) {
    return (
      <div className={className} style={{ display: 'inline-block' }}>
        {children}
      </div>
    );
  }

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ display: 'inline-block', x, y, padding }}
    >
      {children}
    </motion.div>
  );
}
