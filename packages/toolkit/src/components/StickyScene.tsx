'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import type { ReactNode } from 'react';
import { useReducedMotion } from '../provider';

export interface StickySceneProps {
  /** The wide horizontal content that scrolls across as the section is pinned. */
  children: ReactNode;
  /**
   * How much vertical scroll the pinned scene consumes, in viewport heights. Higher = slower
   * horizontal travel. Default `2.5`.
   */
  scrollLength?: number;
  className?: string;
}

/**
 * Pins a full-height scene while the page scrolls past it, translating its content sideways — the
 * "Apple-style" horizontal scroll. Under reduced motion it degrades to a normal, natively
 * scrollable row (no pinning, no scroll-linked transform).
 */
export function StickyScene({ children, scrollLength = 2.5, className }: StickySceneProps) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxX, setMaxX] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -maxX]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setMaxX(Math.max(0, track.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  if (reduced) {
    return (
      <div className={className} style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', width: 'max-content' }}>{children}</div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className={className} style={{ height: `${scrollLength * 100}vh`, position: 'relative' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
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
