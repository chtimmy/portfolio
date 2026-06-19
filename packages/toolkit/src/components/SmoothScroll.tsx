'use client';

import type { MouseEvent, ReactNode, RefObject } from 'react';
import { useReducedMotion } from '../provider';

export interface SmoothScrollProps {
  children: ReactNode;
  /** Pixels to leave above the target (e.g. for a fixed header). Default `0`. */
  offset?: number;
  /**
   * Scroll within this element instead of the window (anchors must point to ids inside it). Lets the
   * eased scrolling work inside a panel.
   */
  container?: RefObject<HTMLElement | null>;
  className?: string;
}

/**
 * Wraps a region and eases scrolling to in-page anchors (`<a href="#section">`) inside it, instead
 * of the browser's instant jump. Respects reduced motion by jumping immediately, and updates the
 * URL hash so links stay shareable and the back button works.
 */
export function SmoothScroll({ children, offset = 0, container, className }: SmoothScrollProps) {
  const reduced = useReducedMotion();

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const link = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
    if (!link) return;
    const id = link.getAttribute('href')!.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    const behavior = reduced ? 'auto' : 'smooth';
    const root = container?.current;
    if (root) {
      // position of the target relative to the container's current scroll
      const top = target.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - offset;
      root.scrollTo({ top, behavior });
    } else {
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior });
      history.pushState(null, '', `#${id}`);
    }
  };

  return (
    <div className={className} onClick={onClick}>
      {children}
    </div>
  );
}
