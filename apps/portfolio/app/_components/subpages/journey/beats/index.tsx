'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useScroll, useTransform } from 'motion/react';
import type { MotionValue } from 'motion/react';
import type { RefObject } from 'react';
import type { BeatKey } from '../../../../_data/caseStudies';

/**
 * "Motion beats" — the signature visual scrubbed above each case-study card. Each beat reads the panel
 * scroll over its own element with offset ['start end', 'start start']: progress runs 0 → 1 as the card
 * rises into its ScrollStack pin (and reverses on the way back down), so the motion *assembles* into
 * place and holds its finished frame while the card is pinned. Under reduced motion every beat renders
 * that finished frame statically (the `reduced` branch forces the transform to its p = 1 value).
 */
export function BeatScene({
  beat,
  panelRef,
  reduced,
}: {
  beat: BeatKey;
  panelRef?: RefObject<HTMLElement | null>;
  reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    ...(panelRef ? { container: panelRef } : {}),
    offset: ['start end', 'start start'],
  });

  return (
    <div
      ref={ref}
      className="relative mb-6 overflow-hidden rounded-xl"
      style={{
        height: 'clamp(200px, 32vh, 300px)',
        background: 'color-mix(in srgb, var(--void) 70%, transparent)',
        border: '1px solid color-mix(in srgb, var(--accent) 14%, transparent)',
      }}
    >
      <Beat beat={beat} p={scrollYProgress} reduced={reduced} />
    </div>
  );
}

function Beat({ beat, p, reduced }: { beat: BeatKey; p: MotionValue<number>; reduced: boolean }) {
  switch (beat) {
    case 'orbit-intro':
      return <LoneOrbitBeat p={p} reduced={reduced} />;
    case 'orbit-assemble':
      return <ReverseOrbitBeat p={p} reduced={reduced} />;
    case 'collapse':
      return <CollapseBeat p={p} reduced={reduced} />;
    case 'preset-toggle':
      return <TokenPlaygroundBeat p={p} reduced={reduced} />;
    case 'fly-through':
      return <FlyThroughBeat p={p} reduced={reduced} />;
    case 'reference-strip':
      return <ReferenceStripBeat p={p} reduced={reduced} />;
    case 'helix-resolve':
      return <HelixResolveBeat p={p} reduced={reduced} />;
    case 'settle':
      return <SettleBeat p={p} reduced={reduced} />;
    default:
      return null;
  }
}

// ── shared geometry (mirrors OrbitSystem's ellipse + diagonal tilt) ───────────
const TILT = (-28 * Math.PI) / 180;
const project = (theta: number, rx: number, ry: number) => {
  const bx = rx * Math.cos(theta);
  const by = ry * Math.sin(theta);
  return {
    x: bx * Math.cos(TILT) - by * Math.sin(TILT),
    y: bx * Math.sin(TILT) + by * Math.cos(TILT),
    depth: Math.sin(theta), // -1 behind … 1 front
  };
};

function Center({ label }: { label: string }) {
  return (
    <div
      className="u-mono absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] tracking-[0.25em] text-[color:var(--muted)]"
      aria-hidden
    >
      {label}
    </div>
  );
}

// ── orbit machinery (Cards 1 & 5) ─────────────────────────────────────────────
// These two beats layer a continuous rAF "spin" over the scroll scrub: scroll modulates the spin
// *rate* and the orbit *radius*, while a single always-running integrator advances the angle. Because
// the integrator never resets, scrolling back up reverses the motion seamlessly with no snapshot/phase
// bookkeeping. The per-frame dt is clamped so a tab-away pause resumes without a jump.
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ORBIT_RX = 108;
const ORBIT_RY = 66;
const BASE_ORBIT = (Math.PI * 2) / 12; // rad/s at speed 1 (≈ 12s per revolution)

