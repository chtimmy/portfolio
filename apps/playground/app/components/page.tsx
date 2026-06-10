'use client';

import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import {
  AnimatedNumber,
  ImageReveal,
  Magnetic,
  Marquee,
  MotionProvider,
  Parallax,
  Reveal,
  Stagger,
  TextReveal,
  TiltCard,
} from '@umbra/motion';
import type { PresetName } from '@umbra/motion';
import { Controls } from '../_components/Controls';
import { META } from '../_components/preset-meta';

const SKILLS = ['Motion', 'React', 'TypeScript', 'Tailwind', 'Next.js', 'Design Systems', 'Vite'];

// A static gradient stand-in for ImageReveal (no external asset needed).
const DEMO_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='240'>
       <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
         <stop offset='0' stop-color='#20283b'/><stop offset='1' stop-color='#5b6b8c'/>
       </linearGradient></defs>
       <rect width='420' height='240' fill='url(#g)'/>
       <text x='28' y='216' fill='#ffffff' opacity='0.85'
         font-family='monospace' font-size='18'>umbra / image</text>
     </svg>`,
  );

export default function ComponentsGallery() {
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
      <header className="mb-10 border-b border-[color:var(--color-line)] pb-6">
        <nav className="mb-6 flex justify-between font-mono text-xs uppercase tracking-widest text-[color:var(--color-muted)]">
          <Link href="/" className="transition-colors hover:text-[color:var(--color-ink)]">
            ← motion language
          </Link>
          <span>components · 9</span>
        </nav>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">Component gallery</h1>
        <p className="mb-6 max-w-prose text-[color:var(--color-muted)]">
          Every component reads the active preset through context. Switch preset or toggle reduced
          motion and watch them all respond — none of the demo code changes.
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
        <div className="grid gap-5 sm:grid-cols-2">
          <DemoCard title="Reveal" desc="fade · slide · scale">
            <div className="flex w-full flex-col gap-3">
              <Reveal trigger="mount" variant="fade">
                <Pill>fade</Pill>
              </Reveal>
              <Reveal trigger="mount" variant="slide" from="left" distance="dramatic">
                <Pill>slide</Pill>
              </Reveal>
              <Reveal trigger="mount" variant="scale" distance="dramatic">
                <Pill>scale</Pill>
              </Reveal>
            </div>
          </DemoCard>

          <DemoCard title="TextReveal" desc="by word">
            <TextReveal
              trigger="mount"
              text="Type that arrives in pieces."
              by="word"
              className="text-2xl font-medium tracking-tight"
            />
          </DemoCard>

          <DemoCard title="Stagger" desc="cascade children">
            <Stagger trigger="mount" className="flex flex-wrap gap-2" from="up">
              {SKILLS.slice(0, 5).map((s) => (
                <Pill key={s}>{s}</Pill>
              ))}
            </Stagger>
          </DemoCard>

          <DemoCard title="AnimatedNumber" desc="count up">
            <div className="flex w-full justify-around text-center">
              {[
                { v: 1280, l: 'commits' },
                { v: 9, l: 'components' },
                { v: 100, l: 'lighthouse' },
              ].map((s) => (
                <div key={s.l}>
                  <AnimatedNumber
                    trigger="mount"
                    value={s.v}
                    className="text-3xl font-semibold"
                    duration="cinematic"
                  />
                  <div className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </DemoCard>

          <DemoCard title="Marquee" desc="infinite · pause on hover" span>
            <Marquee className="w-full" speed={70}>
              {SKILLS.map((s) => (
                <Pill key={s}>{s}</Pill>
              ))}
            </Marquee>
          </DemoCard>

          <DemoCard title="Parallax" desc="scroll the page ↕">
            <div className="relative h-40 w-full overflow-hidden rounded-lg bg-[color:var(--color-canvas)]">
              <Parallax speed={0.5} className="absolute left-4 top-2">
                <span className="text-5xl font-bold opacity-10">01</span>
              </Parallax>
              <Parallax speed={-0.4} className="absolute right-5 bottom-3">
                <Pill>foreground</Pill>
              </Parallax>
              <Parallax speed={0.2} className="absolute left-6 bottom-6">
                <span style={{ color: accent }} className="text-sm font-medium">
                  background
                </span>
              </Parallax>
            </div>
          </DemoCard>

          <DemoCard title="ImageReveal" desc="clip-path wipe">
            <ImageReveal
              trigger="mount"
              src={DEMO_IMAGE}
              alt="Gradient demo"
              from="left"
              className="w-full rounded-lg"
            />
          </DemoCard>

          <DemoCard title="TiltCard" desc="hover · 3D tilt">
            <TiltCard className="flex h-28 w-44 items-center justify-center rounded-xl text-white shadow-lg" >
              <div
                className="flex h-full w-full items-center justify-center rounded-xl font-medium"
                style={{ background: accent }}
              >
                hover me
              </div>
            </TiltCard>
          </DemoCard>

          <DemoCard title="Magnetic" desc="hover · cursor pull">
            <Magnetic strength={0.5} padding={24}>
              <button
                type="button"
                className="rounded-full px-6 py-2.5 font-medium text-white"
                style={{ background: accent }}
              >
                Get in touch
              </button>
            </Magnetic>
          </DemoCard>
        </div>
      </MotionProvider>
    </main>
  );
}

function DemoCard({
  title,
  desc,
  span,
  children,
}: {
  title: string;
  desc: string;
  span?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`rounded-xl border border-[color:var(--color-line)] bg-white/50 p-5 ${span ? 'sm:col-span-2' : ''}`}
    >
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="font-mono text-sm">{title}</h3>
        <p className="font-mono text-[11px] text-[color:var(--color-muted)]">{desc}</p>
      </div>
      <div className="flex min-h-[120px] items-center justify-center">{children}</div>
    </section>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[color:var(--color-line)] bg-white px-3 py-1 text-sm">
      {children}
    </span>
  );
}
