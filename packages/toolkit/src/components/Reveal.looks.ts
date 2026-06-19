import type { LookTable } from '../looks/looks.schema';
import type { RevealFrom, RevealVariant } from '../hooks/use-reveal';
import type { DistanceToken, DurationToken, EasingToken } from '../tokens/tokens.schema';

/** The motion-relevant props of `Reveal` a look can preset. */
export interface RevealMotion {
  variant: RevealVariant;
  from: RevealFrom;
  duration: DurationToken;
  easing: EasingToken;
  distance: DistanceToken;
}

/**
 * Reference look table for `Reveal` — the worked example that validates the variant system.
 * Intentionally minimal: the real, personal look library lands once the design language is set.
 */
export const revealLooks: LookTable<RevealMotion> = {
  editorial: {
    description: 'Slow, composed fade-up — a magazine entrance.',
    motion: { variant: 'slide', from: 'up', duration: 'cinematic', easing: 'entrance', distance: 'subtle' },
  },
};

/** Valid look names for `Reveal`. */
export type RevealLook = keyof typeof revealLooks;
