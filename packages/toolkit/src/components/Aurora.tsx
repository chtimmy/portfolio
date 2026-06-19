'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import type { MotionValue, Transition } from 'motion/react';
import { useMotionTokens, useReducedMotion } from '../provider';

export type AuroraInteraction = 'auto' | 'cursor' | 'scroll';

export interface AuroraProps {
  /** Light-curtain colors, layered back-to-front. Default a northern-lights green/teal/violet. */
  colors?: string[];
  /** Seconds for one sway cycle (auto mode). Lower = livelier. Default `9`. */
  speed?: number;
  /** Blur radius of the curtains in pixels (softness). Default `40`. */
  blur?: number;
  /**
   * What drives the motion. `auto` (default) waves on a loop; `cursor` leans the curtains toward the
   * pointer; `scroll` drifts them with scroll progress.
   */
  interaction?: AuroraInteraction;
  className?: string;
}

const DEFAULT_COLORS = ['#3bf0a0', '#2fd6c6', '#6f8bff', '#9d5cff'];

// Curtain layout (percent of container) + per-curtain motion character. Wider/blurred bands overlap
// and screen-blend into organic sheets of light, like a real aurora.
const CURTAINS = [
  { left: '-5%', width: '38%', depth: 1, sway: 9, dur: 1, skew: -8 },
  { left: '18%', width: '34%', depth: 1.4, sway: 13, dur: 1.25, skew: 6 },
  { left: '44%', width: '40%', depth: 1.8, sway: 11, dur: 0.92, skew: -5 },
  { left: '68%', width: '36%', depth: 2.3, sway: 15, dur: 1.4, skew: 9 },
];

/**
 * A northern-lights backdrop: tall vertical curtains of light that wave sideways, breathe, and
 * shimmer, screen-blended so overlaps glow. Motion can loop (`auto`), follow the cursor, or track
 * scroll. Heavily blurred and pointer-events off. Under reduced motion it holds a still composition.
 * Looks best over a dark surface.
 */
export function Aurora({
  colors = DEFAULT_COLORS,
  speed = 9,
  blur = 40,
  interaction = 'auto',
  className,
}: AuroraProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0);
  const tokens = useMotionTokens();
  const sx = useSpring(px, tokens.spring.gentle);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (interaction !== 'cursor' || reduced) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width - 0.5);
  };

  return (
    <div
      ref={ref}
      aria-hidden
      className={className}
      onPointerMove={onPointerMove}
      onPointerLeave={() => px.set(0)}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}
    >
      {CURTAINS.map((curtain, i) => (
        <Curtain
          key={i}
          color={colors[i % colors.length]!}
          curtain={curtain}
          blur={blur}
          speed={speed}
          interaction={interaction}
          reduced={reduced}
          easing={[...tokens.easing.emphasized]}
          sx={sx}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </div>
  );
}

function Curtain({
  color,
  curtain,
  blur,
  speed,
  interaction,
  reduced,
  easing,
  sx,
  scrollYProgress,
}: {
  color: string;
  curtain: (typeof CURTAINS)[number];
  blur: number;
  speed: number;
  interaction: AuroraInteraction;
  reduced: boolean;
  easing: number[];
  sx: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
}) {
  // Stable hook order; pick the output per mode.
  const cursorX = useTransform(sx, (v) => `${v * 60 * curtain.depth}px`);
  const scrollX = useTransform(
    scrollYProgress,
    [0, 1],
    [`${-30 * curtain.depth}px`, `${30 * curtain.depth}px`],
  );

  const base = {
    position: 'absolute' as const,
    top: '-20%',
    left: curtain.left,
    width: curtain.width,
    height: '140%',
    background: `linear-gradient(to bottom, transparent 0%, ${color} 38%, ${color} 56%, transparent 100%)`,
    filter: `blur(${blur}px)`,
    opacity: 0.5,
    mixBlendMode: 'screen' as const,
    transformOrigin: 'center',
  };

  if (reduced) return <div style={{ ...base, transform: `skewX(${curtain.skew}deg)` }} />;

  if (interaction === 'cursor') {
    return <motion.div style={{ ...base, x: cursorX, skewX: curtain.skew }} />;
  }
  if (interaction === 'scroll') {
    return <motion.div style={{ ...base, x: scrollX, skewX: curtain.skew }} />;
  }

  // auto: sway sideways, breathe, and shimmer on a long mirrored loop.
  const transition: Transition = {
    duration: speed * curtain.dur,
    ease: easing as unknown as Transition['ease'],
    repeat: Infinity,
    repeatType: 'mirror',
  };
  return (
    <motion.div
      style={base}
      initial={false}
      animate={{
        x: [`${-curtain.sway}px`, `${curtain.sway}px`],
        skewX: [`${curtain.skew}deg`, `${-curtain.skew}deg`],
        scaleY: [1, 1.12],
        opacity: [0.4, 0.62],
      }}
      transition={transition}
    />
  );
}
