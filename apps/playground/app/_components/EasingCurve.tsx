'use client';

interface EasingCurveProps {
  /** cubic-bezier control points [x1, y1, x2, y2]. */
  bezier: readonly [number, number, number, number];
  /** Stroke color (the active preset accent). */
  accent: string;
}

const P = 22; // padding inside the viewBox
const SPAN = 100 - P * 2;

// Map easing space (x,y in ~[0,1], y can exceed for overshoot) to SVG coords (y inverted).
const sx = (x: number) => P + x * SPAN;
const sy = (y: number) => P + (1 - y) * SPAN;

/**
 * Plots the actual cubic-bezier of the active preset's entrance easing — the page's signature.
 * You see the curve bend (and, for `expressive`, overshoot past the box) as you feel the motion
 * change. The dashed diagonal is linear motion for reference.
 */
export function EasingCurve({ bezier, accent }: EasingCurveProps) {
  const [x1, y1, x2, y2] = bezier;
  const path = `M ${sx(0)} ${sy(0)} C ${sx(x1)} ${sy(y1)}, ${sx(x2)} ${sy(y2)}, ${sx(1)} ${sy(1)}`;

  return (
    <svg
      viewBox="0 0 100 100"
      className="h-44 w-full overflow-visible"
      role="img"
      aria-label="Easing curve for the active preset"
    >
      {/* unit box */}
      <rect
        x={P}
        y={P}
        width={SPAN}
        height={SPAN}
        fill="none"
        stroke="var(--color-line)"
        strokeWidth={0.6}
      />
      {/* linear reference */}
      <line
        x1={sx(0)}
        y1={sy(0)}
        x2={sx(1)}
        y2={sy(1)}
        stroke="var(--color-muted)"
        strokeWidth={0.6}
        strokeDasharray="2 2"
        opacity={0.5}
      />
      {/* control handles */}
      <g stroke={accent} strokeWidth={0.6} opacity={0.45}>
        <line x1={sx(0)} y1={sy(0)} x2={sx(x1)} y2={sy(y1)} />
        <line x1={sx(1)} y1={sy(1)} x2={sx(x2)} y2={sy(y2)} />
      </g>
      {/* the curve */}
      <path d={path} fill="none" stroke={accent} strokeWidth={2} strokeLinecap="round" />
      {/* endpoints + control points */}
      <circle cx={sx(0)} cy={sy(0)} r={1.6} fill="var(--color-ink)" />
      <circle cx={sx(1)} cy={sy(1)} r={1.6} fill="var(--color-ink)" />
      <circle cx={sx(x1)} cy={sy(y1)} r={1.8} fill={accent} />
      <circle cx={sx(x2)} cy={sy(y2)} r={1.8} fill={accent} />
    </svg>
  );
}
