'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useReducedMotion } from '../provider';

export interface MarqueeProps {
  children: ReactNode;
  /** Scroll speed in pixels per second. Default `60`. */
  speed?: number;
  /** Scroll direction. Default `'left'`. */
  direction?: 'left' | 'right';
  /** Gap between items, in pixels. Default `32`. */
  gap?: number;
  /** Pause while the pointer is over the strip. Default `true`. */
  pauseOnHover?: boolean;
  className?: string;
}

/**
 * Infinite horizontal strip. Renders two identical groups and translates by one group width via a
 * CSS keyframe, so the loop is seamless; duration is derived from measured width to keep `speed`
 * constant regardless of content. Under reduced motion the strip is static (no animation).
 */
export function Marquee({
  children,
  speed = 60,
  direction = 'left',
  gap = 32,
  pauseOnHover = true,
  className,
}: MarqueeProps) {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const groupWidth = track.scrollWidth / 2; // two identical groups
      setDuration(groupWidth / speed);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, [speed, gap]);

  const animate = !reduced && duration > 0;
  const groupStyle: CSSProperties = { display: 'flex', flexShrink: 0, gap, marginRight: gap };

  return (
    <div className={className} style={{ overflow: 'hidden', maxWidth: '100%' }}>
      <div
        ref={trackRef}
        className="umbra-marquee-track"
        data-animate={animate ? '' : undefined}
        data-pause-on-hover={pauseOnHover ? '' : undefined}
        style={
          {
            display: 'flex',
            width: 'max-content',
            '--umbra-marquee-duration': `${duration}s`,
            '--umbra-marquee-direction': direction === 'left' ? 'normal' : 'reverse',
          } as CSSProperties
        }
      >
        <div style={groupStyle}>{children}</div>
        <div style={groupStyle} aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
