'use client';

import type { MotionTokens } from '@umbra/motion';
import { EasingCurve } from './EasingCurve';

interface TokenPanelProps {
  tokens: MotionTokens;
  onChange: (tokens: MotionTokens) => void;
  onReset: () => void;
  accent: string;
}

/**
 * Live token editor. Sliders mutate a working copy of the active preset's tokens and emit a full
 * override (fed to MotionProvider's `tokens` prop), so the demo re-feels in real time. Demonstrates
 * the core "system" idea: change one number, every component responds.
 */
export function TokenPanel({ tokens, onChange, onReset, accent }: TokenPanelProps) {
  const update = (mut: (t: MotionTokens) => void) => {
    const next = structuredClone(tokens);
    mut(next);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-muted)]">
          token panel
        </h3>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-[color:var(--color-line)] px-2 py-0.5 font-mono text-[11px] text-[color:var(--color-muted)] transition-colors hover:bg-white"
        >
          reset
        </button>
      </div>

      <Section title="duration (ms)">
        {(Object.keys(tokens.duration) as (keyof MotionTokens['duration'])[]).map((k) => (
          <Slider
            key={k}
            label={k}
            value={tokens.duration[k]}
            min={0}
            max={1400}
            step={10}
            accent={accent}
            onChange={(v) => update((t) => (t.duration[k] = v))}
          />
        ))}
      </Section>

      <Section title="distance (px)">
        {(Object.keys(tokens.distance) as (keyof MotionTokens['distance'])[]).map((k) => (
          <Slider
            key={k}
            label={k}
            value={tokens.distance[k]}
            min={0}
            max={120}
            accent={accent}
            onChange={(v) => update((t) => (t.distance[k] = v))}
          />
        ))}
      </Section>

      <Section title="stagger (ms)">
        {(Object.keys(tokens.stagger) as (keyof MotionTokens['stagger'])[]).map((k) => (
          <Slider
            key={k}
            label={k}
            value={tokens.stagger[k]}
            min={0}
            max={300}
            step={5}
            accent={accent}
            onChange={(v) => update((t) => (t.stagger[k] = v))}
          />
        ))}
      </Section>

      <Section title="spring (stiffness / damping)">
        {(Object.keys(tokens.spring) as (keyof MotionTokens['spring'])[]).map((k) => (
          <div key={k} className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] text-[color:var(--color-muted)]">{k}</span>
            <Slider
              label="stiffness"
              value={tokens.spring[k].stiffness}
              min={40}
              max={700}
              step={10}
              accent={accent}
              onChange={(v) => update((t) => (t.spring[k].stiffness = v))}
            />
            <Slider
              label="damping"
              value={tokens.spring[k].damping}
              min={4}
              max={40}
              accent={accent}
              onChange={(v) => update((t) => (t.spring[k].damping = v))}
            />
          </div>
        ))}
      </Section>

      <Section title="easing · entrance">
        <EasingCurve bezier={tokens.easing.entrance} accent={accent} />
        <div className="grid grid-cols-2 gap-x-4">
          {tokens.easing.entrance.map((n, i) => (
            <Slider
              key={i}
              label={['x1', 'y1', 'x2', 'y2'][i]!}
              value={n}
              min={-1}
              max={2}
              step={0.01}
              accent={accent}
              onChange={(v) =>
                update((t) => {
                  const e = [...t.easing.entrance] as [number, number, number, number];
                  e[i] = v;
                  (t.easing as unknown as Record<'entrance', number[]>).entrance = e;
                })
              }
            />
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-t border-[color:var(--color-line)] pt-3">
      <span className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
        {title}
      </span>
      {children}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  accent,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  accent: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-20 shrink-0 font-mono text-[11px] text-[color:var(--color-muted)]">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ accentColor: accent }}
        className="flex-1"
      />
      <span className="w-12 shrink-0 text-right font-mono text-[11px]">{value}</span>
    </label>
  );
}
