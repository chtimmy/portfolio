'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import type { DistanceToken, DurationToken, EasingToken } from '../tokens/tokens.schema';
import { useReveal } from '../hooks/use-reveal';
import type { RevealFrom, RevealVariant } from '../hooks/use-reveal';

export interface RevealProps {
  children: ReactNode;
  /** Entrance style. Default `'slide'`. */
  variant?: RevealVariant;
  /** Slide direction. Default `'up'`. */
  from?: RevealFrom;
  duration?: DurationToken;
  easing?: EasingToken;
  distance?: DistanceToken;
  /** Animate when scrolled into view (`'inView'`, default) or immediately on mount (`'mount'`). */
  trigger?: 'inView' | 'mount';
  /** For `inView`: only animate the first time it enters. Default `true`. */
  once?: boolean;
  /** Extra delay in seconds before the entrance. */
  delay?: number;
  className?: string;
}

/**
 * The workhorse entrance. Fades/slides/scales content into place using the active preset's tokens,
 * either on scroll-into-view or on mount. Carries no raw values and collapses to an opacity-only
 * fade under reduced motion (via `useReveal`). The pattern the other components follow.
 */
export function Reveal({
  children,
  variant,
  from,
  duration,
  easing,
  distance,
  trigger = 'inView',
  once = true,
  delay,
  className,
}: RevealProps) {
  const { initial, animate, transition } = useReveal({ variant, from, duration, easing, distance });
  const withDelay = delay ? { ...transition, delay } : transition;

  if (trigger === 'mount') {
    return (
      <motion.div className={className} initial={initial} animate={animate} transition={withDelay}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={animate}
      viewport={{ once, amount: 0.3 }}
      transition={withDelay}
    >
      {children}
    </motion.div>
  );
}
