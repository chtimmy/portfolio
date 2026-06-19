'use client';

import { Children, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import type { MotionValue } from 'motion/react';
import type { ReactNode, RefObject } from 'react';
import { useReducedMotion } from '../provider';

export interface ScrollStackProps {
  /** Each top-level child becomes one card in the stack. */
  children: ReactNode;
  /** Track scroll within this element instead of the window (e.g. a scrollable panel). */
  root?: RefObject<HTMLElement | null>;
  /** Where cards pin from the top of the scroll container, in px. Default `48`. */
  topOffset?: number;
  /** Per-card stack peek — each card pins this many px lower than the last. Default `24`. */
  gap?: number;
  /** How much each covered card shrinks as the next overlaps it (0–0.2). Default `0.04`. */
  scaleStep?: number;
  /**
   * Minimum height for each card so a single card dominates its scroll viewport and the stack reads
   * one-at-a-time. Any CSS length (e.g. `'85vh'`, `480`). Default `'85vh'`. Cards still grow past it
   * for taller content. Ignored under reduced motion (plain document).
   */
  minCardHeight?: number | string;
  className?: string;
}

/**
 * A sticky stacking-cards scroller: each child pins in place while the next scrolls up and overlaps
 * it, and the covered card scales down (gaining a soft shadow) so the stack reads as depth. The last
 * card stays full size. Scroll up and the motion reverses. Under reduced motion it degrades to a plain
 * vertical stack — every card fully visible, no pinning or scaling.
 */
export function ScrollStack({
  children,
  root,
  topOffset = 48,
  gap = 24,
  scaleStep = 0.04,
  minCardHeight = '85vh',
  className,
}: ScrollStackProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const cards = Children.toArray(children);

  // One eased timeline for the whole stack; each card scales over its own slice of it.
  const { scrollYProgress } = useScroll({
    target: ref,
    ...(root ? { container: root } : {}),
    offset: ['start start', 'end end'],
  });

  if (reduced) {
    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: gap + 16 }}>
        {cards.map((card, i) => (
          <div key={i}>{card}</div>
        ))}
      </div>
    );
  }

  const n = cards.length;
  return (
    <div ref={ref} className={className}>
      {cards.map((card, i) => (
        <StackCard
          key={i}
          progress={scrollYProgress}
          // shrink starts when card i begins to be covered (its slice of the timeline) and runs to the end.
          range={[i / Math.max(n, 1), 1]}
          // earlier cards shrink more; the last card (i = n-1) stays at scale 1.
          targetScale={1 - (n - 1 - i) * scaleStep}
          top={topOffset + i * gap}
          minHeight={minCardHeight}
        >
          {card}
        </StackCard>
      ))}
    </div>
  );
}

function StackCard({
  children,
  progress,
  range,
  targetScale,
  top,
  minHeight,
}: {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
  top: number;
  minHeight: number | string;
}) {
  const scale = useTransform(progress, range, [1, targetScale]);
  return (
    <div style={{ position: 'sticky', top, paddingBottom: 24 }}>
      <motion.div
        style={{
          scale,
          transformOrigin: 'top center',
          borderRadius: 'inherit',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          // grid + minHeight stretches the (single) card child to fill, so one card dominates the view.
          display: 'grid',
          minHeight,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
