import type { ReactNode, RefObject } from 'react';
import {
  Accordion,
  AnimatedGradient,
  AnimatedNumber,
  Aurora,
  BeamGrid,
  DecodeText,
  DotGrid,
  GrainOverlay,
  HeroTitle,
  ImageReveal,
  Lightbox,
  LineStagger,
  Magnetic,
  Marquee,
  OutlineTrace,
  Parallax,
  RedactionWipe,
  Reveal,
  RotatingText,
  ScanlineReveal,
  ScrollProgress,
  SkillRadar,
  SpiralGallery,
  Stagger,
  StatBar,
  TextReveal,
  TiltCard,
} from '@umbra/motion';
import type { ControlDef, TokenScale, Values } from '../../_components/PropControls';
import {
  BgBox,
  Centered,
  DEMO_IMAGE,
  Pill,
  SceneLightboxDemo,
  ScrollBox,
  ScrollStackDemo,
  SKILLS,
  SmoothScrollDemo,
  StickySceneDemo,
} from '../../_components/demo-bits';

export type DemoMode = 'loop' | 'scroll' | 'live';

export interface DemoEntry {
  controls: ControlDef[];
  modes: DemoMode[];
  render: (v: Values, ctx: { accent: string; mode: DemoMode }) => ReactNode;
  code: (v: Values) => string;
  /** Optional one-liner shown near the demo — what you're looking at / how to interact. */
  note?: string;
}

// shared option lists
const DURATIONS = ['fast', 'base', 'slow', 'cinematic', 'epic'];
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
const col = (name: string, def: string, description?: string): ControlDef => ({
  kind: 'color',
  name,
  default: def,
  description,
});
const INTERACTIONS = ['auto', 'cursor', 'scroll'];

