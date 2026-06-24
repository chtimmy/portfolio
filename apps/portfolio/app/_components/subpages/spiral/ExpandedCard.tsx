'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { useMotionTokens, useReducedMotion } from '@umbra/motion';
import { systemCategoryColors } from '../../../_data/systems';
import type { SystemCard } from '../../../_data/systems';
import { CardFrontContent, cardSurface } from './BentoCard';
import { CardBack } from './CardBack';

// Open flips to the BACK (odd multiple of 180°): 900° = 2.5 turns. Close mirrors the open, reversed
// in order: another 900° flip (continuing the same direction → 1800°, landing back on the FRONT) at
// modal size, *then* minimize. Kept short (~0.6s) so the multi-spin stays snappy; reuses the
// launch-page collapse easing (`easing.emphasized`) for a consistent feel.
const FLIP_TO = 900;
const FLIP_CLOSE = FLIP_TO + 900;
const DUR_FLIP = 0.6;
const DUR_MORPH = 0.6;

type Phase = 'flip' | 'expand' | 'open' | 'flipClose' | 'minimize';
type Box = { top: number; left: number; width: number; height: number };

// The grow-on-reveal box animation (~0.4s) wants to read distinctly from the open morph.
const DUR_GROW = 0.4;

/**
 * The expanded overlay for a selected card. Portaled to <body> (escaping the SceneLightbox panel's
 * transformed ancestors). On open it **flips in place at card size** (2.5 spins → back face) and
 * **then expands** (rect → modal morph) with the backdrop fading in; close is the open reversed in
 * order — **flip at modal size** (2.5 spins → front face) and **then minimize** (modal → tile morph)
 * with the backdrop fading out. Reduced motion: no flip/morph — the back cross-fades in at full size.
 */
