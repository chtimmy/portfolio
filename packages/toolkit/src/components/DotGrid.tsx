'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../provider';

export type DotGridVariant = 'constellation' | 'dots';

export interface DotGridProps {
  /**
   * `constellation` (default) — drifting particles that link to near neighbours and to the cursor.
   * `dots` — a fixed grid of dots that swell near the cursor (the original look).
   */
  variant?: DotGridVariant;
  /** Average spacing between points in pixels (density). Lower = denser. Default `34`. */
  gap?: number;
  /** Base dot radius in pixels. Default `1.6`. */
  dotSize?: number;
  /** Dot + link color (any canvas color). Default a faint ink. */
  color?: string;
  /** Max distance to draw a link between two particles (constellation). Default `120`. */
  linkDistance?: number;
  /** Cursor influence radius in pixels (links/swell near the pointer). Default `160`. */
  influence?: number;
  /**
   * Constellation only: how far (px) points are pushed outward from the cursor, warping the field
   * around it. `0` = no warp. Default `0`.
   */
  warp?: number;
  /**
   * Thins the field toward the centre so focal content stands out, without leaving a bare hole — the
   * field stays continuous, just lighter in the middle. `0` = uniform; `0.5` keeps ~half the density
   * at the very centre ramping to full at the edges; `1` ≈ a clear centre. Radial mask (no perf cost).
   * Default `0`.
   */
  centerFade?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/**
 * A canvas point field. In `constellation` mode particles drift, linking to near neighbours and to
 * the cursor like a network graph; in `dots` mode a fixed grid swells near the pointer. Static under
 * reduced motion. Renders absolutely-positioned; place in a `position: relative` parent.
 */
export function DotGrid({
  variant = 'constellation',
  gap = 34,
  dotSize = 1.6,
  color = 'rgba(20,22,27,0.5)',
  linkDistance = 120,
  influence = 160,
  warp = 0,
  centerFade = 0,
  className,
}: DotGridProps) {
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !parent || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let particles: Particle[] = [];

    const seed = () => {
      // One particle per ~gap² of area, jittered off a loose grid so it reads organic, not gridded.
      const cols = Math.max(1, Math.round(w / gap));
      const rows = Math.max(1, Math.round(h / gap));
      particles = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          particles.push({
            x: (i + 0.5) * (w / cols) + (Math.random() - 0.5) * gap,
            y: (j + 0.5) * (h / rows) + (Math.random() - 0.5) * gap,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
          });
        }
      }
    };

    const resize = () => {
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    // ── dots variant: fixed grid, swell near cursor ──────────────────────────
    const drawDots = () => {
      ctx.clearRect(0, 0, w, h);
      const cols = Math.max(1, Math.floor(w / gap));
      const rows = Math.max(1, Math.floor(h / gap));
      const offX = (w - (cols - 1) * gap) / 2;
      const offY = (h - (rows - 1) * gap) / 2;
      ctx.fillStyle = color;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = offX + i * gap;
          const y = offY + j * gap;
          let r = dotSize;
          let alpha = 1;
          if (!reduced && pointer.current.active) {
            const dist = Math.hypot(x - pointer.current.x, y - pointer.current.y);
            if (dist < influence) {
              const t = 1 - dist / influence;
              r = dotSize * (1 + t * 2.5);
              alpha = 1 + t * 1.5;
            }
          }
          ctx.globalAlpha = Math.min(alpha, 2.5);
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    // ── constellation variant: drifting particles + proximity links ──────────
    const drawConstellation = (move: boolean) => {
      ctx.clearRect(0, 0, w, h);
      const p = pointer.current;
      const active = !reduced && p.active;

      // advance motion
      for (const pt of particles) {
        if (move) {
          pt.x += pt.vx;
          pt.y += pt.vy;
          if (pt.x < 0 || pt.x > w) pt.vx *= -1;
          if (pt.y < 0 || pt.y > h) pt.vy *= -1;
        }
      }

      // displaced render positions — points near the cursor are pushed outward, warping the field.
      const px = particles.map((pt) => {
        if (active && warp > 0) {
          const vx = pt.x - p.x;
          const vy = pt.y - p.y;
          const dist = Math.hypot(vx, vy) || 1;
          if (dist < influence) {
            const f = 1 - dist / influence;
            const push = f * f * warp;
            return { x: pt.x + (vx / dist) * push, y: pt.y + (vy / dist) * push };
          }
        }
        return { x: pt.x, y: pt.y };
      });

      // links between near neighbours (using warped positions)
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      for (let i = 0; i < px.length; i++) {
        const a = px[i]!;
        for (let k = i + 1; k < px.length; k++) {
          const b = px[k]!;
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < linkDistance) {
            ctx.globalAlpha = (1 - dist / linkDistance) * 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        // link to the cursor
        if (active) {
          const dc = Math.hypot(a.x - p.x, a.y - p.y);
          if (dc < influence) {
            ctx.globalAlpha = (1 - dc / influence) * 0.9;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
        }
      }

      // the points
      ctx.fillStyle = color;
      ctx.globalAlpha = 1;
      for (const a of px) {
        ctx.beginPath();
        ctx.arc(a.x, a.y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const drawStatic = () => (variant === 'dots' ? drawDots() : drawConstellation(false));

    resize();
    drawStatic();

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) drawStatic();
    });
    ro.observe(parent);

    if (reduced) {
      return () => ro.disconnect();
    }

    const loop = () => {
      if (variant === 'dots') drawDots();
      else drawConstellation(true);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
    };
    const onLeave = () => {
      pointer.current.active = false;
    };
    parent.addEventListener('pointermove', onMove);
    parent.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      parent.removeEventListener('pointermove', onMove);
      parent.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced, variant, gap, dotSize, color, linkDistance, influence, warp]);

  // Radial mask that thins the field toward the centre while keeping it continuous: the centre keeps
  // a `1 - centerFade` visibility floor (so a few points remain) and ramps to full out at the edges.
  const c = Math.max(0, Math.min(1, centerFade));
  const floor = (1 - c).toFixed(3);
  const mask =
    c > 0 ? `radial-gradient(closest-side, rgba(0,0,0,${floor}) 0%, rgba(0,0,0,${floor}) 15%, black 80%)` : undefined;

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: reduced ? 'none' : 'auto',
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
