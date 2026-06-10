import type { CSSProperties } from 'react';
import type { MotionTokens } from './tokens.schema';

/**
 * Expose a resolved token set as CSS custom properties, so the animation language works *without*
 * Motion or React — e.g. a plain CSS `transition: opacity var(--umbra-duration-base) var(--umbra-ease-standard)`.
 *
 * Springs are intentionally omitted: they aren't a CSS concept. Durations and stagger are emitted
 * with `ms` units, distances with `px`, easings as `cubic-bezier(...)`.
 */
export function motionVars(tokens: MotionTokens): CSSProperties {
  const vars: Record<string, string> = {};

  for (const [key, ms] of Object.entries(tokens.duration)) {
    vars[`--umbra-duration-${key}`] = `${ms}ms`;
  }
  for (const [key, ms] of Object.entries(tokens.stagger)) {
    vars[`--umbra-stagger-${key}`] = `${ms}ms`;
  }
  for (const [key, px] of Object.entries(tokens.distance)) {
    vars[`--umbra-distance-${key}`] = `${px}px`;
  }
  for (const [key, [x1, y1, x2, y2]] of Object.entries(tokens.easing)) {
    vars[`--umbra-ease-${key}`] = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
  }

  return vars as CSSProperties;
}
