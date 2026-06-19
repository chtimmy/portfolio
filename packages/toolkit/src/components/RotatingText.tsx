'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Transition } from 'motion/react';
import type { DistanceToken, DurationToken, EasingToken } from '../tokens/tokens.schema';
import { useMotionTokens, useReducedMotion } from '../provider';

export interface RotatingTextProps {
  /** Words to cycle through, in order. */
  words: string[];
  /** Time each word stays, in milliseconds. Default `2200`. */
  interval?: number;
  duration?: DurationToken;
  easing?: EasingToken;
  distance?: DistanceToken;
  /** Color of the rotating word. Default `currentColor` (inherits). */
  color?: string;
  className?: string;
}

/**
 * Cycles a single word in place — e.g. "I build websites / systems / tools." Each swap slides the
 * old word out and the new one in on the active preset's tokens. Under reduced motion words
 * crossfade with no vertical travel.
 */
export function RotatingText({
  words,
  interval = 2200,
  duration = 'base',
  easing = 'emphasized',
  distance = 'subtle',
  color = 'currentColor',
  className,
}: RotatingTextProps) {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  const d = reduced ? 0 : tokens.distance[distance];
  const transition: Transition = {
    duration: tokens.duration[duration] / 1000,
    ease: [...tokens.easing[easing]],
  };

  return (
    <span className={className} style={{ display: 'inline-flex', position: 'relative' }}>
      {/* keep layout width from collapsing during the swap */}
      <span style={{ visibility: 'hidden' }} aria-hidden>
        {words.reduce((a, b) => (b.length > a.length ? b : a), '')}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={index}
          initial={{ opacity: 0, y: d }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -d }}
          transition={transition}
          style={{ position: 'absolute', left: 0, whiteSpace: 'nowrap', color }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
