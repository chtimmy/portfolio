import { describe, expect, it } from 'vitest';
import { presets, presetNames, resolveTokens, defaultTokens } from './presets';
import { motionVars } from './css-vars';
import { resolveReveal } from '../hooks/use-reveal';
import type { MotionTokens } from './tokens.schema';

describe('motion presets', () => {
  it('defines both personalities', () => {
    expect([...presetNames].sort()).toEqual(['calm', 'expressive']);
    expect(Object.keys(presets).sort()).toEqual(['calm', 'expressive']);
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

  it('durations are ordered ascending within each preset', () => {
    for (const name of presetNames) {
      const { instant, fast, base, slow, cinematic } = presets[name].duration;
      expect(instant).toBeLessThan(fast);
      expect(fast).toBeLessThan(base);
      expect(base).toBeLessThan(slow);
      expect(slow).toBeLessThan(cinematic);
    }
  });

  it('the two presets actually feel different (distinct on every axis)', () => {
    const { calm, expressive } = presets;
    // expressive is quicker than calm and travels farther
    expect(expressive.duration.base).toBeLessThan(calm.duration.base);
    expect(expressive.distance.base).toBeGreaterThan(calm.distance.base);
    // expressive springs bounce (lower damping); calm's don't
    expect(expressive.spring.bouncy.damping).toBeLessThan(calm.spring.bouncy.damping);
    // only expressive overshoots (easing control point y > 1)
    expect(expressive.easing.entrance[1]).toBeGreaterThan(1);
    expect(calm.easing.entrance[1]).toBeLessThanOrEqual(1);
  });

  it('resolveTokens returns the matching set', () => {
    expect(resolveTokens('expressive')).toBe(presets.expressive);
    expect(defaultTokens).toBe(presets.calm);
  });
});

describe('motionVars (CSS variables)', () => {
  it('emits unit-tagged custom properties and omits springs', () => {
    const vars = motionVars(presets.calm) as Record<string, string>;
    expect(vars['--umbra-duration-base']).toBe('440ms');
    expect(vars['--umbra-distance-base']).toBe('22px');
    expect(vars['--umbra-stagger-base']).toBe('130ms');
    expect(vars['--umbra-ease-standard']).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
    expect(Object.keys(vars).some((k) => k.includes('spring'))).toBe(false);
  });
});

describe('resolveReveal (token + reduced-motion resolution)', () => {
  const tokens: MotionTokens = presets.expressive;

  it('switching preset changes the resolved transition with zero option changes', () => {
    const calmT = resolveReveal(presets.calm, false).transition;
    const expressiveT = resolveReveal(presets.expressive, false).transition;
    expect(calmT.duration).not.toBe(expressiveT.duration);
  });

  it('slide applies travel offset by direction in normal mode', () => {
    const up = resolveReveal(tokens, false, { from: 'up', distance: 'dramatic' });
    expect(up.initial).toMatchObject({ opacity: 0, y: tokens.distance.dramatic });
    const left = resolveReveal(tokens, false, { from: 'left' });
    expect(left.initial).toMatchObject({ x: tokens.distance.base });
  });

  it('scale starts below 1 and ends at 1', () => {
    const r = resolveReveal(tokens, false, { variant: 'scale', distance: 'dramatic' });
    expect((r.initial as { scale: number }).scale).toBeLessThan(1);
    expect(r.animate).toMatchObject({ scale: 1 });
  });

  it('every variant collapses to an opacity-only fade under reduced motion', () => {
    for (const variant of ['fade', 'slide', 'scale'] as const) {
      const r = resolveReveal(tokens, true, { variant, from: 'up', distance: 'dramatic' });
      expect(r.initial).toEqual({ opacity: 0 });
      expect(r.animate).toEqual({ opacity: 1 });
      expect(r.initial).not.toHaveProperty('y');
      expect(r.initial).not.toHaveProperty('scale');
    }
  });
});
