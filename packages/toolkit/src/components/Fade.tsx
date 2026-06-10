'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import type { DurationToken, EasingToken } from '../tokens/tokens.schema';
import { defaultPreset } from '../tokens/presets';

export interface FadeProps {
  children: ReactNode;
  /** Duration token key — resolved against the active preset, never a raw ms value. */
  duration?: DurationToken;
  /** Easing token key — resolved against the active preset. */
  easing?: EasingToken;
  className?: string;
}

/**
 * Dummy token-driven component for Phase 0.
 *
 * Its only job is to prove the workspace boundary: it lives in the toolkit, is imported by both
 * apps, and reads from the token contract rather than hardcoding durations/easings. Phase 2
 * replaces it with the real `Reveal` family; until then it demonstrates the pattern every
 * component must follow.
 */
export function Fade({ children, duration = 'base', easing = 'standard', className }: FadeProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: defaultPreset.distance.subtle }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: defaultPreset.duration[duration] / 1000,
        ease: defaultPreset.easing[easing],
      }}
    >
      {children}
    </motion.div>
  );
}
