'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../provider';

export interface DotGridProps {
  /** Spacing between dots in pixels. Default `28`. */
  gap?: number;
  /** Base dot radius in pixels. Default `1.5`. */
  dotSize?: number;
  /** Dot color (any canvas color). Default a faint ink. */
  color?: string;
  /** Cursor influence radius in pixels. Default `100`. */
  influence?: number;
  className?: string;
}

/**
 * A canvas dot field that swells and brightens near the cursor. Under reduced motion it draws a
 * single static grid (no animation loop, no pointer tracking). Renders as an absolutely-positioned
 * background; place in a `position: relative` parent.
 */
export function DotGrid({
  gap = 28,
  dotSize = 1.5,
  color = 'rgba(20,22,27,0.28)',
  influence = 100,
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

    const resize = () => {
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
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

    resize();
    draw();

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw();
    });
    ro.observe(parent);

    if (reduced) {
      return () => ro.disconnect();
    }

    const loop = () => {
      draw();
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
  }, [reduced, gap, dotSize, color, influence]);

  return (
    <div
      className={className}
      style={{ position: 'absolute', inset: 0, pointerEvents: reduced ? 'none' : 'auto' }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