// loop -> trigger="mount"; scroll -> trigger="inView" inside a scroll box. In scroll mode `once` is
// false so the element re-hides/re-reveals as you scroll up and down, and the box ref is passed as
// the component's `root` so intersection is measured against the box (fires + resets reliably).
const scrollable = (
  mode: DemoMode,
  el: (trigger: 'mount' | 'inView', once: boolean, root?: RefObject<HTMLElement | null>) => ReactNode,
): ReactNode =>
  mode === 'scroll' ? <ScrollBox>{(ref) => el('inView', false, ref)}</ScrollBox> : el('mount', true);

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
      scrollable(mode, (trigger, once, root) => (
        <Reveal
          trigger={trigger}
          once={once}
          root={root}
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
      scrollable(mode, (trigger, once, root) => (
        <ImageReveal
          trigger={trigger}
          once={once}
          root={root}
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
      scrollable(mode, (trigger, once, root) => (
        <TextReveal
          trigger={trigger}
          once={once}
          root={root}
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
  DecodeText: {
    modes: ['loop'],
    note: 'Resolves text out of flickering glyphs, left to right — a "decrypting file" effect. Replays on the loop.',
    controls: [
      { kind: 'text', name: 'text', default: 'ACCESS GRANTED', description: 'the text to decode' },
      s('mode', ['sweep', 'together'], 'sweep'),
      s('duration', DURATIONS, 'base', 'duration'),
      s('stagger', ['tight', 'base', 'loose'], 'tight'),
    ],
    render: (v, { accent }) => (
      <p className="font-mono text-3xl font-medium tracking-tight" style={{ color: accent }}>
        <DecodeText
          text={v.text as string}
          trigger="mount"
          mode={v.mode as 'sweep' | 'together'}
          duration={v.duration as 'fast' | 'base' | 'slow' | 'cinematic'}
          stagger={v.stagger as 'tight' | 'base' | 'loose'}
        />
      </p>
    ),
    code: (v) => `<DecodeText\n  text="${v.text}"\n  mode="${v.mode}"\n  duration="${v.duration}"\n  stagger="${v.stagger}"\n/>`,
  },

  LineStagger: {
    modes: ['loop', 'scroll'],
    note: 'Cascades whole child blocks in as units — a faster, block-level reveal than word-by-word text.',
    controls: [
      s('stagger', ['tight', 'base', 'loose'], 'tight', 'stagger'),
      s('from', ['up', 'down', 'none'], 'up'),
      s('duration', DURATIONS, 'base', 'duration'),
    ],
    render: (v, { mode }) =>
      scrollable(mode, (trigger, once, root) => (
        <LineStagger
          trigger={trigger}
          once={once}
          root={root}
          className="flex flex-col gap-2 text-left text-lg font-medium tracking-tight"
          stagger={v.stagger as never}
          from={v.from as 'up' | 'down' | 'none'}
          duration={v.duration as never}
        >
          <div>Artist acquisition + business development.</div>
          <div>Built the internal systems that let the team scale.</div>
          <div>Wired tools together so data flows automatically.</div>
        </LineStagger>
      )),
    code: (v) =>
      `<LineStagger stagger="${v.stagger}" from="${v.from}" duration="${v.duration}">\n  <div>Line one</div>\n  <div>Line two</div>\n</LineStagger>`,
  },

  RedactionWipe: {
    modes: ['loop', 'scroll'],
    note: 'Censor bars slide off the children — a "declassify" reveal.',
    controls: [
      s('stagger', ['tight', 'base', 'loose'], 'base', 'stagger'),
      s('duration', DURATIONS, 'base', 'duration'),
      col('edgeColor', '#7dd3fc', 'leading-edge accent'),
    ],
    render: (v, { mode }) =>
      scrollable(mode, (trigger, once, root) => (
        <RedactionWipe
          trigger={trigger}
          once={once}
          root={root}
          className="flex flex-col gap-2 text-left text-lg font-medium tracking-tight"
          stagger={v.stagger as never}
          duration={v.duration as never}
          edgeColor={v.edgeColor as string}
        >
          <div>CLASSIFIED — operator dossier</div>
          <div>4+ years of ops &amp; automation</div>
          <div>Clearance granted on read</div>
        </RedactionWipe>
      )),
    code: (v) =>
      `<RedactionWipe stagger="${v.stagger}" duration="${v.duration}" edgeColor="${v.edgeColor}">\n  <div>Line one</div>\n  <div>Line two</div>\n</RedactionWipe>`,
  },

  ScanlineReveal: {
    modes: ['loop', 'scroll'],
    note: 'A scan line sweeps past while the children develop from dim to full — like a page resolving under a scanner.',
    controls: [
      s('duration', DURATIONS, 'slow', 'duration'),
      s('stagger', ['tight', 'base', 'loose'], 'loose', 'stagger'),
      { kind: 'boolean', name: 'glow', default: true },
    ],
    render: (v, { mode }) =>
      scrollable(mode, (trigger, once, root) => (
        <ScanlineReveal
          trigger={trigger}
          once={once}
          root={root}
          className="flex max-w-md flex-col gap-2 text-left text-base leading-relaxed"
          duration={v.duration as never}
          stagger={v.stagger as never}
          glow={v.glow as boolean}
        >
          <p>I find the manual, repetitive work inside a business</p>
          <p>and turn it into systems that run on their own —</p>
          <p>so a small team operates like a much larger one.</p>
        </ScanlineReveal>
      )),
    code: (v) =>
      `<ScanlineReveal duration="${v.duration}" stagger="${v.stagger}" glow={${v.glow}}>\n  <p>Paragraph one</p>\n  <p>Paragraph two</p>\n</ScanlineReveal>`,
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
    note: 'scrollLength = how many screen-heights the scene stays pinned for — higher means slower sideways travel. (Demoed inside this panel; on a real page it pins to the whole viewport.)',
    controls: [num('scrollLength', 1.5, 4, 2.5, 0.5, 'viewport-heights of scroll')],
    render: (v, { accent }) => <StickySceneDemo scrollLength={v.scrollLength as number} accent={accent} />,
    code: (v) => `<StickyScene scrollLength={${v.scrollLength}}>\n  {/* a wide row of panels */}\n</StickyScene>`,
  },

  ScrollStack: {
    modes: ['live'],
    note: 'scaleStep = how much each covered card shrinks; gap = how far each card pins below the last (the peek). Scroll the panel — cards pin and stack, then reverse on the way up.',
    controls: [num('scaleStep', 0, 0.12, 0.04, 0.01, 'shrink per card'), num('gap', 0, 48, 24, 4, 'stack peek px')],
    render: (v, { accent }) => <ScrollStackDemo scaleStep={v.scaleStep as number} gap={v.gap as number} accent={accent} />,
    code: (v) =>
      `<ScrollStack scaleStep={${v.scaleStep}} gap={${v.gap}}>\n  <Card>…</Card>\n  <Card>…</Card>\n  <Card>…</Card>\n</ScrollStack>`,
  },

  // ── Hover & cursor ────────────────────────────────────────────────────────────
  Magnetic: {
    modes: ['live'],
    note: 'strength = how far the element follows your cursor (fraction of the offset). padding = how large the catch zone is around it — the dashed area pulls too. Move your cursor near the button.',
    controls: [num('strength', 0, 1, 0.4, 0.05), num('padding', 0, 60, 24, 1, 'catch-zone px')],
    render: (v, { accent }) => (
      <Magnetic
        strength={v.strength as number}
        padding={v.padding as number}
        className="rounded-full border border-dashed border-[color:var(--color-line)]"
      >
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

  OutlineTrace: {
    modes: ['live'],
    note: 'Hover the button — an outline starts at one point and traces around its border, retracting on leave.',
    controls: [s('duration', DURATIONS, 'base', 'duration'), num('radius', 0, 999, 999, 1, 'corner px'), col('color', '#7dd3fc')],
    render: (v, { accent }) => (
      <OutlineTrace duration={v.duration as never} radius={v.radius as number} color={v.color as string} glow>
        <button type="button" className="rounded-full px-6 py-2.5 font-medium text-white" style={{ background: accent }}>
          hover me
        </button>
      </OutlineTrace>
    ),
    code: (v) =>
      `<OutlineTrace duration="${v.duration}" radius={${v.radius}} color="${v.color}" glow>\n  <button>hover me</button>\n</OutlineTrace>`,
  },

  // ── Background & ambient ──────────────────────────────────────────────────────
  AnimatedGradient: {
    modes: ['live'],
    note: 'Move your cursor / scroll the page over the demo when interaction is set to cursor or scroll.',
    controls: [s('interaction', INTERACTIONS, 'auto'), num('speed', 4, 30, 10, 1, 'sec/cycle (auto)'), num('blur', 20, 120, 60)],
    render: (v) => (
      <BgBox bg="#0e1118">
        <AnimatedGradient interaction={v.interaction as never} speed={v.speed as number} blur={v.blur as number} />
        <Centered>mesh gradient</Centered>
      </BgBox>
    ),
    code: (v) => `<div className="relative">\n  <AnimatedGradient interaction="${v.interaction}" speed={${v.speed}} blur={${v.blur}} />\n</div>`,
  },

  Aurora: {
    modes: ['live'],
    note: 'Northern-lights curtains. Try interaction = cursor (lean) or scroll (drift). Looks best on a dark surface.',
    controls: [s('interaction', INTERACTIONS, 'auto'), num('speed', 4, 20, 9, 1, 'sec/cycle (auto)'), num('blur', 16, 80, 40)],
    render: (v) => (
      <BgBox bg="#05060a">
        <Aurora interaction={v.interaction as never} speed={v.speed as number} blur={v.blur as number} />
        <Centered>aurora</Centered>
      </BgBox>
    ),
    code: (v) => `<div className="relative">\n  <Aurora interaction="${v.interaction}" speed={${v.speed}} blur={${v.blur}} />\n</div>`,
  },

  GrainOverlay: {
    modes: ['live'],
    controls: [num('opacity', 0, 0.6, 0.22, 0.01), col('color', '#000000'), s('blendMode', ['overlay', 'soft-light', 'multiply', 'normal'], 'overlay')],
    render: (v, { accent }) => (
      <BgBox bg={`linear-gradient(135deg, ${accent}, #0e1118)`}>
        <GrainOverlay opacity={v.opacity as number} color={v.color as string} blendMode={v.blendMode as never} />
        <Centered>film grain</Centered>
      </BgBox>
    ),
    code: (v) => `<div className="relative">\n  <GrainOverlay opacity={${v.opacity}} color="${v.color}" blendMode="${v.blendMode}" />\n</div>`,
  },

  DotGrid: {
    modes: ['live'],
    note: 'Move your cursor over the field — nearby points link to it.',
    controls: [
      s('variant', ['constellation', 'dots'], 'constellation'),
      col('color', '#9fb0d0'),
      num('gap', 16, 60, 34),
      num('dotSize', 1, 4, 1.6, 0.2),
      num('linkDistance', 60, 200, 120, 5, 'constellation'),
      num('influence', 60, 260, 160),
      num('warp', 0, 60, 24, 1, 'cursor warp (constellation)'),
      num('centerFade', 0, 0.8, 0, 0.05, 'clear the centre'),
    ],
    render: (v) => (
      <BgBox bg="#0b0f1a">
        <DotGrid
          variant={v.variant as never}
          color={v.color as string}
          gap={v.gap as number}
          dotSize={v.dotSize as number}
          linkDistance={v.linkDistance as number}
          influence={v.influence as number}
          warp={v.warp as number}
          centerFade={v.centerFade as number}
        />
        <Centered>hover the field</Centered>
      </BgBox>
    ),
    code: (v) =>
      `<div className="relative">\n  <DotGrid variant="${v.variant}" color="${v.color}" gap={${v.gap}} linkDistance={${v.linkDistance}} />\n</div>`,
  },

  BeamGrid: {
    modes: ['live'],
    controls: [num('cell', 24, 96, 48), num('speed', 2, 12, 6), col('beamColor', '#6e8bff')],
    render: (v) => (
      <BgBox bg="#0e1118">
        <BeamGrid cell={v.cell as number} speed={v.speed as number} beamColor={v.beamColor as string} />
        <Centered>beam grid</Centered>
      </BgBox>
    ),
    code: (v) => `<div className="relative">\n  <BeamGrid cell={${v.cell}} speed={${v.speed}} beamColor="${v.beamColor}" />\n</div>`,
  },

  // ── Data & numbers ────────────────────────────────────────────────────────────
  AnimatedNumber: {
    modes: ['loop', 'scroll'],
    note: 'easing = the count’s acceleration curve. standard eases in and out; entrance decelerates into the final number; emphasized over/undershoots. Watch how the number speeds up and settles.',
    controls: [num('value', 0, 10000, 1280, 10), s('duration', DURATIONS, 'cinematic', 'duration'), s('easing', EASINGS, 'standard', 'easing')],
    render: (v, { mode }) =>
      scrollable(mode, (trigger, once, root) => (
        <AnimatedNumber
          trigger={trigger}
          once={once}
          root={root}
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
      scrollable(mode, (trigger, once, root) => (
        <div className="w-full max-w-sm" style={{ color: accent }}>
          <StatBar trigger={trigger} once={once} root={root} value={v.value as number} duration={v.duration as never} label={v.label as string} thickness={v.thickness as number} />
        </div>
      )),
    code: (v) => `<StatBar value={${v.value}} duration="${v.duration}" label="${v.label}" thickness={${v.thickness}} />`,
  },
  SkillRadar: {
    modes: ['loop'],
    note: 'A stylized HUD radar — grid + axes draw on, the shape springs out from the center, a sweep line passes once. Replays on the loop.',
    controls: [num('rings', 2, 6, 4, 1, 'grid rings'), { kind: 'boolean', name: 'sweep', default: true }],
    render: (v, { accent }) => (
      <div style={{ color: accent }}>
        <SkillRadar
          trigger="mount"
          rings={v.rings as number}
          sweep={v.sweep as boolean}
          data={[
            { label: 'Systems', value: 92 },
            { label: 'Comms', value: 78 },
            { label: 'Automation', value: 88 },
            { label: 'Design', value: 70 },
            { label: 'Ops', value: 84 },
          ]}
        />
      </div>
    ),
    code: () =>
      `<SkillRadar\n  data={[\n    { label: 'Systems', value: 92 },\n    { label: 'Comms', value: 78 },\n    { label: 'Automation', value: 88 },\n    { label: 'Design', value: 70 },\n    { label: 'Ops', value: 84 },\n  ]}\n/>`,
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
  SpiralGallery: {
    modes: ['live'],
    note: 'Cards orbit a descending spiral and recycle; scroll the wheel over it to speed the orbit, hover to slow it and catch a card. Toggle to List for the scannable fallback.',
    controls: [num('turns', 1.5, 4, 2.4, 0.1, 'spiral turns'), num('baseSpeed', 0.01, 0.12, 0.04, 0.01, 'cycles/sec')],
    render: (v, { accent }) => (
      <div className="w-full" style={{ height: 440 }}>
        <SpiralGallery
          turns={v.turns as number}
          baseSpeed={v.baseSpeed as number}
          categoryColors={{ automation: accent, system: '#38e0c0' }}
          items={[
            { id: 'a', title: 'Invoice sync', blurb: 'Sheets ↔ CRM', category: 'automation', href: '#' },
            { id: 'b', title: 'Meeting OS', blurb: 'Coda system', category: 'system', featured: true, href: '#' },
            { id: 'c', title: 'Lead router', blurb: 'n8n flow', category: 'automation', href: '#' },
            { id: 'd', title: 'Digest bot', blurb: 'daily summary', category: 'automation', href: '#' },
            { id: 'e', title: 'Onboarding', blurb: 'internal portal', category: 'system', href: '#' },
            { id: 'f', title: 'Reminders', blurb: 'Make scenario', category: 'automation', href: '#' },
          ]}
        />
      </div>
    ),
    code: () =>
      `<SpiralGallery\n  categoryColors={{ automation: '#6e8bff', system: '#38e0c0' }}\n  items={[\n    { id: 'a', title: 'Invoice sync', category: 'automation', href: '/...' },\n    { id: 'b', title: 'Meeting OS', category: 'system', featured: true },\n  ]}\n/>`,
  },

  // ── Navigation ────────────────────────────────────────────────────────────────
  SmoothScroll: {
    modes: ['live'],
    controls: [num('offset', 0, 120, 16, 4, 'px above target')],
    note: 'Click a section link — instead of jumping, the panel eases to it. (Demoed in this panel; on a real page it scrolls the window.)',
    render: (v, { accent }) => <SmoothScrollDemo offset={v.offset as number} accent={accent} />,
    code: (v) => `<SmoothScroll offset={${v.offset}}>\n  <a href="#section">Jump</a>\n</SmoothScroll>`,
  },

  // ── Overlay ───────────────────────────────────────────────────────────────────
  Lightbox: {
    modes: ['live'],
    note: 'Click the card — it opens into a fullscreen panel and reverses on close (✕, Esc, backdrop, or browser Back). Try both transitions.',
    controls: [s('transition', ['zoom', 'expand'], 'zoom')],
    render: (v, { accent }) => (
      <Lightbox
        transition={v.transition as 'zoom' | 'expand'}
        label="Demo project"
        surface="#0b0f1a"
        trigger={
          <div className="flex h-32 w-56 flex-col justify-end rounded-xl p-4 text-left text-white" style={{ background: accent }}>
            <div className="text-lg font-semibold">Open me</div>
            <div className="font-mono text-[11px] opacity-80">{v.transition} →</div>
          </div>
        }
      >
        <div className="mx-auto max-w-2xl px-6 py-20 text-white">
          <div className="font-mono text-[11px] uppercase tracking-widest" style={{ color: accent }}>
            overlay
          </div>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Fullscreen panel</h2>
          <p className="mt-3 text-white/70">
            Any content goes here. The panel opened with a <span className="font-mono">{v.transition}</span> transition
            and will reverse on close.
          </p>
        </div>
      </Lightbox>
    ),
    code: (v) =>
      `<Lightbox\n  transition="${v.transition}"\n  trigger={<Card />}\n>\n  <YourPanelContent />\n</Lightbox>`,
  },
  SceneLightbox: {
    modes: ['live'],
    note: 'Click a node — the whole scene moves: flythrough flies the camera in, collapse spins the orbit shut then blooms the node out, expand just grows it. Each reverses on close (✕, Esc, backdrop, Back).',
    controls: [s('transition', ['flythrough', 'collapse', 'expand'], 'flythrough')],
    render: (v, { accent }) => <SceneLightboxDemo transition={v.transition as 'flythrough' | 'collapse' | 'expand'} accent={accent} />,
    code: (v) =>
      `<SceneLightbox\n  open={open}\n  onClose={() => setOpen(false)}\n  originRect={rect}\n  transition="${v.transition}"\n  far={<Backdrop />}\n  near={<Orbit onOpen={(id, r) => …} />}\n  panel={<PanelContent />}\n/>`,
  },

  // ── Orchestration ─────────────────────────────────────────────────────────────
  Stagger: {
    modes: ['loop', 'scroll'],
    controls: [s('stagger', ['tight', 'base', 'loose'], 'base', 'stagger'), s('from', DIRECTIONS, 'up'), s('distance', DISTANCES, 'base', 'distance')],
    render: (v, { mode }) =>
      scrollable(mode, (trigger, once, root) => (
        <Stagger trigger={trigger} once={once} root={root} className="flex flex-wrap justify-center gap-2" stagger={v.stagger as never} from={v.from as never} distance={v.distance as never}>
          {SKILLS.slice(0, 5).map((x) => (
            <Pill key={x}>{x}</Pill>
          ))}
        </Stagger>
      )),
    code: (v) => `<Stagger stagger="${v.stagger}" from="${v.from}" distance="${v.distance}">\n  {children}\n</Stagger>`,
  },

  MotionProvider: {
    modes: ['loop'],
    note: 'Wrap your app once — it feeds the active preset’s tokens to every component via context + CSS vars. Flip the preset in the sidebar and watch all three below re-feel at once (that’s the whole idea).',
    controls: [],
    render: (_v, { accent }) => (
      <div className="flex flex-col items-center gap-5">
        <Reveal trigger="mount" variant="slide" duration="slow">
          <div className="rounded-lg px-5 py-3 font-medium text-white" style={{ background: accent }}>
            One provider · one preset
          </div>
        </Reveal>
        <Stagger trigger="mount" className="flex gap-2">
          {SKILLS.slice(0, 4).map((x) => (
            <Pill key={x}>{x}</Pill>
          ))}
        </Stagger>
        <AnimatedNumber trigger="mount" value={98} duration="cinematic" className="text-4xl font-semibold" />
      </div>
    ),
    code: () => `<MotionProvider preset="calm">\n  <App />\n</MotionProvider>`,
  },

  // ── Signatures ────────────────────────────────────────────────────────────────
  HeroTitle: {
    modes: ['loop'],
    note: 'A signature: an opinionated composition of primitives (TextReveal + Reveal). The seed of the variant system’s signatures layer — designed signatures land with the look library.',
    controls: [
      { kind: 'text', name: 'title', default: 'Design that moves.' },
      { kind: 'text', name: 'subtitle', default: 'A signature composition of primitives.' },
    ],
    render: (v) => (
      <HeroTitle title={v.title as string} subtitle={v.subtitle as string} className="text-center" />
    ),
    code: (v) => `<HeroTitle title="${v.title}" subtitle="${v.subtitle}" />`,
  },
};
