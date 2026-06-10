// Public surface of @umbra/motion.

// Provider + hooks
export {
  MotionProvider,
  useMotionTokens,
  usePreset,
  useReducedMotion,
} from './provider';
export type { MotionProviderProps } from './provider';
export { useEntrance, resolveEntrance } from './hooks/use-entrance';
export type { EntranceOptions, EntranceAnimation } from './hooks/use-entrance';

// Components
export { Fade } from './components/Fade';
export type { FadeProps } from './components/Fade';

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
