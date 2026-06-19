'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import type { MotionValue, Transition } from 'motion/react';
import { useMotionTokens, useReducedMotion } from '../provider';

export type GradientInteraction = 'auto' | 'cursor' | 'scroll';

export interface AnimatedGradientProps {
  /** Blob colors. Default a cool aurora palette. */
  colors?: string[];
  /** Seconds for one drift cycle (auto mode). Lower = livelier. Default `10`. */
  speed?: number;
  /** Blur radius of the blobs in pixels. Default `60`. */
  blur?: number;
  /**
   * What drives the motion. `auto` (default) drifts on a loop; `cursor` eases the blobs toward the
   * pointer; `scroll` moves them with scroll progress.
   */
  interaction?: GradientInteraction;
  className?: string;
}

const DEFAULT_COLORS = ['#5b6b8c', '#e0457b', '#3b82f6'];

// Per-blob drift paths (percent of container) for `auto`, and a parallax depth for cursor/scroll.
const BLOBS = [
  { x: ['-12%', '34%', '-12%'], y: ['-6%', '28%', '-6%'], top: '0%', left: '-5%', depth: 1 },
  { x: ['28%', '-18%', '28%'], y: ['14%', '-14%', '14%'], top: '24%', left: '38%', depth: 1.7 },
  { x: ['-8%', '20%', '-8%'], y: ['24%', '-8%', '24%'], top: '-8%', left: '55%', depth: 2.4 },
];

/**
 * An ambient drifting aurora/mesh gradient for hero backgrounds. Soft blurred color blobs move —
 * either on a loop (`auto`), toward the cursor (`cursor`), or with scroll (`scroll`). Under reduced
 * motion the blobs hold a fixed, still composition. Pointer-events are off so it never blocks content.
 */
export function AnimatedGradient({
  colors = DEFAULT_COLORS,
  speed = 10,
  blur = 60,
  interaction = 'auto',
  className,
}: AnimatedGradientProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Normalized pointer offset (-0.5..0.5), spring-smoothed — drives `cursor` mode.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const tokens = useMotionTokens();
  const sx = useSpring(px, tokens.spring.gentle);
  const sy = useSpring(py, tokens.spring.gentle);

  // Scroll progress through the container — drives `scroll` mode.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (interaction !== 'cursor' || reduced) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onPointerLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div
      ref={ref}
      aria-hidden
      className={className}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}
    >
      {colors.map((color, i) => (
        <GradientBlob
          key={i}
          color={color}
          blur={blur}
          speed={speed}
          index={i}
          interaction={interaction}
          reduced={reduced}
          easing={[...tokens.easing.emphasized]}
          sx={sx}
          sy={sy}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </div>
  );
}

function GradientBlob({
  color,
  blur,
  speed,
  index,
  interaction,
  reduced,
  easing,
  sx,
  sy,
  scrollYProgress,
}: {
  color: string;
  blur: number;
  speed: number;
  index: number;
  interaction: GradientInteraction;
  reduced: boolean;
  easing: number[];
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
}) {
  const blob = BLOBS[index % BLOBS.length]!;

  // Hooks are always called (stable order); we just pick which output the style uses per mode.
  const cursorX = useTransform(sx, (v) => `${v * 40 * blob.depth}px`);
  const cursorY = useTransform(sy, (v) => `${v * 40 * blob.depth}px`);
  const scrollX = useTransform(scrollYProgress, [0, 1], [`${-20 * blob.depth}px`, `${20 * blob.depth}px`]);
  const scrollY = useTransform(scrollYProgress, [0, 1], [`${-30 * blob.depth}px`, `${30 * blob.depth}px`]);

  const base = {
    position: 'absolute' as const,
    top: blob.top,
    left: blob.left,
    width: '60%',
    height: '60%',
    borderRadius: '50%',
    background: color,
    filter: `blur(${blur}px)`,
    opacity: 0.55,
  };

  if (reduced) return <div style={base} />;

  if (interaction === 'cursor') return <motion.div style={{ ...base, x: cursorX, y: cursorY }} />;
  if (interaction === 'scroll') return <motion.div style={{ ...base, x: scrollX, y: scrollY }} />;

  // auto: drift on a long mirrored loop.
  const transition: Transition = {
    duration: speed + index * 2,
    ease: easing as unknown as Transition['ease'],
    repeat: Infinity,
    repeatType: 'mirror',
  };
  return <motion.div style={base} initial={false} animate={{ x: blob.x, y: blob.y }} transition={transition} />;
}
