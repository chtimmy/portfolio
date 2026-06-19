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
import type { RevealFrom } from '../hooks/use-reveal';

export interface StaggerProps {
  children: ReactNode;
  /** Per-child rhythm token. Default `'base'`. */
  stagger?: StaggerToken;
  /** Direction each child enters from. Default `'up'`. */
  from?: RevealFrom;
  distance?: DistanceToken;
  duration?: DurationToken;
  easing?: EasingToken;
  /** Animate on scroll-into-view (default) or on mount. */
  trigger?: 'inView' | 'mount';
  once?: boolean;
  /** For `inView`: a scrollable ancestor to track instead of the window viewport. */
  root?: RefObject<HTMLElement | null>;
  className?: string;
}

const offset = (from: RevealFrom, d: number) =>
  from === 'up'
    ? { y: d }
    : from === 'down'
      ? { y: -d }
      : from === 'left'
        ? { x: d }
        : { x: -d };

/**
 * Cascades its direct children into view on the active preset's stagger rhythm. Each child is
 * wrapped in a motion element with shared entrance variants; under reduced motion the cascade
 * collapses to a simultaneous opacity fade (stagger and transforms removed).
 */
export function Stagger({
  children,
  stagger = 'base',
  from = 'up',
  distance = 'base',
  duration = 'base',
  easing = 'entrance',
  trigger = 'inView',
  once = true,
  root,
  className,
}: StaggerProps) {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : tokens.stagger[stagger] / 1000 } },
  };
  const item: Variants = {
    hidden: reduced ? { opacity: 0 } : { opacity: 0, ...offset(from, tokens.distance[distance]) },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: tokens.duration[duration] / 1000, ease: [...tokens.easing[easing]] },
    },
  };

  const animateProps =
    trigger === 'mount'
      ? ({ animate: 'show' } as const)
      : ({ whileInView: 'show', viewport: { once, amount: 0.2, root } } as const);

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      {...animateProps}
    >
      {Children.map(children, (child) => (
        <motion.div variants={item}>{child}</motion.div>
      ))}
    </motion.div>
  );
}