const card1Speed = (pv: number) => 0.35 + 0.35 * pv; // creeps in, speeds up, never reaches full
const card5Speed = (pv: number) => 2 - clamp01(pv / 0.6); // whirls collapsed (2×) → 1× once expanded
const fullRadius = () => 1; // Card 1 node traces the whole path from the start
const expandRadius = (pv: number) => clamp01(pv / 0.6); // Card 5 nodes spread out as you scroll in

/** A motion value holding a monotonically advancing orbit angle (radians), paced by scroll position. */
function useOrbitSpin(reduced: boolean, p: MotionValue<number>, speedOf: (pv: number) => number) {
  const spin = useMotionValue(0);
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05); // clamp → no jump after a hidden-tab pause
      last = now;
      spin.set(spin.get() + BASE_ORBIT * speedOf(clamp01(p.get())) * dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced, p, spin, speedOf]);
  return spin;
}

/** Faint dotted ellipse tracing the orbit path (mirrors the launch-page look). */
function PathRing({ count = 36 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, j) => {
        const { x, y, depth } = project((j / count) * Math.PI * 2, ORBIT_RX, ORBIT_RY);
        const dn = depth * 0.5 + 0.5;
        const d = 2 + 2 * dn;
        return (
          <span
            key={j}
            aria-hidden
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: d,
              height: d,
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
              background: 'var(--accent)',
              opacity: 0.14 + 0.2 * dn,
              boxShadow: '0 0 6px color-mix(in srgb, var(--accent) 40%, transparent)',
            }}
          />
        );
      })}
    </>
  );
}

/** A single orbiting node card; its angle comes from the shared spin, its radius from scroll. */
function OrbitDot({
  spin,
  p,
  reduced,
  base,
  radiusOf,
}: {
  spin: MotionValue<number>;
  p: MotionValue<number>;
  reduced: boolean;
  base: number;
  radiusOf: (pv: number) => number;
}) {
  const inputs = [spin, p] as MotionValue<number>[];
  const transform = useTransform(inputs, (latest: number[]) => {
    const s = reduced ? 0 : (latest[0] ?? 0);
    const R = radiusOf(reduced ? 1 : (latest[1] ?? 0));
    const { x, y, depth } = project(base + s, ORBIT_RX * R, ORBIT_RY * R);
    const dn = depth * 0.5 + 0.5;
    const sc = 0.62 + 0.46 * dn;
    return `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${sc})`;
  });
  const opacity = useTransform(inputs, (latest: number[]) => {
    const dn = Math.sin(base + (reduced ? 0 : (latest[0] ?? 0))) * 0.5 + 0.5;
    return 0.5 + 0.5 * dn;
  });
  return (
    <motion.div
      aria-hidden
      className="absolute left-1/2 top-1/2 rounded-md"
      style={{
        width: 52,
        height: 33,
        transform,
        opacity,
        background: 'color-mix(in srgb, var(--deep) 86%, transparent)',
        border: '1px solid color-mix(in srgb, var(--accent) 55%, transparent)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
      }}
    />
  );
}

// ── Card 1: a lone node starting up (slow orbit, speeds up on scroll, never full) ─
function LoneOrbitBeat({ p, reduced }: { p: MotionValue<number>; reduced: boolean }) {
  const spin = useOrbitSpin(reduced, p, card1Speed);
  const fade = useTransform(p, [0, 0.55], [0, 1]); // gentle fade-in on entry, no pop
  return (
    <div className="absolute inset-0">
      <PathRing />
      <Center label="UMBRA" />
      <motion.div className="absolute inset-0" style={{ opacity: reduced ? 1 : fade }}>
        <OrbitDot spin={spin} p={p} reduced={reduced} base={-Math.PI / 2} radiusOf={fullRadius} />
      </motion.div>
    </div>
  );
}

