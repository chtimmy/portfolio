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

// Components — Batch 1 (workhorses)
export { Reveal } from './components/Reveal';
export type { RevealProps } from './components/Reveal';
export { TextReveal } from './components/TextReveal';
export type { TextRevealProps } from './components/TextReveal';
export { Stagger } from './components/Stagger';
export type { StaggerProps } from './components/Stagger';
export { AnimatedNumber } from './components/AnimatedNumber';
export type { AnimatedNumberProps } from './components/AnimatedNumber';

// Components — Batch 2 (showpieces)
export { Marquee } from './components/Marquee';
export type { MarqueeProps } from './components/Marquee';
export { Parallax } from './components/Parallax';
export type { ParallaxProps } from './components/Parallax';
export { ImageReveal } from './components/ImageReveal';
export type { ImageRevealProps } from './components/ImageReveal';
export { TiltCard } from './components/TiltCard';
export type { TiltCardProps } from './components/TiltCard';
export { Magnetic } from './components/Magnetic';
export type { MagneticProps } from './components/Magnetic';

// Utilities
export { splitText } from './utils/split-text';
export type { SplitBy } from './utils/split-text';

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
