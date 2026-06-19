'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useReducedMotion } from '../provider';

export interface SpiralItem {
  id: string;
  title: string;
  /** One line shown under the title. */
  blurb?: string;
  /** Link target; the card becomes a link when set. */
  href?: string;
  /** Highlighted with a star + glow + slight scale bump. */
  featured?: boolean;
  /** Free-form key used for color-coding + the legend (e.g. "automation" / "system"). */
  category?: string;
}

export interface SpiralGalleryProps {
  items: SpiralItem[];
  /** Color per `category` key — drives card accents and the legend. */
  categoryColors?: Record<string, string>;
  /** Human labels per category key for the legend. Defaults to the key. */
  categoryLabels?: Record<string, string>;
  /** Spiral turns across the top→bottom descent. Default `2.4`. */
  turns?: number;
  /** Orbit speed in cycles/second. Default `0.04`. */
  baseSpeed?: number;
  /** Container height. Default `'100%'`. */
  height?: number | string;
  /** Initial view. Default `'spiral'` (falls back to `'list'` under reduced motion). */
  defaultView?: 'spiral' | 'list';
  /** Custom card renderer; defaults to a titled card. */
  renderItem?: (item: SpiralItem, ctx: { color: string; featured: boolean }) => ReactNode;
  className?: string;
}

const frac = (x: number) => x - Math.floor(x);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a || 1), 0, 1);
  return t * t * (3 - 2 * t);
};
const DAMPING = 0.92;

/**
 * A library index whose cards orbit a vertical spiral, descending top→bottom and recycling into a
 * continuous loop; the wheel briefly speeds the orbit, and hovering eases it toward a stop so cards are
 * catchable. Ships with a scannable **list** fallback (the default under reduced motion / the toggle),
 * a category **legend**, and **featured** markers. 2D transforms only (no WebGL).
 */
