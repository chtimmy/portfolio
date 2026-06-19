// Public surface of @umbra/motion.

// Provider + hooks
export { MotionProvider, useMotionTokens, usePreset, useReducedMotion } from './provider';
export type { MotionProviderProps } from './provider';
export { useMounted } from './hooks/use-mounted';
export { useReveal, resolveReveal } from './hooks/use-reveal';
export type { RevealOptions, RevealAnimation, RevealVariant, RevealFrom } from './hooks/use-reveal';

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
export { DecodeText } from './components/DecodeText';
export type { DecodeTextProps } from './components/DecodeText';
export { LineStagger } from './components/LineStagger';
export type { LineStaggerProps } from './components/LineStagger';
export { RedactionWipe } from './components/RedactionWipe';
export type { RedactionWipeProps } from './components/RedactionWipe';
export { ScanlineReveal } from './components/ScanlineReveal';
export type { ScanlineRevealProps } from './components/ScanlineReveal';

// Components — Scroll-driven
export { Parallax } from './components/Parallax';
export type { ParallaxProps } from './components/Parallax';
export { ScrollProgress } from './components/ScrollProgress';
export type { ScrollProgressProps } from './components/ScrollProgress';
export { StickyScene } from './components/StickyScene';
export type { StickySceneProps } from './components/StickyScene';
export { ScrollStack } from './components/ScrollStack';
export type { ScrollStackProps } from './components/ScrollStack';

// Components — Hover & cursor
export { TiltCard } from './components/TiltCard';
export type { TiltCardProps } from './components/TiltCard';
export { Magnetic } from './components/Magnetic';
export type { MagneticProps } from './components/Magnetic';
export { OutlineTrace } from './components/OutlineTrace';
export type { OutlineTraceProps } from './components/OutlineTrace';

// Components — Background & ambient
export { AnimatedGradient } from './components/AnimatedGradient';
export type { AnimatedGradientProps, GradientInteraction } from './components/AnimatedGradient';
export { Aurora } from './components/Aurora';
export type { AuroraProps, AuroraInteraction } from './components/Aurora';
export { GrainOverlay } from './components/GrainOverlay';
export type { GrainOverlayProps } from './components/GrainOverlay';
export { DotGrid } from './components/DotGrid';
export type { DotGridProps, DotGridVariant } from './components/DotGrid';
export { BeamGrid } from './components/BeamGrid';
export type { BeamGridProps } from './components/BeamGrid';

// Components — Data & numbers
export { AnimatedNumber } from './components/AnimatedNumber';
export type { AnimatedNumberProps } from './components/AnimatedNumber';
export { StatBar } from './components/StatBar';
export type { StatBarProps } from './components/StatBar';
export { SkillRadar } from './components/SkillRadar';
export type { SkillRadarProps, RadarAxis } from './components/SkillRadar';

// Components — Continuous & layout
export { Marquee } from './components/Marquee';
export type { MarqueeProps } from './components/Marquee';
export { Accordion } from './components/Accordion';
export type { AccordionProps, AccordionItemData } from './components/Accordion';
export { SpiralGallery } from './components/SpiralGallery';
export type { SpiralGalleryProps, SpiralItem } from './components/SpiralGallery';

// Components — Navigation
export { SmoothScroll } from './components/SmoothScroll';
export type { SmoothScrollProps } from './components/SmoothScroll';

// Components — Overlay
export { Lightbox } from './components/Lightbox';
export type { LightboxProps, LightboxTransition } from './components/Lightbox';
export {
  SceneLightbox,
  useSceneTransition,
  useScenePanelRef,
  SCENE_COLLAPSE_PHASES,
} from './components/SceneLightbox';
export type {
  SceneLightboxProps,
  SceneTransition,
  ScenePhase,
  SceneState,
  SceneTransitionContextValue,
} from './components/SceneLightbox';

// Orchestration
export { Stagger } from './components/Stagger';
export type { StaggerProps } from './components/Stagger';

// Variant system — looks + signatures
export { applyLook } from './looks/looks.schema';
export type { Look, LookTable, ResolvedLook } from './looks/looks.schema';
export { revealLooks } from './components/Reveal.looks';
export type { RevealLook, RevealMotion } from './components/Reveal.looks';
export { HeroTitle } from './signatures';
export type { HeroTitleProps } from './signatures';

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
