'use client';

import type { ChangeEvent } from 'react';

export type ControlDef =
  | { kind: 'select'; name: string; description?: string; default: string; options: string[] }
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
}

/** Renders a control schema as live knobs bound to a values object. */
export function PropControls({ controls, values, onChange, accent }: PropControlsProps) {
  if (controls.length === 0) {
    return <p className="text-sm text-[color:var(--color-muted)]">No props to tweak.</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      {controls.map((c) => (
        <label key={c.name} className="flex flex-col gap-1.5">
          <span className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-xs">{c.name}</span>
            {c.kind === 'number' && (
              <span className="font-mono text-xs text-[color:var(--color-muted)]">
                {values[c.name] as number}
              </span>
            )}
          </span>
          <Widget def={c} value={values[c.name]!} onChange={(v) => onChange(c.name, v)} accent={accent} />
          {c.description && (
            <span className="text-[11px] text-[color:var(--color-muted)]">{c.description}</span>
          )}
        </label>
      ))}
    </div>
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
