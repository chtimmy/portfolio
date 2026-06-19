'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from 'motion/react';
import type { MotionValue } from 'motion/react';
import type { ReactNode, RefObject } from 'react';
import { useMotionTokens, useReducedMotion } from '../provider';
import type { MotionTokens } from '../tokens/tokens.schema';

export type SceneTransition = 'expand' | 'flythrough' | 'collapse';
export type ScenePhase = 'idle' | 'travel' | 'spin' | 'overlap' | 'reveal';
export type SceneState = 'closed' | 'opening' | 'open' | 'closing';

/**
 * Choreography constants (spatial, not timing). Per the token rule, every *duration / easing / spring*
 * comes from the active preset (see `timing()` below); only these spatial ratios live as literals, kept
 * in one place so feel-tuning touches a single object.
 */
// `reveal: [start, end]` = the progress window over which the panel content materializes (fades +
// drifts + settles). flythrough reveals early so the content forms *as* the camera flies in.
const FLY = { nearScale: 3.0, farScale: 1.4, blur: 6, fadeStart: 0.4, panelRadius: 10, reveal: [0.15, 0.7] } as const;
const COLLAPSE = {
  spinEnd: 0.5,
  overlapEnd: 0.62,
  bloomFrom: 0.04,
  backdropDim: 0.3,
  reveal: [0.67, 0.96],
  // slow the whole collapse (open + reverse) so the spin → contract → bloom is readable.
  openFactor: 1.5,
  closeFactor: 1.35,
} as const;
const EXPAND = { panelRadius: 16, reveal: [0.3, 0.7] } as const;

/** Phase fractions of the collapse timeline, exported so a host scene derives the same phases. */
export const SCENE_COLLAPSE_PHASES = { spinEnd: COLLAPSE.spinEnd, overlapEnd: COLLAPSE.overlapEnd } as const;

export interface SceneTransitionContextValue {
  /** 0 (closed) → 1 (open), already eased. A host scene reads this to move in lockstep. */
  progress: MotionValue<number>;
  transition: SceneTransition;
  state: SceneState;
  originRect: DOMRect | null;
  reduced: boolean;
  /** Derive the current phase from a progress sample (for the collapse choreography). */
  phaseOf: (p: number) => ScenePhase;
}

const SceneTransitionContext = createContext<SceneTransitionContextValue | null>(null);

/**
 * Read the active `SceneLightbox` transition from inside its `far`/`near` scene — the open/close
 * `progress` (a MotionValue), the transition kind, lifecycle `state`, and a `phaseOf` helper. Returns
 * `null` outside a `SceneLightbox`, so a scene component can fall back to its normal behaviour.
 */
export function useSceneTransition(): SceneTransitionContextValue | null {
  return useContext(SceneTransitionContext);
}

const ScenePanelContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

/**
 * A ref to the `SceneLightbox` panel — the scrollable container the `panel` content lives in. Panel
 * content uses it to scope scrolling (Motion `useScroll({ container })`, `SmoothScroll container={…}`,
 * `inView root={…}`) to the panel instead of the window. Returns `null` outside a `SceneLightbox` panel.
 */
export function useScenePanelRef(): RefObject<HTMLDivElement | null> | null {
  return useContext(ScenePanelContext);
}

