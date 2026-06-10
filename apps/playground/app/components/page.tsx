'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { catalog, MotionProvider, ScrollProgress } from '@umbra/motion';
import type { PresetName } from '@umbra/motion';
import { Controls } from '../_components/Controls';
import { META } from '../_components/preset-meta';
import { defaultValues } from '../_components/PropControls';
import { registry } from './_registry';

const componentCount = catalog.flatMap((c) => c.components).filter((c) => c.name !== 'MotionProvider').length;

export default function ComponentsIndex() {
  const [preset, setPreset] = useState<PresetName>('calm');
  const [reduced, setReduced] = useState(false);
  const [replay, setReplay] = useState(0);
  const accent = META[preset].accent;
  const key = `${preset}-${reduced}-${replay}`;

  return (
    <main
      className="mx-auto min-h-dvh w-full max-w-5xl px-6 py-10 md:px-10"
      style={{ '--accent': accent } as CSSProperties}
    >
      <header className="mb-12 border-b border-[color:var(--color-line)] pb-6">
        <nav className="mb-6 flex justify-between font-mono text-xs uppercase tracking-widest text-[color:var(--color-muted)]">
          <Link href="/" className="transition-colors hover:text-[color:var(--color-ink)]">
            ← motion language
          </Link>
          <span>
            {componentCount} components · {catalog.length - 1} categories
          </span>
        </nav>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">Component gallery</h1>
        <p className="mb-6 max-w-prose text-[color:var(--color-muted)]">
          Organized by what each part of a page does. Open any component for a live demo with prop
          knobs and a token panel. Switch preset or reduced motion to see them all respond.
        </p>
        <Controls
          preset={preset}
          onPreset={setPreset}
          reduced={reduced}
          onToggleReduced={() => setReduced((r) => !r)}
          onReplay={() => setReplay((n) => n + 1)}
        />
      </header>

      <MotionProvider key={key} preset={preset} reducedMotion={reduced}>
        <ScrollProgress color={accent} />

        {catalog.map((cat, i) => (
          <section id={cat.id} key={cat.id} className="mb-14 scroll-mt-6">
            <div className="mb-5 flex items-baseline gap-3">
              <span className="font-mono text-sm text-[color:var(--accent)]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h2 className="text-xl font-semibold tracking-tight">{cat.title}</h2>
              <span className="text-sm text-[color:var(--color-muted)]">{cat.tagline}</span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {cat.components.map((c) => {
                const entry = registry[c.name];
                return (
                  <div
                    key={c.name}
                    className="group relative flex flex-col rounded-xl border border-[color:var(--color-line)] bg-white/50 p-5 transition-colors hover:border-[color:var(--accent)]"
                  >
                    {/* stretched link — sibling of the demo, so previews can contain buttons/anchors */}
                    <Link
                      href={`/components/${c.name}`}
                      aria-label={`Open ${c.name}`}
                      className="absolute inset-0 z-20 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{ outlineColor: accent }}
                    />
                    <div className="mb-1 flex items-baseline justify-between gap-3">
                      <h3 className="font-mono text-sm">{c.name}</h3>
                      <span className="font-mono text-xs text-[color:var(--color-muted)] transition-transform group-hover:translate-x-0.5">
                        →
                      </span>
                    </div>
                    <p className="mb-4 text-xs text-[color:var(--color-muted)]">{c.summary}</p>
                    <div className="pointer-events-none flex min-h-[120px] flex-1 items-center justify-center overflow-hidden">
                      {entry?.render(defaultValues(entry.controls), { accent })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </MotionProvider>
    </main>
  );
}
