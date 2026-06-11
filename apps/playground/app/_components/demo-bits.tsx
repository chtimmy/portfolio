'use client';

import { useRef } from 'react';
import type { ReactNode, RefObject } from 'react';

export const SKILLS = ['Motion', 'React', 'TypeScript', 'Tailwind', 'Next.js', 'Design Systems', 'Vite'];

/** A static gradient stand-in for image demos (no external asset). */
export const DEMO_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='260'>
       <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
         <stop offset='0' stop-color='#20283b'/><stop offset='1' stop-color='#5b6b8c'/>
       </linearGradient></defs>
       <rect width='480' height='260' fill='url(#g)'/>
       <text x='28' y='232' fill='#ffffff' opacity='0.85' font-family='monospace' font-size='20'>umbra / image</text>
     </svg>`,
  );

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[color:var(--color-line)] bg-white px-3 py-1 text-sm">
      {children}
    </span>
  );
}

export function BgBox({ children, bg, height = 'h-56' }: { children: ReactNode; bg: string; height?: string }) {
  return (
    <div className={`relative ${height} w-full overflow-hidden rounded-lg`} style={{ background: bg }}>
      {children}
    </div>
  );
}

export function Centered({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center font-mono text-sm"
      style={{ color: dark ? 'rgba(20,22,27,0.5)' : 'rgba(255,255,255,0.85)' }}
    >
      {children}
    </div>
  );
}

/**
 * A scrollable box for demoing scroll-driven components. Hands its scroll element back via the
 * `children` (and optional `pinned`) render props so components can receive it as their
 * `root`/`container`. Tall spacers create scroll room; a sticky hint shows there's something to do.
 */
export function ScrollBox({
  children,
  pinned,
}: {
  children: (ref: RefObject<HTMLDivElement | null>) => ReactNode;
  pinned?: (ref: RefObject<HTMLDivElement | null>) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="relative w-full">
      {pinned?.(ref)}
      <div
        ref={ref}
        className="relative h-80 w-full overflow-y-auto rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-canvas)]"
      >
        <div className="pointer-events-none sticky top-2 z-10 text-center font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
          ↓ scroll ↓
        </div>
        <div style={{ height: '78%' }} />
        <div className="flex justify-center px-6 py-8">{children(ref)}</div>
        <div style={{ height: '72%' }} />
      </div>
    </div>
  );
}
