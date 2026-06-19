'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';
import type { RefObject } from 'react';
import type { DurationToken, StaggerToken } from '../tokens/tokens.schema';
import { useMotionTokens, useReducedMotion } from '../provider';

const DEFAULT_GLYPHS = '!<>-_\\/[]{}=+*^?#________01';

export interface DecodeTextProps {
  /** The final text. Always rendered to assistive tech; the scramble is purely visual. */
  text: string;
  /** Decode on scroll-into-view (default) or immediately on mount. */
  trigger?: 'inView' | 'mount';
  /** For `inView`: only decode the first time it enters. Default `true`. */
  once?: boolean;
  /** For `inView`: a scrollable ancestor to track instead of the window viewport. */
  root?: RefObject<HTMLElement | null>;
  /**
   * `sweep` (default) resolves characters left-to-right; `together` scrambles every character at once and
   * settles them simultaneously (like a counter for letters).
   */
  mode?: 'sweep' | 'together';
  /** How long each character flickers before locking. Default `base`. */
  duration?: DurationToken;
  /** Per-character start offset for `sweep` mode (ignored when `together`). Default `tight`. */
  stagger?: StaggerToken;
  /** Characters to flicker through while decoding. */
  glyphs?: string;
  /** Wrapper element. Default `span`. */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3';
  /** Text color. Defaults to `currentColor`. */
  color?: string;
  className?: string;
}

/**
 * Resolves text out of flickering random glyphs, left-to-right — a "decrypting case file" effect. The
 * final string is always present for assistive tech (the scramble layer is `aria-hidden`); under reduced
 * motion it renders the final text immediately with no flicker.
 */
export function DecodeText({
  text,
  trigger = 'inView',
  once = true,
  root,
  mode = 'sweep',
  duration = 'base',
  stagger = 'tight',
  glyphs = DEFAULT_GLYPHS,
  as: Tag = 'span',
  color,
  className,
}: DecodeTextProps) {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once, amount: 0.3, root });
  const [display, setDisplay] = useState(text);
  const started = useRef(false);

  const active = trigger === 'mount' || inView;

  useEffect(() => {
    if (reduced) {
      setDisplay(text);
      return;
    }
    if (!active || (once && started.current)) return;
    started.current = true;

    const scrambleMs = tokens.duration[duration];
    // `together` → no per-character offset, so every char locks at the same instant.
    const stepMs = mode === 'together' ? 0 : tokens.stagger[stagger];
    const chars = text.split('');
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      let done = true;
      const out = chars.map((ch, i) => {
        if (ch === ' ' || ch === '\n') return ch;
        const lockAt = i * stepMs + scrambleMs;
        if (elapsed >= lockAt) return ch;
        done = false;
        if (elapsed < i * stepMs) return ' '; // not started yet — hold space, no layout jump
        return glyphs[Math.floor(Math.random() * glyphs.length)]!;
      });
      setDisplay(out.join(''));
      if (done) setDisplay(text);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced, text, mode, duration, stagger, glyphs, once, tokens]);

  return (
    <Tag className={className} aria-label={text} style={{ color }}>
      <span ref={ref} aria-hidden style={{ whiteSpace: 'pre-wrap', fontVariantLigatures: 'none' }}>
        {display}
      </span>
    </Tag>
  );
}
