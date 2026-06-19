'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useReducedMotion } from '@umbra/motion';

export interface BeforeAfterToggleProps {
  /** e.g. "popup vs fly-through". */
  label?: string;
  /** Media slot — captured video/gif or a live component in its broken config. */
  before: ReactNode;
  /** Media slot — the fixed/shipped version. */
  after: ReactNode;
  /** Which state shows first. Default `'after'` so the page reads finished on load. */
  defaultState?: 'before' | 'after';
  /** The required (Card 4) flip gets a stronger, more prominent frame. */
  prominent?: boolean;
}

/**
 * The craft-flip: one control swaps a single scene between its broken "before" and fixed "after" — same
 * frame, same content, only the one variable changes. Defaults to "after" so the page looks finished on
 * load; flipping to "before" is the reveal. Under reduced motion it shows "after" statically with a note
 * that a comparison is available (no crossfade). Media slots are empty placeholders for now — wire the
 * interaction, drop real before/after media in later.
 */
export function BeforeAfterToggle({
  label,
  before,
  after,
  defaultState = 'after',
  prominent = false,
}: BeforeAfterToggleProps) {
  const reduced = useReducedMotion();
  const [view, setView] = useState<'before' | 'after'>(defaultState);

  if (reduced) {
    return (
      <figure className="mt-2" style={frameStyle(prominent)}>
        <Eyebrow label={label} prominent={prominent} />
        <div className="relative mt-3 overflow-hidden rounded-lg" style={{ minHeight: 200 }}>
          {after}
        </div>
        <figcaption className="u-mono mt-2 text-[10px] tracking-[0.15em] text-[color:var(--muted)]">
          SHOWING “AFTER” · BEFORE/AFTER COMPARISON AVAILABLE
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="mt-2" style={frameStyle(prominent)}>
      <div className="flex items-center justify-between gap-3">
        <Eyebrow label={label} prominent={prominent} />
        <div
          className="u-mono inline-flex shrink-0 overflow-hidden rounded-full text-[10px] tracking-[0.15em]"
          style={{ border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' }}
          role="group"
          aria-label="Before / after comparison"
        >
          {(['before', 'after'] as const).map((state) => {
            const active = view === state;
            return (
              <button
                key={state}
                type="button"
                aria-pressed={active}
                onClick={() => setView(state)}
                className="px-3 py-1.5 uppercase transition-colors"
                style={{
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? 'var(--void)' : 'var(--muted)',
                }}
              >
                {state}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative mt-3 overflow-hidden rounded-lg" style={{ minHeight: 200 }}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            {view === 'before' ? before : after}
          </motion.div>
        </AnimatePresence>
      </div>
    </figure>
  );
}

function Eyebrow({ label, prominent }: { label?: string; prominent: boolean }) {
  return (
    <figcaption
      className="u-mono text-[10px] tracking-[0.2em]"
      style={{ color: prominent ? 'var(--accent)' : 'var(--muted)' }}
    >
      {prominent ? 'BEFORE / AFTER · ' : ''}
      {(label ?? 'before vs after').toUpperCase()}
    </figcaption>
  );
}

function frameStyle(prominent: boolean): React.CSSProperties {
  return {
    borderRadius: 12,
    padding: 14,
    background: 'color-mix(in srgb, var(--void) 70%, transparent)',
    border: prominent
      ? '1px solid color-mix(in srgb, var(--accent) 45%, transparent)'
      : '1px solid color-mix(in srgb, var(--accent) 16%, transparent)',
  };
}

/** Empty media slot — a clearly-marked placeholder until captured before/after clips land. */
export function MediaPlaceholder({ kind }: { kind: 'before' | 'after' }) {
  return (
    <div
      className="u-mono grid h-full min-h-[200px] place-items-center text-center text-[10px] leading-relaxed tracking-[0.2em] text-[color:var(--muted)]"
      style={{
        background:
          'repeating-linear-gradient(135deg, color-mix(in srgb, var(--accent) 7%, transparent) 0 10px, transparent 10px 20px)',
        border: '1px dashed color-mix(in srgb, var(--accent) 28%, transparent)',
        borderRadius: 8,
      }}
    >
      TODO: {kind} media
    </div>
  );
}
