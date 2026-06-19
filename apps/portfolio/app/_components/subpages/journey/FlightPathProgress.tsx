'use client';

import { useCallback, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  useVelocity,
} from 'motion/react';
import type { CaseStudyStep } from '../../../_data/caseStudies';

type ContainerRef = React.RefObject<HTMLElement | null>;

const PAD = 12; // % of rail height reserved top & bottom so the path doesn't touch the edges
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Left side-rail: a vertical flight path with one planet node per case-study step and a rocket marker
 * that tracks the SceneLightbox panel's scroll. Nodes are clickable (smooth-scroll to that section);
 * everything else is `pointer-events-none`. Reduced motion → rocket sits at its progress position with
 * no bob/thruster, and node clicks jump instantly. Quiet and functional — sits in the gutter.
 */
export function FlightPathProgress({
  steps,
  scrollContainerRef,
  reduced,
}: {
  steps: CaseStudyStep[];
  scrollContainerRef: ContainerRef;
  reduced: boolean;
}) {
  const n = steps.length;
  const denom = Math.max(n - 1, 1);
  const { scrollYProgress } = useScroll({ container: scrollContainerRef });

  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setActive(Math.round(clamp(v, 0, 1) * denom));
  });

  const rocketTop = useTransform(scrollYProgress, [0, 1], [`${PAD}%`, `${100 - PAD}%`]);
  const fillHeight = useTransform(scrollYProgress, [0, 1], ['0%', `${100 - 2 * PAD}%`]);

  // Thruster reacts to scroll speed; idle → short & faint.
  const velocity = useVelocity(scrollYProgress);
  const trailLen = useTransform(velocity, [-0.4, 0, 0.4], [44, 7, 44]);
  const trailLenSide = useTransform(velocity, [-0.4, 0, 0.4], [30, 5, 30]);
  const trailOpacity = useTransform(velocity, [-0.4, 0, 0.4], [0.8, 0.5, 0.8]);

  // Flip the rocket to lead nose-first: nose down when scrolling down, nose up when scrolling back up.
  // A small deadzone keeps scroll jitter from flipping it; near-idle keeps the last heading.
  const [goingUp, setGoingUp] = useState(false);
  useMotionValueEvent(velocity, 'change', (v) => {
    if (v > 0.03) setGoingUp(false);
    else if (v < -0.03) setGoingUp(true);
  });

  const scrollToStep = useCallback(
    (i: number) => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const el = container.querySelector<HTMLElement>(`#cs-step-${i}`);
      if (!el) return;
      // offsetTop is the *layout* position — unaffected by the sticky pin / scale transforms — so it
      // gives the section's true scroll offset within the panel.
      let top = 0;
      let node: HTMLElement | null = el;
      while (node && node !== container) {
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      container.scrollTo({ top: Math.max(0, top - 28), behavior: reduced ? 'auto' : 'smooth' });
    },
    [scrollContainerRef, reduced],
  );

  return (
    <div className="pointer-events-none absolute inset-y-0 left-4 flex w-24 justify-center">
      <div className="relative h-full w-px">
        {/* base path */}
        <div
          className="absolute left-1/2 w-[6px] -translate-x-1/2 rounded-full"
          style={{
            top: `${PAD}%`,
            bottom: `${PAD}%`,
            background: 'color-mix(in srgb, var(--accent) 20%, transparent)',
          }}
        />
        {/* travelled path */}
        <motion.div
          className="absolute left-1/2 w-[6px] -translate-x-1/2 rounded-full"
          style={{
            top: `${PAD}%`,
            height: fillHeight,
            background: 'color-mix(in srgb, var(--accent) 70%, transparent)',
          }}
        />

        {/* planet nodes */}
        {steps.map((s, i) => {
          const top = PAD + (i / denom) * (100 - 2 * PAD);
          const reached = i <= active;
          const current = i === active;
          return (
            <button
              key={i}
              type="button"
              onClick={() => scrollToStep(i)}
              className="group pointer-events-auto absolute left-1/2 -translate-x-1/2 -translate-y-1/2 p-2"
              style={{ top: `${top}%` }}
              aria-label={`Go to ${s.label} — ${s.heading}`}
            >
              <span
                className="block rounded-full transition-all duration-300"
                style={{
                  width: current ? 20 : 14,
                  height: current ? 20 : 14,
                  background: reached ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 28%, transparent)',
                  boxShadow: current ? '0 0 10px color-mix(in srgb, var(--accent) 70%, transparent)' : 'none',
                }}
              />
              <span
                className="u-mono pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 whitespace-nowrap text-[9px] uppercase tracking-wider opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                style={{ color: current ? 'var(--ice)' : 'var(--muted)' }}
              >
                {s.heading}
              </span>
            </button>
          );
        })}

        {/* rocket marker — the group flips 180° so the rocket always leads nose-first, exhaust trailing */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ top: rocketTop }}
        >
          <motion.div
            className="relative"
            animate={{ rotate: goingUp ? 180 : 0 }}
            transition={{ duration: reduced ? 0 : 0.3, ease: 'easeInOut' }}
          >
            {!reduced && (
              <div className="absolute bottom-full left-1/2 flex -translate-x-1/2 items-end gap-[5px]">
                {[-22, 0, 22].map((deg) => (
                  <motion.span
                    key={deg}
                    className="w-[5px] origin-bottom rounded-full"
                    style={{
                      height: deg === 0 ? trailLen : trailLenSide,
                      opacity: trailOpacity,
                      rotate: deg,
                      background: 'linear-gradient(to top, var(--active), transparent)',
                    }}
                  />
                ))}
              </div>
            )}
            <span className={reduced ? 'block' : 'rocket-bob block'} style={{ color: 'var(--active)' }}>
              <RocketGlyph size={34} />
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * A clean rocket pointing down the path (nozzle up, toward the exhaust). Drawn as one filled silhouette
 * so the fins read as part of the body — no internal seam lines — with a small porthole punched out.
 */
function RocketGlyph({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      style={{ transform: 'rotate(180deg)' }}
    >
      <path d="M12 2C15.3 5 16 9.5 16 13L16 15L19 19L15 17.5L12 19L9 17.5L5 19L8 15L8 13C8 9.5 8.7 5 12 2Z" />
      <circle cx="12" cy="9.3" r="1.7" fill="var(--void)" />
    </svg>
  );
}
