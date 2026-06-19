'use client';

import { Star } from 'lucide-react';
import {
  featuredStarColor,
  systemCategoryColors,
  systemCategoryLabels,
  systemPalette,
} from '../../../_data/systems';

/**
 * A static key for the bento: what the two category accents mean (AI Systems / Automations) and what
 * the ★ marks (a featured build). Replaces the old category toggle — it reads, it doesn't filter.
 */
export function Legend() {
  return (
    <div
      className="u-mono inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] tracking-[0.12em]"
      style={{ color: systemPalette.muted }}
    >
      <LegendDot
        color={systemCategoryColors['ai-system'].base}
        label={systemCategoryLabels['ai-system']}
      />
      <LegendDot
        color={systemCategoryColors.automation.base}
        label={systemCategoryLabels.automation}
      />
      <span className="inline-flex items-center gap-1.5">
        <Star
          size={11}
          strokeWidth={2}
          fill="currentColor"
          aria-hidden
          style={{ color: featuredStarColor }}
        />
        Featured
      </span>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        style={{
          width: 7,
          height: 7,
          borderRadius: 99,
          background: color,
          display: 'inline-block',
        }}
      />
      {label}
    </span>
  );
}
