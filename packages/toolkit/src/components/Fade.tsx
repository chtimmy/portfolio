'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import type { DistanceToken, DurationToken, EasingToken } from '../tokens/tokens.schema';
import { useEntrance } from '../hooks/use-entrance';

export interface FadeProps {
  children: ReactNode;
  /** Duration token key — resolved against the active preset, never a raw ms value. */
  duration?: DurationToken;
  /** Easing token key — resolved against the active preset. */
  easing?: EasingToken;
  /** Travel distance token key. */
  distance?: DistanceToken;
  /** Direction the element enters from. Default enters from below. */
  from?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

/**
 * Entrance fade — fades and slides content into place using the active preset's tokens. Reads
 * everything through `useEntrance`, so it carries no raw values and automatically collapses to an
 * opacity-only fade under reduced motion. The pattern every Phase 2 component follows.
 */
export function Fade({ children, duration, easing, distance, from, className }: FadeProps) {
  const entrance = useEntrance({ duration, easing, distance, from });

  return (
    <motion.div className={className} {...entrance}>
      {children}
    </motion.div>
  );
}
