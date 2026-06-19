'use client';

import { DotGrid, GrainOverlay } from '@umbra/motion';

/**
 * The space behind the orbit, composed from real Umbra backgrounds (the testbed payoff):
 * a constellation DotGrid network + a nebula wash, under a faint film grain. Returns a fragment so
 * DotGrid's parent is the positioned hero `<main>` (it tracks the cursor via that element).
 */
export function SpaceBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(60% 50% at 50% 40%, rgba(40,55,110,0.30), transparent 70%)',
        }}
      />
      <DotGrid
        variant="constellation"
        color="rgba(150,168,210,0.45)"
        gap={52}
        dotSize={1.4}
        linkDistance={130}
        influence={190}
        warp={30}
        centerFade={0.5}
      />
      <GrainOverlay opacity={0.1} color="#000" blendMode="overlay" />
    </>
  );
}