// ── Card 5: reverse-collapse → full orbit, then a gentle idle rotation ─────────
function ReverseOrbitBeat({ p, reduced }: { p: MotionValue<number>; reduced: boolean }) {
  const spin = useOrbitSpin(reduced, p, card5Speed);
  const ringOpacity = useTransform(p, [0.15, 0.6], [0, 1]); // ring resolves as the orbit forms
  return (
    <div className="absolute inset-0">
      <motion.div className="absolute inset-0" style={{ opacity: reduced ? 1 : ringOpacity }}>
        <PathRing />
      </motion.div>
      <Center label="SYSTEM" />
      {Array.from({ length: 4 }).map((_, i) => (
        <OrbitDot
          key={i}
          spin={spin}
          p={p}
          reduced={reduced}
          base={(i / 4) * Math.PI * 2 - Math.PI / 2}
          radiusOf={expandRadius}
        />
      ))}
    </div>
  );
}

// ── collapse (Card 3): node spins up, contracts to 0, then blooms into a panel ─
function CollapseBeat({ p, reduced }: { p: MotionValue<number>; reduced: boolean }) {
  const rx = 96;
  const ry = 62;
  // node: orbits, then accelerates angularly while its radius contracts to center over p 0 → 0.6.
  const nodeTransform = useTransform(p, (v) => {
    const pr = reduced ? 1 : v;
    const collapse = Math.min(1, pr / 0.6); // 0 → 1 across the first 60%
    const r = 1 - collapse; // orbit radius shrinks to 0
    const spin = collapse * collapse * Math.PI * 4; // angular velocity ramps up (eased)
    const { x, y, depth } = project(-Math.PI / 2 + spin, rx * r, ry * r);
    const dn = depth * 0.5 + 0.5;
    const s = (0.7 + 0.5 * dn) * (1 - collapse * 0.6);
    return `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${s})`;
  });
  // hand off to the panel right as the node reaches center.
  const nodeOpacity = useTransform(p, (v) => {
    const pr = reduced ? 1 : v;
    return pr < 0.55 ? 1 : Math.max(0, 1 - (pr - 0.55) / 0.1);
  });
  // panel: blooms out of the collapsed center over p 0.55 → 1.
  const panelScale = useTransform(p, (v) => {
    const pr = reduced ? 1 : v;
    return 0.2 + Math.max(0, (pr - 0.55) / 0.45) * 0.8;
  });
  const panelOpacity = useTransform(p, (v) => {
    const pr = reduced ? 1 : v;
    return Math.min(1, Math.max(0, (pr - 0.55) / 0.2));
  });
  return (
    <div className="absolute inset-0 grid place-items-center">
      <Center label="CLICK" />
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 rounded-md"
        style={{
          width: 54,
          height: 34,
          transform: nodeTransform,
          opacity: nodeOpacity,
          background: 'color-mix(in srgb, var(--deep) 86%, transparent)',
          border: '1px solid color-mix(in srgb, var(--accent) 55%, transparent)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
        }}
      />
      <motion.div
        className="u-mono grid place-items-center rounded-lg text-[10px] tracking-[0.2em] text-[color:var(--ice)]"
        style={{
          scale: panelScale,
          opacity: panelOpacity,
          width: 150,
          height: 96,
          background: 'color-mix(in srgb, var(--deep) 94%, transparent)',
          border: '1px solid var(--accent)',
          boxShadow: '0 18px 50px rgba(0,0,0,0.5)',
        }}
      >
        EXPAND
      </motion.div>
    </div>
  );
}

// ── token playground (Card 2): one preview dot driven by three independent, draggable token sliders ─
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const V_MIN = 45; // px/s at speed 0
const V_MAX = 430; // px/s at speed 1
const DOT = 16;
const PAD = 12; // dot's left inset (ml-3)
const EDGE_MARGIN = 8; // keep the dot's glow off the box edges

/**
 * Movement character: snap 0 = smooth & even, snap 1 = dwell-at-the-ends then dart across. A bounded
 * steepness ease — monotonic 0→1 with easeShape(0)=0 and easeShape(1)=1 — so the dot always stops
 * exactly at the Distance endpoint (Snap shapes the motion, never the reach).
 */
