import { describe, expect, it } from 'vitest';
import { clamp } from './clamp';

describe('clamp', () => {
  it('passes values within range through', () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it('clamps to the bounds', () => {
    expect(clamp(-10, 0, 100)).toBe(0);
    expect(clamp(150, 0, 100)).toBe(100);
  });
});
