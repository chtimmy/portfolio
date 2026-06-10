import type { MotionPresets, MotionTokens } from './tokens.schema';

/**
 * PLACEHOLDER preset values — Phase 0 only.
 *
 * These exist so the schema is exercised by real data and the dummy component has something to
 * animate. Phase 1 ("the motion token system") replaces these with deliberately-tuned values and
 * a `MotionProvider`. Treat the numbers here as throwaway.
 */

const calm: MotionTokens = {
  duration: { instant: 0, fast: 150, base: 300, slow: 500, cinematic: 900 },
  easing: {
    standard: [0.4, 0, 0.2, 1],
    entrance: [0, 0, 0.2, 1],
    exit: [0.4, 0, 1, 1],
    emphasized: [0.2, 0, 0, 1],
  },
  spring: {
    gentle: { stiffness: 120, damping: 20, mass: 1 },
    snappy: { stiffness: 300, damping: 24, mass: 1 },
    bouncy: { stiffness: 400, damping: 12, mass: 1 },
  },
  stagger: { tight: 40, base: 80, loose: 140 },
  distance: { subtle: 8, base: 24, dramatic: 64 },
};

// Phase 0 placeholders: snappy/expressive reuse calm's shape until Phase 1 differentiates them.
const snappy: MotionTokens = calm;
const expressive: MotionTokens = calm;

export const presets: MotionPresets = { calm, snappy, expressive };

/** The preset used until `MotionProvider` lands in Phase 1. */
export const defaultPreset = presets.calm;
