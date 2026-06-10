'use client';

import type { Target, Transition } from 'motion/react';
import type {
  DistanceToken,
  DurationToken,
  EasingToken,
  MotionTokens,
} from '../tokens/tokens.schema';
import { useMotionTokens, useReducedMotion } from '../provider';

export interface EntranceOptions {
  /** Duration token key. Default `'base'`. */
  duration?: DurationToken;
  /** Easing token key. Default `'entrance'`. */
  easing?: EasingToken;
  /** Travel distance token key. Default `'base'`. */
  distance?: DistanceToken;
  /** Axis and sign of travel: elements slide in from this offset. Default `'up'` (enters from below). */
  from?: 'up' | 'down' | 'left' | 'right';
}

export interface EntranceAnimation {
  initial: Target;
  animate: Target;
  transition: Transition;
}

const offsetFor = (from: NonNullable<EntranceOptions['from']>, d: number): Target => {
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

/**
 * Pure resolver behind `useEntrance` — token keys + active tokens + reduced flag → a Motion
 * animation. The single place the "no raw values" rule and the reduced-motion fallback live: when
 * `reduced` is true the result collapses to an opacity-only fade (no transforms), per the system's
 * accessibility contract. Kept side-effect-free so it's testable without a DOM.
 */
export function resolveEntrance(
  tokens: MotionTokens,
  reduced: boolean,
  options: EntranceOptions = {},
): EntranceAnimation {
  const { duration = 'base', easing = 'entrance', distance = 'base', from = 'up' } = options;

  const transition: Transition = {
    duration: tokens.duration[duration] / 1000,
    ease: [...tokens.easing[easing]],
  };

  if (reduced) {
    return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition };
  }

  const offset = offsetFor(from, tokens.distance[distance]);
  return {
    initial: { opacity: 0, ...offset },
    animate: { opacity: 1, x: 0, y: 0 },
    transition,
  };
}

/**
 * Resolve an entrance animation from token keys against the active preset and reduced-motion
 * state. Thin React wrapper over {@link resolveEntrance}.
 */
export function useEntrance(options: EntranceOptions = {}): EntranceAnimation {
  return resolveEntrance(useMotionTokens(), useReducedMotion(), options);
}
