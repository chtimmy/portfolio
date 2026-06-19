'use client';

import { motion } from 'motion/react';
import { ArrowRight, Star } from 'lucide-react';
import { useReducedMotion } from '@umbra/motion';
import {
  featuredStarColor,
  systemCategoryColors,
  systemCategoryLabels,
  systemPalette,
} from '../../../_data/systems';
import type { SystemCard } from '../../../_data/systems';
import { resolveIcon } from './icons';

// Bespoke desktop bento placement (4 cols × 3 rows). Layout — not content — so it lives here keyed
// by card id rather than in the data. Spans/starts apply at `lg` only; below `lg` the grid is a
// uniform flow (1col mobile, 2col tablet). Daytrading is the 2×2 feature (top-left); Lead to Outreach
// is vertical (1×2) on the far right; 1-on-1 Tracker is horizontal (2×1); the other four are 1×1.
//
//   col1      col2      col3      col4
//   Daytrade  Daytrade  Finance   Lead
//   Daytrade  Daytrade  Client    Lead
//   MeetErr   Sheet     1on1      1on1
export const LG_PLACEMENT: Record<string, string> = {
  'daytrading-agent': 'lg:col-start-1 lg:row-start-1 lg:col-span-2 lg:row-span-2', // 2×2 feature
  'finance-tracker': 'lg:col-start-3 lg:row-start-1', // 1×1, above Client
  'lead-to-outreach': 'lg:col-start-4 lg:row-start-1 lg:row-span-2', // far-right, tall
  'client-tracker': 'lg:col-start-3 lg:row-start-2', // 1×1, below Finance
  'meeting-error-detection': 'lg:col-start-1 lg:row-start-3', // under Daytrading
  'sheet-cleaner': 'lg:col-start-2 lg:row-start-3', // under Daytrading
  'meeting-intelligence': 'lg:col-start-3 lg:row-start-3 lg:col-span-2', // bottom-right, wide
};

/** Background + glow for a card surface (border is applied by the caller so it can be hover-aware). */
export function cardSurface(card: SystemCard) {
  const { base } = systemCategoryColors[card.category];
  const accented = card.featured || card.caseStudyNodeId;
  return {
    background: systemPalette.panel,
    boxShadow: accented
      ? `0 12px 34px rgba(0,0,0,0.45), 0 0 30px color-mix(in srgb, ${base} 20%, transparent)`
      : '0 10px 30px rgba(0,0,0,0.42)',
  } as const;
}

/** The category pill shown on the front of a normal card. */
export function CategoryBadge({ category }: { category: SystemCard['category'] }) {
  const { base, tint } = systemCategoryColors[category];
  return (
    <span
      className="u-mono inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] tracking-[0.12em]"
      style={{
        color: tint,
        background: `color-mix(in srgb, ${base} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${base} 35%, transparent)`,
      }}
    >
      <span
        aria-hidden
        style={{ width: 6, height: 6, borderRadius: 99, background: base, display: 'inline-block' }}
      />
      {systemCategoryLabels[category]}
    </span>
  );
}

/** Distinct tag for the case-study card — stands out without outshining the feature tile. */
export function CaseStudyTag({ category }: { category: SystemCard['category'] }) {
  const { base, tint } = systemCategoryColors[category];
  return (
    <span
      className="u-mono inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] tracking-[0.12em]"
      style={{
        color: tint,
        background: `color-mix(in srgb, ${base} 16%, transparent)`,
        border: `1px solid color-mix(in srgb, ${base} 45%, transparent)`,
      }}
    >
      <Star size={11} strokeWidth={2} fill="currentColor" aria-hidden />
      Featured case study
    </span>
  );
}