export interface SceneLightboxProps {
  /** Whether the overlay is open (controlled by the host). */
  open: boolean;
  /** Called when the overlay requests to close (✕, Esc, backdrop, browser Back). */
  onClose: () => void;
  /** Called once the close animation has fully finished (state → closed) — e.g. to deselect the node. */
  onClosed?: () => void;
  /** The clicked element's viewport rect, captured by the host at click time. Drives the FLIP morph. */
  originRect: DOMRect | null;
  /** Which cinematic transition to play (and reverse on close). Default `flythrough`. */
  transition?: SceneTransition;
  /** Back scene layer (e.g. a backdrop) — scaled less than `near` for parallax. */
  far?: ReactNode;
  /**
   * Front scene layer (e.g. the orbit). Centered; reads `useSceneTransition()` to move with the camera.
   * The layer is pointer-transparent so the cursor reaches `far`; interactive children must set their
   * own `pointer-events: auto`.
   */
  near?: ReactNode;
  /** Fullscreen panel content shown once open. */
  panel?: ReactNode;
  /** Accessible label for the dialog. */
  label?: string;
  /** Panel surface color. Default a deep ink. */
  surface?: string;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Token-driven timing per transition (the only source of durations/easings — the one rule). */
function timing(transition: SceneTransition, t: MotionTokens, reduced: boolean) {
  if (reduced) {
    const e = [...t.easing.standard] as number[];
    return { open: t.duration.fast, close: t.duration.fast, openEase: e, closeEase: e };
  }
  if (transition === 'collapse') {
    return {
      open: t.duration.cinematic * COLLAPSE.openFactor,
      close: t.duration.cinematic * COLLAPSE.closeFactor,
      openEase: [...t.easing.emphasized] as number[],
      closeEase: [...t.easing.emphasized] as number[],
    };
  }
  // flythrough / expand — accelerate-in, decelerate back
  return {
    open: t.duration.slow,
    close: Math.round(t.duration.slow * 0.85),
    openEase: [...t.easing.standard] as number[],
    closeEase: [...t.easing.entrance] as number[],
  };
}

/**
 * A scene-coordinating overlay: opening a node morphs it into a fullscreen `panel` while the whole
 * scene behind it moves — the camera **flies** forward (`flythrough`) or the orbit **collapses** to the
 * center and the node blooms out (`collapse`); `expand` simply grows the node to fullscreen. One eased
 * `progress` MotionValue drives the panel, the camera layers, and (via `useSceneTransition`) the host
 * scene, so the close is always the open played in reverse. Reduced motion degrades to a soft crossfade.
 */
export function SceneLightbox({
  open,
  onClose,
  onClosed,
  originRect,
  transition = 'flythrough',
  far,
  near,
  panel,
  label,
  surface = '#0b0f1a',
}: SceneLightboxProps) {
  const reduced = useReducedMotion();
  const tokens = useMotionTokens();
  const progress = useMotionValue(0);
  const [state, setState] = useState<SceneState>('closed');
  // Client-mount gate. Motion serializes MotionValue-driven transforms (scale/opacity/filter) as
  // `transform:none` on the server, but re-serializes them differently on the first client render →
  // a hydration mismatch on the camera layers' `style`. So we only attach those styles after mount;
  // SSR + first render emit just the static layout, and we stay `motion.div` (swapping to a plain
  // `<div>` would remount `near`/`far` — e.g. the orbit — and reset it). The camera is at progress 0
  // (its rest state) on mount, so there's no visible jump.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const rectRef = useRef<DOMRect | null>(originRect);
  if (open && originRect) rectRef.current = originRect;
  const onClosedRef = useRef(onClosed);
  onClosedRef.current = onClosed;

  // Drive progress on open/close. Interruptible: a reversal animates from the current value, never jumps.
  useEffect(() => {
    const t = timing(transition, tokens, reduced);
    if (open) {
      setState('opening');
      const controls = animate(progress, 1, {
        duration: t.open / 1000,
        ease: t.openEase as [number, number, number, number],
      });
      controls.then(() => setState('open')).catch(() => {});
      return () => controls.stop();
    }
    if (progress.get() === 0) {
      setState('closed');
      return;
    }
    setState('closing');
    const controls = animate(progress, 0, {
      duration: t.close / 1000,
      ease: t.closeEase as [number, number, number, number],
    });
    controls
      .then(() => {
        setState('closed');
        onClosedRef.current?.();
      })
      .catch(() => {});
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transition, reduced]);

  const phaseOf = (p: number): ScenePhase => {
    if (transition !== 'collapse') return p > 0 ? 'travel' : 'idle';
    if (p <= 0) return 'idle';
    if (p < COLLAPSE.spinEnd) return 'spin';
    if (p < COLLAPSE.overlapEnd) return 'overlap';
    return 'reveal';
  };

  const ctx = useMemo<SceneTransitionContextValue>(
    () => ({ progress, transition, state, originRect: rectRef.current, reduced, phaseOf }),
    // phaseOf is derived from `transition`; rectRef is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progress, transition, state, reduced],
  );

  // ── camera layers (parallax) ──────────────────────────────────────────────
  const fly = transition === 'flythrough' && !reduced;
  const nearScale = useTransform(progress, [0, 1], [1, fly ? FLY.nearScale : 1]);
  const farScale = useTransform(progress, [0, 1], [1, fly ? FLY.farScale : 1]);
  const farOpacity = useTransform(
    progress,
    fly ? [0, FLY.fadeStart, 1] : [0, 1],
    fly ? [1, 1, 0] : transition === 'collapse' ? [1, COLLAPSE.backdropDim] : [1, 1],
  );
  const nearOpacity = useTransform(
    progress,
    fly ? [0, FLY.fadeStart, 1] : [0, 1],
    fly ? [1, 1, 0] : [1, 1],
  );
  const blurPx = useTransform(progress, [0, 1], [0, fly ? FLY.blur : 0]);
  const nearFilter = useMotionTemplate`blur(${blurPx}px)`;

  // Fly *into* the clicked node: scale the camera about the card's viewport center.
  const cr = rectRef.current;
  const cameraOrigin = fly && cr ? `${cr.left + cr.width / 2}px ${cr.top + cr.height / 2}px` : 'center';

  const mounted = state !== 'closed' || open;

  return (
    <SceneTransitionContext.Provider value={ctx}>
      {far != null && (
        <motion.div
          aria-hidden={state !== 'closed'}
          style={{
            position: 'absolute',
            inset: 0,
            // Only promote to a GPU layer while the scene is actually animating; a permanently-promoted
            // viewport-sized layer at rest causes a first-paint raster gap (a green strip on the landing).
            willChange: state === 'closed' ? 'auto' : 'transform',
            // MotionValue transforms attach only after mount — see `hydrated` above.
            ...(hydrated ? { scale: farScale, opacity: farOpacity, transformOrigin: cameraOrigin } : null),
          }}
        >
          {far}
        </motion.div>
      )}
      {near != null && (
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            willChange: state === 'closed' ? 'auto' : 'transform',
            // pointer-transparent so the cursor reaches the `far` backdrop (e.g. a DotGrid that tracks
            // the pointer); interactive children opt back in with their own `pointer-events: auto`.
            pointerEvents: 'none',
            ...(hydrated
              ? { scale: nearScale, opacity: nearOpacity, filter: fly ? nearFilter : undefined, transformOrigin: cameraOrigin }
              : null),
          }}
        >
          {near}
        </motion.div>
      )}
      {mounted && (
        <ScenePanel
          progress={progress}
          transition={transition}
          rect={rectRef.current}
          surface={surface}
          label={label}
          reduced={reduced}
          onClose={onClose}
        >
          {panel}
        </ScenePanel>
      )}
    </SceneTransitionContext.Provider>
  );
}

