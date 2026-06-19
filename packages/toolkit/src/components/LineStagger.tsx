'use client';

import { Children } from 'react';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import type { ReactNode, RefObject } from 'react';
import type {
  DistanceToken,
  DurationToken,
  EasingToken,
  StaggerToken,
} from '../tokens/tokens.schema';
import { useMotionTokens, useReducedMotion } from '../provider';

export interface LineStaggerProps {
  children: ReactNode;
  /** Animate on scroll-into-view (default) or on mount. */
  trigger?: 'inView' | 'mount';
  once?: boolean;
  /** For `inView`: a scrollable ancestor to track instead of the window viewport. */
  root?: RefObject<HTMLElement | null>;
  /** Per-child duration. Default `'base'`. */
  duration?: DurationToken;
  easing?: EasingToken;
  /** Seconds before the first child animates. Default `0`. */
  delay?: number;
  /** Rhythm between children. Default `'tight'` (a fast cascade). */
  stagger?: StaggerToken;
  /** Slide direction for each child. Default `'up'`; `'none'` fades with no transform. */
  from?: 'up' | 'down' | 'none';
  /** Travel distance for the slide. Default `'subtle'`. */
  distance?: DistanceToken;
  className?: string;
}

const offset = (from: 'up' | 'down' | 'none', d: number) =>
  from === 'up' ? { y: d } : from === 'down' ? { y: -d } : {};

/**
 * Cascades its direct children in as whole units — a faster, block-level cousin of `Stagger` tuned for
 * lists and stacked lines (where word-by-word reveals read sluggish). Each child slides + fades on the
 * active preset's stagger rhythm; under reduced motion the children render as-is with no transform.
 */
export function LineStagger({
  children,
  trigger = 'inView',
  once = true,
  root,
  duration = 'base',
  easing = 'entrance',
  delay = 0,
  stagger = 'tight',
  from = 'up',
  distance = 'subtle',
  className,
}: LineStaggerProps) {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        delayChildren: delay,
        staggerChildren: reduced ? 0 : tokens.stagger[stagger] / 1000,
      },
    },
  };
  const item: Variants = {
    hidden: reduced ? { opacity: 0 } : { opacity: 0, ...offset(from, tokens.distance[distance]) },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: tokens.duration[duration] / 1000, ease: [...tokens.easing[easing]] },
    },
  };

  const animateProps =
    trigger === 'mount'
      ? ({ animate: 'show' } as const)
      : ({ whileInView: 'show', viewport: { once, amount: 0.2, root } } as const);

  return (
    <motion.div className={className} variants={container} initial="hidden" {...animateProps}>
      {Children.map(children, (child) => (
        <motion.div variants={item}>{child}</motion.div>
      ))}
    </motion.div>
  );
}
