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
import type { ControlDef, TokenScale, Values } from '../../_components/PropControls';
import { BgBox, Centered, DEMO_IMAGE, Pill, ScrollBox, SKILLS } from '../../_components/demo-bits';

export type DemoMode = 'loop' | 'scroll' | 'live';

export interface DemoEntry {
  controls: ControlDef[];
  modes: DemoMode[];
  render: (v: Values, ctx: { accent: string; mode: DemoMode }) => ReactNode;
  code: (v: Values) => string;
}

// shared option lists
const DURATIONS = ['instant', 'fast', 'base', 'slow', 'cinematic'];
const EASINGS = ['standard', 'entrance', 'exit', 'emphasized'];
const DISTANCES = ['subtle', 'base', 'dramatic'];
const DIRECTIONS = ['up', 'down', 'left', 'right'];

const s = (name: string, options: string[], def: string, token?: TokenScale): ControlDef => ({
  kind: 'select',
  name,
  options,
  default: def,
  token,
});
const num = (name: string, min: number, max: number, def: number, step?: number, description?: string): ControlDef => ({
  kind: 'number',
  name,
  min,
  max,
  default: def,
  step,
  description,
});

// loop -> trigger="mount"; scroll -> trigger="inView" inside a scroll box. In scroll mode `once` is
// false so the element re-hides/re-reveals as you scroll up and down.
const scrollable = (
  mode: DemoMode,
  el: (trigger: 'mount' | 'inView', once: boolean) => ReactNode,
): ReactNode => (mode === 'scroll' ? <ScrollBox>{() => el('inView', false)}</ScrollBox> : el('mount', true));

function DemoBox({ label, accent }: { label: string; accent: string }) {
  return (
    <div className="flex h-20 w-56 items-center justify-center rounded-lg text-lg font-medium text-white" style={{ background: accent }}>
      {label}
    </div>
  );
}

