'use client';

import { useEffect, useRef, useState } from 'react';
import {
  useMounted,
  useReducedMotion,
  useSceneTransition,
  SCENE_COLLAPSE_PHASES,
} from '@umbra/motion';
import { projects } from './projects';
import type { Project } from './projects';

const TILT = (-28 * Math.PI) / 180; // node orbit diagonal (bottom-left → top-right)
const RING_TILT = -TILT; // halo on the opposite diagonal (top-left → bottom-right)
const SPEED = 26; // seconds per revolution (shared ring)
const CENTER_Z = 100;
const RING_COUNT = 24; // dots in the 3D constellation halo around the title
const PATH_COUNT = 36; // dots tracing the node orbit (multiple of 4 → aligns under the cards)

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a || 1), 0, 1);
  return t * t * (3 - 2 * t);
};

/** How many PATH_COUNT steps a path dot sits from the nearest node (0 = on a node, ~4.5 = mid-gap). */
const stepsToNode = (j: number) => {
  const m = PATH_COUNT / projects.length; // steps between adjacent nodes
  const d = ((j % m) + m) % m;
  return Math.min(d, m - d);
};

interface OrbitSystemProps {
  /** The id of the node currently opening/open (null when idle). */
  activeId: string | null;
  /** Report a clicked card's id + viewport rect up to the host (drives the SceneLightbox transition). */
  onOpen: (id: string, rect: DOMRect) => void;
}

/**
 * The signature: four project "notecards" (film frames) orbiting the title on a single diagonal ring,
 * passing in front of and behind it. Hovering a card brings it forward; clicking it reports its rect up
 * so the `SceneLightbox` can fly the camera in or collapse the orbit. During a transition the orbit's
 * own rAF loop is parked and the choreography is driven by the shared `progress` value, so the close is
 * the open in reverse with the orbit resuming exactly where it left off. Reduced motion → still scene.
 */
