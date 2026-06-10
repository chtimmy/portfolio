'use client';

import { createContext, useContext, useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useReducedMotion as useSystemReducedMotion } from 'motion/react';
import type { MotionTokens, PresetName } from './tokens/tokens.schema';
import { defaultPresetName, defaultTokens, resolveTokens } from './tokens/presets';
import { motionVars } from './tokens/css-vars';

interface MotionContextValue {
  preset: PresetName;
  tokens: MotionTokens;
  /** True when motion should be minimized — components collapse transforms to opacity-only fades. */
  reducedMotion: boolean;
}

const MotionContext = createContext<MotionContextValue>({
  preset: defaultPresetName,
  tokens: defaultTokens,
  reducedMotion: false,
});

export interface MotionProviderProps {
  children: ReactNode;
  /** Active personality. Defaults to `calm`. */
  preset?: PresetName;
  /**
   * Force reduced motion on/off. Omit to follow the user's OS `prefers-reduced-motion` setting
   * (the right default); set explicitly to demo or test the reduced experience.
   */
  reducedMotion?: boolean;
  /** Render a wrapping element carrying the token CSS variables. Default `'div'`; `false` to skip. */
  as?: 'div' | 'section' | false;
  className?: string;
  style?: CSSProperties;
}

/**
 * Injects the active motion preset into the React tree (via context) and exposes its tokens as CSS
 * variables on a wrapping element, so both Motion components and plain CSS can read the same
 * animation language. Switching `preset` re-feels every descendant with zero component changes.
 */
export function MotionProvider({
  children,
  preset = defaultPresetName,
  reducedMotion,
  as = 'div',
  className,
  style,
}: MotionProviderProps) {
  const systemReduced = useSystemReducedMotion();
  const resolvedReduced = reducedMotion ?? systemReduced ?? false;
  const tokens = resolveTokens(preset);

  const value = useMemo<MotionContextValue>(
    () => ({ preset, tokens, reducedMotion: resolvedReduced }),
    [preset, tokens, resolvedReduced],
  );

  const content = <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;

  if (as === false) return content;

  const Tag = as;
  return (
    <Tag
      className={className}
      data-umbra-preset={preset}
      data-umbra-reduced={resolvedReduced ? '' : undefined}
      style={{ ...motionVars(tokens), ...style }}
    >
      {content}
    </Tag>
  );
}

/** The fully-resolved token set for the active preset. */
export function useMotionTokens(): MotionTokens {
  return useContext(MotionContext).tokens;
}

/** The active preset name. */
export function usePreset(): PresetName {
  return useContext(MotionContext).preset;
}

/**
 * Whether motion should be minimized. Reflects the `MotionProvider` override if set, otherwise the
 * OS `prefers-reduced-motion` setting. Every component reads this one source.
 */
export function useReducedMotion(): boolean {
  return useContext(MotionContext).reducedMotion;
}
