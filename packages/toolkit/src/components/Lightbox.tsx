'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import type { Transition } from 'motion/react';
import type { ReactNode, RefObject } from 'react';
import { useReducedMotion } from '../provider';

export type LightboxTransition = 'expand' | 'zoom';

export interface LightboxProps {
  /** The clickable element (e.g. a card) that opens the panel. */
  trigger: ReactNode;
  /** The fullscreen panel content. */
  children: ReactNode;
  /**
   * How the panel opens (and reverses on close). `expand` grows the trigger to fullscreen; `zoom`
   * scales the panel out of the trigger's center. Default `zoom`.
   */
  transition?: LightboxTransition;
  /** Accessible label for the trigger / dialog. */
  label?: string;
  /** Surface color of the panel. Default a deep ink. */
  surface?: string;
  /** className on the trigger button. */
  className?: string;
  /** className on the scrollable panel surface. */
  panelClassName?: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Opens a trigger into a fullscreen panel with a cinematic, reversible transition — either
 * **expand** (the trigger grows to fullscreen) or **zoom** (the panel scales out of the trigger).
 * The overlay is portalled to `document.body` (so it escapes any transformed/clipped ancestor) and
 * managed by `AnimatePresence`, so the exit always plays the entrance in reverse. Closes on the ✕,
 * Esc, a backdrop click, or the browser Back button. Under reduced motion it uses a gentle scale-fade
 * instead of the full travel — still an open/close, never a flat jump.
 */
export function Lightbox({
  trigger,
  children,
  transition = 'zoom',
  label,
  surface = '#0b0f1a',
  className,
  panelClassName,
}: LightboxProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const rectRef = useRef<DOMRect | null>(null);

  const handleOpen = () => {
    rectRef.current = triggerRef.current?.getBoundingClientRect() ?? null;
    setOpen(true);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-label={label}
        onClick={handleOpen}
        className={className}
        style={{
          cursor: 'pointer',
          display: 'block',
          textAlign: 'inherit',
          // reset user-agent button chrome so the trigger is just its content
          margin: 0,
          padding: 0,
          border: 'none',
          background: 'transparent',
          font: 'inherit',
          color: 'inherit',
        }}
      >
        {trigger}
      </button>
      <AnimatePresence>
        {open && (
          <LightboxOverlay
            key="umbra-lightbox"
            rect={rectRef.current}
            transition={transition}
            label={label}
            surface={surface}
            panelClassName={panelClassName}
            onClose={() => setOpen(false)}
            triggerRef={triggerRef}
          >
            {children}
          </LightboxOverlay>
        )}
      </AnimatePresence>
    </>
  );
}

function LightboxOverlay({
  rect,
  transition,
  label,
  surface,
  panelClassName,
  onClose,
  triggerRef,
  children,
}: {
  rect: DOMRect | null;
  transition: LightboxTransition;
  label?: string;
  surface: string;
  panelClassName?: string;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Close = run the exit directly (reliable), with the browser Back button as an extra path.
  const requestClose = () => {
    onCloseRef.current();
    if (typeof window !== 'undefined' && (window.history.state as { umbraLightbox?: boolean } | null)?.umbraLightbox) {
      window.history.back();
    }
  };

  useEffect(() => {
    window.history.pushState({ umbraLightbox: true }, '');
    const onPop = () => onCloseRef.current();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    const trigger = triggerRef.current;
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('keydown', onKey);
      trigger?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (typeof document === 'undefined') return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const r = rect ?? new DOMRect(vw / 2 - 80, vh / 2 - 50, 160, 100);
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const open: Transition = { duration: 0.62, ease: EASE };

  const panelMotion = reduced
    ? {
        style: { position: 'fixed' as const, inset: 0, transformOrigin: `${cx}px ${cy}px` },
        initial: { scale: 0.94, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.96, opacity: 0 },
        transition: { duration: 0.28, ease: EASE } as Transition,
      }
    : transition === 'expand'
      ? {
          style: { position: 'fixed' as const },
          initial: { top: r.top, left: r.left, width: r.width, height: r.height, borderRadius: 16 },
          animate: { top: 0, left: 0, width: vw, height: vh, borderRadius: 0 },
          exit: { top: r.top, left: r.left, width: r.width, height: r.height, borderRadius: 16 },
          transition: open,
        }
      : {
          style: { position: 'fixed' as const, inset: 0, transformOrigin: `${cx}px ${cy}px` },
          initial: { scale: 0.04, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.04, opacity: 0 },
          transition: open,
        };

  return createPortal(
    <motion.div
      className="umbra-lightbox-backdrop"
      style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(4,5,10,0.72)', backdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      onClick={requestClose}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`umbra-lightbox-panel ${panelClassName ?? ''}`}
        initial={panelMotion.initial}
        animate={panelMotion.animate}
        exit={panelMotion.exit}
        transition={panelMotion.transition}
        style={{ ...panelMotion.style, zIndex: 9999, overflowY: 'auto', background: surface, outline: 'none' }}
      >
        <button
          type="button"
          onClick={requestClose}
          aria-label="Close"
          style={{
            position: 'fixed',
            top: 18,
            right: 18,
            zIndex: 1,
            width: 38,
            height: 38,
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.16)',
            background: 'rgba(255,255,255,0.06)',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0, transition: { delay: reduced ? 0.05 : 0.24, duration: 0.5, ease: EASE } }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          style={{ height: '100%' }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
