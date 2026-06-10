'use client';

import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import {
  Accordion,
  AnimatedGradient,
  AnimatedNumber,
  BeamGrid,
  catalog,
  DotGrid,
  GrainOverlay,
  ImageReveal,
  Magnetic,
  Marquee,
  MotionProvider,
  Parallax,
  Reveal,
  RotatingText,
  ScrollProgress,
  SmoothScroll,
  Stagger,
  StatBar,
  TextReveal,
  TiltCard,
} from '@umbra/motion';
import type { PresetName } from '@umbra/motion';
import { Controls } from '../_components/Controls';
import { META } from '../_components/preset-meta';

const SKILLS = ['Motion', 'React', 'TypeScript', 'Tailwind', 'Next.js', 'Design Systems', 'Vite'];

const DEMO_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='220'>
       <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
         <stop offset='0' stop-color='#20283b'/><stop offset='1' stop-color='#5b6b8c'/>
       </linearGradient></defs>
       <rect width='420' height='220' fill='url(#g)'/>
       <text x='28' y='196' fill='#ffffff' opacity='0.85' font-family='monospace' font-size='18'>umbra / image</text>
     </svg>`,
  );

const componentCount = catalog
  .flatMap((c) => c.components)
  .filter((c) => c.name !== 'MotionProvider').length;

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
      <header className="mb-12 border-b border-[color:var(--color-line)] pb-6">
        <nav className="mb-6 flex justify-between font-mono text-xs uppercase tracking-widest text-[color:var(--color-muted)]">
          <Link href="/" className="transition-colors hover:text-[color:var(--color-ink)]">
            ← motion language
          </Link>
          <span>
            components · {componentCount} · {catalog.length - 1} categories
          </span>
        </nav>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">Component gallery</h1>
        <p className="mb-6 max-w-prose text-[color:var(--color-muted)]">
          Organized by what each part of a page does. Every component reads the active preset through
          context — switch preset or toggle reduced motion and they all respond, no demo code changes.
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
              {cat.components.map((c) => (
                <DemoCard key={c.name} title={c.name} desc={c.summary} span={WIDE.has(c.name)}>
                  {demoFor(c.name, accent)}
                </DemoCard>
              ))}
            </div>
          </section>
        ))}
      </MotionProvider>
    </main>
  );
}

// Components that read better full-width.
const WIDE = new Set(['Marquee', 'StickyScene', 'SmoothScroll', 'AnimatedGradient', 'BeamGrid']);

function demoFor(name: string, accent: string): ReactNode {
  switch (name) {
    case 'Reveal':
      return (
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
      );
    case 'ImageReveal':
      return (
        <ImageReveal trigger="mount" src={DEMO_IMAGE} alt="Gradient demo" from="left" className="w-full rounded-lg" />
      );
    case 'TextReveal':
      return (
        <TextReveal trigger="mount" text="Type that arrives in pieces." by="word" className="text-2xl font-medium tracking-tight" />
      );
    case 'RotatingText':
      return (
        <p className="text-2xl font-medium tracking-tight">
          I build{' '}
          <span style={{ color: accent }}>
            <RotatingText words={['websites', 'systems', 'tools']} />
          </span>
        </p>
      );
    case 'Parallax':
      return (
        <div className="relative h-40 w-full overflow-hidden rounded-lg bg-[color:var(--color-canvas)]">
          <Parallax speed={0.5} className="absolute left-4 top-2">
            <span className="text-5xl font-bold opacity-10">01</span>
          </Parallax>
          <Parallax speed={-0.4} className="absolute bottom-3 right-5">
            <Pill>foreground</Pill>
          </Parallax>
          <Parallax speed={0.2} className="absolute bottom-6 left-6">
            <span style={{ color: accent }} className="text-sm font-medium">
              background
            </span>
          </Parallax>
        </div>
      );
    case 'ScrollProgress':
      return (
        <p className="text-center text-sm text-[color:var(--color-muted)]">
          The accent bar pinned to the <strong className="text-[color:var(--color-ink)]">top of the page</strong> —
          scroll to watch it fill.
        </p>
      );
    case 'StickyScene':
      return (
        <div className="w-full">
          <p className="mb-3 text-sm text-[color:var(--color-muted)]">
            On a full page this pins and scrolls its row sideways. Drag the row:
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {['Scene 01', 'Scene 02', 'Scene 03', 'Scene 04'].map((s) => (
              <div
                key={s}
                className="flex h-24 w-40 flex-shrink-0 items-center justify-center rounded-lg font-medium text-white"
                style={{ background: accent }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      );
    case 'Magnetic':
      return (
        <Magnetic strength={0.5} padding={24}>
          <button type="button" className="rounded-full px-6 py-2.5 font-medium text-white" style={{ background: accent }}>
            Get in touch
          </button>
        </Magnetic>
      );
    case 'TiltCard':
      return (
        <TiltCard className="h-28 w-44">
          <div className="flex h-full w-full items-center justify-center rounded-xl font-medium text-white shadow-lg" style={{ background: accent }}>
            hover me
          </div>
        </TiltCard>
      );
    case 'AnimatedGradient':
      return (
        <BgBox bg="#0e1118">
          <AnimatedGradient />
          <Centered>aurora</Centered>
        </BgBox>
      );
    case 'GrainOverlay':
      return (
        <BgBox bg={`linear-gradient(135deg, ${accent}, #0e1118)`}>
          <GrainOverlay opacity={0.35} />
          <Centered>film grain</Centered>
        </BgBox>
      );
    case 'DotGrid':
      return (
        <BgBox bg="#ffffff">
          <DotGrid />
          <Centered dark>hover the grid</Centered>
        </BgBox>
      );
    case 'BeamGrid':
      return (
        <BgBox bg="#0e1118">
          <BeamGrid beamColor={accent} />
          <Centered>beam grid</Centered>
        </BgBox>
      );
    case 'AnimatedNumber':
      return (
        <div className="flex w-full justify-around text-center">
          {[
            { v: 1280, l: 'commits' },
            { v: 19, l: 'components' },
            { v: 100, l: 'lighthouse' },
          ].map((s) => (
            <div key={s.l}>
              <AnimatedNumber trigger="mount" value={s.v} className="text-3xl font-semibold" duration="cinematic" />
              <div className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">{s.l}</div>
            </div>
          ))}
        </div>
      );
    case 'StatBar':
      return (
        <div className="flex w-full flex-col gap-4" style={{ color: accent }}>
          <StatBar trigger="mount" value={92} label="Design" />
          <StatBar trigger="mount" value={78} label="Engineering" />
        </div>
      );
    case 'Marquee':
      return (
        <Marquee className="w-full" speed={70}>
          {SKILLS.map((s) => (
            <Pill key={s}>{s}</Pill>
          ))}
        </Marquee>
      );
    case 'Accordion':
      return (
        <Accordion
          className="w-full"
          defaultOpen={0}
          items={[
            { title: 'What is Umbra?', content: 'A token-driven motion toolkit for React.' },
            { title: 'Does it respect reduced motion?', content: 'Yes — every component degrades gracefully.' },
            { title: 'How is it distributed?', content: 'A shadcn-style registry (Phase 3).' },
          ]}
        />
      );
    case 'SmoothScroll':
      return (
        <SmoothScroll offset={16} className="flex flex-col items-center gap-3 text-sm">
          <span className="text-[color:var(--color-muted)]">Eased jump to a category:</span>
          <div className="flex flex-wrap justify-center gap-2">
            {['entrance', 'background', 'data'].map((id) => (
              <a key={id} href={`#${id}`} className="rounded-full border border-[color:var(--color-line)] px-3 py-1 capitalize transition-colors hover:bg-white" style={{ color: accent }}>
                {id}
              </a>
            ))}
          </div>
        </SmoothScroll>
      );
    case 'Stagger':
      return (
        <Stagger trigger="mount" className="flex flex-wrap justify-center gap-2" from="up">
          {SKILLS.slice(0, 5).map((s) => (
            <Pill key={s}>{s}</Pill>
          ))}
        </Stagger>
      );
    case 'MotionProvider':
      return (
        <p className="text-center text-sm text-[color:var(--color-muted)]">
          Wraps your app and injects the active preset. The controls above are a `MotionProvider`.
        </p>
      );
    default:
      return null;
  }
}

function DemoCard({ title, desc, span, children }: { title: string; desc: string; span?: boolean; children: ReactNode }) {
  return (
    <section className={`rounded-xl border border-[color:var(--color-line)] bg-white/50 p-5 ${span ? 'sm:col-span-2' : ''}`}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="font-mono text-sm">{title}</h3>
        <p className="font-mono text-[11px] text-[color:var(--color-muted)]">{desc}</p>
      </div>
      <div className="flex min-h-[140px] items-center justify-center">{children}</div>
    </section>
  );
}

function BgBox({ children, bg }: { children: ReactNode; bg: string }) {
  return (
    <div className="relative h-44 w-full overflow-hidden rounded-lg" style={{ background: bg }}>
      {children}
    </div>
  );
}

function Centered({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center font-mono text-sm"
      style={{ color: dark ? 'rgba(20,22,27,0.5)' : 'rgba(255,255,255,0.85)' }}
    >
      {children}
    </div>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[color:var(--color-line)] bg-white px-3 py-1 text-sm">
      {children}
    </span>
  );
}