const easeShape = (s: number, snap: number) => {
  const p = lerp(2, 6, snap);
  const a = Math.pow(s, p);
  const b = Math.pow(1 - s, p);
  return a / (a + b || 1);
};

function TokenPlaygroundBeat({ reduced }: { p: MotionValue<number>; reduced: boolean }) {
  // Three independent tokens, all user-draggable: Speed = rate, Distance = travel, Snap = character.
  const [speed, setSpeed] = useState(0.25); // default to a slower rate
  const [distance, setDistance] = useState(1); // default: full-width travel
  const [snap, setSnap] = useState(0); // default: normal (un-snappy) movement
  return (
    <div className="absolute inset-0 flex flex-col gap-3 px-5 py-3">
      <PreviewStage speed={speed} distance={distance} snap={snap} reduced={reduced} />
      <div className="flex flex-col gap-2">
        <SliderRow label="SPEED" value={speed} onChange={reduced ? undefined : setSpeed} />
        <SliderRow label="DISTANCE" value={distance} onChange={reduced ? undefined : setDistance} />
        <SliderRow label="SNAP" value={snap} onChange={reduced ? undefined : setSnap} />
      </div>
      {!reduced && (
        <span
          aria-hidden
          className="u-mono pointer-events-none text-center text-[8px] tracking-[0.2em] text-[color:var(--muted)]"
        >
          drag sliders to make changes
        </span>
      )}
    </div>
  );
}

/**
 * The single live preview: one dot bouncing left↔right, driven by a manual rAF oscillator that reads
 * the three token values live each frame. Speed sets the velocity (px/s), Distance sets the amplitude
 * (turn-around point), Snap shapes the easing. Because position = amplitude · easeShape(phase) and the
 * phase advances continuously, changing any value adjusts the motion in place — no restart, and Distance
 * never bleeds into the rate (period scales with amplitude to hold velocity constant).
 */
function PreviewStage({
  speed,
  distance,
  snap,
  reduced,
}: {
  speed: number;
  distance: number;
  snap: number;
  reduced: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxW, setBoxW] = useState(280);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBoxW(el.clientWidth));
    ro.observe(el);
    setBoxW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // mirror live values into refs so the rAF loop reads the latest without re-subscribing / restarting
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const distRef = useRef(distance);
  distRef.current = distance;
  const snapRef = useRef(snap);
  snapRef.current = snap;
  const widthRef = useRef(boxW);
  widthRef.current = boxW;

  const x = useMotionValue(0);
  const phaseRef = useRef(0);
  useEffect(() => {
    if (reduced) {
      x.set(0);
      return;
    }
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const v = lerp(V_MIN, V_MAX, speedRef.current);
      const maxTravel = Math.max(8, widthRef.current - DOT - PAD * 2 - EDGE_MARGIN);
      const A = Math.max(6, maxTravel * distRef.current);
      const period = Math.max(0.2, (2 * A) / v); // velocity ~constant as amplitude changes
      phaseRef.current = (phaseRef.current + dt / period) % 1;
      const ph = phaseRef.current;
      const s = ph < 0.5 ? ph * 2 : (ph - 0.5) * 2; // 0→1 within each half-cycle
      const eased = easeShape(s, snapRef.current);
      const posNorm = ph < 0.5 ? eased : 1 - eased; // out, then back
      x.set(A * posNorm);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced, x]);

  return (
    <div
      ref={boxRef}
      className="relative flex h-[88px] w-full items-center overflow-hidden rounded-lg"
      style={{
        background: 'color-mix(in srgb, var(--void) 60%, transparent)',
        border: '1px solid color-mix(in srgb, var(--accent) 14%, transparent)',
      }}
    >
      <motion.div
        aria-hidden
        className="ml-3 h-4 w-4 shrink-0 rounded-full"
        style={{
          x: reduced ? 0 : x,
          background: 'var(--accent)',
          boxShadow: '0 0 10px color-mix(in srgb, var(--accent) 60%, transparent)',
        }}
      />
    </div>
  );
}

