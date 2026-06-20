'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { X } from 'lucide-react';
import { useReducedMotion } from '@umbra/motion';
import { systemPalette } from '../../../_data/systems';
import type { Architecture } from '../../../_data/systems';
import { ArchitectureDiagram } from './ArchitectureDiagram';

// Mobile-only fullscreen overlay that shows the EXISTING desktop ArchitectureDiagram with pinch /
// double-tap zoom and pan. Top-level portal to <body> (own stacking context) — never nested inside
// the flip card or any transformed ancestor, to dodge the iOS scroll/transform bugs hit on the
// dossier card. The desktop diagram has no media queries, so a fixed-width wrapper reproduces the
// desktop layout regardless of viewport; the view initializes fit-to-width (the whole diagram
// visible) and that fit scale is also the zoom-out floor.

const CONTENT_W = 900;

export function DiagramZoomOverlay({
  architecture,
  open,
  onClose,
  triggerRef,
  title,
}: {
  architecture: Architecture;
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  title?: string;
}) {
  const reduced = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [availW, setAvailW] = useState(0);

  // Track viewport width to compute the fit-to-width scale (re-fits on rotate/resize).
  useEffect(() => {
    if (!open) return;
    const update = () => setAvailW(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [open]);

  // Lock body scroll while open; restore exactly on close.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Focus the close button, trap Tab, close on Escape, and return focus to the trigger on close.
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        const first = focusables?.[0];
        const last = focusables?.[focusables.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      trigger?.focus();
    };
  }, [open, onClose, triggerRef]);

  if (!open || typeof document === 'undefined') return null;

  const fit = availW ? Math.min(1, (availW - 24) / CONTENT_W) : 0.4;

  return createPortal(
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${title ?? 'Architecture'} diagram`}
      initial={{ opacity: reduced ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.2 }}
      // Tapping the backdrop (empty space around the diagram) closes; taps on the diagram content
      // stop propagation below, so they pan/zoom instead of closing.
      onClick={onClose}
      className="fixed inset-0 z-[10001]"
      style={{ background: 'rgba(4,5,10,0.92)', backdropFilter: 'blur(4px)' }}
    >
      <TransformWrapper
        // Re-init the view when the fit scale changes (e.g. on rotate).
        key={fit}
        initialScale={fit}
        minScale={fit}
        maxScale={4}
        centerOnInit
        limitToBounds
        doubleClick={{ mode: 'zoomIn', step: 0.7, animationTime: reduced ? 0 : 200 }}
        pinch={{ step: 5 }}
        wheel={{ step: 0.08 }}
        panning={{ velocityDisabled: true }}
      >
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: CONTENT_W }}
        >
          {/* stop propagation so a tap on the diagram doesn't bubble to the backdrop's close */}
          <div style={{ width: CONTENT_W, padding: 12 }} onClick={(e) => e.stopPropagation()}>
            <ArchitectureDiagram architecture={architecture} />
          </div>
        </TransformComponent>
      </TransformWrapper>

      <button
        ref={closeBtnRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close diagram"
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
        style={{
          color: systemPalette.text,
          background: 'rgba(0,0,0,0.55)',
          border: '1px solid rgba(255,255,255,0.18)',
        }}
      >
        <X size={18} strokeWidth={2} />
      </button>
    </motion.div>,
    document.body,
  );
}
