'use client';

import { motion } from 'motion/react';
import type { Transition } from 'motion/react';
import type { DurationToken, EasingToken } from '../tokens/tokens.schema';
import { useMotionTokens, useReducedMotion } from '../provider';
import { clamp } from '../utils/clamp';

export interface StatBarProps {
  /** Fill percentage, 0–100. */
  value: number;
  /** Optional label shown above the bar. */
  label?: string;
  /** Show the numeric percent on the right of the label row. Default `true`. */
  showValue?: boolean;
  duration?: DurationToken;
  easing?: EasingToken;
  /** Fill color. Defaults to `currentColor`. */
  color?: string;
  /** Bar thickness in pixels. Default `8`. */
  thickness?: number;
  /** Fill when scrolled into view (default) or on mount. */
  trigger?: 'inView' | 'mount';
  once?: boolean;
  className?: string;
}

/**
 * A horizontal bar that fills from 0 to `value`% using the active preset's duration and easing.
 * Under reduced motion it appears already filled (no grow). Pairs with `AnimatedNumber` for stats.
 */
export function StatBar({
  value,
  label,
  showValue = true,
  duration = 'slow',
  easing = 'entrance',
  color = 'currentColor',
  thickness = 8,
  trigger = 'inView',
  once = true,
  className,
}: StatBarProps) {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();
  const pct = clamp(value, 0, 100);
  const transition: Transition = {
    duration: tokens.duration[duration] / 1000,
    ease: [...tokens.easing[easing]],
  };

  const target = { width: `${pct}%` };
  const animateProps = reduced
    ? { animate: target }
    : trigger === 'mount'
      ? { animate: target }
      : { whileInView: target, viewport: { once, amount: 0.6 } };

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-baseline justify-between text-sm">
          {label ? <span>{label}</span> : <span />}
          {showValue && <span style={{ color }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div style={{ height: thickness, borderRadius: thickness, background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <motion.div
          initial={reduced ? target : { width: 0 }}
          transition={transition}
          style={{ height: '100%', borderRadius: thickness, background: color }}
          {...animateProps}
        />
      </div>
    </div>
  );
}
