'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import type { RefObject } from 'react';
import { useMotionTokens, useReducedMotion } from '../provider';

export interface RadarAxis {
  label: string;
  /** 0–`max` (default max 100). */
  value: number;
}

export interface SkillRadarProps {
  /** The axes (3+). 5 reads as a pentagon. */
  data: RadarAxis[];
  /** Value that reaches the outer ring. Default `100`. */
  max?: number;
  /** Number of concentric grid rings. Default `4`. */
  rings?: number;
  /** Draw on scroll-into-view (default) or on mount. */
  trigger?: 'inView' | 'mount';
  once?: boolean;
  root?: RefObject<HTMLElement | null>;
  /** Accent for the plotted shape + sweep. Grid/labels derive from it. Default `currentColor`. */
  color?: string;
  /** SVG size in px (square). Default `260`. */
  size?: number;
  /** Show the rotating radar sweep line during the reveal. Default `true`. */
  sweep?: boolean;
  className?: string;
}

/**
 * A hand-built SVG radar (polygon) chart, styled as a HUD readout — deliberately stylized, not a literal
 * metric. On reveal the grid rings + axes draw on, the plotted shape springs out from the center, and a
 * sweep line passes once. Under reduced motion it renders the finished readout instantly.
 */
export function SkillRadar({
  data,
  max = 100,
  rings = 4,
  trigger = 'inView',
  once = true,
  root,
  color = 'currentColor',
  size = 260,
  sweep = true,
  className,
}: SkillRadarProps) {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once, amount: 0.3, root });
  const active = trigger === 'mount' || inView;
  const show = reduced || active;

  const n = Math.max(3, data.length);
  const c = size / 2;
  const pad = 34; // room for labels
  const R = c - pad;

  // axis angle (start at top, clockwise)
  const angle = (i: number) => -Math.PI / 2 + (i * Math.PI * 2) / n;
  const point = (i: number, radius: number) => ({
    x: c + Math.cos(angle(i)) * radius,
    y: c + Math.sin(angle(i)) * radius,
  });
  const polyPath = (radius: number) => {
    const pts = Array.from({ length: n }, (_, i) => point(i, radius));
    return `M ${pts.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ')} Z`;
  };
  const valuePath = () => {
    const pts = data.map((d, i) => point(i, (Math.max(0, Math.min(max, d.value)) / max) * R));
    return `M ${pts.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ')} Z`;
  };

  const dur = tokens.duration.slow / 1000;
  const ease = [...tokens.easing.entrance] as [number, number, number, number];
  const spring = { type: 'spring' as const, ...tokens.spring.snappy };

  const drawn = show ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 };
  const grid = reduced ? { pathLength: 1, opacity: 1 } : drawn;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      width={size}
      height={size}
      role="img"
      aria-label={`Radar chart: ${data.map((d) => `${d.label} ${d.value}`).join(', ')}`}
      style={{ color, overflow: 'visible' }}
    >
      {/* concentric grid rings */}
      {Array.from({ length: rings }, (_, r) => {
        const radius = (R * (r + 1)) / rings;
        return (
          <motion.path
            key={`ring-${r}`}
            d={polyPath(radius)}
            fill="none"
            stroke={color}
            strokeOpacity={0.16}
            strokeWidth={1}
            initial={reduced ? false : { pathLength: 0, opacity: 0 }}
            animate={grid}
            transition={{ duration: dur, ease, delay: reduced ? 0 : r * 0.08 }}
          />
        );
      })}

      {/* axes (spokes) */}
      {Array.from({ length: n }, (_, i) => {
        const p = point(i, R);
        return (
          <motion.line
            key={`axis-${i}`}
            x1={c}
            y1={c}
            x2={p.x}
            y2={p.y}
            stroke={color}
            strokeOpacity={0.22}
            strokeWidth={1}
            initial={reduced ? false : { pathLength: 0, opacity: 0 }}
            animate={grid}
            transition={{ duration: dur, ease, delay: reduced ? 0 : 0.15 }}
          />
        );
      })}

      {/* plotted shape — springs out from the center */}
      <motion.path
        d={valuePath()}
        fill={color}
        fillOpacity={0.18}
        stroke={color}
        strokeWidth={1.5}
        style={{ transformOrigin: `${c}px ${c}px` }}
        initial={reduced ? false : { scale: 0, opacity: 0 }}
        animate={show ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={reduced ? { duration: 0 } : { ...spring, delay: dur * 0.55 }}
      />

      {/* vertex dots */}
      {data.map((d, i) => {
        const p = point(i, (Math.max(0, Math.min(max, d.value)) / max) * R);
        return (
          <motion.circle
            key={`dot-${i}`}
            cx={p.x}
            cy={p.y}
            r={2.6}
            fill={color}
            initial={reduced ? false : { scale: 0, opacity: 0 }}
            animate={show ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={reduced ? { duration: 0 } : { ...spring, delay: dur * 0.55 + 0.08 }}
            style={{ transformOrigin: `${p.x}px ${p.y}px` }}
          />
        );
      })}

      {/* radar sweep line — passes once during reveal */}
      {sweep && !reduced && (
        <motion.line
          x1={c}
          y1={c}
          x2={c}
          y2={c - R}
          stroke={color}
          strokeWidth={1.5}
          strokeOpacity={0.5}
          style={{ transformOrigin: `${c}px ${c}px` }}
          initial={{ rotate: 0, opacity: 0 }}
          animate={show ? { rotate: 360, opacity: [0, 0.6, 0] } : { rotate: 0, opacity: 0 }}
          transition={{ duration: dur * 1.4, ease: 'linear' }}
        />
      )}

      {/* axis labels — multi-word labels stack onto separate lines, centered on the vertex, so long
          labels grow vertically instead of bleeding sideways past the chart. */}
      {data.map((d, i) => {
        const p = point(i, R + 16);
        const a = angle(i);
        const anchor = Math.abs(Math.cos(a)) < 0.3 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end';
        const words = d.label.split(' ');
        const lineHeight = 11;
        return (
          <motion.text
            key={`label-${i}`}
            x={p.x}
            y={p.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fill={color}
            fillOpacity={0.7}
            style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}
            initial={reduced ? false : { opacity: 0 }}
            animate={show ? { opacity: 0.7 } : { opacity: 0 }}
            transition={{ duration: dur * 0.6, delay: reduced ? 0 : dur * 0.7 }}
          >
            {words.map((w, wi) => (
              <tspan key={wi} x={p.x} dy={wi === 0 ? (-(words.length - 1) * lineHeight) / 2 : lineHeight}>
                {w}
              </tspan>
            ))}
          </motion.text>
        );
      })}
    </svg>
  );
}
