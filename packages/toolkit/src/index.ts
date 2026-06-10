// Public surface of @umbra/motion.

// Provider + hooks
export {
  MotionProvider,
  useMotionTokens,
  usePreset,
  useReducedMotion,
} from './provider';
export type { MotionProviderProps } from './provider';
export { useReveal, resolveReveal } from './hooks/use-reveal';
export type {
  RevealOptions,
  RevealAnimation,
  RevealVariant,
  RevealFrom,
} from './hooks/use-reveal';

// Components — Entrance & reveal
export { Reveal } from './components/Reveal';
export type { RevealProps } from './components/Reveal';
export { ImageReveal } from './components/ImageReveal';
export type { ImageRevealProps } from './components/ImageReveal';

// Components — Text
export { TextReveal } from './components/TextReveal';
export type { TextRevealProps } from './components/TextReveal';
export { RotatingText } from './components/RotatingText';
export type { RotatingTextProps } from './components/RotatingText';

// Components — Scroll-driven
export { Parallax } from './components/Parallax';
export type { ParallaxProps } from './components/Parallax';
export { ScrollProgress } from './components/ScrollProgress';
export type { ScrollProgressProps } from './components/ScrollProgress';
export { StickyScene } from './components/StickyScene';
export type { StickySceneProps } from './components/StickyScene';

// Components — Hover & cursor
export { TiltCard } from './components/TiltCard';
export type { TiltCardProps } from './components/TiltCard';
export { Magnetic } from './components/Magnetic';
export type { MagneticProps } from './components/Magnetic';

// Components — Background & ambient
export { AnimatedGradient } from './components/AnimatedGradient';
export type { AnimatedGradientProps } from './components/AnimatedGradient';
export { GrainOverlay } from './components/GrainOverlay';
export type { GrainOverlayProps } from './components/GrainOverlay';
export { DotGrid } from './components/DotGrid';
export type { DotGridProps } from './components/DotGrid';
export { BeamGrid } from './components/BeamGrid';
export type { BeamGridProps } from './components/BeamGrid';

// Components — Data & numbers
export { AnimatedNumber } from './components/AnimatedNumber';
export type { AnimatedNumberProps } from './components/AnimatedNumber';
export { StatBar } from './components/StatBar';
export type { StatBarProps } from './components/StatBar';

// Components — Continuous & layout
export { Marquee } from './components/Marquee';
export type { MarqueeProps } from './components/Marquee';
export { Accordion } from './components/Accordion';
export type { AccordionProps, AccordionItemData } from './components/Accordion';

// Components — Navigation
export { SmoothScroll } from './components/SmoothScroll';
export type { SmoothScrollProps } from './components/SmoothScroll';

// Orchestration
export { Stagger } from './components/Stagger';
export type { StaggerProps } from './components/Stagger';

// Catalog (category metadata)
export { catalog } from './catalog';
export type { Category, CategoryId, CatalogComponent } from './catalog';

// Utilities
export { splitText } from './utils/split-text';
export type { SplitBy } from './utils/split-text';
export { clamp } from './utils/clamp';

// Token system
export {
  presets,
  presetNames,
  defaultPresetName,
  defaultTokens,
  resolveTokens,
} from './tokens/presets';
export { motionVars } from './tokens/css-vars';
export type * from './tokens/tokens.schema';
