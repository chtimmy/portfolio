'use client';

import { createPortal } from 'react-dom';
import { motion } from 'motion/react';

/**
 * A "portal" that grows out of a source rect (the clicked CTA) to fullscreen, on top of everything
 * (above the card modal at z-10000). The host keeps the current view painted underneath and only
 * swaps the page once this finishes — so the screen holds, a navy panel expands out of the button,
 * and the page changes only after it's covered. Styled as the case-study surface (deep navy) with an
 * accent rim/glow that fades as it opens, so it reads as a portal, not a black box.
 */
export function PortalReveal({ rect, onDone }: { rect: DOMRect; onDone: () => void }) {
  if (typeof window === 'undefined') return null;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  return createPortal(
    <motion.div
      aria-hidden
      initial={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        borderRadius: 999,
        opacity: 0.65,
      }}
      animate={{ top: 0, left: 0, width: vw, height: vh, borderRadius: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      onAnimationComplete={onDone}
      style={{
        position: 'fixed',
        zIndex: 10001,
        overflow: 'hidden',
        background: 'var(--deep)',
      }}
    >
      {/* accent rim + glow that fades as the portal opens (the "portal" feel) */}
      <motion.div
        aria-hidden
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          inset: 0,
          border: '1px solid color-mix(in srgb, var(--accent) 70%, transparent)',
          boxShadow:
            '0 0 60px color-mix(in srgb, var(--accent) 45%, transparent), inset 0 0 40px color-mix(in srgb, var(--accent) 22%, transparent)',
        }}
      />
    </motion.div>,
    document.body,
  );
}
