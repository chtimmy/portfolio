import type { MotionPresets, MotionTokens, PresetName } from './tokens.schema';

/**
 * The three motion personalities. Switching the active preset re-feels every component at once —
 * this table is the heart of the system. Each preset is deliberately distinct on *every* axis
 * (duration, easing, spring, stagger, distance) so the difference is unmistakable.
 *
 * - calm       — composed, premium, unhurried. Long durations, pure decelerate, no overshoot.
 * - snappy     — precise, product-grade. Short durations, stiff near-critical springs, tight rhythm.
 * - expressive — playful, alive. Back-out overshoot + anticipation, bouncy springs, bigger travel.
 *
 * Durations are ms, distances px, stagger ms-per-child. Easings are cubic-bezier control points;
 * `expressive` intentionally uses points outside [0,1] for overshoot/anticipation.
 */

const calm: MotionTokens = {
  duration: { instant: 0, fast: 240, base: 440, slow: 680, cinematic: 1100 },
  easing: {
    standard: [0.4, 0, 0.2, 1],
    entrance: [0.16, 1, 0.3, 1], // smooth expo-out, decelerate into place
    exit: [0.4, 0, 1, 1],
    emphasized: [0.7, 0, 0.3, 1], // slow, symmetric in-out
  },
  spring: {
    gentle: { stiffness: 120, damping: 28, mass: 1 },
    snappy: { stiffness: 220, damping: 30, mass: 1 },
    bouncy: { stiffness: 260, damping: 22, mass: 1 },
  },
  stagger: { tight: 70, base: 130, loose: 220 },
  distance: { subtle: 8, base: 22, dramatic: 52 },
};

const snappy: MotionTokens = {
  duration: { instant: 0, fast: 110, base: 200, slow: 320, cinematic: 520 },
  easing: {
    standard: [0.2, 0, 0, 1], // quick decelerate
    entrance: [0.1, 0.9, 0.2, 1],
    exit: [0.4, 0, 1, 1],
    emphasized: [0.5, 0, 0.1, 1],
  },
  spring: {
    gentle: { stiffness: 320, damping: 32, mass: 1 },
    snappy: { stiffness: 500, damping: 34, mass: 1 },
    bouncy: { stiffness: 650, damping: 26, mass: 1 },
  },
  stagger: { tight: 25, base: 50, loose: 90 },
  distance: { subtle: 6, base: 14, dramatic: 36 },
};

const expressive: MotionTokens = {
  duration: { instant: 0, fast: 180, base: 360, slow: 600, cinematic: 950 },
  easing: {
    standard: [0.34, 1.56, 0.64, 1], // back-out overshoot
    entrance: [0.34, 1.56, 0.64, 1],
    exit: [0.36, 0, 0.66, -0.4], // anticipate (dip back before leaving)
    emphasized: [0.68, -0.55, 0.27, 1.55], // anticipate + overshoot
  },
  spring: {
    gentle: { stiffness: 180, damping: 16, mass: 1 },
    snappy: { stiffness: 320, damping: 15, mass: 1 },
    bouncy: { stiffness: 480, damping: 10, mass: 1 }, // real bounce
  },
  stagger: { tight: 55, base: 110, loose: 200 },
  distance: { subtle: 14, base: 36, dramatic: 88 },
};

export const presets: MotionPresets = { calm, snappy, expressive };

/** All preset names, in display order (restrained → bold). */
export const presetNames: PresetName[] = ['calm', 'snappy', 'expressive'];

/** The default personality when no preset is specified. */
export const defaultPresetName: PresetName = 'calm';

/** Pure resolver: preset name → its fully-resolved token set. Safe for SSR and tests. */
export function resolveTokens(preset: PresetName): MotionTokens {
  return presets[preset];
}

/** The token set for the default preset. */
export const defaultTokens: MotionTokens = presets[defaultPresetName];
