'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import type { ReactNode, RefObject } from 'react';
import { useReducedMotion } from '../provider';

export interface StickySceneProps {
  /** The wide horizontal content that scrolls across as the section is pinned. */
  children: ReactNode;
  /**
   * How much vertical scroll the pinned scene consumes, in viewport heights (or container-heights
   * when `root` is set). Higher = slower horizontal travel. Default `2.5`.
   */
  scrollLength?: number;
  /**
   * Pin within a scrolling container instead of the window (e.g. a demo panel). When set, sizing is
   * measured from the container rather than the viewport.
   */
  root?: RefObject<HTMLElement | null>;
  className?: string;
}

/**
 * Pins a full-height scene while the page scrolls past it, translating its content sideways — the
 * "Apple-style" horizontal scroll. Under reduced motion it degrades to a normal, natively
 * scrollable row (no pinning, no scroll-linked transform).
 */
export function StickyScene({ children, scrollLength = 2.5, root, className }: StickySceneProps) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxX, setMaxX] = useState(0);
  // Height of the pinning viewport: the window, or the scroll container when `root` is set.
  const [viewportH, setViewportH] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    ...(root ? { container: root } : {}),
    offset: ['start start', 'end end'],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -maxX]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const container = root?.current ?? null;
    const measure = () => {
      const vw = container ? container.clientWidth : window.innerWidth;
      const vh = container ? container.clientHeight : window.innerHeight;
      setMaxX(Math.max(0, track.scrollWidth - vw));
      setViewportH(vh);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    if (container) ro.observe(container);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [root]);

  if (reduced) {
    return (
      <div className={className} style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', width: 'max-content' }}>{children}</div>
      </div>
    );
  }

  // In the window, fall back to CSS vh units; in a container, use the measured pixel height.
  const sectionHeight = root ? viewportH * scrollLength : undefined;
  const pinHeight = root ? viewportH : undefined;

  return (
    <div
      ref={sectionRef}
      className={className}
      style={{ height: sectionHeight ?? `${scrollLength * 100}vh`, position: 'relative' }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: pinHeight ?? '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <motion.div ref={trackRef} style={{ x, display: 'flex', width: 'max-content' }}>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
