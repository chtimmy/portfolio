'use client';

import { motion } from 'motion/react';
import { useReducedMotion } from '@umbra/motion';
import { systemCategoryColors, systemCategoryLabels } from '../../../_data/systems';
import type { SystemCategory } from '../../../_data/systems';

export type CategoryFilter = 'all' | SystemCategory;

const OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'ai-system', label: systemCategoryLabels['ai-system'] },
  { value: 'automation', label: systemCategoryLabels.automation },
];

/**
 * Systems / Automations / All segmented control. NOTE (Phase 4 stub): this only reflects the active
 * selection visually — it does not filter or reshuffle the grid yet.
 */
export function CategoryToggle({ value, onChange }: { value: CategoryFilter; onChange: (v: CategoryFilter) => void }) {
  const reduced = useReducedMotion();
  return (
    <div
      className="u-mono inline-flex items-center gap-1 rounded-full p-1 text-[12px]"
      style={{ background: 'rgba(11,15,26,0.6)', border: '1px solid var(--line)', backdropFilter: 'blur(6px)' }}
      role="group"
      aria-label="Filter builds by category (preview)"
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        const accent = opt.value === 'all' ? 'var(--accent)' : systemCategoryColors[opt.value].base;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className="relative rounded-full px-3.5 py-1.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
            style={{ color: active ? 'var(--void, #05060a)' : 'var(--muted)' }}
          >
            {active && (
              <motion.span
                layoutId="category-toggle-pill"
                transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 32 }}
                className="absolute inset-0 rounded-full"
                style={{ background: accent }}
              />
            )}
            <span className="relative tracking-wide">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
