'use client';

import { motion } from 'motion/react';
import type { Transition } from 'motion/react';
import type { RefObject } from 'react';
import type { DurationToken, EasingToken } from '../tokens/tokens.schema';
import { useMotionTokens, useReducedMotion } from '../provider';

export interface ImageRevealProps {
  src: string;
  alt: string;
  /** Edge the reveal wipes from. Default `'left'`. */
  from?: 'left' | 'right' | 'top' | 'bottom';
  duration?: DurationToken;
  easing?: EasingToken;
  /** Reveal on scroll-into-view (default) or on mount. */
  trigger?: 'inView' | 'mount';
  once?: boolean;
  /** For `inView`: a scrollable ancestor to track instead of the window viewport. */
  root?: RefObject<HTMLElement | null>;
  className?: string;
}

// clip-path inset: top right bottom left. Fully clipped from the given edge -> fully open.
const clipped: Record<NonNullable<ImageRevealProps['from']>, string> = {
  left: 'inset(0 100% 0 0)',
  right: 'inset(0 0 0 100%)',
  top: 'inset(100% 0 0 0)',
  bottom: 'inset(0 0 100% 0)',
};
const open = 'inset(0 0 0 0)';

/**
 * Wipes an image into view with a clip-path mask — the media stays put while the reveal sweeps
 * across it. Uses the active preset's duration/easing. Under reduced motion the wipe is replaced by
 * a plain opacity fade.
 */
export function ImageReveal({
  src,
  alt,
  from = 'left',
  duration = 'slow',
  easing = 'entrance',
  trigger = 'inView',
  once = true,
  root,
  className,
}: ImageRevealProps) {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();
  const transition: Transition = {
    duration: tokens.duration[duration] / 1000,
    ease: [...tokens.easing[easing]],
  };

  const initial = reduced ? { opacity: 0 } : { clipPath: clipped[from], opacity: 1 };
  const target = reduced ? { opacity: 1 } : { clipPath: open, opacity: 1 };
  const animateProps =
    trigger === 'mount'
      ? { animate: target }
      : { whileInView: target, viewport: { once, amount: 0.3, root } };

  return (
    <motion.div
      className={className}
      style={{ overflow: 'hidden', display: 'inline-block' }}
      initial={initial}
      transition={transition}
      {...animateProps}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- toolkit is framework-agnostic */}
      <img src={src} alt={alt} style={{ display: 'block', maxWidth: '100%', height: 'auto' }} />
    </motion.div>
  );
}