/** A labelled slider row. Read-only when `onChange` is omitted (the scroll-locked Speed slider). */
function SliderRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange?: (v: number) => void;
}) {
  const interactive = !!onChange;
  const trackRef = useRef<HTMLDivElement>(null);
  const setFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el || !onChange) return;
    const r = el.getBoundingClientRect();
    onChange(clamp01((clientX - r.left) / r.width));
  };
  return (
    <div className="flex items-center gap-3">
      <span className="u-mono w-16 shrink-0 text-[9px] tracking-[0.2em] text-[color:var(--muted)]">
        {label}
      </span>
      <div
        ref={trackRef}
        role={interactive ? 'slider' : undefined}
        aria-label={interactive ? label : undefined}
        aria-valuemin={interactive ? 0 : undefined}
        aria-valuemax={interactive ? 100 : undefined}
        aria-valuenow={interactive ? Math.round(value * 100) : undefined}
        tabIndex={interactive ? 0 : undefined}
        onPointerDown={
          interactive
            ? (e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setFromClientX(e.clientX);
              }
            : undefined
        }
        onPointerMove={
          interactive
            ? (e) => {
                if (e.buttons) setFromClientX(e.clientX);
              }
            : undefined
        }
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                  onChange?.(clamp01(value + 0.05));
                  e.preventDefault();
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                  onChange?.(clamp01(value - 0.05));
                  e.preventDefault();
                }
              }
            : undefined
        }
        className={`relative h-4 flex-1 ${interactive ? 'cursor-pointer' : ''}`}
        style={interactive ? { touchAction: 'none' } : { pointerEvents: 'none' }}
      >
        <div
          className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 rounded-full"
          style={{ background: 'color-mix(in srgb, var(--accent) 20%, transparent)' }}
        />
        <div
          className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full"
          style={{ width: `${value * 100}%`, background: 'color-mix(in srgb, var(--accent) 55%, transparent)' }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ left: `${value * 100}%`, background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }}
        />
      </div>
    </div>
  );
}

// ── fly-through (Card 4): backdrop + panel scale toward focus at different rates ─
function FlyThroughBeat({ p, reduced }: { p: MotionValue<number>; reduced: boolean }) {
  // world recedes slowly while the focused panel rushes forward — the parallax that reads as a
  // fly-through rather than a popup.
  const worldScale = useTransform(p, (v) => 1 + (reduced ? 1 : v) * 0.7);
  const worldOpacity = useTransform(p, (v) => 0.5 - (reduced ? 1 : v) * 0.4);
  const panelScale = useTransform(p, (v) => 0.3 + (reduced ? 1 : v) * 0.7);
  const panelOpacity = useTransform(p, (v) => Math.min(1, (reduced ? 1 : v) * 1.6));
  return (
    <div className="absolute inset-0 grid place-items-center">
      <motion.div
        aria-hidden
        className="absolute inset-6 rounded-lg"
        style={{
          scale: worldScale,
          opacity: worldOpacity,
          background:
            'repeating-linear-gradient(0deg, color-mix(in srgb, var(--accent) 18%, transparent) 0 1px, transparent 1px 22px), repeating-linear-gradient(90deg, color-mix(in srgb, var(--accent) 18%, transparent) 0 1px, transparent 1px 22px)',
        }}
      />
      <motion.div
        className="u-mono grid place-items-center rounded-lg text-[10px] tracking-[0.2em] text-[color:var(--ice)]"
        style={{
          scale: panelScale,
          opacity: panelOpacity,
          width: 132,
          height: 84,
          background: 'color-mix(in srgb, var(--deep) 94%, transparent)',
          border: '1px solid var(--accent)',
          boxShadow: '0 18px 50px rgba(0,0,0,0.5)',
        }}
      >
        PANEL
      </motion.div>
    </div>
  );
}