export function ExpandedCard({
  card,
  originRect,
  onClose,
}: {
  card: SystemCard;
  originRect: DOMRect;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();
  const tokens = useMotionTokens();
  const ease = useMemo(
    () => [...tokens.easing.emphasized] as [number, number, number, number],
    [tokens],
  );

  const cardBox = useMemo<Box>(
    () => ({
      top: originRect.top,
      left: originRect.left,
      width: originRect.width,
      height: originRect.height,
    }),
    [originRect],
  );

  // Viewport sizing: width is fixed; height is content-driven (grow-to-fit), floored at MIN_H so
  // short cards aren't tiny and capped at maxH so tall ones scroll instead of overflowing.
  const sizing = useMemo(() => {
    if (typeof window === 'undefined') return { vw: 0, vh: 0, width: 0, minH: 0, maxH: 0 };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxH = vh - 32; // near-full height so a content-rich back (daytrading) fits without scroll
    return { vw, vh, width: Math.min(1000, vw - 32), maxH, minH: Math.min(420, maxH) };
  }, []);

  const [phase, setPhase] = useState<Phase>(reduced ? 'open' : 'flip');
  // Once settled open (or reduced), render the back FLAT — no perspective / preserve-3d / rotation.
  // Safari mis-maps hit-testing for a scroll container nested in a 3D transform, so the bottom-most
  // controls (e.g. "View full case study") become unclickable; the flat resting state fixes that.
  // The flip still animates on open/close — only the interactive resting state drops the 3D context.
  const flat = reduced || phase === 'open';

  // Measured natural height of the back content (an unclamped, fixed-width wrapper in CardBack) →
  // drives the modal height, so the card grows/shrinks to fit when the extended block toggles.
  const measureRef = useRef<HTMLDivElement>(null);
  const extendedRef = useRef<HTMLDivElement>(null);
  const [naturalH, setNaturalH] = useState<number | null>(null);
  // Re-attach + re-measure when the back subtree swaps (3D flip ↔ flat settled): that remounts
  // CardBack, so a one-time observer would be left watching the detached node and freeze a stale
  // (Safari: collapsed-backface) height. React commits refs before passive effects, so on the
  // `flat`-change re-run measureRef.current already points at the newly mounted node.
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const update = () => setNaturalH((prev) => (prev === el.scrollHeight ? prev : el.scrollHeight));
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, [flat]);

  const boxForHeight = (h: number): Box => {
    const height = Math.max(sizing.minH, Math.min(h, sizing.maxH));
    return { top: (sizing.vh - height) / 2, left: (sizing.vw - sizing.width) / 2, width: sizing.width, height };
  };
  const expandedBox = boxForHeight(naturalH ?? Math.min(sizing.vh * 0.85, sizing.maxH));

  // "Expand, then reveal": `showMore` grows the card (CardBack's grid row → resize → this box's
  // height); `revealText` fades the extended text in once the grow has settled (instant if reduced).
  const [showMore, setShowMore] = useState(false);
  const [revealText, setRevealText] = useState(false);
  const onToggleMore = () => {
    if (showMore) {
      setRevealText(false); // fade text out first, then collapse
      setShowMore(false);
    } else {
      setShowMore(true); // grid grows the card; revealText follows once it settles
    }
  };
  useEffect(() => {
    if (!showMore) {
      setRevealText(false);
      return;
    }
    if (reduced) {
      setRevealText(true);
      return;
    }
    const t = setTimeout(() => {
      setRevealText(true);
      const h = measureRef.current?.scrollHeight ?? 0;
      if (h > sizing.maxH) extendedRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 360); // ≥ the grid-row grow (320ms)
    return () => clearTimeout(t);
  }, [showMore, reduced, sizing.maxH]);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // `flipClose` holds the current (possibly grown) expanded size; `minimize` morphs back to the tile.
  const expanded = phase === 'expand' || phase === 'open' || phase === 'flipClose';
  const outerBox = reduced || expanded ? expandedBox : cardBox;
  const closing = phase === 'flipClose' || phase === 'minimize';
  const rotate = closing ? FLIP_CLOSE : FLIP_TO;

  const requestClose = () => {
    if (reduced || phase === 'flip') {
      closeRef.current();
      return;
    }
    setPhase('flipClose');
  };
  // The keydown listener is registered once, so keep the latest requestClose in a ref — otherwise Esc
  // would fire a stale closure (captured at phase 'flip') and close instantly without the animation.
  const requestCloseRef = useRef(requestClose);
  requestCloseRef.current = requestClose;

  // Esc + a lightweight focus trap; restore focus to the originating grid card on unmount.
  useEffect(() => {
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        requestCloseRef.current();
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
      document.getElementById(`bento-${card.id}`)?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (typeof document === 'undefined') return null;

  // Shared back content — rendered flat when settled, or inside the back face during the flip.
  const back = (
    <CardBack
      card={card}
      onClose={requestClose}
      closeBtnRef={closeBtnRef}
      showMore={showMore}
      onToggleMore={onToggleMore}
      revealText={revealText}
      measureRef={measureRef}
      extendedRef={extendedRef}
      width={sizing.width}
    />
  );

  return createPortal(
    <div className="fixed inset-0 z-[10000]">
      {/* Backdrop — fades in during the expand; click-outside closes. */}
      <motion.div
        aria-hidden
        onClick={requestClose}
        initial={{ opacity: reduced ? 1 : 0 }}
        animate={{ opacity: expanded ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.3, ease }}
        className="absolute inset-0"
        style={{ background: 'rgba(4,5,10,0.72)', backdropFilter: 'blur(4px)' }}
      />

      {/* Outer = the morph (card rect → modal box). perspective enables the inner 3D flip. */}
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${card.title} — details`}
        initial={reduced ? expandedBox : cardBox}
        animate={outerBox}
        transition={reduced ? { duration: 0 } : { duration: phase === 'open' ? DUR_GROW : DUR_MORPH, ease }}
        onAnimationComplete={() => {
          if (phase === 'expand') setPhase('open');
          else if (phase === 'minimize') closeRef.current();
        }}
        className="overflow-hidden"
        style={{ position: 'fixed', perspective: flat ? undefined : 2000, ...cardSurfaceFrame(card) }}
      >
        {flat ? (
          // Settled (or reduced): a plain, non-3D context Safari hit-tests correctly. Cross-fade in
          // only for reduced motion; arriving from the flip it's already shown, so render instantly.
          reduced ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              style={{ height: '100%' }}
            >
              {back}
            </motion.div>
          ) : (
            <div style={{ height: '100%' }}>{back}</div>
          )
        ) : (
          // Inner = the rotateY flip (separate node so the morph never overwrites the transform).
          // Unmounted once `flat`, so `initial` starts from the back face when re-mounting to close.
          <motion.div
            initial={{ rotateY: closing ? FLIP_TO : 0 }}
            animate={{ rotateY: rotate }}
            transition={{ duration: DUR_FLIP, ease }}
            onAnimationComplete={() => {
              if (phase === 'flip') setPhase('expand');
              else if (phase === 'flipClose') setPhase('minimize');
            }}
            style={{ position: 'relative', height: '100%', transformStyle: 'preserve-3d' }}
          >
            <Face>
              <CardFrontContent card={card} />
            </Face>
            <Face back>
              {/* Back content stays hidden through the flip, then fades in as the card expands (and
                  fades back out on collapse) — so you never see full-size back text at card size. */}
              <motion.div
                className="h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: expanded ? 1 : 0 }}
                transition={{ duration: 0.3, ease }}
              >
                {back}
              </motion.div>
            </Face>
          </motion.div>
        )}
      </motion.div>
    </div>,
    document.body,
  );
}

/** Surface for the expanded frame — same language as the tile but a touch stronger, with a border. */
function cardSurfaceFrame(card: SystemCard) {
  const { base } = systemCategoryColors[card.category];
  return {
    ...cardSurface(card),
    border: `1px solid color-mix(in srgb, ${base} 55%, transparent)`,
    boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 40px color-mix(in srgb, ${base} 18%, transparent)`,
    borderRadius: 16,
  } as const;
}

/** One face of the flip — absolutely stacked, back rotated 180° with backface hidden. */
function Face({ children, back }: { children: React.ReactNode; back?: boolean }) {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        position: 'absolute',
        inset: 0,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        // Safari/Firefox don't apply backface-visibility to hit-testing, so the away-facing front
        // face still swallows clicks meant for the back face's controls (e.g. "View full case
        // study"). Only the interactive back face should receive pointer events.
        pointerEvents: back ? 'auto' : 'none',
        transform: back ? 'rotateY(180deg)' : undefined,
      }}
    >
      {children}
    </div>
  );
}
