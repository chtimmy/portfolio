'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import {
  SceneLightbox,
  ScrollStack,
  SmoothScroll,
  StickyScene,
  useReducedMotion,
  useSceneTransition,
  SCENE_COLLAPSE_PHASES,
} from '@umbra/motion';
import type { SceneTransition } from '@umbra/motion';

export const SKILLS = ['Motion', 'React', 'TypeScript', 'Tailwind', 'Next.js', 'Design Systems', 'Vite'];

/** A static gradient stand-in for image demos (no external asset). */
export const DEMO_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='260'>
       <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
         <stop offset='0' stop-color='#20283b'/><stop offset='1' stop-color='#5b6b8c'/>
       </linearGradient></defs>
       <rect width='480' height='260' fill='url(#g)'/>
       <text x='28' y='232' fill='#ffffff' opacity='0.85' font-family='monospace' font-size='20'>umbra / image</text>
     </svg>`,
  );

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[color:var(--color-line)] bg-white px-3 py-1 text-sm">
      {children}
    </span>
  );
}

export function BgBox({ children, bg, height = 'h-56' }: { children: ReactNode; bg: string; height?: string }) {
  return (
    <div className={`relative ${height} w-full overflow-hidden rounded-lg`} style={{ background: bg }}>
      {children}
    </div>
  );
}

export function Centered({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center font-mono text-sm"
      style={{ color: dark ? 'rgba(20,22,27,0.5)' : 'rgba(255,255,255,0.85)' }}
    >
      {children}
    </div>
  );
}

/**
 * A scrollable box for demoing scroll-driven components. Hands its scroll element back via the
 * `children` (and optional `pinned`) render props so components can receive it as their
 * `root`/`container`. Tall spacers create scroll room; a sticky hint shows there's something to do.
 */
export function ScrollBox({
  children,
  pinned,
}: {
  children: (ref: RefObject<HTMLDivElement | null>) => ReactNode;
  pinned?: (ref: RefObject<HTMLDivElement | null>) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="relative w-full">
      {pinned?.(ref)}
      <div
        ref={ref}
        className="relative h-80 w-full overflow-y-auto rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-canvas)]"
      >
        <div className="pointer-events-none sticky top-2 z-10 text-center font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
          ↓ scroll ↓
        </div>
        <div style={{ height: '78%' }} />
        <div className="flex justify-center px-6 py-8">{children(ref)}</div>
        <div style={{ height: '72%' }} />
      </div>
    </div>
  );
}

/** Self-contained StickyScene demo: scroll the panel and the row pins, then slides sideways. */
export function StickySceneDemo({ scrollLength, accent }: { scrollLength: number; accent: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative h-80 w-full overflow-y-auto rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-canvas)]"
    >
      <div className="pointer-events-none sticky top-2 z-10 text-center font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
        ↓ scroll — the row pins &amp; slides ↓
      </div>
      <StickyScene root={ref} scrollLength={scrollLength}>
        {['Scene 01', 'Scene 02', 'Scene 03', 'Scene 04', 'Scene 05'].map((t) => (
          <div
            key={t}
            className="mx-3 flex h-40 w-60 flex-shrink-0 items-center justify-center rounded-lg text-lg font-medium text-white"
            style={{ background: accent }}
          >
            {t}
          </div>
        ))}
      </StickyScene>
    </div>
  );
}

/** Self-contained ScrollStack demo: scroll the panel and each card pins as the next overlaps it. */
export function ScrollStackDemo({ scaleStep, gap, accent }: { scaleStep: number; gap: number; accent: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const cards = [
    { n: '01', t: 'Problem', body: 'Each card pins in place…' },
    { n: '02', t: 'Approach', body: '…while the next scrolls up over it…' },
    { n: '03', t: 'Build', body: '…shrinking the covered card into a stack.' },
    { n: '04', t: 'Result', body: 'The last card stays full size.' },
  ];
  return (
    <div
      ref={ref}
      className="relative h-80 w-full overflow-y-auto rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-canvas)]"
    >
      <div className="pointer-events-none sticky top-2 z-20 text-center font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
        ↓ scroll — cards pin &amp; stack ↓
      </div>
      <div className="px-6 pb-32 pt-10">
        <ScrollStack root={ref} topOffset={36} gap={gap} scaleStep={scaleStep} minCardHeight={230}>
          {cards.map((c) => (
            <div
              key={c.n}
              className="flex flex-col justify-between rounded-xl p-6 text-white"
              style={{ background: accent }}
            >
              <span className="font-mono text-xs tracking-widest opacity-80">{c.n}</span>
              <div>
                <div className="text-xl font-semibold">{c.t}</div>
                <p className="mt-1 text-sm opacity-90">{c.body}</p>
              </div>
            </div>
          ))}
        </ScrollStack>
      </div>
    </div>
  );
}

/** Self-contained SmoothScroll demo: nav links ease-scroll the panel below to each section. */
export function SmoothScrollDemo({ offset, accent }: { offset: number; accent: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const sections: [string, string][] = [
    ['intro', 'Intro'],
    ['systems', 'Systems'],
    ['contact', 'Contact'],
  ];
  return (
    <SmoothScroll offset={offset} container={ref} className="w-full">
      <div className="mb-2 flex justify-center gap-2">
        {sections.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="rounded-full border border-[color:var(--color-line)] px-3 py-1 text-sm transition-colors hover:bg-white"
            style={{ color: accent }}
          >
            {label}
          </a>
        ))}
      </div>
      <div
        ref={ref}
        className="relative h-72 w-full overflow-y-auto rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-canvas)]"
      >
        {sections.map(([id, label]) => (
          <section
            key={id}
            id={id}
            className="flex h-64 items-center justify-center border-b border-[color:var(--color-line)] text-2xl font-medium"
          >
            {label}
          </section>
        ))}
      </div>
    </SmoothScroll>
  );
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const DEMO_NODES = ['Systems', 'Automation', 'Design', 'Data'];

/** A faint CSS starfield — the `far` layer of the SceneLightbox demo scene. */
function Starfield() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        background: '#080b14',
        backgroundImage:
          'radial-gradient(1.5px 1.5px at 18% 28%, rgba(255,255,255,0.55), transparent),' +
          'radial-gradient(1.5px 1.5px at 72% 62%, rgba(255,255,255,0.45), transparent),' +
          'radial-gradient(1.5px 1.5px at 42% 78%, rgba(255,255,255,0.5), transparent),' +
          'radial-gradient(1.5px 1.5px at 86% 22%, rgba(255,255,255,0.4), transparent),' +
          'radial-gradient(1.5px 1.5px at 30% 52%, rgba(255,255,255,0.35), transparent),' +
          'radial-gradient(1.5px 1.5px at 60% 16%, rgba(255,255,255,0.45), transparent)',
      }}
    />
  );
}

/** A 4-card ring (the `near` layer) that reads `useSceneTransition()` to spin + collapse + scatter. */
function MiniOrbit({ accent, activeIndex, onOpen }: { accent: string; activeIndex: number | null; onOpen: (i: number, rect: DOMRect) => void }) {
  const scene = useSceneTransition();
  const reduced = useReducedMotion();
  const elapsed = useRef(0);
  const [, force] = useState(0);
  const transitioning = scene != null && scene.state !== 'closed';

  useEffect(() => {
    if (reduced || transitioning) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      elapsed.current += now - last;
      last = now;
      force((n) => (n + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced, transitioning]);

  useEffect(() => {
    if (!scene) return;
    return scene.progress.on('change', () => force((n) => (n + 1) % 1_000_000));
  }, [scene]);

  const t = reduced ? 0 : elapsed.current / 1000;
  const p = transitioning ? scene!.progress.get() : 0;
  const phase = scene ? scene.phaseOf(p) : 'idle';
  const isCollapse = transitioning && scene!.transition === 'collapse' && !reduced;
  const isFly = transitioning && scene!.transition === 'flythrough' && !reduced;
  const { spinEnd, overlapEnd } = SCENE_COLLAPSE_PHASES;
  const u = isCollapse ? clamp(p / spinEnd, 0, 1) : 0;
  const radiusScale = isCollapse ? 1 - u * u : 1;
  const extraSpin = isCollapse ? Math.PI * 2 * 1.5 * (u * u) : 0;
  const revealK = isCollapse && phase === 'reveal' ? clamp((p - overlapEnd) / (1 - overlapEnd), 0, 1) : 0;
  const R = 110;

  return (
    <div className="relative" style={{ width: 320, height: 240, pointerEvents: 'none' }}>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[11px] tracking-[0.2em]" style={{ color: accent, opacity: 1 - revealK }}>
        SCENE
      </div>
      {DEMO_NODES.map((label, i) => {
        const theta = (i * Math.PI * 2) / DEMO_NODES.length + t * 0.5 + extraSpin;
        let x = Math.cos(theta) * R * radiusScale;
        let y = Math.sin(theta) * R * 0.6 * radiusScale;
        const isActive = activeIndex === i;
        let scale = 1;
        let opacity = 1;
        if (isCollapse) {
          const cp = clamp(p / overlapEnd, 0, 1);
          scale = 1 - cp * 0.5;
          if (phase === 'reveal') {
            if (isActive) {
              opacity = clamp(1 - revealK / 0.4, 0, 1);
            } else {
              x += Math.cos(theta) * R * 1.6 * revealK;
              y += Math.sin(theta) * R * revealK;
              scale = 0.5 * (1 - revealK);
              opacity = 1 - revealK;
            }
          }
        } else if (isFly && isActive) {
          opacity = 0;
        }
        return (
          <button
            key={label}
            type="button"
            aria-label={`Open ${label}`}
            onClick={(e) => onOpen(i, e.currentTarget.getBoundingClientRect())}
            className="absolute left-1/2 top-1/2 rounded-md border text-left"
            style={{
              width: 84,
              padding: '8px 10px',
              background: 'rgba(11,15,26,0.86)',
              borderColor: `color-mix(in srgb, ${accent} 60%, transparent)`,
              color: '#eaedf7',
              cursor: 'pointer',
              opacity,
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`,
              pointerEvents: transitioning ? 'none' : 'auto',
            }}
          >
            <div className="text-[13px] font-semibold">{label}</div>
            <div className="font-mono text-[8px] opacity-70">node {i + 1}</div>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Self-contained SceneLightbox demo: a starfield + a 4-card mini-orbit. Click a card to open it into a
 * fullscreen panel — the scene flies in (`flythrough`), collapses (`collapse`), or grows (`expand`)
 * behind it, and reverses on close. This is the scene coupling the transition needs to actually show.
 */
export function SceneLightboxDemo({ transition, accent }: { transition: SceneTransition; accent: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  return (
    <div className="relative h-[440px] w-full overflow-hidden rounded-xl border border-[color:var(--color-line)]">
      <SceneLightbox
        open={open != null}
        onClose={() => setOpen(null)}
        originRect={rect}
        transition={transition}
        surface="#0b0f1a"
        label={open != null ? `${DEMO_NODES[open]} node` : undefined}
        far={<Starfield />}
        near={
          <MiniOrbit
            accent={accent}
            activeIndex={open}
            onOpen={(i, r) => {
              setRect(r);
              setOpen(i);
            }}
          />
        }
        panel={
          open != null ? (
            <div className="mx-auto max-w-2xl px-6 py-20 text-white">
              <div className="font-mono text-[11px] uppercase tracking-widest" style={{ color: accent }}>
                {transition}
              </div>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight">{DEMO_NODES[open]}</h2>
              <p className="mt-3 text-white/70">
                The scene opened with a <span className="font-mono">{transition}</span> transition and reverses on
                close (✕, Esc, backdrop, or browser Back).
              </p>
            </div>
          ) : null
        }
      />
    </div>
  );
}
