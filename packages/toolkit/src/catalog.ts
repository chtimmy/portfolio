/**
 * The component catalog, organized by category — the anatomy of a website (things appear → text
 * speaks → scroll moves → pointer plays → background breathes → stats land → things loop → states
 * transition). This metadata drives the playground's grouped gallery and will feed the Phase 3
 * registry/docs. It is the single source of truth for "what exists and what each thing is for."
 */

export type CategoryId =
  | 'entrance'
  | 'text'
  | 'scroll'
  | 'pointer'
  | 'background'
  | 'data'
  | 'continuous'
  | 'navigation'
  | 'overlay'
  | 'orchestration'
  | 'signatures';

export interface CatalogComponent {
  /** Exported component name. */
  name: string;
  /** One-line description of what it does / when to use it. */
  summary: string;
  /** Named looks (variant system) available on this component, if any. */
  looks?: string[];
}

export interface Category {
  id: CategoryId;
  /** Display title. */
  title: string;
  /** What the category is for — the role it plays on a page. */
  tagline: string;
  components: CatalogComponent[];
}

export const catalog: Category[] = [
  {
    id: 'entrance',
    title: 'Entrance & reveal',
    tagline: 'How elements appear.',
    components: [
      { name: 'Reveal', summary: 'Scroll- or mount-triggered fade / slide / scale entrance.', looks: ['editorial'] },
      { name: 'ImageReveal', summary: 'Clip-path wipe for images and media.' },
    ],
  },
  {
    id: 'text',
    title: 'Text',
    tagline: 'How words speak.',
    components: [
      { name: 'TextReveal', summary: 'Split by character / word / line, staggered in.' },
      { name: 'RotatingText', summary: 'Cycles a word in a sentence in place.' },
      { name: 'DecodeText', summary: 'Resolves text out of flickering glyphs — a decrypt effect.' },
      { name: 'LineStagger', summary: 'Cascades child blocks/lines in as whole units — a fast block reveal.' },
      { name: 'RedactionWipe', summary: 'Censor bars wipe off the children — a declassify reveal.' },
      { name: 'ScanlineReveal', summary: 'A scan line sweeps past; children develop dim → full behind it.' },
    ],
  },
  {
    id: 'scroll',
    title: 'Scroll-driven',
    tagline: 'Animation tied to scroll position.',
    components: [
      { name: 'Parallax', summary: 'Layers move at different speeds for depth.' },
      { name: 'ScrollProgress', summary: 'Reading-progress bar pinned to the viewport edge.' },
      { name: 'StickyScene', summary: 'Pins a scene and scrolls its content sideways.' },
      { name: 'ScrollStack', summary: 'Sticky stacking cards — each pins as the next overlaps and scales it down.' },
    ],
  },
  {
    id: 'pointer',
    title: 'Hover & cursor',
    tagline: 'How the site responds to the pointer.',
    components: [
      { name: 'Magnetic', summary: 'Element is pulled toward the cursor.' },
      { name: 'TiltCard', summary: 'Pointer-tracked 3D tilt.' },
      { name: 'OutlineTrace', summary: 'Draws an outline tracing the element’s border on hover.' },
    ],
  },
  {
    id: 'background',
    title: 'Background & ambient',
    tagline: 'How the page breathes.',
    components: [
      { name: 'AnimatedGradient', summary: 'Drifting mesh gradient; can follow cursor or scroll.' },
      { name: 'Aurora', summary: 'Northern-lights light curtains that sway and shimmer.' },
      { name: 'GrainOverlay', summary: 'Subtle filmic noise texture.' },
      { name: 'DotGrid', summary: 'Constellation / dot field that links near the cursor.' },
      { name: 'BeamGrid', summary: 'Faint grid with light beams tracing across it.' },
    ],
  },
  {
    id: 'data',
    title: 'Data & numbers',
    tagline: 'How stats land.',
    components: [
      { name: 'AnimatedNumber', summary: 'Counts up to a value on view.' },
      { name: 'StatBar', summary: 'Animated progress / percentage bar.' },
      { name: 'SkillRadar', summary: 'Stylized polygon radar that draws on and springs out.' },
    ],
  },
  {
    id: 'continuous',
    title: 'Continuous & layout',
    tagline: 'Elements that move on their own or reflow.',
    components: [
      { name: 'Marquee', summary: 'Infinite scrolling strip (logos, tech-stack lists).' },
      { name: 'Accordion', summary: 'Spring-physics expand / collapse.' },
      { name: 'SpiralGallery', summary: 'Cards orbit a spiral index; wheel-driven, with a list fallback.' },
    ],
  },
  {
    id: 'navigation',
    title: 'Navigation',
    tagline: 'Moving between states and places.',
    components: [
      { name: 'SmoothScroll', summary: 'Eased in-page anchor scrolling.' },
    ],
  },
  {
    id: 'overlay',
    title: 'Overlay',
    tagline: 'Opening focused views over the page.',
    components: [
      { name: 'Lightbox', summary: 'Opens a card into a fullscreen panel (expand or zoom).' },
      {
        name: 'SceneLightbox',
        summary: 'Opens a node into a fullscreen panel while the scene flies in or collapses behind it.',
      },
    ],
  },
  {
    id: 'orchestration',
    title: 'Orchestration',
    tagline: 'Toolkit core that powers the rest.',
    components: [
      { name: 'Stagger', summary: 'Cascades any children into view.' },
      { name: 'MotionProvider', summary: 'Injects the active preset (context + CSS vars).' },
    ],
  },
  {
    id: 'signatures',
    title: 'Signatures',
    tagline: 'Opinionated compositions — the personal design layer (in progress).',
    components: [
      { name: 'HeroTitle', summary: 'Composed hero entrance (TextReveal + Reveal). Seed of the signatures layer.' },
    ],
  },
];
