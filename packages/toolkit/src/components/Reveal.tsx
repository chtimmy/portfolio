'use client';

import { motion } from 'motion/react';
import type { CSSProperties, ReactNode, RefObject } from 'react';
import type { DistanceToken, DurationToken, EasingToken } from '../tokens/tokens.schema';
import { useReveal } from '../hooks/use-reveal';
import type { RevealFrom, RevealVariant } from '../hooks/use-reveal';
import { applyLook } from '../looks/looks.schema';
import { revealLooks } from './Reveal.looks';
import type { RevealLook } from './Reveal.looks';

export interface RevealProps {
  children: ReactNode;
  /** Entrance style. Default `'slide'`. */
  variant?: RevealVariant;
  /** Slide direction. Default `'up'`. */
  from?: RevealFrom;
  duration?: DurationToken;
  easing?: EasingToken;
  distance?: DistanceToken;
  /**
   * A named "look" — an opinionated preset of the motion props above (and, where defined, styling).
   * Explicit props still win over the look. See `revealLooks`.
   */
  look?: RevealLook;
  /** Animate when scrolled into view (`'inView'`, default) or immediately on mount (`'mount'`). */
  trigger?: 'inView' | 'mount';
  /** For `inView`: only animate the first time it enters. Default `true`. */
  once?: boolean;
  /** For `inView`: a scrollable ancestor to track instead of the window viewport. */
  root?: RefObject<HTMLElement | null>;
  /** Extra delay in seconds before the entrance. */
  delay?: number;
  style?: CSSProperties;
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
  look,
  trigger = 'inView',
  once = true,
  root,
  delay,
  style,
  className,
}: RevealProps) {
  // A `look` presets the motion props (and may carry styling); explicit props still win.
  const merged = applyLook(revealLooks, look, { variant, from, duration, easing, distance });
  const { initial, animate, transition } = useReveal(merged.motion);
  const withDelay = delay ? { ...transition, delay } : transition;
  const cls = [merged.className, className].filter(Boolean).join(' ') || undefined;
  const mergedStyle = merged.style ? { ...merged.style, ...style } : style;

  if (trigger === 'mount') {
    return (
      <motion.div className={cls} style={mergedStyle} initial={initial} animate={animate} transition={withDelay}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cls}
      style={mergedStyle}
      initial={initial}
      whileInView={animate}
      viewport={{ once, amount: 0.3, root }}
      transition={withDelay}
    >
      {children}
    </motion.div>
  );
}