export function OrbitSystem({ activeId, onOpen }: OrbitSystemProps) {
  const reduced = useReducedMotion();
  // The orbit's geometry is derived from the measured stage size and an animation clock — both
  // client-only — and renders full-precision floats into inline styles. SSR'ing it serializes those
  // floats lossily and trips hydration, so the animated layers render only after mount; the server
  // and first client render are just the static title (a deterministic, matching tree).
  const mounted = useMounted();
  const scene = useSceneTransition();
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 760, h: 520 });
  const [hovered, setHovered] = useState<string | null>(null);
  const hoveredRef = useRef<string | null>(null);
  const elapsed = useRef(0);
  const [, force] = useState(0);
  // Briefly ignore hover right after a close: the SceneLightbox restores focus to the trigger card,
  // which would re-fire its onFocus → setHover and re-pause the orbit. This window swallows that.
  const suppressHoverRef = useRef(false);

  const transitioning = scene != null && scene.state !== 'closed';
  const setHover = (id: string | null) => {
    if (transitioning || suppressHoverRef.current) return;
    hoveredRef.current = id;
    setHovered(id);
  };

  // measure the stage so the orbit is responsive
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // orbit loop — parked while a node is opening/open (so transitions aren't clobbered, and `elapsed`
  // freezes → the orbit resumes seamlessly on close).
  useEffect(() => {
    if (reduced || transitioning) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      if (hoveredRef.current === null) elapsed.current += dt;
      force((n) => (n + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced, transitioning]);

  // during a transition, re-render off the shared progress so the collapse choreography tracks it.
  useEffect(() => {
    if (!scene) return;
    const unsub = scene.progress.on('change', () => force((n) => (n + 1) % 1_000_000));
    return unsub;
  }, [scene]);

  // A clicked card is still "hovered" when it opens, and its pointerleave is suppressed during the
  // transition. Clear the hover both on open (so the loop's `elapsed` advances again on close) and on
  // close — and on close briefly suppress hover so the focus-restore can't immediately re-select it.
  useEffect(() => {
    hoveredRef.current = null;
    setHovered(null);
    if (transitioning) return;
    suppressHoverRef.current = true;
    const id = window.setTimeout(() => {
      suppressHoverRef.current = false;
    }, 350);
    return () => window.clearTimeout(id);
  }, [transitioning]);

  const t = reduced ? 0 : elapsed.current / 1000;
  // Rounder ellipse (closer rx/ry) so the evenly-spaced nodes read as a clean circular orbit.
  const rx = size.w * 0.36;
  const ry = size.h * 0.42;
  const omega = (Math.PI * 2) / SPEED;

  // ── transition sampling ────────────────────────────────────────────────────
  const p = transitioning ? scene!.progress.get() : 0;
  const kind = scene?.transition;
  const phase = scene ? scene.phaseOf(p) : 'idle';
  const isCollapse = transitioning && kind === 'collapse' && !reduced;
  const isFly = transitioning && kind === 'flythrough' && !reduced;
  const { spinEnd, overlapEnd } = SCENE_COLLAPSE_PHASES;

  // collapse: radius collapses late (stays open early, sucks in near the end of phase 1); spin ramps up.
  const u = isCollapse ? clamp(p / spinEnd, 0, 1) : 0;
  const radiusScale = isCollapse ? 1 - u * u : 1;
  const extraSpin = isCollapse ? Math.PI * 2 * 1.5 * (u * u) : 0;
  // fade the halo + path dots out as the field collapses
  const sceneFade = isCollapse ? smoothstep(0, spinEnd, p) : 0;
  const revealK =
    isCollapse && phase === 'reveal' ? clamp((p - overlapEnd) / (1 - overlapEnd), 0, 1) : 0;

  const rxEff = rx * radiusScale;
  const ryEff = ry * radiusScale;

  return (
    <div
      ref={stageRef}
      className="relative"
      style={{ width: 'min(94vw, 780px)', height: 'min(66vh, 540px)', pointerEvents: 'none' }}
    >
      {/* center title (fades out as the orbit collapses into the panel) */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        style={{ zIndex: CENTER_Z, opacity: 1 - revealK }}
      >
        <div
          className="u-display font-semibold tracking-tight text-[color:var(--ice)]"
          style={{ fontSize: 'clamp(28px, 5vw, 52px)', lineHeight: 1.02 }}
        >
          Timmy’s
          <br />
          Portfolio
        </div>
        <div className="u-mono mt-3 text-[10px] tracking-[0.2em] text-[color:var(--muted)]">
          a constellation of work, builds, and background
        </div>
      </div>

      {/* Animated layers (halo, path dots, cards) are float-positioned from measurement + the animation
          clock — client-only, so they're gated on mount to keep the SSR/first-render tree static. */}
      {mounted && (
        <>
          {/* 3D constellation halo encircling the title (dots pass in front of & behind it) */}
          {Array.from({ length: RING_COUNT }).map((_, j) => {
            const a = (j * Math.PI * 2) / RING_COUNT - t * ((Math.PI * 2) / 44);
            const ringRx = Math.min(size.w * 0.27, 220);
            const ringRy = ringRx * 0.5;
            // ellipse rotated onto the opposite diagonal from the node orbit
            const bx = ringRx * Math.cos(a);
            const by = ringRy * Math.sin(a);
            const x = bx * Math.cos(RING_TILT) - by * Math.sin(RING_TILT);
            const y = bx * Math.sin(RING_TILT) + by * Math.cos(RING_TILT);
            const depth = Math.sin(a);
            const dn = depth * 0.5 + 0.5;
            const d = 2 + 2.4 * dn;
            return (
              <span
                key={`ring-${j}`}
                aria-hidden
                className="absolute left-1/2 top-1/2 rounded-full"
                style={{
                  width: d,
                  height: d,
                  background: 'var(--accent)',
                  // raised floor so the back of the ring stays clearly visible
                  opacity: (0.38 + 0.5 * dn) * (1 - sceneFade),
                  boxShadow: '0 0 6px color-mix(in srgb, var(--accent) 50%, transparent)',
                  zIndex: CENTER_Z + Math.round(depth * 12),
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                  pointerEvents: 'none',
                }}
              />
            );
          })}

          {/* dotted node-orbit path — traces the ring the cards ride. Dots sit in a z-band *below* the cards
          and fade out near each node, so they only show along the connecting arcs between nodes. */}
          {Array.from({ length: PATH_COUNT }).map((_, j) => {
            const theta = (j * Math.PI * 2) / PATH_COUNT + t * omega + extraSpin;
            const bx = rxEff * Math.cos(theta);
            const by = ryEff * Math.sin(theta);
            const x = bx * Math.cos(TILT) - by * Math.sin(TILT);
            const y = bx * Math.sin(TILT) + by * Math.cos(TILT);
            const depth = Math.sin(theta);
            const dn = depth * 0.5 + 0.5;
            const d = 2 + 2.8 * dn;
            const gap = smoothstep(0.5, 3, stepsToNode(j)); // 0 near a node, 1 mid-gap
            return (
              <span
                key={`path-${j}`}
                aria-hidden
                className="absolute left-1/2 top-1/2 rounded-full"
                style={{
                  width: d,
                  height: d,
                  background: 'var(--accent)',
                  opacity: (0.32 + 0.55 * dn) * gap * (1 - sceneFade),
                  boxShadow: '0 0 7px color-mix(in srgb, var(--accent) 55%, transparent)',
                  // strictly below the cards' band (cards add +24) so a node is always on top of the path
                  zIndex: CENTER_Z + Math.round(depth * 40),
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                  pointerEvents: 'none',
                }}
              />
            );
          })}

          {/* orbiting notecards (evenly spaced on one diagonal ring) */}
          {projects.map((p_, i) => {
            const theta = (i * Math.PI * 2) / projects.length + t * omega + extraSpin;
            const bx = rxEff * Math.cos(theta);
            const by = ryEff * Math.sin(theta);
            let x = bx * Math.cos(TILT) - by * Math.sin(TILT);
            let y = bx * Math.sin(TILT) + by * Math.cos(TILT);
            const depth = Math.sin(theta); // -1 (behind) .. 1 (front)
            const dn = depth * 0.5 + 0.5; // 0..1
            const sel = hovered === p_.id && !transitioning;
            const isActive = activeId === p_.id;

            let scale = sel ? 1.18 : 0.6 + 0.56 * dn;
            let opacity = sel ? 1 : 0.45 + 0.55 * dn;
            let z = sel ? 220 : CENTER_Z + Math.round(depth * 55) + 24; // +24 keeps cards above the path dots
            let blur = sel ? 0 : (1 - dn) * 2.5;

            if (isCollapse) {
              // shrink every card toward the center stack by the overlap beat
              const cp = clamp(p / overlapEnd, 0, 1);
              scale = (0.6 + 0.56 * dn) * (1 - cp) + 0.5 * cp;
              blur = 0;
              if (phase === 'reveal') {
                if (isActive) {
                  // the active card hands off to the blooming panel
                  opacity = clamp(1 - revealK / 0.4, 0, 1);
                } else {
                  // the other three burst outward along their (un-collapsed) direction and fade
                  const fbx = rx * Math.cos(theta);
                  const fby = ry * Math.sin(theta);
                  const dx = fbx * Math.cos(TILT) - fby * Math.sin(TILT);
                  const dy = fbx * Math.sin(TILT) + fby * Math.cos(TILT);
                  const len = Math.hypot(dx, dy) || 1;
                  x += (dx / len) * size.w * 0.42 * revealK;
                  y += (dy / len) * size.h * 0.42 * revealK;
                  scale = 0.5 * (1 - revealK) + 0.16 * revealK;
                  opacity = 1 - revealK;
                }
              }
              z = isActive ? 230 : CENTER_Z + Math.round(depth * 55) + 24;
            } else if (isFly && isActive) {
              // the panel morphs out of this card's rect — hide the original so it doesn't double up
              opacity = 0;
            }

            return (
              <div
                key={p_.id}
                onPointerEnter={() => setHover(p_.id)}
                onPointerLeave={() => setHover(null)}
                className="absolute left-1/2 top-1/2"
                style={{
                  zIndex: z,
                  opacity,
                  filter: blur ? `blur(${blur}px)` : undefined,
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`,
                  transformOrigin: 'center',
                  pointerEvents: transitioning ? 'none' : 'auto',
                  transition: sel
                    ? 'transform 0.25s ease, opacity 0.2s ease, filter 0.25s ease'
                    : 'none',
                }}
              >
                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-label={`${p_.name} — ${p_.kind}`}
                  onClick={(e) => onOpen(p_.id, e.currentTarget.getBoundingClientRect())}
                  onFocus={() => setHover(p_.id)}
                  onBlur={() => setHover(null)}
                  style={{
                    display: 'block',
                    cursor: 'pointer',
                    margin: 0,
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    font: 'inherit',
                    color: 'inherit',
                    textAlign: 'inherit',
                  }}
                >
                  <Notecard project={p_} selected={sel} />
                </button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function Notecard({ project, selected }: { project: Project; selected: boolean }) {
  const sprocket = 'repeating-linear-gradient(90deg, var(--line) 0 4px, transparent 4px 11px)';
  return (
    <div
      className="relative overflow-hidden rounded-lg backdrop-blur-sm"
      style={{
        width: 184,
        background: 'color-mix(in srgb, var(--deep) 84%, transparent)',
        // outline is always on; it lightens with the card's overall opacity as it orbits behind.
        border: `1px solid ${selected ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 60%, transparent)'}`,
        boxShadow: selected
          ? '0 0 30px color-mix(in srgb, var(--accent) 45%, transparent)'
          : '0 10px 34px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ height: 9, background: sprocket }} />
      <div className="px-4 py-3 text-center">
        <div className="u-display text-lg font-semibold text-[color:var(--ice)]">
          {project.name}
        </div>
        <div className="u-mono mt-1 text-[9px] tracking-wide text-[color:var(--muted)]">
          {project.kind}
        </div>
        {selected && (
          <div className="mt-2 text-[12px] leading-snug text-[color:var(--muted)]">
            {project.blurb}
          </div>
        )}
      </div>
      <div style={{ height: 9, background: sprocket }} />
    </div>
  );
}
