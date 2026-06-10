'use client';

import type { Target, Transition } from 'motion/react';
import type {
  DistanceToken,
  DurationToken,
  EasingToken,
  MotionTokens,
} from '../tokens/tokens.schema';
import { useMotionTokens, useReducedMotion } from '../provider';

export type RevealVariant = 'fade' | 'slide' | 'scale';
export type RevealFrom = 'up' | 'down' | 'left' | 'right';

export interface RevealOptions {
  /** How the element enters. Default `'slide'`. */
  variant?: RevealVariant;
  /** Slide direction (used by `slide`). Default `'up'` (enters from below). */
  from?: RevealFrom;
  /** Duration token key. Default `'base'`. */
  duration?: DurationToken;
  /** Easing token key. Default `'entrance'`. */
  easing?: EasingToken;
  /** Travel distance (slide) token key. Default `'base'`. */
  distance?: DistanceToken;
}

export interface RevealAnimation {
  initial: Target;
  animate: Target;
  transition: Transition;
}

const slideOffset = (from: RevealFrom, d: number): Target => {
  switch (from) {
    case 'up':
      return { y: d };
    case 'down':
      return { y: -d };
    case 'left':
      return { x: d };
    case 'right':
      return { x: -d };
  }
};

// Bigger travel distance → more pronounced scale-in.
const scaleFor = (distance: DistanceToken): number =>
  distance === 'subtle' ? 0.96 : distance === 'dramatic' ? 0.8 : 0.9;

/**
 * Pure resolver behind `useReveal` — variant + token keys + active tokens + reduced flag → a Motion
 * animation. Holds the "no raw values" rule and the reduced-motion fallback in one place: when
 * `reduced` is true, every variant collapses to an opacity-only fade. Side-effect-free for testing.
 */
export function resolveReveal(
  tokens: MotionTokens,
  reduced: boolean,
  options: RevealOptions = {},
): RevealAnimation {
  const { variant = 'slide', from = 'up', duration = 'base', easing = 'entrance', distance = 'base' } =
    options;

  const transition: Transition = {
    duration: tokens.duration[duration] / 1000,
    ease: [...tokens.easing[easing]],
  };

  if (reduced) {
    return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition };
  }

  switch (variant) {
    case 'fade':
      return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition };
    case 'scale':
      return {
        initial: { opacity: 0, scale: scaleFor(distance) },
        animate: { opacity: 1, scale: 1 },
        transition,
      };
    case 'slide':
      return {
        initial: { opacity: 0, ...slideOffset(from, tokens.distance[distance]) },
        animate: { opacity: 1, x: 0, y: 0 },
        transition,
      };
  }
}

/** Resolve a reveal animation from token keys against the active preset and reduced-motion state. */
export function useReveal(options: RevealOptions = {}): RevealAnimation {
  return resolveReveal(useMotionTokens(), useReducedMotion(), options);
}
