'use client';

import { useRef } from 'react';
import { motion, useScroll } from 'motion/react';
import {
  AnimatedNumber,
  MotionProvider,
  Reveal,
  ScrollStack,
  TextReveal,
  usePreset,
  useReducedMotion,
  useScenePanelRef,
} from '@umbra/motion';
import { caseStudies } from '../../../_data/caseStudies';
import type { CaseStudyStep } from '../../../_data/caseStudies';
import { BeatScene } from './beats';
import { BeforeAfterToggle, MediaPlaceholder } from './BeforeAfterToggle';
import { StepBlocks, splitBlocks } from './StepBlocks';
import { getIcon } from './icons';
import { FlightPathProgress } from './FlightPathProgress';
import { Starfield } from './Starfield';

// Per-card label for the before/after craft-flip (keyed by the card's beat).
const TOGGLE_LABEL: Record<string, string> = {
  'fly-through': 'popup vs fly-through',
  'orbit-assemble': 'eyeballed vs ratio’d bento',
};

const KIND_COLOR: Record<string, string> = {
  problem: 'var(--muted)',
  approach: 'var(--accent)',
  build: 'var(--accent)',
  workflows: 'var(--accent)',
  insight: 'var(--accent)',
  practice: 'var(--accent)',
  precautions: 'var(--accent-caution)',
  result: 'var(--active)',
  demo: 'var(--active)',
};

// A leading integer (with optional %/+/x) → animate it counting up; render the rest as-is.
function splitMetric(value: string): { num: number; prefix: string; suffix: string } | null {
  const m = value.match(/^(\D*)(\d+)(.*)$/);
  if (!m) return null;
  return { prefix: m[1] ?? '', num: Number(m[2]), suffix: m[3] ?? '' };
}

/**
 * A "stacking cards" case study, rendered inside the SceneLightbox panel (the panel is the scroll
 * container). A briefing hero states the outcome up front, then each step is a card that pins via
 * ScrollStack while the next scrolls up and overlaps it (scaling the covered card down). Under reduced
 * motion ScrollStack degrades to a plain vertical stack and the reveals render their finished state —
 * a clean, fully readable document.
 *
 * The hero forces `reducedMotion={false}` (it's a motion showcase), but a case study is long-form
 * reading: we re-provide motion here following the user's OS `prefers-reduced-motion` so the document
 * degrades gracefully — the accessibility signal Card 7 advertises. The preset carries through.
 */
export function CaseStudyJourney({ slug }: { slug: string }) {
  const preset = usePreset();
  return (
    <MotionProvider preset={preset} as={false}>
      <CaseStudyJourneyInner slug={slug} />
    </MotionProvider>
  );
}

