'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { MotionProvider, catalog, resolveTokens } from '@umbra/motion';
import type { MotionTokens, PresetName } from '@umbra/motion';
import { registry } from '../_registry';
import type { DemoMode } from '../_registry';
import { Controls } from '../../_components/Controls';
import { PropControls, defaultValues } from '../../_components/PropControls';
import type { ControlDef } from '../../_components/PropControls';
import { CodeBlock } from '../../_components/CodeBlock';
import { LoopDemo } from '../../_components/LoopDemo';
import { META } from '../../_components/preset-meta';

const MODE_LABEL: Record<DemoMode, string> = { loop: 'Loop', scroll: 'Scroll', live: 'Live' };

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
  const [mode, setMode] = useState<DemoMode>(entry.modes[0]!);

  // Re-seed the token override whenever the preset changes.
  useEffect(() => {
    setTokens(resolveTokens(preset));
  }, [preset]);

  const accent = META[preset].accent;
  const code = useMemo(() => entry.code(values), [entry, values]);
  const loopDeps = `${JSON.stringify(values)}|${JSON.stringify(tokens)}`;
  const hasTokenProp = entry.controls.some((c) => c.kind === 'select' && c.token);

  const demo = entry.render(values, { accent, mode });

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
          {entry.modes.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
                demo
              </span>
              <div className="inline-flex rounded-full border border-[color:var(--color-line)] bg-white/60 p-1">
                {entry.modes.map((m) => {
                  const active = m === mode;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      aria-pressed={active}
                      className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                      style={{ background: active ? accent : 'transparent', color: active ? '#fff' : 'var(--color-muted)' }}
                    >
                      {MODE_LABEL[m]}
                    </button>
                  );
                })}
              </div>
              <span className="text-[11px] text-[color:var(--color-muted)]">
                {mode === 'loop' ? 'replays on a loop' : mode === 'scroll' ? 'scroll inside the box' : ''}
              </span>
            </div>
          )}

          <div className="flex min-h-[24rem] items-center justify-center overflow-hidden rounded-xl border border-[color:var(--color-line)] bg-white/50 p-8">
            <MotionProvider preset={preset} reducedMotion={reduced} tokens={tokens} as={false}>
              <div key={`${mode}-${replay}`} className="flex w-full items-center justify-center">
                {mode === 'loop' ? <LoopDemo deps={loopDeps}>{demo}</LoopDemo> : demo}
              </div>
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
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-muted)]">props</h3>
                {hasTokenProp && (
                  <button
                    type="button"
                    onClick={() => setTokens(resolveTokens(preset))}
                    className="font-mono text-[11px] text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-ink)]"
                  >
                    reset tweaks
                  </button>
                )}
              </div>
              <PropControls
                controls={entry.controls}
                values={values}
                accent={accent}
                tokens={tokens}
                onChange={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))}
                onTokensChange={setTokens}
              />
              {hasTokenProp && (
                <p className="mt-3 text-[11px] leading-relaxed text-[color:var(--color-muted)]">
                  A prop like <span className="font-mono">duration</span> picks <em>which</em> token this
                  instance uses; expand its <span className="font-mono">value</span> to change what that
                  token <em>is</em> for the whole preset.
                </p>
              )}
            </section>
          )}

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
