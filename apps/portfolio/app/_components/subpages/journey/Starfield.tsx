'use client';

import { useMemo } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import type { MotionValue } from 'motion/react';

type ContainerRef = React.RefObject<HTMLElement | null>;

// Deterministic PRNG (mulberry32) so star positions are identical on server and client — no hydration
// drift, no first-paint reshuffle.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Star = { x: number; y: number; size: number; opacity: number };

// Far layers (small factor) move least with scroll; near layers move most. Low contrast throughout.
const LAYERS = [
  { count: 72, factor: 0.16, size: [1.2, 2.0] as const, opacity: [0.28, 0.5] as const, idle: 78 },
  { count: 48, factor: 0.36, size: [1.6, 2.6] as const, opacity: [0.4, 0.62] as const, idle: 58 },
  { count: 30, factor: 0.62, size: [2.2, 3.4] as const, opacity: [0.55, 0.8] as const, idle: 42 },
];

// px half-width kept star-free at the center (sized to the centered "SCROLL ↓" / title axis, not the
// full card column — cards sit in front, so stars are allowed to pass behind them and the title).
const CENTER_CLEAR = 120;
// Horizontal mask: solid (stars shown) at the viewport edges, fading to clear across the center column.
const CENTER_FADE = `linear-gradient(to right, black, transparent calc(50% - ${CENTER_CLEAR}px), transparent calc(50% + ${CENTER_CLEAR}px), black)`;

function makeStars(
  count: number,
  size: readonly [number, number],
  opacity: readonly [number, number],
  rand: () => number,
): Star[] {
  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    size: size[0] + rand() * (size[1] - size[0]),
    opacity: opacity[0] + rand() * (opacity[1] - opacity[0]),
  }));
}

/**
 * Right side-rail: low-contrast parallax star layers. Reads the SceneLightbox panel's scroll (not the
 * window) so it drifts with the case study. A faint constant idle drift keeps it alive when still.
 * Reduced motion → fully static. Purely atmospheric; never the loudest thing on screen.
 */
export function Starfield({
  scrollContainerRef,
  reduced,
}: {
  scrollContainerRef: ContainerRef;
  reduced: boolean;
}) {
  const layers = useMemo(() => {
    const rand = mulberry32(20260616);
    return LAYERS.map((l) => ({ ...l, stars: makeStars(l.count, l.size, l.opacity, rand) }));
  }, []);
  const { scrollYProgress } = useScroll({ container: scrollContainerRef });

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ WebkitMaskImage: CENTER_FADE, maskImage: CENTER_FADE }}
    >
      {layers.map((l, i) => (
        <StarLayer
          key={i}
          stars={l.stars}
          factor={l.factor}
          idle={l.idle}
          progress={scrollYProgress}
          reduced={reduced}
        />
      ))}
    </div>
  );
}

function StarLayer({
  stars,
  factor,
  idle,
  progress,
  reduced,
}: {
  stars: Star[];
  factor: number;
  idle: number;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const y = useTransform(progress, [0, 1], [0, reduced ? 0 : -300 * factor]);
  return (
    <motion.div className="absolute inset-0" style={{ y }}>
      <div
        className="absolute inset-0"
        style={reduced ? undefined : { animation: `starDrift ${idle}s ease-in-out infinite alternate` }}
      >
        {stars.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              background: 'var(--ice)',
              opacity: s.opacity,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