export function SpiralGallery({
  items,
  categoryColors = {},
  categoryLabels = {},
  turns = 2.4,
  baseSpeed = 0.04,
  height = '100%',
  defaultView = 'spiral',
  renderItem,
  className,
}: SpiralGalleryProps) {
  const reduced = useReducedMotion();
  const [view, setView] = useState<'spiral' | 'list'>(reduced ? 'list' : defaultView);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 720, h: 560 });
  const [, force] = useState(0);

  const progress = useRef(0);
  const boost = useRef(0);
  const speedScale = useRef(1); // eased toward 0 while hovering (catchability)
  const hovering = useRef(false);

  const colorOf = (it: SpiralItem) => (it.category && categoryColors[it.category]) || 'currentColor';

  // measure
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // orbit loop
  useEffect(() => {
    if (reduced || view !== 'spiral') return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      // ease the global speed toward 0 while hovering, back to 1 otherwise
      const target = hovering.current ? 0 : 1;
      speedScale.current += (target - speedScale.current) * 0.12;
      progress.current = frac(progress.current + (baseSpeed / 1000) * speedScale.current * dt + boost.current * dt);
      boost.current *= DAMPING;
      if (Math.abs(boost.current) < 1e-5) boost.current = 0;
      force((n) => (n + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced, view, baseSpeed]);

  // wheel feeds the orbit (and doesn't scroll the surrounding panel while over the spiral)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || reduced || view !== 'spiral') return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      boost.current += (e.deltaY / 1000) * 0.0006;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [reduced, view]);

  const categories = Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[];

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height }}>
      {/* chrome: view toggle + legend */}
      <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 200, display: 'flex', gap: 8, alignItems: 'center' }}>
        {!reduced && <ViewToggle view={view} onChange={setView} />}
      </div>
      {categories.length > 0 && (
        <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 200 }}>
          <Legend categories={categories} colors={categoryColors} labels={categoryLabels} />
        </div>
      )}

      {view === 'list' || reduced ? (
        <ListView items={items} colorOf={colorOf} renderItem={renderItem} />
      ) : (
        <div
          ref={containerRef}
          onPointerEnter={() => (hovering.current = true)}
          onPointerLeave={() => (hovering.current = false)}
          style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
        >
          {items.map((it, i) => {
            const u = frac(i / items.length + progress.current);
            const theta = u * turns * Math.PI * 2;
            const r = Math.min(size.w * 0.32, 260) * (0.35 + 0.65 * Math.sin(Math.PI * u));
            const x = size.w / 2 + Math.cos(theta) * r;
            const y = lerp(size.h * 0.1, size.h * 0.9, u);
            const depth = (Math.sin(theta) + 1) / 2; // 0 far .. 1 near
            const featured = !!it.featured;
            const scale = lerp(0.7, 1.04, depth) * (featured ? 1.12 : 1);
            const edge = smoothstep(0, 0.08, u) * (1 - smoothstep(0.92, 1, u)); // fade at recycle seam
            const opacity = lerp(0.35, 1, depth) * edge;
            const z = Math.round(depth * 100) + (featured ? 50 : 0);
            const color = colorOf(it);
            return (
              <div
                key={it.id}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`,
                  opacity,
                  zIndex: z,
                  willChange: 'transform',
                }}
              >
                {renderItem ? renderItem(it, { color, featured }) : <SpiralCard item={it} color={color} featured={featured} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SpiralCard({ item, color, featured }: { item: SpiralItem; color: string; featured: boolean }) {
  const inner = (
    <div
      style={{
        width: 184,
        padding: '12px 14px',
        borderRadius: 12,
        textAlign: 'left',
        background: 'rgba(11,15,26,0.86)',
        border: `1px solid ${featured ? color : `color-mix(in srgb, ${color} 45%, transparent)`}`,
        boxShadow: featured ? `0 0 26px color-mix(in srgb, ${color} 45%, transparent)` : '0 10px 30px rgba(0,0,0,0.45)',
        color: '#eaedf7',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 7, height: 7, borderRadius: 99, background: color, display: 'inline-block' }} />
        {featured && <span style={{ color, fontSize: 12 }}>★</span>}
        <span style={{ fontSize: 14, fontWeight: 600 }}>{item.title}</span>
      </div>
      {item.blurb && <div style={{ marginTop: 4, fontSize: 11, opacity: 0.66, lineHeight: 1.4 }}>{item.blurb}</div>}
    </div>
  );
  return item.href ? (
    <a href={item.href} style={{ textDecoration: 'none', display: 'block', cursor: 'pointer' }}>
      {inner}
    </a>
  ) : (
    inner
  );
}

function ListView({
  items,
  colorOf,
  renderItem,
}: {
  items: SpiralItem[];
  colorOf: (i: SpiralItem) => string;
  renderItem?: (item: SpiralItem, ctx: { color: string; featured: boolean }) => ReactNode;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflowY: 'auto',
        padding: '64px 20px 28px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 14,
        alignContent: 'start',
      }}
    >
      {items.map((it) => (
        <div key={it.id}>
          {renderItem ? renderItem(it, { color: colorOf(it), featured: !!it.featured }) : <SpiralCard item={it} color={colorOf(it)} featured={!!it.featured} />}
        </div>
      ))}
    </div>
  );
}

function Legend({ categories, colors, labels }: { categories: string[]; colors: Record<string, string>; labels: Record<string, string> }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: '6px 10px',
        borderRadius: 999,
        background: 'rgba(11,15,26,0.7)',
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: 11,
        color: '#eaedf7',
        backdropFilter: 'blur(6px)',
      }}
    >
      {categories.map((c) => (
        <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: colors[c] ?? '#888' }} />
          {labels[c] ?? c}
        </span>
      ))}
    </div>
  );
}

function ViewToggle({ view, onChange }: { view: 'spiral' | 'list'; onChange: (v: 'spiral' | 'list') => void }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        gap: 2,
        padding: 3,
        borderRadius: 999,
        background: 'rgba(11,15,26,0.7)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(6px)',
      }}
    >
      {(['spiral', 'list'] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          aria-pressed={view === v}
          style={{
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            padding: '4px 12px',
            fontSize: 11,
            textTransform: 'capitalize',
            background: view === v ? '#eaedf7' : 'transparent',
            color: view === v ? '#0b0f1a' : '#9aa3bd',
          }}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
