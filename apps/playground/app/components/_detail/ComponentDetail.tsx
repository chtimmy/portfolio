'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { MotionProvider, catalog, resolveTokens } from '@umbra/motion';
import type { MotionTokens, PresetName } from '@umbra/motion';
import { registry } from '../_registry';
import { Controls } from '../../_components/Controls';
import { PropControls, defaultValues } from '../../_components/PropControls';
import type { ControlDef } from '../../_components/PropControls';
import { TokenPanel } from '../../_components/TokenPanel';
import { CodeBlock } from '../../_components/CodeBlock';
import { META } from '../../_components/preset-meta';

function typeOf(c: ControlDef): string {
  switch (c.kind) {
    case 'select':
      return c.options.map((o) => `'${o}'`).join(' | ');
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'color':
      return 'string (color)';
    case 'text':
      return 'string';
  }
}

export function ComponentDetail({ name }: { name: string }) {
  const entry = registry[name]!;
  const category = catalog.find((c) => c.components.some((x) => x.name === name));
  const summary = category?.components.find((x) => x.name === name)?.summary;

  const [preset, setPreset] = useState<PresetName>('calm');
  const [reduced, setReduced] = useState(false);
  const [replay, setReplay] = useState(0);
  const [values, setValues] = useState(() => defaultValues(entry.controls));
  const [tokens, setTokens] = useState<MotionTokens>(() => resolveTokens('calm'));

  // Re-seed the token panel whenever the preset changes.
  useEffect(() => {
    setTokens(resolveTokens(preset));
  }, [preset]);

  const accent = META[preset].accent;
  const demoKey = `${name}-${JSON.stringify(values)}-${preset}-${reduced}-${replay}`;
  const code = useMemo(() => entry.code(values), [entry, values]);

  return (
    <main
      className="mx-auto min-h-dvh w-full max-w-6xl px-6 py-10 md:px-10"
      style={{ '--accent': accent } as CSSProperties}
    >
      <span id="top" />
      <nav className="mb-6 flex justify-between font-mono text-xs uppercase tracking-widest text-[color:var(--color-muted)]">
        <Link href="/components" className="transition-colors hover:text-[color:var(--color-ink)]">
          ← all components
        </Link>
        {category && <span>{category.title}</span>}
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{name}</h1>
        {summary && <p className="mt-2 text-[color:var(--color-muted)]">{summary}</p>}
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        {/* Live demo + code */}
        <div className="flex flex-col gap-6">
          <div className="flex min-h-[22rem] items-center justify-center overflow-hidden rounded-xl border border-[color:var(--color-line)] bg-white/50 p-8">
            <MotionProvider key={demoKey} preset={preset} reducedMotion={reduced} tokens={tokens}>
              {entry.render(values, { accent })}
            </MotionProvider>
          </div>
          <div>
            <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
              usage
            </div>
            <CodeBlock code={code} />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-8">
          <Controls
            preset={preset}
            onPreset={setPreset}
            reduced={reduced}
            onToggleReduced={() => setReduced((r) => !r)}
            onReplay={() => setReplay((n) => n + 1)}
          />

          {entry.controls.length > 0 && (
            <section>
              <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-[color:var(--color-muted)]">
                props
              </h3>
              <PropControls
                controls={entry.controls}
                values={values}
                accent={accent}
                onChange={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))}
              />
            </section>
          )}

          <section className="rounded-xl border border-[color:var(--color-line)] bg-white/40 p-4">
            <TokenPanel
              tokens={tokens}
              accent={accent}
              onChange={setTokens}
              onReset={() => setTokens(resolveTokens(preset))}
            />
          </section>

          {entry.controls.length > 0 && (
            <section>
              <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-[color:var(--color-muted)]">
                prop reference
              </h3>
              <dl className="flex flex-col gap-2 text-xs">
                {entry.controls.map((c) => (
                  <div key={c.name} className="border-b border-[color:var(--color-line)] pb-2">
                    <div className="flex items-baseline justify-between gap-2 font-mono">
                      <dt>{c.name}</dt>
                      <dd className="text-right text-[color:var(--color-muted)]">{String(c.default)}</dd>
                    </div>
                    <div className="font-mono text-[11px] text-[color:var(--accent)]">{typeOf(c)}</div>
                    {c.description && <div className="text-[color:var(--color-muted)]">{c.description}</div>}
                  </div>
                ))}
                <div className="pt-1 font-mono text-[11px] text-[color:var(--color-muted)]">
                  + className?: string{name !== 'MotionProvider' ? ' · children: ReactNode' : ''}
                </div>
              </dl>
            </section>
          )}
        </aside>
      </div>

      <span id="bottom" />
    </main>
  );
}
