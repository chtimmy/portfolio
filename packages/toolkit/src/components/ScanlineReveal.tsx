'use client';

import { Children, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import type { ReactNode, RefObject } from 'react';
import type { DurationToken, EasingToken, StaggerToken } from '../tokens/tokens.schema';
import { useMotionTokens, useReducedMotion } from '../provider';

export interface ScanlineRevealProps {
  children: ReactNode;
  /** Animate on scroll-into-view (default) or on mount. */
  trigger?: 'inView' | 'mount';
  once?: boolean;
  /** For `inView`: a scrollable ancestor to track instead of the window viewport. */
  root?: RefObject<HTMLElement | null>;
  /** Time for the scan line to traverse the block. Default `'slow'`. */
  duration?: DurationToken;
  easing?: EasingToken;
  /** Seconds before the line starts. Default `0`. */
  delay?: number;
  /** How far each child's light-up trails the line. Default `'loose'`. */
  stagger?: StaggerToken;
  /** Scan-line color. Default the accent token. */
  lineColor?: string;
  /** Accent box-shadow glow on the line. Default `true`. */
  glow?: boolean;
  className?: string;
}

/**
 * A scan line sweeps top→bottom while the children "develop" (dim → full) trailing behind it — like a
 * page resolving under a scanner. Each direct child starts faint and lights up on the preset's rhythm.
 * Under reduced motion the children render at full opacity with no scan line.
 */
export function ScanlineReveal({
  children,
  trigger = 'inView',
  once = true,
  root,
  duration = 'slow',
  easing = 'entrance',
  delay = 0,
  stagger = 'loose',
  lineColor = 'var(--accent)',
  glow = true,
  className,
}: ScanlineRevealProps) {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount: 0.2, root });
  const active = trigger === 'mount' || inView;

  const dur = tokens.duration[duration] / 1000;
  const step = tokens.stagger[stagger] / 1000;
  const ease = [...tokens.easing[easing]] as [number, number, number, number];

  return (
    <div ref={ref} className={className} style={{ position: 'relative' }}>
      {Children.map(children, (child, i) => (
        <motion.div
          initial={reduced ? false : { opacity: 0.1 }}
          animate={reduced ? { opacity: 1 } : active ? { opacity: 1 } : { opacity: 0.1 }}
          transition={{ duration: dur * 0.5, ease, delay: delay + i * step }}
        >
          {child}
        </motion.div>
      ))}

      {!reduced && (
        <motion.span
          aria-hidden
          style={{
            position: 'absolute',
            insetInline: 0,
            top: 0,
            height: 2,
            background: lineColor,
            boxShadow: glow ? `0 0 12px 1px ${lineColor}` : undefined,
            pointerEvents: 'none',
          }}
          initial={{ top: '0%', opacity: 0 }}
          animate={active ? { top: '100%', opacity: [0, 1, 1, 0] } : { top: '0%', opacity: 0 }}
          transition={{ duration: dur, ease, delay }}
        />
      )}
    </div>
  );
}
