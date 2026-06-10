'use client';

import { motion } from 'motion/react';
import type { Transition, Variants } from 'motion/react';
import type {
  DistanceToken,
  DurationToken,
  EasingToken,
  StaggerToken,
} from '../tokens/tokens.schema';
import { useMotionTokens, useReducedMotion } from '../provider';
import { splitText } from '../utils/split-text';
import type { SplitBy } from '../utils/split-text';

export interface TextRevealProps {
  /** The text to animate. Kept as a string so it can be split and made accessible. */
  text: string;
  /** Granularity of the reveal. Default `'word'`. */
  by?: SplitBy;
  stagger?: StaggerToken;
  duration?: DurationToken;
  easing?: EasingToken;
  distance?: DistanceToken;
  /** Animate on scroll-into-view (default) or on mount. */
  trigger?: 'inView' | 'mount';
  once?: boolean;
  /** Element for the wrapper. Default `'span'`. */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3';
  className?: string;
}

/**
 * Reveals text by character / word / line, each unit cascading in on the active preset's stagger
 * rhythm. The split spans are hidden from assistive tech (the wrapper carries the full text as its
 * label) and the whole thing collapses to a single opacity fade under reduced motion.
 */
export function TextReveal({
  text,
  by = 'word',
  stagger = 'base',
  duration = 'base',
  easing = 'entrance',
  distance = 'subtle',
  trigger = 'inView',
  once = true,
  as = 'span',
  className,
}: TextRevealProps) {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();
  const units = splitText(text, by);

  const transition: Transition = {
    duration: tokens.duration[duration] / 1000,
    ease: [...tokens.easing[easing]],
  };

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : tokens.stagger[stagger] / 1000 } },
  };
  const item: Variants = {
    hidden: reduced ? { opacity: 0 } : { opacity: 0, y: tokens.distance[distance] },
    show: { opacity: 1, y: 0, transition },
  };

  const MotionTag = motion[as];
  const animateProps =
    trigger === 'mount'
      ? ({ animate: 'show' } as const)
      : ({ whileInView: 'show', viewport: { once, amount: 0.3 } } as const);

  return (
    <MotionTag
      className={className}
      aria-label={text}
      variants={container}
      initial="hidden"
      {...animateProps}
    >
      {units.map((unit, i) => (
        <motion.span
          key={`${unit}-${i}`}
          variants={item}
          aria-hidden
          style={{ display: by === 'line' ? 'block' : 'inline-block', whiteSpace: 'pre' }}
        >
          {unit}
          {by === 'word' ? ' ' : ''}
        </motion.span>
      ))}
    </MotionTag>
  );
}
