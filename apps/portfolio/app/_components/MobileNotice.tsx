'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useReducedMotion } from '@umbra/motion';
import { useIsMobile } from './useIsMobile';

/**
 * One-time welcome notice for mobile viewers (< 640px): the portfolio is a motion showcase tuned for
 * desktop, so we tell phone visitors it's even better on a PC and let them decide whether to stay.
 * Self-managing (no props): detects mobile, shows on every page load, and dismisses on OK / Esc /
 * backdrop. Themed and structured like the dossier ExitIntentPrompt; entrance skipped under reduced motion.
 */
export function MobileNotice() {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const [dismissed, setDismissed] = useState(false);
  const okRef = useRef<HTMLButtonElement>(null);

  const open = isMobile && !dismissed;

  useEffect(() => {
    if (!open) return;
    okRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDismissed(true);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Portal to <body> so the overlay escapes the Landing tree and sits above the scene panels
  // (SceneLightbox is portaled to <body> at z-index 9999); without this it would paint behind.
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[10010] flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
          onClick={() => setDismissed(true)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-notice-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl p-6"
            style={{
              background: 'color-mix(in srgb, var(--deep) 96%, transparent)',
              border: '1px solid color-mix(in srgb, var(--accent) 45%, transparent)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
            }}
            initial={reduced ? false : { opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 280, damping: 24 }}
          >
            <div className="u-mono text-[10px] tracking-[0.25em] text-[color:var(--accent)]">BEST ON DESKTOP</div>
            <h2 id="mobile-notice-title" className="u-display mt-2 text-2xl font-semibold text-[color:var(--ice)]">
              This portfolio was made with motion design.
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--ice)]/80">
              For the best experience, please view it on your PC.
            </p>
            <div className="mt-6 flex items-center">
              <button
                ref={okRef}
                type="button"
                onClick={() => setDismissed(true)}
                className="u-mono rounded-full px-5 py-2 text-[12px] font-medium tracking-[0.15em]"
                style={{ background: 'var(--accent)', color: 'var(--void)' }}
              >
                OK
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
