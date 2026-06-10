'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { MotionProvider, presetNames, resolveTokens } from '@umbra/motion';
import type { PresetName } from '@umbra/motion';
import { EasingCurve } from './_components/EasingCurve';
import { Stage } from './_components/Stage';

const META: Record<PresetName, { accent: string; tagline: string }> = {
  calm: { accent: '#5b6b8c', tagline: 'Composed. Unhurried. Premium.' },
  snappy: { accent: '#2563eb', tagline: 'Precise. Responsive. Product-grade.' },
  expressive: { accent: '#e0457b', tagline: 'Playful. Bouncy. Alive.' },
};

export default function Home() {
  const [preset, setPreset] = useState<PresetName>('calm');
  const [reduced, setReduced] = useState(false);
  const [replay, setReplay] = useState(0);

  const { accent, tagline } = META[preset];
  const tokens = resolveTokens(preset);
  const stageKey = `${preset}-${reduced}-${replay}`;

  return (
    <main
      className="mx-auto min-h-dvh w-full max-w-5xl px-6 py-10 md:px-10"
      style={{ '--accent': accent } as CSSProperties}
    >
      {/* Header */}
      <header className="mb-12 flex flex-col gap-6 border-b border-[color:var(--color-line)] pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-[color:var(--color-muted)]">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: accent }} />
            umbra · motion language
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Three temperaments,<br />one system.
          </h1>
          <p className="mt-2 text-[color:var(--color-muted)]">{tagline}</p>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          {/* preset segmented control */}
          <div
            role="group"
            aria-label="Motion preset"
            className="inline-flex rounded-full border border-[color:var(--color-line)] bg-white/60 p-1"
          >
            {presetNames.map((name) => {
              const active = name === preset;
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setPreset(name)}
                  className="rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    background: active ? META[name].accent : 'transparent',
                    color: active ? '#fff' : 'var(--color-muted)',
                    outlineColor: META[name].accent,
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setReplay((n) => n + 1)}
              className="rounded-full border border-[color:var(--color-line)] px-3 py-1.5 text-sm text-[color:var(--color-ink)] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ outlineColor: accent }}
            >
              ↻ Replay
            </button>
            <button
              type="button"
              aria-pressed={reduced}
              onClick={() => setReduced((r) => !r)}
              className="flex items-center gap-2 rounded-full border border-[color:var(--color-line)] px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ outlineColor: accent, color: reduced ? accent : 'var(--color-muted)' }}
            >
              <span
                className="inline-block h-3.5 w-3.5 rounded-full border"
                style={{
                  borderColor: reduced ? accent : 'var(--color-line)',
                  background: reduced ? accent : 'transparent',
                }}
              />
              Reduced motion
            </button>
          </div>
        </div>
      </header>

      {/* Body: stage + signature */}
      <div className="grid gap-12 md:grid-cols-[1fr_18rem]">
        <MotionProvider key={stageKey} preset={preset} reducedMotion={reduced}>
          <Stage />
        </MotionProvider>

        <aside className="flex flex-col gap-5">
          <div className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
            entrance easing
          </div>
          <EasingCurve bezier={tokens.easing.entrance} accent={accent} />
          <dl className="flex flex-col gap-1.5 font-mono text-xs">
            <Row k="duration.base" v={`${tokens.duration.base}ms`} />
            <Row
              k="ease.entrance"
              v={`(${tokens.easing.entrance.join(', ')})`}
              accent={accent}
            />
            <Row
              k="spring.bouncy"
              v={`s${tokens.spring.bouncy.stiffness} d${tokens.spring.bouncy.damping} m${tokens.spring.bouncy.mass}`}
            />
            <Row k="stagger.base" v={`${tokens.stagger.base}ms`} />
            <Row k="distance.base" v={`${tokens.distance.base}px`} />
          </dl>
        </aside>
      </div>
    </main>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[color:var(--color-line)] pb-1.5">
      <dt className="text-[color:var(--color-muted)]">{k}</dt>
      <dd className="text-right" style={accent ? { color: accent } : undefined}>
        {v}
      </dd>
    </div>
  );
}
