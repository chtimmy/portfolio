'use client';

import { motion, useScroll, useSpring } from 'motion/react';
import { useMotionTokens, useReducedMotion } from '../provider';

export interface ScrollProgressProps {
  /** Bar thickness in pixels. Default `3`. */
  thickness?: number;
  /** Bar color. Defaults to `currentColor`. */
  color?: string;
  /** Where to pin the bar. Default `'top'`. */
  position?: 'top' | 'bottom';
  /** Track a specific scroll container instead of the page. */
  target?: React.RefObject<HTMLElement | null>;
  className?: string;
}

/**
 * A reading-progress bar pinned to the viewport edge, scaled by scroll position. Spring-smoothed on
 * the active preset's gentle spring; under reduced motion it tracks scroll directly (no spring lag).
 * The bar reflects scroll, so it stays meaningful even with motion minimized.
 */
export function ScrollProgress({
  thickness = 3,
  color = 'currentColor',
  position = 'top',
  target,
  className,
}: ScrollProgressProps) {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll(target ? { target } : undefined);
  const smooth = useSpring(scrollYProgress, tokens.spring.gentle);
  const scaleX = reduced ? scrollYProgress : smooth;

  return (
    <motion.div
      aria-hidden
      className={className}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        [position]: 0,
        height: thickness,
        background: color,
        transformOrigin: '0 50%',
        scaleX,
        zIndex: 50,
      }}
    />
  );
}
