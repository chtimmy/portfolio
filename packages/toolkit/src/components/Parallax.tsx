'use client';

import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import type { ReactNode, RefObject } from 'react';
import type { DistanceToken } from '../tokens/tokens.schema';
import { useMotionTokens, useReducedMotion } from '../provider';

export interface ParallaxProps {
  children: ReactNode;
  /** Parallax strength, roughly -1..1. Positive lags (moves up as you scroll down). Default `0.3`. */
  speed?: number;
  /** Travel range token (the max offset at the extremes). Default `'dramatic'`. */
  range?: DistanceToken;
  /** Track scroll within this element instead of the window (e.g. a scrollable panel). */
  root?: RefObject<HTMLElement | null>;
  className?: string;
}

/**
 * Moves its content against the scroll to fake depth. Maps the element's progress through the
 * viewport to a vertical offset (scaled by `speed`), spring-smoothed on the active preset's gentle
 * spring. Renders perfectly still under reduced motion.
 */
export function Parallax({ children, speed = 0.3, range = 'dramatic', root, className }: ParallaxProps) {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    ...(root ? { container: root } : {}),
    offset: ['start end', 'end start'],
  });

  const amount = tokens.distance[range] * speed;
  const raw = useTransform(scrollYProgress, [0, 1], [amount, -amount]);
  const y = useSpring(raw, tokens.spring.gentle);

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
