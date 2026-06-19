'use client';

import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { PointerEvent, ReactNode } from 'react';
import type { DurationToken, EasingToken } from '../tokens/tokens.schema';
import { useMotionTokens, useReducedMotion } from '../provider';
import { clamp } from '../utils/clamp';

export interface OutlineTraceProps {
  children: ReactNode;
  /** Stroke color of the traced outline. Default the accent token. */
  color?: string;
  /** Corner radius (px). Defaults large so pills trace fully; clamped to half the short side. */
  radius?: number;
  /** Outline thickness (px). Default `1.5`. */
  strokeWidth?: number;
  /** Time for the line to trace the full perimeter. Default `'base'`. */
  duration?: DurationToken;
  easing?: EasingToken;
  /** Accent `drop-shadow` glow on the line. Default `false`. */
  glow?: boolean;
  className?: string;
}

/**
 * Draws an outline that starts at one point and traces around the child's border while hovered, then
 * retracts on leave — a crisp pointer affordance for buttons and links. The child is measured on
 * pointer-enter so the outline matches any size/radius (pass a small `radius` for rounded rects, leave
 * the default for pills). Under reduced motion the outline appears/disappears instantly (no draw).
 */
export function OutlineTrace({
  children,
  color = 'var(--accent)',
  radius = 999,
  strokeWidth = 1.5,
  duration = 'base',
  easing = 'standard',
  glow = false,
  className,
}: OutlineTraceProps) {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  const enter = (e: PointerEvent<HTMLSpanElement>) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setSize({ w: r.width, h: r.height });
    setHovered(true);
  };
  const leave = () => setHovered(false);

  const sw = strokeWidth;
  const rx = size ? clamp(radius, 0, Math.min(size.w, size.h) / 2) : radius;
  const dur = tokens.duration[duration] / 1000;
  const ease = [...tokens.easing[easing]] as [number, number, number, number];

  return (
    <span
      ref={ref}
      className={className}
      onPointerEnter={enter}
      onPointerLeave={leave}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {children}
      {size && (
        <svg
          aria-hidden
          width={size.w}
          height={size.h}
          style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
        >
          <motion.rect
            x={sw / 2}
            y={sw / 2}
            width={size.w - sw}
            height={size.h - sw}
            rx={rx}
            fill="none"
            stroke={color}
            strokeWidth={sw}
            style={{ filter: glow ? `drop-shadow(0 0 4px ${color})` : undefined }}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={hovered ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: dur, ease }}
          />
        </svg>
      )}
    </span>
  );
}
