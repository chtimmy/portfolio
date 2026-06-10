/**
 * Motion token system — the CONTRACT.
 *
 * This file defines the *shape* of Umbra's animation language: the named scales every
 * component reads from instead of hardcoding raw durations/easings. It is types-only; the concrete
 * values for each preset (`calm` / `expressive`) live in `presets.ts`, so the rest of the system
 * builds against a stable contract.
 *
 * Rule enforced by this contract: components never write a raw duration or easing — they read a
 * token key (e.g. `duration.base`, `easing.standard`) and the active preset supplies the value.
 */

/** Named steps on each scale. Keep these stable — components reference them by key. */
export type DurationToken = 'instant' | 'fast' | 'base' | 'slow' | 'cinematic';
export type EasingToken = 'standard' | 'entrance' | 'exit' | 'emphasized';
export type SpringToken = 'gentle' | 'snappy' | 'bouncy';
export type StaggerToken = 'tight' | 'base' | 'loose';
export type DistanceToken = 'subtle' | 'base' | 'dramatic';

/** The motion personalities a consumer can switch between. */
export type PresetName = 'calm' | 'expressive';

/** Durations in milliseconds, keyed by the named scale. */
export type DurationScale = Record<DurationToken, number>;

/** Easings as cubic-bezier control points `[x1, y1, x2, y2]` (Motion-compatible). */
export type EasingScale = Record<EasingToken, readonly [number, number, number, number]>;

/** Spring physics presets (Motion `type: 'spring'` configs). */
export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}
export type SpringScale = Record<SpringToken, SpringConfig>;

/** Per-child delay (in milliseconds) for orchestrated/cascading children. */
export type StaggerScale = Record<StaggerToken, number>;

/** How far elements travel on entrance/exit, in pixels. */
export type DistanceScale = Record<DistanceToken, number>;

/** A fully-resolved set of motion tokens — what `MotionProvider` injects for the active preset. */
export interface MotionTokens {
  duration: DurationScale;
  easing: EasingScale;
  spring: SpringScale;
  stagger: StaggerScale;
  distance: DistanceScale;
}

/** The complete preset table: one fully-resolved `MotionTokens` per personality. */
export type MotionPresets = Record<PresetName, MotionTokens>;
