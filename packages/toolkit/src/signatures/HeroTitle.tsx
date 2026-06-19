'use client';

import type { CSSProperties, ReactNode } from 'react';
import { TextReveal } from '../components/TextReveal';
import { Reveal } from '../components/Reveal';

export interface HeroTitleProps {
  /** The headline — revealed word by word. */
  title: string;
  /** Optional supporting line, fading in after the title. */
  subtitle?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

/**
 * A worked **signature** — an opinionated composition of primitives, the pattern personal signature
 * components follow (bundling primitives + layout +, later, styling into one hero-ready piece).
 * This is the seed of the signatures layer; the real, designed signatures land with the look library.
 */
export function HeroTitle({ title, subtitle, style, className }: HeroTitleProps) {
  return (
    <div className={className} style={style}>
      <TextReveal
        as="h1"
        by="word"
        trigger="mount"
        duration="slow"
        className="text-4xl font-semibold tracking-tight md:text-6xl"
        text={title}
      />
      {subtitle && (
        <Reveal trigger="mount" variant="fade" duration="cinematic" delay={0.3}>
          <p className="mt-4 text-lg opacity-70">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}
