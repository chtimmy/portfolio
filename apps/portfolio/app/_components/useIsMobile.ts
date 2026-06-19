'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks whether the viewport is at/below a mobile width (default `< 640px`, Tailwind's `sm`
 * breakpoint). SSR-safe: returns `false` on the server and the first client render, then settles to
 * the real value on mount — so the markup matches during hydration and only re-renders once.
 *
 * Used for the few mobile branches that CSS can't express alone: the orbit's JS-computed geometry,
 * the systems reorder, and the case-study layout swap.
 */
export function useIsMobile(maxWidth = 639): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [maxWidth]);
  return isMobile;
}
