'use client';

import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { Reveal, useMotionTokens, useReducedMotion } from '@umbra/motion';

const ROWS = ['Reveal', 'Stagger', 'Spring', 'Parallax', 'Marquee'];

/**
 * Three test animations — an entrance fade, a staggered cascade, and a spring badge — each reading
 * the active preset purely through context. Nothing here changes when the preset switches; the feel
 * does. Remount (via a `key` on the parent) to replay.
 */
export function Stage() {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: tokens.stagger.base / 1000, delayChildren: 0.05 } },
  };

  const item: Variants = {
    hidden: reduced ? { opacity: 0 } : { opacity: 0, x: tokens.distance.base },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: tokens.duration.base / 1000, ease: [...tokens.easing.entrance] },
    },
  };

  return (
    <div className="flex flex-col gap-10">
      {/* 1 — entrance fade */}
      <section>
        <Label n="01" name="Reveal · entrance" />
        <Reveal trigger="mount" duration="slow" distance="dramatic">
          <p className="text-3xl font-medium tracking-tight">One switch re-feels everything.</p>
        </Reveal>
      </section>

      {/* 2 — staggered cascade */}
      <section>
        <Label n="02" name="Stagger · cascade" />
        <motion.ul variants={container} initial="hidden" animate="show" className="flex flex-col gap-1.5">
          {ROWS.map((row) => (
            <motion.li
              key={row}
              variants={item}
              className="flex items-center gap-3 border-l-2 pl-3 text-sm text-[color:var(--color-muted)]"
              style={{ borderColor: 'var(--accent)' }}
            >
              <span className="font-mono text-xs text-[color:var(--accent)]">{row}</span>
            </motion.li>
          ))}
        </motion.ul>
      </section>

      {/* 3 — spring badge */}
      <section>
        <Label n="03" name="Spring · bouncy" />
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduced ? { duration: tokens.duration.base / 1000 } : { type: 'spring', ...tokens.spring.bouncy }}
          className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium text-white"
          style={{ background: 'var(--accent)' }}
        >
          spring.bouncy
        </motion.div>
      </section>
    </div>
  );
}

function Label({ n, name }: { n: string; name: string }) {
  return (
    <div className="mb-3 flex items-baseline gap-2 font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
      <span>{n}</span>
      <span className="h-px flex-1 bg-[color:var(--color-line)]" />
      <span>{name}</span>
    </div>
  );
}
