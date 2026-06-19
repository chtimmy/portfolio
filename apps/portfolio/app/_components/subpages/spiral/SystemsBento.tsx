'use client';

import { useState } from 'react';
import { RotatingText } from '@umbra/motion';
import { systems } from '../../../_data/systems';
import type { SystemCard } from '../../../_data/systems';
import { BentoCard } from './BentoCard';
import { ExpandedCard } from './ExpandedCard';
import { Legend } from './Legend';
import { useIsMobile } from '../../useIsMobile';

// Mobile reading order (single column). Desktop ignores this — it's positioned by `LG_PLACEMENT`.
const MOBILE_ORDER = [
  'daytrading-agent',
  'meeting-intelligence',
  'lead-to-outreach',
  'client-tracker',
  'meeting-error-detection',
  'finance-tracker',
  'sheet-cleaner',
];

/**
 * The Systems Library scene: a header band (rotating eyebrow + title + legend) above a static
 * 4-column bento of the 7 builds. Each tile expands into a detailed overlay (a body-portaled popup)
 * that flips to its back on click. Desktop fits one viewport (no scroll); the grid scrolls under the
 * fixed header on smaller screens.
 */
export function SystemsBento() {
  // The open card + the grid cell it was clicked from (drives the flip→expand morph).
  const [selected, setSelected] = useState<{ card: SystemCard; rect: DOMRect } | null>(null);
  const isMobile = useIsMobile();
  const ordered = isMobile
    ? [...systems].sort((a, b) => MOBILE_ORDER.indexOf(a.id) - MOBILE_ORDER.indexOf(b.id))
    : systems;

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Header band — a flex sibling above the scroll area, so content never overlaps it. */}
      <header
        className="shrink-0 px-4 pb-4 pt-6 text-center sm:px-6"
        style={{
          background: 'color-mix(in srgb, var(--deep) 90%, transparent)',
          borderBottom: '1px solid var(--line)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="u-mono inline-flex items-center gap-1.5 text-[12px] tracking-[0.2em] text-[color:var(--muted)]">
          I build
          <RotatingText
            words={['systems', 'automations', 'agents', 'connectors']}
            color="var(--accent)"
            className="font-medium"
          />
        </div>
        <h2 className="u-display mt-1 text-3xl font-semibold tracking-tight text-[color:var(--ice)] md:text-4xl">
          Systems Library
        </h2>
        <div className="mt-4 flex justify-center">
          <Legend />
        </div>
      </header>

      {/* Grid area — fills the rest. Desktop: a fixed 4×3 that fits without scrolling. Tablet/mobile:
          fewer columns, natural height, scrolls. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-5 sm:px-6 sm:py-5">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-3.5 sm:grid-cols-2 lg:h-full lg:grid-cols-4 lg:grid-rows-3">
          {ordered.map((card) => (
            <BentoCard key={card.id} card={card} onSelect={(rect) => setSelected({ card, rect })} />
          ))}
        </div>
      </div>

      {selected && (
        <ExpandedCard
          key={selected.card.id}
          card={selected.card}
          originRect={selected.rect}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