export const registry: Record<string, DemoEntry> = {
  // ── Entrance & reveal ───────────────────────────────────────────────────────
  Reveal: {
    modes: ['loop', 'scroll'],
    controls: [
      s('variant', ['fade', 'slide', 'scale'], 'slide'),
      s('from', DIRECTIONS, 'up'),
      s('distance', DISTANCES, 'dramatic', 'distance'),
      s('duration', DURATIONS, 'slow', 'duration'),
    ],
    render: (v, { accent, mode }) =>
      scrollable(mode, (trigger, once) => (
        <Reveal
          trigger={trigger}
          once={once}
          variant={v.variant as 'fade' | 'slide' | 'scale'}
          from={v.from as 'up' | 'down' | 'left' | 'right'}
          distance={v.distance as never}
          duration={v.duration as never}
        >
          <DemoBox label="Reveal" accent={accent} />
        </Reveal>
      )),
    code: (v) =>
      `<Reveal variant="${v.variant}" from="${v.from}" distance="${v.distance}" duration="${v.duration}">\n  <YourContent />\n</Reveal>`,
  },

  ImageReveal: {
    modes: ['loop', 'scroll'],
    controls: [
      s('from', ['left', 'right', 'top', 'bottom'], 'left'),
      s('duration', DURATIONS, 'slow', 'duration'),
      s('easing', EASINGS, 'entrance', 'easing'),
    ],
    render: (v, { mode }) =>
      scrollable(mode, (trigger, once) => (
        <ImageReveal
          trigger={trigger}
          once={once}
          src={DEMO_IMAGE}
          alt="Demo"
          from={v.from as 'left' | 'right' | 'top' | 'bottom'}
          duration={v.duration as never}
          easing={v.easing as never}
          className="w-full max-w-md rounded-lg"
        />
      )),
    code: (v) => `<ImageReveal src={src} alt="…" from="${v.from}" duration="${v.duration}" />`,
  },

  // ── Text ────────────────────────────────────────────────────────────────────
  TextReveal: {
    modes: ['loop', 'scroll'],
    controls: [
      s('by', ['character', 'word', 'line'], 'word'),
      s('stagger', ['tight', 'base', 'loose'], 'base', 'stagger'),
      s('distance', DISTANCES, 'subtle', 'distance'),
      { kind: 'text', name: 'text', default: 'Type that arrives in pieces.' },
    ],
    render: (v, { mode }) =>
      scrollable(mode, (trigger, once) => (
        <TextReveal
          trigger={trigger}
          once={once}
          text={v.text as string}
          by={v.by as 'character' | 'word' | 'line'}
          stagger={v.stagger as never}
          distance={v.distance as never}
          className="text-3xl font-medium tracking-tight"
        />
      )),
    code: (v) => `<TextReveal text="${v.text}" by="${v.by}" stagger="${v.stagger}" />`,
  },

  RotatingText: {
    modes: ['live'],
    controls: [
      { kind: 'text', name: 'words', default: 'websites, systems, tools', description: 'comma-separated' },
      num('interval', 600, 4000, 2000, 100, 'ms per word'),
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
      `<RotatingText\n  words={[${(v.words as string).split(',').map((w) => `'${w.trim()}'`).join(', ')}]}\n  interval={${v.interval}}\n/>`,
  },

  // ── Scroll-driven ─────────────────────────────────────────────────────────────
  Parallax: {
    modes: ['scroll'],
    controls: [num('speed', -1, 1, 0.5, 0.05), s('range', DISTANCES, 'dramatic', 'distance')],
    render: (v, { accent }) => (
      <ScrollBox>
        {(ref) => (
          <div className="relative flex h-40 w-full items-center justify-center">
            <Parallax root={ref} speed={v.speed as number} range={v.range as never} className="absolute">
              <span className="text-7xl font-bold opacity-10">01</span>
            </Parallax>
            <Parallax root={ref} speed={-(v.speed as number)} range={v.range as never}>
              <DemoBox label="layer" accent={accent} />
            </Parallax>
          </div>
        )}
      </ScrollBox>
    ),
    code: (v) => `<Parallax speed={${v.speed}} range="${v.range}">\n  <YourContent />\n</Parallax>`,
  },

  ScrollProgress: {
    modes: ['scroll'],
    controls: [num('thickness', 1, 10, 4), s('position', ['top', 'bottom'], 'top')],
    render: (v, { accent }) => (
      <ScrollBox
        pinned={(ref) => (
          <ScrollProgress
            container={ref}
            color={accent}
            thickness={v.thickness as number}
            position={v.position as 'top' | 'bottom'}
          />
        )}
      >
        {() => <p className="text-sm text-[color:var(--color-muted)]">Scroll — the bar tracks this box.</p>}
      </ScrollBox>
    ),
    code: (v) => `<ScrollProgress thickness={${v.thickness}} position="${v.position}" />`,
  },

  StickyScene: {
    modes: ['live'],
    controls: [num('scrollLength', 1.5, 4, 2.5, 0.5, 'viewport-heights of scroll')],
    render: (_v, { accent }) => (
      <div className="w-full">
        <p className="mb-3 text-sm text-[color:var(--color-muted)]">
          On a full page this pins and scrolls the row sideways as you scroll down. Drag the row:
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
    modes: ['live'],
    controls: [num('strength', 0, 1, 0.4, 0.05), num('padding', 0, 60, 24)],
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
    modes: ['live'],
    controls: [num('max', 0, 30, 12, 1, 'degrees'), num('perspective', 200, 1200, 600, 50)],
    render: (v, { accent }) => (
      <TiltCard max={v.max as number} perspective={v.perspective as number} className="h-32 w-52">
        <div className="flex h-full w-full items-center justify-center rounded-xl font-medium text-white shadow-lg" style={{ background: accent }}>
          hover me
        </div>
      </TiltCard>
    ),
    code: (v) => `<TiltCard max={${v.max}} perspective={${v.perspective}}>\n  <YourCard />\n</TiltCard>`,
  },

  // ── Background & ambient ──────────────────────────────────────────────────────
  AnimatedGradient: {
    modes: ['live'],
    controls: [num('speed', 4, 40, 16), num('blur', 20, 120, 60)],
    render: (v) => (
      <BgBox bg="#0e1118">
        <AnimatedGradient speed={v.speed as number} blur={v.blur as number} />
        <Centered>aurora</Centered>
      </BgBox>
    ),
    code: (v) => `<div className="relative">\n  <AnimatedGradient speed={${v.speed}} blur={${v.blur}} />\n</div>`,
  },

  GrainOverlay: {
    modes: ['live'],
    controls: [num('opacity', 0, 0.6, 0.18, 0.01), s('blendMode', ['overlay', 'soft-light', 'multiply', 'normal'], 'overlay')],
    render: (v, { accent }) => (
      <BgBox bg={`linear-gradient(135deg, ${accent}, #0e1118)`}>
        <GrainOverlay opacity={v.opacity as number} blendMode={v.blendMode as never} />
        <Centered>film grain</Centered>
      </BgBox>
    ),
    code: (v) => `<div className="relative">\n  <GrainOverlay opacity={${v.opacity}} blendMode="${v.blendMode}" />\n</div>`,
  },

  DotGrid: {
    modes: ['live'],
    controls: [num('gap', 12, 50, 28), num('dotSize', 1, 4, 1.5, 0.5), num('influence', 40, 220, 100)],
    render: (v) => (
      <BgBox bg="#ffffff">
        <DotGrid gap={v.gap as number} dotSize={v.dotSize as number} influence={v.influence as number} />
        <Centered dark>hover the grid</Centered>
      </BgBox>
    ),
    code: (v) => `<div className="relative">\n  <DotGrid gap={${v.gap}} dotSize={${v.dotSize}} influence={${v.influence}} />\n</div>`,
  },

  BeamGrid: {
    modes: ['live'],
    controls: [num('cell', 24, 96, 48), num('speed', 2, 12, 6)],
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
    modes: ['loop', 'scroll'],
    controls: [num('value', 0, 10000, 1280, 10), s('duration', DURATIONS, 'cinematic', 'duration'), s('easing', EASINGS, 'standard', 'easing')],
    render: (v, { mode }) =>
      scrollable(mode, (trigger, once) => (
        <AnimatedNumber
          trigger={trigger}
          once={once}
          value={v.value as number}
          duration={v.duration as never}
          easing={v.easing as never}
          className="text-6xl font-semibold"
        />
      )),
    code: (v) => `<AnimatedNumber value={${v.value}} duration="${v.duration}" easing="${v.easing}" />`,
  },

  StatBar: {
    modes: ['loop', 'scroll'],
    controls: [num('value', 0, 100, 78), s('duration', DURATIONS, 'slow', 'duration'), { kind: 'text', name: 'label', default: 'Engineering' }, num('thickness', 4, 20, 8)],
    render: (v, { accent, mode }) =>
      scrollable(mode, (trigger, once) => (
        <div className="w-full max-w-sm" style={{ color: accent }}>
          <StatBar trigger={trigger} once={once} value={v.value as number} duration={v.duration as never} label={v.label as string} thickness={v.thickness as number} />
        </div>
      )),
    code: (v) => `<StatBar value={${v.value}} duration="${v.duration}" label="${v.label}" thickness={${v.thickness}} />`,
  },

  // ── Continuous & layout ───────────────────────────────────────────────────────
  Marquee: {
    modes: ['live'],
    controls: [
      num('speed', 10, 160, 70, 5, 'px / second'),
      s('direction', ['left', 'right'], 'left'),
      num('gap', 8, 64, 32),
      { kind: 'boolean', name: 'pauseOnHover', default: true },
    ],
    render: (v) => (
      <Marquee className="w-full" speed={v.speed as number} direction={v.direction as 'left' | 'right'} gap={v.gap as number} pauseOnHover={v.pauseOnHover as boolean}>
        {SKILLS.map((x) => (
          <Pill key={x}>{x}</Pill>
        ))}
      </Marquee>
    ),
    code: (v) => `<Marquee speed={${v.speed}} direction="${v.direction}" gap={${v.gap}} pauseOnHover={${v.pauseOnHover}}>\n  {items}\n</Marquee>`,
  },

  Accordion: {
    modes: ['live'],
    controls: [{ kind: 'boolean', name: 'allowMultiple', default: false }, num('defaultOpen', 0, 2, 0)],
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
    modes: ['live'],
    controls: [num('offset', 0, 120, 16, 4, 'px above target')],
    render: (v, { accent }) => (
      <SmoothScroll offset={v.offset as number} className="flex flex-col items-center gap-3 text-sm">
        <span className="text-[color:var(--color-muted)]">Eased jump within this page:</span>
        <div className="flex gap-2">
          {[
            ['#top', 'top'],
            ['#bottom', 'bottom'],
          ].map(([href, label]) => (
            <a key={href} href={href} className="rounded-full border border-[color:var(--color-line)] px-3 py-1 transition-colors hover:bg-white" style={{ color: accent }}>
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
    modes: ['loop', 'scroll'],
    controls: [s('stagger', ['tight', 'base', 'loose'], 'base', 'stagger'), s('from', DIRECTIONS, 'up'), s('distance', DISTANCES, 'base', 'distance')],
    render: (v, { mode }) =>
      scrollable(mode, (trigger, once) => (
        <Stagger trigger={trigger} once={once} className="flex flex-wrap justify-center gap-2" stagger={v.stagger as never} from={v.from as never} distance={v.distance as never}>
          {SKILLS.slice(0, 5).map((x) => (
            <Pill key={x}>{x}</Pill>
          ))}
        </Stagger>
      )),
    code: (v) => `<Stagger stagger="${v.stagger}" from="${v.from}" distance="${v.distance}">\n  {children}\n</Stagger>`,
  },

  MotionProvider: {
    modes: ['live'],
    controls: [],
    render: () => (
      <p className="max-w-sm text-center text-sm text-[color:var(--color-muted)]">
        Wrap your app once. It injects the active preset via context and CSS variables — every
        component reads from it. The preset / reduced toggles on this page are a live MotionProvider.
      </p>
    ),
    code: () => `<MotionProvider preset="calm">\n  <App />\n</MotionProvider>`,
  },
};
