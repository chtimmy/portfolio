import { useEffect, useState } from 'react';

/**
 * False on the server and the first client render; true after mount. Gate SSR-unsafe output —
 * styles derived from measurement (element size), time (rAF/`Date.now()`), or `Math.random()` — on
 * this so the server and first client render produce an identical tree and hydration matches.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
