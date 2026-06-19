import type { CSSProperties } from 'react';

/**
 * The variant system — "looks". A look is an opinionated, named recipe layered on top of a primitive
 * (the third layer, above presets and primitives). It carries two things:
 *
 *  - `motion` — a recipe of **token keys** for the component (duration/easing/distance/…). Because
 *    it's token-keyed, a look still re-feels when the active preset changes. The "no raw values"
 *    rule stays intact for motion.
 *  - `style` / `className` — **concrete, curated visual values** (color, shadow, blur, radius, …).
 *    Looks are the *sanctioned* home for literal design values; primitives stay presentation-neutral.
 *
 * Visuals are expressed framework-agnostically (inline style / CSS vars / the toolkit's own
 * `styles.css`), never Tailwind — the library must not assume it.
 *
 * NOTE: infrastructure only for now — the concrete look library is intentionally a placeholder while
 * the design language is researched.
 */
export interface Look<TMotion = Record<string, unknown>> {
  /** Short human description of the look. */
  description?: string;
  /** Token-keyed motion recipe for the component (still preset-driven). */
  motion?: Partial<TMotion>;
  /** Concrete visual styling applied to the component root. */
  style?: CSSProperties;
  /** Extra className applied to the component root. */
  className?: string;
}

/** A component's named looks, keyed by look name. */
export type LookTable<TMotion = Record<string, unknown>> = Record<string, Look<TMotion>>;

export interface ResolvedLook<TMotion> {
  motion: Partial<TMotion>;
  style?: CSSProperties;
  className?: string;
}

/**
 * Merge a named look into a component's explicit props. Explicit (caller-provided, defined) props
 * always win over the look's motion recipe, so a look is a default a consumer can still override.
 */
export function applyLook<TMotion extends Record<string, unknown>>(
  table: LookTable<TMotion> | undefined,
  look: string | undefined,
  explicit: Partial<TMotion>,
): ResolvedLook<TMotion> {
  const chosen = look && table ? table[look] : undefined;
  if (!chosen) return { motion: explicit };

  const motion: Record<string, unknown> = { ...(chosen.motion ?? {}) };
  for (const key in explicit) {
    if (explicit[key] !== undefined) motion[key] = explicit[key];
  }
  return { motion: motion as Partial<TMotion>, style: chosen.style, className: chosen.className };
}