/** Tool chips — a compact row reused on the front and back. */
export function ToolChips({ tools }: { tools: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tools.map((t) => (
        <span
          key={t}
          className="u-mono rounded-full px-2.5 py-0.5 text-[11px]"
          style={{
            color: `color-mix(in srgb, ${systemPalette.text} 78%, transparent)`,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.03)',
          }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

/**
 * Front-face content shared by the grid tile and the expanded card's front. `compact` (sm tiles)
 * hides the tool chips to keep small cells readable.
 */
export function CardFrontContent({ card, compact }: { card: SystemCard; compact?: boolean }) {
  const Icon = resolveIcon(card.icon);
  const { base, tint } = systemCategoryColors[card.category];
  const isCaseStudy = !!card.caseStudyNodeId;
  return (
    <div className="flex h-full flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
          style={{
            color: tint,
            background: `color-mix(in srgb, ${base} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${base} 30%, transparent)`,
          }}
        >
          <Icon size={22} strokeWidth={1.75} aria-hidden />
        </span>
        {isCaseStudy ? (
          <CaseStudyTag category={card.category} />
        ) : (
          <CategoryBadge category={card.category} />
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {card.featured && (
          <span aria-hidden style={{ color: featuredStarColor }}>
            ★
          </span>
        )}
        <h3
          className="u-display text-lg font-semibold leading-tight"
          style={{ color: systemPalette.text }}
        >
          {card.title}
        </h3>
      </div>

      <p
        className="text-[13.5px] leading-relaxed"
        style={{ color: `color-mix(in srgb, ${systemPalette.text} 75%, transparent)` }}
      >
        {card.oneLiner}
      </p>

      {!compact && (
        <div className="mt-auto">
          <ToolChips tools={card.tools} />
        </div>
      )}
    </div>
  );
}

/** A grid tile (resting state): the front face + a hover/focus "Click to view more →" cue. */
export function BentoCard({
  card,
  onSelect,
}: {
  card: SystemCard;
  onSelect: (rect: DOMRect) => void;
}) {
  const reduced = useReducedMotion();
  const compact = card.size === 'sm';
  const { base, hover, tint } = systemCategoryColors[card.category];
  return (
    <motion.button
      type="button"
      id={`bento-${card.id}`}
      onClick={(e) => {
        e.stopPropagation(); // don't let the opening click reach any outside-click dismiss handler
        onSelect(e.currentTarget.getBoundingClientRect()); // origin rect drives the flip→expand morph
      }}
      aria-expanded={false}
      aria-label={`${card.title} — ${card.oneLiner}. Click to view more.`}
      whileHover={reduced ? undefined : { y: -4 }}
      transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 30 }}
      className={`group relative ${LG_PLACEMENT[card.id] ?? ''} flex min-h-[150px] flex-col overflow-hidden rounded-2xl border text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[color:var(--card-hover)]`}
      style={
        {
          ...cardSurface(card),
          '--card-rest': `color-mix(in srgb, ${base} 55%, transparent)`,
          '--card-hover': hover,
          borderColor: 'var(--card-rest)',
        } as React.CSSProperties
      }
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--card-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--card-rest)')}
      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--card-hover)')}
      onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--card-rest)')}
    >
      {/* soft category glow — present on the feature + case-study tiles, brightening on hover */}
      {(card.featured || card.caseStudyNodeId) && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(120% 90% at 25% 15%, color-mix(in srgb, ${base} 16%, transparent), transparent 70%)`,
          }}
        />
      )}
      <div className="relative flex h-full flex-col">
        <CardFrontContent card={card} compact={compact} />
      </div>
      <HoverCue tint={tint} />
    </motion.button>
  );
}

/** Resting-state affordance — reveals a cue (not content) on hover OR keyboard focus. */
function HoverCue({ tint }: { tint: string }) {
  return (
    <span
      aria-hidden
      className="u-mono pointer-events-none absolute bottom-3 right-4 inline-flex items-center gap-1 text-[11px] tracking-wide opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
      style={{ color: tint }}
    >
      Click to view more
      <ArrowRight size={13} strokeWidth={2} />
    </span>
  );
}
