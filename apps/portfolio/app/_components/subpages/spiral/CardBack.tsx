'use client';

import type { RefObject } from 'react';
import { ArrowRight, ChevronDown, Play, X } from 'lucide-react';
import { useReducedMotion } from '@umbra/motion';
import { systemCategoryColors, systemPalette } from '../../../_data/systems';
import type { SystemCard } from '../../../_data/systems';
import { CaseStudyTag, CategoryBadge, ToolChips } from './BentoCard';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { MobileArchitectureDiagram } from './MobileArchitectureDiagram';
import { resolveIcon } from './icons';
import { useNodeNav } from '../../node-nav';
import { useIsMobile } from '../../useIsMobile';

/**
 * The shared back-of-card "trailer" — same section order on every card so the library reads as one
 * system. Sections: architecture diagram → How it works (description + "In practice") → Skills →
 * Tools (tool · role) → The tricky part (optional) → extended depth → CTA. Each section hides when
 * its data is absent. Static content (the diagram does its own static render) → reduced-motion safe.
 *
 * Presentational only: `ExpandedCard` owns the open/grow animation and the `showMore`/`revealText`
 * state. The whole back lives in one `measureRef` wrapper (sticky header + sections) whose natural
 * height drives the modal's grow-to-fit sizing — so it's pinned to a fixed `width` (= modal width)
 * and measured even while rotated away during the flip. The extended block is always mounted; it
 * expands via a CSS grid row (0fr→1fr, feeds the resize observer → the card grows) and its text
 * fades in once `revealText` flips (the "expand, then reveal" sequence).
 */
