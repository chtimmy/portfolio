'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { animate, motion, useInView, useMotionValue, useTransform } from 'motion/react';
import type { DurationToken, EasingToken } from '../tokens/tokens.schema';
import { useMotionTokens, useReducedMotion } from '../provider';

export interface AnimatedNumberProps {
  /** Target value to count to. */
  value: number;
  /** Starting value. Default `0`. */
  from?: number;
  duration?: DurationToken;
  easing?: EasingToken;
  /** Format the displayed number. Default rounds to a locale integer string. */
  format?: (n: number) => string;
  /** Count when scrolled into view (default) or on mount. */
  trigger?: 'inView' | 'mount';
  once?: boolean;
  /** For `inView`: a scrollable ancestor to track instead of the window viewport. */
  root?: RefObject<HTMLElement | null>;
  className?: string;
}

const defaultFormat = (n: number) => Math.round(n).toLocaleString();

/**
 * Counts from `from` to `value` using the active preset's duration and easing. Under reduced motion
 * it jumps straight to the final value (no count). The displayed text always ends exactly on
 * `value`, so it's safe for real figures.
 */
export function AnimatedNumber({
  value,
  from = 0,
  duration = 'slow',
  easing = 'standard',
  format = defaultFormat,
  trigger = 'inView',
  once = true,
  root,
  className,
}: AnimatedNumberProps) {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once, amount: 0.5, root });
  const active = trigger === 'mount' || inView;

  const count = useMotionValue(from);
  const text = useTransform(count, (n) => format(n));

  useEffect(() => {
    // Out of view (only possible when once=false): reset so it re-counts on scroll back in.
    if (!active) {
      count.set(from);
      return;
    }
    if (reduced) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, {
      duration: tokens.duration[duration] / 1000,
      ease: [...tokens.easing[easing]],
    });
    return () => controls.stop();
  }, [active, reduced, value, from, count, tokens, duration, easing]);

  return (
    <motion.span ref={ref} className={className}>
      {text}
    </motion.span>
  );
}
