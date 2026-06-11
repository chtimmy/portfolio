'use client';

import { Fragment, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Replays its child continuously by remounting it on an interval (and immediately whenever `deps`
 * changes). Lets one-shot entrance demos loop so timing/easing/token differences are visible.
 */
export function LoopDemo({
  children,
  deps = '',
  interval = 2500,
}: {
  children: ReactNode;
  deps?: string;
  interval?: number;
}) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), interval);
    return () => clearInterval(id);
  }, [interval]);

  return <Fragment key={`${deps}-${tick}`}>{children}</Fragment>;
}