function CaseStudyJourneyInner({ slug }: { slug: string }) {
  const study = caseStudies[slug];
  const reduced = useReducedMotion();
  const panelRef = useScenePanelRef();
  const rootRef = (panelRef as React.RefObject<HTMLElement>) ?? undefined;
  const fallbackRef = useRef<HTMLElement>(null);
  const root = panelRef ?? fallbackRef;
  // Panel scroll → the thin top progress bar shown on the mobile/tablet rail fallback.
  const { scrollYProgress } = useScroll({ container: root });

  if (!study) return null;

  return (
    <div className="relative" style={{ background: 'var(--void)' }}>
      {/* quiet gradient backdrop (no starfield) */}
      <div
        aria-hidden
        style={{
          position: 'sticky',
          top: 0,
          height: 0,
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '0 0 auto 0',
            height: '100vh',
            background: 'radial-gradient(70% 50% at 50% 0%, rgba(40,55,110,0.22), transparent 70%)',
          }}
        />
      </div>

      {/* full-bleed starfield, behind the cards & rail, faded out across the centered column (≥ lg) */}
      <div
        aria-hidden
        className="hidden lg:block"
        style={{ position: 'sticky', top: 0, height: 0, zIndex: 0 }}
      >
        <div style={{ position: 'absolute', inset: '0 0 auto 0', height: '100vh' }}>
          <Starfield scrollContainerRef={root} reduced={reduced} />
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* desktop side rail (≥ lg): the left flight path, pinned in the gutter.
            The overlay is pointer-events-none so cards stay interactive — only the path nodes click. */}
        <div className="hidden lg:block" style={{ position: 'sticky', top: 0, height: 0, zIndex: 2 }}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '100vh',
              pointerEvents: 'none',
            }}
          >
            <FlightPathProgress steps={study.steps} scrollContainerRef={root} reduced={reduced} />
          </div>
        </div>

        {/* mobile/tablet fallback (< lg): a thin top progress bar instead of the rails */}
        <div className="lg:hidden" style={{ position: 'sticky', top: 0, height: 0, zIndex: 2 }}>
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: 2,
              width: '100%',
              transformOrigin: 'left',
              scaleX: scrollYProgress,
              background: 'color-mix(in srgb, var(--accent) 70%, transparent)',
            }}
          />
        </div>

        {/* briefing hero — outcome up front */}
        <section className="flex min-h-[78vh] flex-col items-center justify-center px-6 text-center">
          <div className="u-mono text-[11px] tracking-[0.3em] text-[color:var(--accent)]">
            CASE STUDY · {study.title.toUpperCase()}
          </div>
          <h2 className="u-display mx-auto mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-[color:var(--ice)] md:text-5xl">
            {study.outcomeHeadline}
          </h2>
          <p className="u-mono mx-auto mt-5 max-w-2xl text-[11px] uppercase leading-relaxed tracking-[0.18em] text-[color:var(--muted)]">
            {study.context}
          </p>
          {!reduced && (
            <div className="u-mono mt-10 animate-pulse text-[11px] tracking-[0.25em] text-[color:var(--muted)]">
              SCROLL ↓
            </div>
          )}
        </section>

        {/* stacking cards — one per step */}
        <div className="px-4 pb-[8vh] md:px-8">
          <div className="mx-auto w-full max-w-3xl">
            <ScrollStack root={root} topOffset={28} gap={10} scaleStep={0.03} minCardHeight="74vh">
              {study.steps.map((step, i) => (
                <StepCard
                  key={step.kind + i}
                  step={step}
                  index={i}
                  total={study.steps.length}
                  root={rootRef}
                  reduced={reduced}
                />
              ))}
            </ScrollStack>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepCard({
  step,
  index,
  total,
  root,
  reduced,
}: {
  step: CaseStudyStep;
  index: number;
  total: number;
  root: React.RefObject<HTMLElement> | undefined;
  reduced: boolean;
}) {
  const color = KIND_COLOR[step.kind] ?? 'var(--accent)';
  const Icon = getIcon(step.icon);
  return (
    <article
      id={`cs-step-${index}`}
      className="overflow-hidden rounded-2xl p-7 md:p-10"
      style={{
        // Fully opaque so a stacked card never lets the card behind it bleed through its face.
        background: 'var(--deep)',
        border: '1px solid color-mix(in srgb, var(--accent) 28%, transparent)',
      }}
    >
      <div
        className="u-mono flex items-center gap-3 text-[11px] tracking-[0.25em]"
        style={{ color }}
      >
        {Icon && <Icon size={15} strokeWidth={1.75} aria-hidden />}
        <span>{String(index + 1).padStart(2, '0')}</span>
        <span style={{ width: 28, height: 1, background: color, display: 'inline-block' }} />
        {step.label.toUpperCase()}
        <span className="ml-auto text-[color:var(--muted)]">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>

      {step.beat && (
        <div className="mt-6">
          <BeatScene beat={step.beat} panelRef={root} reduced={reduced} />
        </div>
      )}

      {reduced ? (
        <h3 className="u-display mt-4 text-2xl font-semibold tracking-tight text-[color:var(--ice)] md:text-3xl">
          {step.heading}
        </h3>
      ) : (
        <TextReveal
          text={step.heading}
          by="word"
          trigger="inView"
          once={false}
          root={root}
          as="h3"
          className="u-display mt-4 text-2xl font-semibold tracking-tight text-[color:var(--ice)] md:text-3xl"
        />
      )}

      {step.blocks && step.blocks.length > 0 ? (
        step.layout === 'split' ? (
          (() => {
            const { text, visual } = splitBlocks(step.blocks);
            return (
              <div className="grid grid-cols-1 gap-x-8 md:grid-cols-[1.5fr_1fr] md:items-center">
                <StepBlocks blocks={text} reduced={reduced} root={root} />
                <StepBlocks blocks={visual} reduced={reduced} root={root} baseDelay={0.2} />
              </div>
            );
          })()
        ) : (
          <StepBlocks blocks={step.blocks} reduced={reduced} root={root} />
        )
      ) : (
        step.body && (
          <RevealMaybe reduced={reduced} root={root} delay={0.1}>
            <p className="mt-4 text-[16px] leading-relaxed text-[color:var(--ice)]/85">
              {step.body}
            </p>
          </RevealMaybe>
        )
      )}

      {step.toggle && (
        <RevealMaybe reduced={reduced} root={root} delay={0.15}>
          <div className="mt-7">
            <BeforeAfterToggle
              prominent={step.toggle === 'required'}
              label={step.beat ? TOGGLE_LABEL[step.beat] : undefined}
              before={<MediaPlaceholder kind="before" />}
              after={<MediaPlaceholder kind="after" />}
            />
          </div>
        </RevealMaybe>
      )}

      {step.metrics && step.metrics.length > 0 && (
        <RevealMaybe reduced={reduced} root={root} delay={0.2}>
          <div className="mt-8 flex flex-wrap gap-8">
            {step.metrics.map((m) => {
              const parts = splitMetric(m.value);
              return (
                <div key={m.label}>
                  <div className="u-display text-4xl font-semibold" style={{ color }}>
                    {parts && !reduced ? (
                      <>
                        {parts.prefix}
                        <AnimatedNumber
                          value={parts.num}
                          trigger="inView"
                          once={false}
                          root={root}
                          duration="slow"
                        />
                        {parts.suffix}
                      </>
                    ) : (
                      m.value
                    )}
                  </div>
                  <div className="u-mono mt-1 text-[10px] uppercase tracking-[0.15em] text-[color:var(--muted)]">
                    {m.label}
                  </div>
                </div>
              );
            })}
          </div>
        </RevealMaybe>
      )}

      {step.links && step.links.length > 0 && (
        <RevealMaybe reduced={reduced} root={root} delay={0.25}>
          <div
            className="mt-8 flex flex-wrap items-center gap-3"
            style={{ justifyContent: step.links.every((l) => l.soon) ? 'center' : 'flex-start' }}
          >
            {step.links.map((l) =>
              l.soon ? (
                <span
                  key={l.label}
                  aria-disabled
                  className="u-mono inline-flex cursor-default items-center gap-2 rounded-full px-5 py-2.5 text-[11px] uppercase tracking-[0.15em]"
                  style={{
                    color: 'var(--muted)',
                    border: '1px solid color-mix(in srgb, var(--accent) 22%, transparent)',
                  }}
                >
                  {l.label}
                  <span style={{ color: 'var(--active)' }}>Coming Soon</span>
                </span>
              ) : (
                <a
                  key={l.label}
                  href={l.href}
                  className="rounded-full px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ background: 'var(--accent)', color: 'var(--void)' }}
                >
                  {l.label}
                </a>
              ),
            )}
          </div>
        </RevealMaybe>
      )}
    </article>
  );
}

function RevealMaybe({
  reduced,
  root,
  delay,
  children,
}: {
  reduced: boolean;
  root: React.RefObject<HTMLElement> | undefined;
  delay: number;
  children: React.ReactNode;
}) {
  if (reduced) return <>{children}</>;
  return (
    <Reveal trigger="inView" once={false} root={root} variant="slide" from="up" delay={delay}>
      {children}
    </Reveal>
  );
}