export function CardBack({
  card,
  onClose,
  closeBtnRef,
  showMore,
  onToggleMore,
  revealText,
  measureRef,
  extendedRef,
  width,
}: {
  card: SystemCard;
  onClose: () => void;
  closeBtnRef: RefObject<HTMLButtonElement | null>;
  showMore: boolean;
  onToggleMore: () => void;
  revealText: boolean;
  measureRef: RefObject<HTMLDivElement | null>;
  extendedRef: RefObject<HTMLDivElement | null>;
  width: number;
}) {
  const Icon = resolveIcon(card.icon);
  const { base, tint } = systemCategoryColors[card.category];
  const isCaseStudy = !!card.caseStudyNodeId;
  const reduced = useReducedMotion();
  const hasExtended = !!(card.extended && card.extendedSections && card.extendedSections.length > 0);

  const visual = <Visual card={card} />;
  const textSections = (
    <>
      <Section title="How it works">
        {card.description.split('\n\n').map((para, i) => (
          <p
            key={i}
            className={`text-[13.5px] leading-relaxed${i > 0 ? ' mt-2' : ''}`}
            style={{ color: `color-mix(in srgb, ${systemPalette.text} 85%, transparent)` }}
          >
            {para}
          </p>
        ))}
        {card.example && (
          <p className="mt-3 text-[13px] leading-relaxed" style={{ color: systemPalette.muted }}>
            <span style={{ color: tint }}>In practice: </span>
            {card.example}
          </p>
        )}
      </Section>

      {card.highlight && (
        <Section title="Nice Touch">
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: `color-mix(in srgb, ${systemPalette.text} 80%, transparent)` }}
          >
            {card.highlight}
          </p>
        </Section>
      )}

      {card.skills && card.skills.length > 0 && (
        <Section title="Skills demonstrated">
          <ToolChips tools={card.skills} />
        </Section>
      )}

      {card.stack && card.stack.length > 0 && (
        <Section title="Tools used">
          {/* The "View more details" toggle aligns to the last tool row (bottom-right), so it's
              visible the moment the card opens without scrolling past the tools list. */}
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              {card.stack.map((s) => (
                <div key={s.tool} className="flex items-baseline gap-2 text-[13px]">
                  <span className="font-medium" style={{ color: systemPalette.text }}>
                    {s.tool}
                  </span>
                  <span style={{ color: systemPalette.muted }}>· {s.role}</span>
                </div>
              ))}
            </div>
            {hasExtended && (
              <ExtendedToggle
                showMore={showMore}
                onToggleMore={onToggleMore}
                reduced={reduced}
                base={base}
                tint={tint}
              />
            )}
          </div>
        </Section>
      )}

      {/* Fallback: an extended card with no tools list → toggle on its own row. */}
      {hasExtended && !(card.stack && card.stack.length > 0) && (
        <div className="flex justify-end">
          <ExtendedToggle
            showMore={showMore}
            onToggleMore={onToggleMore}
            reduced={reduced}
            base={base}
            tint={tint}
          />
        </div>
      )}

      {/* Extended depth: collapsed behind the toggle. The card grows (grid row) then text fades. */}
      {hasExtended && (
        <div
          style={{
            display: 'grid',
            gridTemplateRows: showMore ? '1fr' : '0fr',
            transition: reduced ? undefined : 'grid-template-rows 320ms cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <div
            ref={extendedRef}
            style={{
              overflow: 'hidden',
              opacity: revealText ? 1 : 0,
              transition: reduced ? undefined : 'opacity 240ms ease',
            }}
          >
            <div
              className="flex flex-col gap-5 border-t pt-5"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              {card.extendedSections!.map((s) => (
                <Section key={s.title} title={s.title}>
                  <RichBody text={s.body} />
                </Section>
              ))}
            </div>
          </div>
        </div>
      )}

      <Cta card={card} />
    </>
  );

  return (
    <div className="flex h-full flex-col" style={{ background: systemPalette.panel }}>
      {/* Scroll container — only engages when content exceeds the viewport-capped modal height. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {/* Natural-height, fixed-width wrapper: this is what ExpandedCard measures to size the card. */}
        <div ref={measureRef} style={{ width }}>
          {/* sticky header — stays pinned (close button reachable) when the body scrolls */}
          <div
            className="sticky top-0 z-[1] flex items-center gap-3 px-6 pb-4 pt-5"
            style={{ background: systemPalette.panel }}
          >
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
              style={{
                color: tint,
                background: `color-mix(in srgb, ${base} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${base} 30%, transparent)`,
              }}
            >
              <Icon size={20} strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h3
                className="u-display truncate text-lg font-semibold"
                style={{ color: systemPalette.text }}
              >
                {card.title}
              </h3>
            </div>
            {isCaseStudy ? (
              <CaseStudyTag category={card.category} />
            ) : (
              <CategoryBadge category={card.category} />
            )}
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full outline-none transition-colors hover:brightness-150 focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
              style={{ color: systemPalette.muted, border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <X size={15} strokeWidth={2} />
            </button>
          </div>

          {card.sideVisual ? (
            // Tall visual → text on the left, screenshot on the right (stacks under text below md).
            <div className="grid gap-5 px-6 pb-6 md:grid-cols-[minmax(0,1fr)_300px] md:items-start">
              <div className="flex min-w-0 flex-col gap-5">{textSections}</div>
              <div>{visual}</div>
            </div>
          ) : (
            <div className="flex flex-col gap-5 px-6 pb-6">
              {visual}
              {textSections}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** The back's flexible visual slot: an image screenshot, or the architecture diagram (the default —
 *  falls back to `card.architecture` when `visual` is omitted). */
function Visual({ card }: { card: SystemCard }) {
  const isMobile = useIsMobile();
  const visual =
    card.visual ??
    (card.architecture ? ({ type: 'diagram', data: card.architecture } as const) : null);
  if (!visual) return null;
  if (visual.type === 'image') {
    const base = visual.width ?? '100%';
    // Mobile only: double the configured width (percentages clamp at 100%) so a half-width
    // screenshot like Lead to Outreach reads at a usable size on a phone. Desktop keeps `base`.
    const width = isMobile ? doubledPercent(base) : base;
    return (
      <img
        src={visual.src}
        alt={visual.alt}
        className="mx-auto block rounded-xl object-contain"
        style={{ width, maxHeight: '46vh', border: '1px solid rgba(255,255,255,0.08)' }}
      />
    );
  }
  // Mobile only: the desktop diagram overflows/overlaps in the narrow modal, so reflow it vertically.
  // Desktop renders the original ArchitectureDiagram unchanged.
  return isMobile ? (
    <MobileArchitectureDiagram architecture={visual.data} title={card.title} />
  ) : (
    <ArchitectureDiagram architecture={visual.data} />
  );
}

/** Double a percentage width, clamped to 100%; non-percentage widths pass through unchanged. */
function doubledPercent(w: string): string {
  const m = /^(\d+(?:\.\d+)?)%$/.exec(w.trim());
  return m ? `${Math.min(100, parseFloat(m[1]!) * 2)}%` : w;
}

/**
 * Bottom-of-back CTA row. Renders the primary "View full case study" action (in-app node nav via
 * `caseStudyNodeId`, or an external link via `caseStudyUrl`) and/or a subtler "Watch the walkthrough"
 * link (`walkthroughUrl`) — they coexist in a wrapping row. Returns null when no CTA applies.
 */
function Cta({ card }: { card: SystemCard }) {
  const { base, tint } = systemCategoryColors[card.category];
  const nav = useNodeNav();

  const primaryPill =
    'u-mono inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold tracking-[0.06em] outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]';
  const primaryStyle = {
    background: base,
    color: '#05060a',
    boxShadow: `0 8px 24px color-mix(in srgb, ${base} 35%, transparent)`,
  } as const;

  const nodeId = card.caseStudyNodeId;
  const caseStudy = nodeId ? (
    <button type="button" onClick={(e) => nav?.(nodeId, e.currentTarget.getBoundingClientRect())} className={primaryPill} style={primaryStyle}>
      View full case study
      <ArrowRight size={15} strokeWidth={2.25} />
    </button>
  ) : card.caseStudyUrl ? (
    <a href={card.caseStudyUrl} className={primaryPill} style={primaryStyle}>
      View full case study
      <ArrowRight size={15} strokeWidth={2.25} />
    </a>
  ) : null;

  // Subtler, outlined variant (mirrors ExtendedToggle) so it reads secondary to the case-study action.
  const walkthrough = card.walkthroughUrl ? (
    <a
      href={card.walkthroughUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="u-mono inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold tracking-[0.06em] outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
      style={{
        color: tint,
        background: `color-mix(in srgb, ${base} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${base} 35%, transparent)`,
      }}
    >
      <Play size={14} strokeWidth={2.25} aria-hidden />
      Watch the walkthrough
    </a>
  ) : null;

  if (!caseStudy && !walkthrough) return null;

  return (
    <div className="mt-1 flex flex-wrap items-center gap-3">
      {caseStudy}
      {walkthrough}
    </div>
  );
}

/** The "View more details" / "Show less" toggle for an extended card's back. */
function ExtendedToggle({
  showMore,
  onToggleMore,
  reduced,
  base,
  tint,
}: {
  showMore: boolean;
  onToggleMore: () => void;
  reduced: boolean;
  base: string;
  tint: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggleMore}
      aria-expanded={showMore}
      className="u-mono inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] tracking-wide outline-none transition-colors hover:brightness-125 focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
      style={{
        color: tint,
        background: `color-mix(in srgb, ${base} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${base} 35%, transparent)`,
      }}
    >
      {showMore ? 'Show less' : 'View more details'}
      <ChevronDown
        size={14}
        strokeWidth={2}
        aria-hidden
        style={{
          transform: showMore ? 'rotate(180deg)' : 'none',
          transition: reduced ? undefined : 'transform 200ms ease',
        }}
      />
    </button>
  );
}

/**
 * Renders an extended-section body: blank-line-separated paragraphs, with runs of `- ` lines grouped
 * into a bullet list. Lets the data carry simple structured copy (e.g. the Risk Framework guardrails).
 */
function RichBody({ text }: { text: string }) {
  const blocks: ({ type: 'p'; text: string } | { type: 'ul'; items: string[] })[] = [];
  let para: string[] = [];
  let list: string[] = [];
  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: 'p', text: para.join(' ') });
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push({ type: 'ul', items: list });
      list = [];
    }
  };
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
    } else if (line.startsWith('- ')) {
      flushPara();
      list.push(line.slice(2));
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();

  const color = `color-mix(in srgb, ${systemPalette.text} 80%, transparent)`;
  return (
    <div className="flex flex-col gap-2">
      {blocks.map((b, i) =>
        b.type === 'p' ? (
          <p key={i} className="text-[13px] leading-relaxed" style={{ color }}>
            {b.text}
          </p>
        ) : (
          <ul key={i} className="list-disc space-y-1 pl-5 text-[13px] leading-relaxed" style={{ color }}>
            {b.items.map((it, j) => (
              <li key={j}>{it}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        className="u-mono mb-2 text-[10px] uppercase tracking-[0.2em]"
        style={{ color: systemPalette.muted }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
