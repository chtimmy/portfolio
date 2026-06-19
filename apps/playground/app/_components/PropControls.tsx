'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import type { MotionTokens } from '@umbra/motion';
import { EasingCurve } from './EasingCurve';

export type TokenScale = 'duration' | 'easing' | 'distance' | 'stagger';

export type ControlDef =
  | { kind: 'select'; name: string; description?: string; default: string; options: string[]; token?: TokenScale }
  | { kind: 'boolean'; name: string; description?: string; default: boolean }
  | { kind: 'number'; name: string; description?: string; default: number; min: number; max: number; step?: number }
  | { kind: 'color'; name: string; description?: string; default: string }
  | { kind: 'text'; name: string; description?: string; default: string };

export type Values = Record<string, string | number | boolean>;

/** Seed a values object from a control schema's defaults. */
export function defaultValues(controls: ControlDef[]): Values {
  const v: Values = {};
  for (const c of controls) v[c.name] = c.default;
  return v;
}

interface PropControlsProps {
  controls: ControlDef[];
  values: Values;
  onChange: (name: string, value: string | number | boolean) => void;
  accent: string;
  tokens: MotionTokens;
  onTokensChange: (tokens: MotionTokens) => void;
}

/** Renders a control schema as live knobs; token-select props can expand to edit the value behind them. */
export function PropControls({ controls, values, onChange, accent, tokens, onTokensChange }: PropControlsProps) {
  if (controls.length === 0) {
    return <p className="text-sm text-[color:var(--color-muted)]">No props to tweak.</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      {controls.map((c) => (
        <div key={c.name} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-xs">{c.name}</span>
            {c.kind === 'number' && (
              <span className="font-mono text-xs text-[color:var(--color-muted)]">{values[c.name] as number}</span>
            )}
          </div>
          <Widget def={c} value={values[c.name]!} onChange={(v) => onChange(c.name, v)} accent={accent} />
          {c.kind === 'select' && c.token && (
            <TokenValueEditor
              scale={c.token}
              tokenKey={values[c.name] as string}
              tokens={tokens}
              onChange={onTokensChange}
              accent={accent}
            />
          )}
          {c.description && <span className="text-[11px] text-[color:var(--color-muted)]">{c.description}</span>}
        </div>
      ))}
    </div>
  );
}

const SCALE_RANGE: Record<Exclude<TokenScale, 'easing'>, { min: number; max: number; step: number; unit: string }> = {
  duration: { min: 0, max: 1800, step: 10, unit: 'ms' },
  distance: { min: 0, max: 120, step: 1, unit: 'px' },
  stagger: { min: 0, max: 300, step: 5, unit: 'ms' },
};

function TokenValueEditor({
  scale,
  tokenKey,
  tokens,
  onChange,
  accent,
}: {
  scale: TokenScale;
  tokenKey: string;
  tokens: MotionTokens;
  onChange: (t: MotionTokens) => void;
  accent: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="font-mono text-[11px] text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-ink)]"
      >
        {open ? '▾' : '▸'} value of {scale}.{tokenKey}
      </button>
      {open && (
        <div className="mt-2 overflow-hidden rounded-md border border-[color:var(--color-line)] bg-white/60 p-3">
          {scale === 'easing' ? (
            <EasingEditor
              value={tokens.easing[tokenKey as keyof MotionTokens['easing']]}
              accent={accent}
              onChange={(e) => {
                const next = structuredClone(tokens);
                (next.easing as unknown as Record<string, number[]>)[tokenKey] = e;
                onChange(next);
              }}
            />
          ) : (
            <Slider
              label={`${scale}.${tokenKey}`}
              value={(tokens[scale] as Record<string, number>)[tokenKey]!}
              min={SCALE_RANGE[scale].min}
              max={SCALE_RANGE[scale].max}
              step={SCALE_RANGE[scale].step}
              unit={SCALE_RANGE[scale].unit}
              accent={accent}
              onChange={(v) => {
                const next = structuredClone(tokens);
                (next[scale] as Record<string, number>)[tokenKey] = v;
                onChange(next);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function EasingEditor({
  value,
  accent,
  onChange,
}: {
  value: readonly [number, number, number, number];
  accent: string;
  onChange: (e: [number, number, number, number]) => void;
}) {
  return (
    <div>
      <EasingCurve bezier={value} accent={accent} />
      <div className="mt-2 grid grid-cols-2 gap-x-3">
        {value.map((nValue, i) => (
          <Slider
            key={i}
            label={['x1', 'y1', 'x2', 'y2'][i]!}
            value={nValue}
            min={-1}
            max={2}
            step={0.01}
            accent={accent}
            onChange={(v) => {
              const e = [...value] as [number, number, number, number];
              e[i] = v;
              onChange(e);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  accent,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  accent: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-16 shrink-0 truncate font-mono text-[11px] text-[color:var(--color-muted)]">{label}</span>
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
      <span className="w-14 shrink-0 text-right font-mono text-[11px]">
        {value}
        {unit ?? ''}
      </span>
    </label>
  );
}

function Widget({
  def,
  value,
  onChange,
  accent,
}: {
  def: ControlDef;
  value: string | number | boolean;
  onChange: (v: string | number | boolean) => void;
  accent: string;
}) {
  switch (def.kind) {
    case 'select':
      return (
        <div className="flex flex-wrap gap-1.5">
          {def.options.map((opt) => {
            const active = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                aria-pressed={active}
                className="rounded-md border px-2.5 py-1 text-xs transition-colors"
                style={{
                  borderColor: active ? accent : 'var(--color-line)',
                  background: active ? accent : 'transparent',
                  color: active ? '#fff' : 'var(--color-muted)',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );
    case 'boolean':
      return (
        <button
          type="button"
          onClick={() => onChange(!value)}
          aria-pressed={value as boolean}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-[color:var(--color-line)] px-2.5 py-1 text-xs"
          style={{ color: value ? accent : 'var(--color-muted)' }}
        >
          <span
            className="inline-block h-3 w-3 rounded-full border"
            style={{ borderColor: value ? accent : 'var(--color-line)', background: value ? accent : 'transparent' }}
          />
          {value ? 'on' : 'off'}
        </button>
      );
    case 'number':
      return (
        <input
          type="range"
          min={def.min}
          max={def.max}
          step={def.step ?? 1}
          value={value as number}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
          style={{ accentColor: accent }}
        />
      );
    case 'color':
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            className="h-7 w-9 rounded border border-[color:var(--color-line)]"
          />
          <span className="font-mono text-xs text-[color:var(--color-muted)]">{value as string}</span>
        </div>
      );
    case 'text':
      return (
        <input
          type="text"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-md border border-[color:var(--color-line)] bg-white px-2.5 py-1 text-sm"
        />
      );
  }
}
