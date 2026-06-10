import type { PresetName } from '@umbra/motion';

/** Per-preset display metadata: the accent color and a one-line personality. */
export const META: Record<PresetName, { accent: string; tagline: string }> = {
  calm: { accent: '#5b6b8c', tagline: 'Composed. Unhurried. Premium.' },
  expressive: { accent: '#e0457b', tagline: 'Playful. Bouncy. Alive.' },
};
