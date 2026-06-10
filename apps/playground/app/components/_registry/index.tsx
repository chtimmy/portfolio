import type { ReactNode } from 'react';
import {
  Accordion,
  AnimatedGradient,
  AnimatedNumber,
  BeamGrid,
  DotGrid,
  GrainOverlay,
  ImageReveal,
  Magnetic,
  Marquee,
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
import type { ControlDef, Values } from '../../_components/PropControls';
import { BgBox, Centered, DEMO_IMAGE, Pill, SKILLS } from '../../_components/demo-bits';

export interface DemoEntry {
  controls: ControlDef[];
  render: (v: Values, ctx: { accent: string }) => ReactNode;
  code: (v: Values) => string;
}

// shared option lists
const DURATIONS = ['instant', 'fast', 'base', 'slow', 'cinematic'];
const EASINGS = ['standard', 'entrance', 'exit', 'emphasized'];
const DISTANCES = ['subtle', 'base', 'dramatic'];
const DIRECTIONS = ['up', 'down', 'left', 'right'];

const s = (name: string, options: string[], def: string, description?: string): ControlDef => ({
  kind: 'select',
  name,
  options,
  default: def,
  description,
});
const n = (name: string, min: number, max: number, def: number, step?: number, description?: string): ControlDef => ({
  kind: 'number',
  name,
  min,
  max,
  default: def,
  step,
  description,
});

function DemoBox({ label, accent }: { label: string; accent: string }) {
  return (
    <div
      className="flex h-16 w-48 items-center justify-center rounded-lg font-medium text-white"
      style={{ background: accent }}
    >
      {label}
    </div>
  );
}

export const registry: Record<string, DemoEntry> = {
  // ── Entrance & reveal ───────────────────────────────────────────────────────
  Reveal: {
    controls: [
      s('variant', ['fade', 'slide', 'scale'], 'slide'),
      s('from', DIRECTIONS, 'up', 'slide direction'),
      s('distance', DISTANCES, 'base'),
      s('duration', DURATIONS, 'base'),
    ],
    render: (v, { accent }) => (
      <Reveal
        trigger="mount"
        variant={v.variant as 'fade' | 'slide' | 'scale'}
        from={v.from as 'up' | 'down' | 'left' | 'right'}
        distance={v.distance as 'subtle' | 'base' | 'dramatic'}
        duration={v.duration as 'instant' | 'fast' | 'base' | 'slow' | 'cinematic'}
      >
        <DemoBox label="Reveal" accent={accent} />
      </Reveal>
    ),
    code: (v) =>
      `<Reveal variant="${v.variant}" from="${v.from}" distance="${v.distance}" duration="${v.duration}">\n  <YourContent />\n</Reveal>`,
  },

  ImageReveal: {
    controls: [
      s('from', ['left', 'right', 'top', 'bottom'], 'left'),
      s('duration', DURATIONS, 'slow'),
      s('easing', EASINGS, 'entrance'),
    ],
    render: (v) => (
      <ImageReveal
        trigger="mount"
        src={DEMO_IMAGE}
        alt="Demo"
        from={v.from as 'left' | 'right' | 'top' | 'bottom'}
        duration={v.duration as never}
        easing={v.easing as never}
        className="w-full max-w-md rounded-lg"
      />
    ),
    code: (v) => `<ImageReveal src={src} alt="…" from="${v.from}" duration="${v.duration}" />`,
  },

  // ── Text ────────────────────────────────────────────────────────────────────
  TextReveal: {
    controls: [
      s('by', ['character', 'word', 'line'], 'word'),
      s('stagger', ['tight', 'base', 'loose'], 'base'),
      s('distance', DISTANCES, 'subtle'),
      { kind: 'text', name: 'text', default: 'Type that arrives in pieces.' },
    ],
    render: (v) => (
      <TextReveal
        trigger="mount"
        text={v.text as string}
        by={v.by as 'character' | 'word' | 'line'}
        stagger={v.stagger as never}
        distance={v.distance as never}
        className="text-3xl font-medium tracking-tight"
      />
    ),
    code: (v) => `<TextReveal text="${v.text}" by="${v.by}" stagger="${v.stagger}" />`,
  },

  RotatingText: {
    controls: [
      { kind: 'text', name: 'words', default: 'websites, systems, tools', description: 'comma-separated' },
      n('interval', 600, 4000, 2000, 100, 'ms per word'),
    ],
    render: (v, { accent }) => {
      const words = (v.words as string).split(',').map((w) => w.trim()).filter(Boolean);
      return (
        <p className="text-3xl font-medium tracking-tight">
          I build{' '}
          <span style={{ color: accent }}>
            <RotatingText words={words} interval={v.interval as number} />
          </span>
        </p>
      );
    },
    code: (v) =>
      `<RotatingText\n  words={[${(v.words as string)
        .split(',')
        .map((w) => `'${w.trim()}'`)
        .join(', ')}]}\n  interval={${v.interval}}\n/>`,
  },

  // ── Scroll-driven ─────────────────────────────────────────────────────────────
  Parallax: {
    controls: [n('speed', -1, 1, 0.4, 0.05), s('range', DISTANCES, 'dramatic')],
    render: (v, { accent }) => (
      <div className="relative h-64 w-full overflow-hidden rounded-lg bg-[color:var(--color-canvas)]">
        <p className="absolute left-3 top-2 font-mono text-[11px] text-[color:var(--color-muted)]">
          scroll the page ↕
        </p>
        <Parallax speed={v.speed as number} range={v.range as never} className="absolute left-6 top-8">
          <span className="text-6xl font-bold opacity-10">01</span>
        </Parallax>
        <Parallax speed={-(v.speed as number)} range={v.range as never} className="absolute bottom-6 right-6">
          <DemoBox label="layer" accent={accent} />
        </Parallax>
      </div>
    ),
    code: (v) => `<Parallax speed={${v.speed}} range="${v.range}">\n  <YourContent />\n</Parallax>`,
  },

  ScrollProgress: {
    controls: [n('thickness', 1, 10, 4), s('position', ['top', 'bottom'], 'top')],
    render: (v, { accent }) => (
      <div className="w-full text-center">
        <ScrollProgress color={accent} thickness={v.thickness as number} position={v.position as 'top' | 'bottom'} />
        <p className="text-sm text-[color:var(--color-muted)]">
          A real bar is pinned to the <strong className="text-[color:var(--color-ink)]">{v.position as string}</strong> of
          the page — scroll to watch it fill.
        </p>
      </div>
    ),
    code: (v) => `<ScrollProgress color="…" thickness={${v.thickness}} position="${v.position}" />`,
  },

  StickyScene: {
    controls: [n('scrollLength', 1.5, 4, 2.5, 0.5, 'viewport-heights of scroll')],
    render: (_v, { accent }) => (
      <div className="w-full">
        <p className="mb-3 text-sm text-[color:var(--color-muted)]">
          On a full page this pins and scrolls its row sideways as you scroll down. Preview row:
        </p>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {['Scene 01', 'Scene 02', 'Scene 03', 'Scene 04'].map((t) => (
            <div
              key={t}
              className="flex h-24 w-40 flex-shrink-0 items-center justify-center rounded-lg font-medium text-white"
              style={{ background: accent }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    code: (v) => `<StickyScene scrollLength={${v.scrollLength}}>\n  {/* a wide row of panels */}\n</StickyScene>`,
  },

  // ── Hover & cursor ────────────────────────────────────────────────────────────
  Magnetic: {
    controls: [n('strength', 0, 1, 0.4, 0.05), n('padding', 0, 60, 24)],
    render: (v, { accent }) => (
      <Magnetic strength={v.strength as number} padding={v.padding as number}>
        <button type="button" className="rounded-full px-6 py-2.5 font-medium text-white" style={{ background: accent }}>
          Get in touch
        </button>
      </Magnetic>
    ),
    code: (v) => `<Magnetic strength={${v.strength}} padding={${v.padding}}>\n  <button>Get in touch</button>\n</Magnetic>`,
  },

  TiltCard: {
    controls: [n('max', 0, 30, 12, 1, 'degrees'), n('perspective', 200, 1200, 600, 50)],
    render: (v, { accent }) => (
      <TiltCard max={v.max as number} perspective={v.perspective as number} className="h-32 w-52">
        <div
          className="flex h-full w-full items-center justify-center rounded-xl font-medium text-white shadow-lg"
          style={{ background: accent }}
        >
          hover me
        </div>
      </TiltCard>
    ),
    code: (v) => `<TiltCard max={${v.max}} perspective={${v.perspective}}>\n  <YourCard />\n</TiltCard>`,
  },

  // ── Background & ambient ──────────────────────────────────────────────────────
  AnimatedGradient: {
    controls: [n('speed', 4, 40, 16), n('blur', 20, 120, 60)],
    render: (v) => (
      <BgBox bg="#0e1118">
        <AnimatedGradient speed={v.speed as number} blur={v.blur as number} />
        <Centered>aurora</Centered>
      </BgBox>
    ),
    code: (v) => `<div className="relative">\n  <AnimatedGradient speed={${v.speed}} blur={${v.blur}} />\n  {/* content */}\n</div>`,
  },

  GrainOverlay: {
    controls: [n('opacity', 0, 0.6, 0.18, 0.01), s('blendMode', ['overlay', 'soft-light', 'multiply', 'normal'], 'overlay')],
    render: (v, { accent }) => (
      <BgBox bg={`linear-gradient(135deg, ${accent}, #0e1118)`}>
        <GrainOverlay opacity={v.opacity as number} blendMode={v.blendMode as never} />
        <Centered>film grain</Centered>
      </BgBox>
    ),
    code: (v) => `<div className="relative">\n  <GrainOverlay opacity={${v.opacity}} blendMode="${v.blendMode}" />\n</div>`,
  },

  DotGrid: {
    controls: [n('gap', 12, 50, 28), n('dotSize', 1, 4, 1.5, 0.5), n('influence', 40, 220, 100)],
    render: (v) => (
      <BgBox bg="#ffffff">
        <DotGrid gap={v.gap as number} dotSize={v.dotSize as number} influence={v.influence as number} />
        <Centered dark>hover the grid</Centered>
      </BgBox>
    ),
    code: (v) => `<div className="relative">\n  <DotGrid gap={${v.gap}} dotSize={${v.dotSize}} influence={${v.influence}} />\n</div>`,
  },

  BeamGrid: {
    controls: [n('cell', 24, 96, 48), n('speed', 2, 12, 6)],
    render: (v, { accent }) => (
      <BgBox bg="#0e1118">
        <BeamGrid cell={v.cell as number} speed={v.speed as number} beamColor={accent} />
        <Centered>beam grid</Centered>
      </BgBox>
    ),
    code: (v) => `<div className="relative">\n  <BeamGrid cell={${v.cell}} speed={${v.speed}} beamColor="…" />\n</div>`,
  },

  // ── Data & numbers ────────────────────────────────────────────────────────────
  AnimatedNumber: {
    controls: [n('value', 0, 10000, 1280, 10), s('duration', DURATIONS, 'cinematic'), s('easing', EASINGS, 'standard')],
    render: (v) => (
      <AnimatedNumber
        trigger="mount"
        value={v.value as number}
        duration={v.duration as never}
        easing={v.easing as never}
        className="text-5xl font-semibold"
      />
    ),
    code: (v) => `<AnimatedNumber value={${v.value}} duration="${v.duration}" easing="${v.easing}" />`,
  },

  StatBar: {
    controls: [n('value', 0, 100, 78), { kind: 'text', name: 'label', default: 'Engineering' }, n('thickness', 4, 20, 8)],
    render: (v, { accent }) => (
      <div className="w-full max-w-sm" style={{ color: accent }}>
        <StatBar trigger="mount" value={v.value as number} label={v.label as string} thickness={v.thickness as number} />
      </div>
    ),
    code: (v) => `<StatBar value={${v.value}} label="${v.label}" thickness={${v.thickness}} />`,
  },

  // ── Continuous & layout ───────────────────────────────────────────────────────
  Marquee: {
    controls: [
      n('speed', 10, 160, 70, 5, 'px / second'),
      s('direction', ['left', 'right'], 'left'),
      n('gap', 8, 64, 32),
      { kind: 'boolean', name: 'pauseOnHover', default: true },
    ],
    render: (v) => (
      <Marquee
        className="w-full"
        speed={v.speed as number}
        direction={v.direction as 'left' | 'right'}
        gap={v.gap as number}
        pauseOnHover={v.pauseOnHover as boolean}
      >
        {SKILLS.map((x) => (
          <Pill key={x}>{x}</Pill>
        ))}
      </Marquee>
    ),
    code: (v) => `<Marquee speed={${v.speed}} direction="${v.direction}" gap={${v.gap}} pauseOnHover={${v.pauseOnHover}}>\n  {items}\n</Marquee>`,
  },

  Accordion: {
    controls: [{ kind: 'boolean', name: 'allowMultiple', default: false }, n('defaultOpen', 0, 2, 0)],
    render: (v) => (
      <Accordion
        className="w-full max-w-md"
        allowMultiple={v.allowMultiple as boolean}
        defaultOpen={v.defaultOpen as number}
        items={[
          { title: 'What is Umbra?', content: 'A token-driven motion toolkit for React.' },
          { title: 'Reduced motion?', content: 'Every component degrades gracefully.' },
          { title: 'Distribution?', content: 'A shadcn-style registry (Phase 3b).' },
        ]}
      />
    ),
    code: (v) => `<Accordion allowMultiple={${v.allowMultiple}} defaultOpen={${v.defaultOpen}} items={[…]} />`,
  },

  // ── Navigation ────────────────────────────────────────────────────────────────
  SmoothScroll: {
    controls: [n('offset', 0, 120, 16, 4, 'px above target')],
    render: (v, { accent }) => (
      <SmoothScroll offset={v.offset as number} className="flex flex-col items-center gap-3 text-sm">
        <span className="text-[color:var(--color-muted)]">Eased jump within this page:</span>
        <div className="flex gap-2">
          {[
            ['#top', 'top'],
            ['#bottom', 'bottom'],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="rounded-full border border-[color:var(--color-line)] px-3 py-1 transition-colors hover:bg-white"
              style={{ color: accent }}
            >
              {label}
            </a>
          ))}
        </div>
      </SmoothScroll>
    ),
    code: (v) => `<SmoothScroll offset={${v.offset}}>\n  <a href="#section">Jump</a>\n</SmoothScroll>`,
  },

  // ── Orchestration ─────────────────────────────────────────────────────────────
  Stagger: {
    controls: [s('stagger', ['tight', 'base', 'loose'], 'base'), s('from', DIRECTIONS, 'up'), s('distance', DISTANCES, 'base')],
    render: (v) => (
      <Stagger
        trigger="mount"
        className="flex flex-wrap justify-center gap-2"
        stagger={v.stagger as never}
        from={v.from as never}
        distance={v.distance as never}
      >
        {SKILLS.slice(0, 5).map((x) => (
          <Pill key={x}>{x}</Pill>
        ))}
      </Stagger>
    ),
    code: (v) => `<Stagger stagger="${v.stagger}" from="${v.from}" distance="${v.distance}">\n  {children}\n</Stagger>`,
  },

  MotionProvider: {
    controls: [],
    render: () => (
      <p className="max-w-sm text-center text-sm text-[color:var(--color-muted)]">
        Wrap your app once. It injects the active preset via context and as CSS variables — every
        component below reads from it. The preset / reduced toggles on this page are a live
        `MotionProvider`.
      </p>
    ),
    code: () => `<MotionProvider preset="calm">\n  <App />\n</MotionProvider>`,
  },
};
