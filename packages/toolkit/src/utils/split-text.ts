export type SplitBy = 'character' | 'word' | 'line';

/**
 * Split text into animatable units. Pure and side-effect-free so it's unit-testable.
 *
 * - `word` and `line` drop the separating whitespace/newline (the renderer re-adds spacing);
 * - `character` preserves spaces as their own units so the original spacing survives.
 */
export function splitText(text: string, by: SplitBy): string[] {
  switch (by) {
    case 'character':
      return Array.from(text);
    case 'word':
      return text.split(/\s+/).filter((w) => w.length > 0);
    case 'line':
      return text.split('\n').filter((l) => l.length > 0);
  }
}
