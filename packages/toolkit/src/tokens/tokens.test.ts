import { describe, expect, it } from 'vitest';
import { presets, presetNames, resolveTokens, defaultTokens } from './presets';
import { motionVars } from './css-vars';
import { resolveEntrance } from '../hooks/use-entrance';
import type { MotionTokens } from './tokens.schema';

describe('motion presets', () => {
  it('defines all three personalities', () => {
    expect([...presetNames].sort()).toEqual(['calm', 'expressive', 'snappy']);
    expect(Object.keys(presets).sort()).toEqual(['calm', 'expressive', 'snappy']);
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

  it('the three presets actually feel different (distinct on every axis)', () => {
    const { calm, snappy, expressive } = presets;
    // snappy is faster than calm; expressive sits between
    expect(snappy.duration.base).toBeLessThan(expressive.duration.base);
    expect(expressive.duration.base).toBeLessThan(calm.duration.base);
    // snappy springs are stiffer; expressive springs bounce (lower damping)
    expect(snappy.spring.bouncy.stiffness).toBeGreaterThan(calm.spring.bouncy.stiffness);
    expect(expressive.spring.bouncy.damping).toBeLessThan(calm.spring.bouncy.damping);
    // only expressive overshoots (easing control point y > 1)
    expect(expressive.easing.entrance[1]).toBeGreaterThan(1);
    expect(calm.easing.entrance[1]).toBeLessThanOrEqual(1);
  });

  it('resolveTokens returns the matching set', () => {
    expect(resolveTokens('snappy')).toBe(presets.snappy);
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

describe('resolveEntrance (token + reduced-motion resolution)', () => {
  const tokens: MotionTokens = presets.expressive;

  it('switching preset changes the resolved transition with zero option changes', () => {
    const calmT = resolveEntrance(presets.calm, false).transition;
    const snappyT = resolveEntrance(presets.snappy, false).transition;
    expect(calmT.duration).not.toBe(snappyT.duration);
  });

  it('applies travel offset by direction in normal mode', () => {
    const up = resolveEntrance(tokens, false, { from: 'up', distance: 'dramatic' });
    expect(up.initial).toMatchObject({ opacity: 0, y: tokens.distance.dramatic });
    const left = resolveEntrance(tokens, false, { from: 'left' });
    expect(left.initial).toMatchObject({ x: tokens.distance.base });
  });

  it('collapses to an opacity-only fade under reduced motion', () => {
    const r = resolveEntrance(tokens, true, { from: 'up', distance: 'dramatic' });
    expect(r.initial).toEqual({ opacity: 0 });
    expect(r.animate).toEqual({ opacity: 1 });
    expect(r.initial).not.toHaveProperty('y');
    expect(r.initial).not.toHaveProperty('x');
  });
});
