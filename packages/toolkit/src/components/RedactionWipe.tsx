'use client';

import { Children, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import type { ReactNode, RefObject } from 'react';
import type { DurationToken, EasingToken, StaggerToken } from '../tokens/tokens.schema';
import { useMotionTokens, useReducedMotion } from '../provider';

export interface RedactionWipeProps {
  children: ReactNode;
  /** Animate on scroll-into-view (default) or on mount. */
  trigger?: 'inView' | 'mount';
  once?: boolean;
  /** For `inView`: a scrollable ancestor to track instead of the window viewport. */
  root?: RefObject<HTMLElement | null>;
  /** Per-bar wipe duration. Default `'base'`. */
  duration?: DurationToken;
  easing?: EasingToken;
  /** Seconds before the first bar wipes. Default `0`. */
  delay?: number;
  /** Rhythm between bars. Default `'base'`. */
  stagger?: StaggerToken;
  /** Censor-bar fill. Default the deep surface token. */
  barColor?: string;
  /** Leading-edge accent on each bar. Default the accent token. */
  edgeColor?: string;
  className?: string;
}

/**
 * Reveals its direct children by sliding solid "censor bars" off them — the declassify beat. Each child
 * renders fully from the start beneath an `aria-hidden` bar that wipes away (`scaleX → 0`, anchored
 * right) on the preset's rhythm. Under reduced motion the bars are never rendered (content shows plainly).
 */
export function RedactionWipe({
  children,
  trigger = 'inView',
  once = true,
  root,
  duration = 'base',
  easing = 'entrance',
  delay = 0,
  stagger = 'base',
  barColor = 'var(--deep)',
  edgeColor = 'var(--accent)',
  className,
}: RedactionWipeProps) {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount: 0.2, root });
  const active = trigger === 'mount' || inView;

  const dur = tokens.duration[duration] / 1000;
  const step = tokens.stagger[stagger] / 1000;
  const ease = [...tokens.easing[easing]] as [number, number, number, number];

  return (
    <div ref={ref} className={className}>
      {Children.map(children, (child, i) => (
        <div style={{ position: 'relative' }}>
          {child}
          {!reduced && (
            <motion.span
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: barColor,
                borderRight: `2px solid ${edgeColor}`,
                transformOrigin: 'right',
                pointerEvents: 'none',
              }}
              initial={{ scaleX: 1 }}
              animate={active ? { scaleX: 0 } : { scaleX: 1 }}
              transition={{ duration: dur, ease, delay: delay + i * step }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
