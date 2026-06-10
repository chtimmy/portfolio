import { describe, expect, it } from 'vitest';
import { presets, defaultPreset } from './presets';
import type { PresetName } from './tokens.schema';

const presetNames: PresetName[] = ['calm', 'snappy', 'expressive'];

describe('motion presets', () => {
  it('defines all three personalities', () => {
    expect(Object.keys(presets).sort()).toEqual([...presetNames].sort());
  });

  it('every preset is a complete token set', () => {
    for (const name of presetNames) {
      const t = presets[name];
      expect(Object.keys(t.duration)).toEqual(['instant', 'fast', 'base', 'slow', 'cinematic']);
      expect(Object.keys(t.easing)).toEqual(['standard', 'entrance', 'exit', 'emphasized']);
      expect(Object.keys(t.spring)).toEqual(['gentle', 'snappy', 'bouncy']);
      expect(Object.keys(t.stagger)).toEqual(['tight', 'base', 'loose']);
      expect(Object.keys(t.distance)).toEqual(['subtle', 'base', 'dramatic']);
    }
  });

  it('durations are ordered ascending', () => {
    const { instant, fast, base, slow, cinematic } = defaultPreset.duration;
    expect(instant).toBeLessThan(fast);
    expect(fast).toBeLessThan(base);
    expect(base).toBeLessThan(slow);
    expect(slow).toBeLessThan(cinematic);
  });
});
