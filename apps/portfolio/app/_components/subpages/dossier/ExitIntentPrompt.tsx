'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useReducedMotion } from '@umbra/motion';

export interface ExitIntentPromptProps {
  open: boolean;
  /** Flip the dossier and close the prompt (the scene stays open on its verso). */
  onDecrypt: () => void;
  /** Close the prompt and let the viewer leave (closes the scene). */
  onLeave: () => void;
  /** Cancel the prompt without leaving (Esc / backdrop). */
  onDismiss: () => void;
}

/**
 * Page-level exit-intent modal for the dossier: if a viewer tries to leave (or close the scene) without
 * decrypting, it nudges them to open the file first. Accessible (dialog role, focus trap to the primary
 * action, Esc + backdrop close) and themed like the card. Entrance is skipped under reduced motion.
 */
export function ExitIntentPrompt({ open, onDecrypt, onLeave, onDismiss }: ExitIntentPromptProps) {
  const reduced = useReducedMotion();
  const decryptRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    decryptRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onDismiss]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
          onClick={onDismiss}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-intent-title"
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
            <div className="u-mono text-[10px] tracking-[0.25em] text-[color:var(--accent)]">DOSSIER // CONFIDENTIAL</div>
            <h2 id="exit-intent-title" className="u-display mt-2 text-2xl font-semibold text-[color:var(--ice)]">
              Hold on, you haven&apos;t opened the file yet.
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--ice)]/80">
              The work experience and background of the subject is sealed inside. Decrypt to view it.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                ref={decryptRef}
                type="button"
                onClick={onDecrypt}
                className="u-mono rounded-full px-5 py-2 text-[12px] font-medium tracking-[0.15em]"
                style={{ background: 'var(--accent)', color: 'var(--void)' }}
              >
                DECRYPT NOW
              </button>
              <button
                type="button"
                onClick={onLeave}
                className="u-mono rounded-full px-4 py-2 text-[12px] tracking-[0.1em] text-[color:var(--muted)] transition-colors hover:text-[color:var(--ice)]"
                style={{ border: '1px solid var(--line)' }}
              >
                Leave anyway
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
