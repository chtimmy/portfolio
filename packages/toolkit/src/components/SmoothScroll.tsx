'use client';

import type { MouseEvent, ReactNode } from 'react';
import { useReducedMotion } from '../provider';

export interface SmoothScrollProps {
  children: ReactNode;
  /** Pixels to leave above the target (e.g. for a fixed header). Default `0`. */
  offset?: number;
  className?: string;
}

/**
 * Wraps a region and eases scrolling to in-page anchors (`<a href="#section">`) inside it, instead
 * of the browser's instant jump. Respects reduced motion by jumping immediately, and updates the
 * URL hash so links stay shareable and the back button works.
 */
export function SmoothScroll({ children, offset = 0, className }: SmoothScrollProps) {
  const reduced = useReducedMotion();

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const link = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
    if (!link) return;
    const id = link.getAttribute('href')!.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    history.pushState(null, '', `#${id}`);
  };

  return (
    <div className={className} onClick={onClick}>
      {children}
    </div>
  );
}