// ── reference strip (Card 5): thumbnails of the sites used as references ───────
function ReferenceStripBeat({ p, reduced }: { p: MotionValue<number>; reduced: boolean }) {
  const x = useTransform(p, (v) => `${(reduced ? 0 : 1 - v) * -120}px`);
  return (
    <div className="absolute inset-0 flex items-center overflow-hidden">
      <motion.div className="flex gap-3 px-5" style={{ x }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="u-mono grid h-28 w-44 shrink-0 place-items-center rounded-md text-[9px] tracking-[0.2em] text-[color:var(--muted)]"
            style={{
              background: 'color-mix(in srgb, var(--deep) 80%, transparent)',
              border: '1px dashed color-mix(in srgb, var(--accent) 30%, transparent)',
            }}
          >
            TODO: reference {i + 1}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ── helix → resolve (Card 6): the cut idea tries to form, then settles simpler ─
function HelixResolveBeat({ p, reduced }: { p: MotionValue<number>; reduced: boolean }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      {Array.from({ length: 9 }).map((_, i) => (
        <HelixDot key={i} p={p} reduced={reduced} i={i} />
      ))}
      <Center label="SHIPPED" />
    </div>
  );
}

function HelixDot({ p, reduced, i }: { p: MotionValue<number>; reduced: boolean; i: number }) {
  // p < 0.55: a helix twists into being; p > 0.55: it collapses into a tidy vertical stack (the design
  // that actually shipped).
  const transform = useTransform(p, (v) => {
    const pr = reduced ? 1 : v;
    const t = i / 8;
    if (pr < 0.55) {
      const k = pr / 0.55;
      const ang = t * Math.PI * 3 * k;
      const x = Math.cos(ang) * 60 * k;
      const y = (t - 0.5) * 150;
      return `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    }
    const k = (pr - 0.55) / 0.45;
    const ang = t * Math.PI * 3 * (1 - k);
    const x = Math.cos(ang) * 60 * (1 - k);
    const y = (t - 0.5) * 150;
    return `translate(-50%, -50%) translate(${x * (1 - k)}px, ${y}px)`;
  });
  const bg = useTransform(p, (v) =>
    (reduced ? 1 : v) > 0.55
      ? 'var(--active)'
      : 'color-mix(in srgb, var(--accent) 60%, transparent)',
  );
  return (
    <motion.div
      aria-hidden
      className="absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-full"
      style={{ transform, background: bg }}
    />
  );
}

// ── settle (Card 7): everything comes to final rest ───────────────────────────
function SettleBeat({ p, reduced }: { p: MotionValue<number>; reduced: boolean }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      {['SYSTEM', 'LIBRARY', 'PLAYGROUND', 'SITE'].map((label, i) => (
        <SettleChip key={label} p={p} reduced={reduced} i={i} label={label} />
      ))}
    </div>
  );
}

function SettleChip({
  p,
  reduced,
  i,
  label,
}: {
  p: MotionValue<number>;
  reduced: boolean;
  i: number;
  label: string;
}) {
  const y = useTransform(p, (v) => `${(1 - (reduced ? 1 : v)) * (24 + i * 8)}px`);
  const opacity = useTransform(p, (v) => Math.min(1, (reduced ? 1 : v) * 1.4 - i * 0.1));
  return (
    <motion.div
      className="u-mono absolute rounded-full px-3 py-1 text-[9px] tracking-[0.2em] text-[color:var(--ice)]"
      style={{
        y,
        opacity,
        left: `${18 + i * 18}%`,
        top: `${30 + (i % 2) * 28}%`,
        background: 'color-mix(in srgb, var(--deep) 88%, transparent)',
        border: '1px solid color-mix(in srgb, var(--active) 40%, transparent)',
      }}
    >
      {label}
    </motion.div>
  );
}