/** The fullscreen panel + backdrop, portaled to `document.body` to escape the camera's transforms. */
function ScenePanel({
  progress,
  transition,
  rect,
  surface,
  label,
  reduced,
  onClose,
  children,
}: {
  progress: MotionValue<number>;
  transition: SceneTransition;
  rect: DOMRect | null;
  surface: string;
  label?: string;
  reduced: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const requestClose = () => {
    onCloseRef.current();
    if (typeof window !== 'undefined' && (window.history.state as { umbraScene?: boolean } | null)?.umbraScene) {
      window.history.back();
    }
  };

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    window.history.pushState({ umbraScene: true }, '');
    const onPop = () => onCloseRef.current();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('keydown', onKey);
      prevFocus?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const r = rect ?? new DOMRect(vw / 2 - 90, vh / 2 - 60, 180, 120);
  const isCollapse = transition === 'collapse';
  const flipRadius = transition === 'expand' ? EXPAND.panelRadius : FLY.panelRadius;

  // FLIP geometry (flythrough / expand) — progress already carries the easing, so interpolate linearly.
  const fTop = useTransform(progress, [0, 1], [r.top, 0]);
  const fLeft = useTransform(progress, [0, 1], [r.left, 0]);
  const fWidth = useTransform(progress, [0, 1], [r.width, vw]);
  const fHeight = useTransform(progress, [0, 1], [r.height, vh]);
  const fRadius = useTransform(progress, [0, 1], [flipRadius, 0]);
  const fOpacity = useTransform(progress, [0, 0.12], [0, 1]);

  // Collapse: bloom from screen-center during the reveal phase.
  const cScale = useTransform(progress, [COLLAPSE.overlapEnd, 1], [COLLAPSE.bloomFrom, 1]);
  const cOpacity = useTransform(progress, [COLLAPSE.overlapEnd, COLLAPSE.overlapEnd + 0.05, 1], [0, 1, 1]);

  // Reduced motion: a soft full-screen crossfade.
  const rScale = useTransform(progress, [0, 1], [0.98, 1]);
  const rOpacity = useTransform(progress, [0, 1], [0, 1]);

  const backdropOpacity = useTransform(progress, [0, 1], [0, 0.72]);

  // Panel content reveal — the window it materializes over. flythrough reveals early so the content
  // forms *as* the camera flies in (not after a blank surface); collapse blooms with the node.
  const [revStart, revEnd] = reduced
    ? [0.05, 0.3]
    : isCollapse
      ? COLLAPSE.reveal
      : transition === 'expand'
        ? EXPAND.reveal
        : FLY.reveal;
  const contentOpacity = useTransform(progress, [revStart, revEnd], [0, 1]);
  const contentY = useTransform(progress, [revStart, revEnd], [16, 0]);
  const contentScale = useTransform(progress, [revStart, revEnd], [0.96, 1]);

  const panelStyle = reduced
    ? { position: 'fixed' as const, inset: 0, scale: rScale, opacity: rOpacity, transformOrigin: 'center' }
    : isCollapse
      ? { position: 'fixed' as const, inset: 0, scale: cScale, opacity: cOpacity, transformOrigin: 'center' }
      : { position: 'fixed' as const, top: fTop, left: fLeft, width: fWidth, height: fHeight, borderRadius: fRadius, opacity: fOpacity };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <motion.div
        aria-hidden
        onClick={requestClose}
        style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(4,5,10,1)', opacity: backdropOpacity, backdropFilter: 'blur(6px)' }}
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        style={{ ...panelStyle, zIndex: 9999, overflowY: 'auto', background: surface, outline: 'none', willChange: 'transform' }}
      >
        {/* `isolation: isolate` keeps panel content in its own stacking context, so a panel's internal
            z-indexes can never paint over the chrome. */}
        <motion.div style={{ opacity: contentOpacity, y: contentY, scale: contentScale, minHeight: '100%', isolation: 'isolate' }}>
          <ScenePanelContext.Provider value={panelRef}>{children}</ScenePanelContext.Provider>
        </motion.div>
      </motion.div>
      {/* The ✕ lives OUTSIDE the panel: the panel is the scroll container and a transformed/will-change
          containing block, which would make a `position: fixed` child behave like `absolute` and scroll
          away. As a portal-level sibling it's truly viewport-fixed — pinned top-right at any scroll. */}
      <motion.button
        type="button"
        onClick={requestClose}
        aria-label="Close"
        style={{
          position: 'fixed',
          top: 18,
          right: 18,
          zIndex: 10000,
          opacity: contentOpacity,
          width: 38,
          height: 38,
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.16)',
          background: 'rgba(255,255,255,0.06)',
          color: 'rgba(255,255,255,0.85)',
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: 1,
        }}
      >
        ✕
      </motion.button>
    </>,
    document.body,
  );
}
