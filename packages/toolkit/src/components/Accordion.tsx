'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Transition } from 'motion/react';
import type { ReactNode } from 'react';
import { useMotionTokens, useReducedMotion } from '../provider';

export interface AccordionItemData {
  title: ReactNode;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItemData[];
  /** Allow more than one panel open at once. Default `false` (single-open). */
  allowMultiple?: boolean;
  /** Index open on first render. */
  defaultOpen?: number;
  className?: string;
}

/**
 * Expand/collapse panels with height animated on the active preset's tokens. Under reduced motion
 * panels toggle instantly. Headers are real buttons with `aria-expanded` for keyboard + screen
 * reader support.
 */
export function Accordion({ items, allowMultiple = false, defaultOpen, className }: AccordionProps) {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<Set<number>>(
    () => new Set(defaultOpen === undefined ? [] : [defaultOpen]),
  );

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const transition: Transition = reduced
    ? { duration: 0 }
    : { duration: tokens.duration.base / 1000, ease: [...tokens.easing.standard] };

  return (
    <div className={className}>
      {items.map((item, i) => {
        const isOpen = open.has(i);
        return (
          <div key={i} className="border-b border-[color:var(--color-line,#e3e5ea)]">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => toggle(i)}
              className="flex w-full items-center justify-between gap-4 py-4 text-left font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {item.title}
              <motion.span
                aria-hidden
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={transition}
                style={{ fontSize: '1.25rem', lineHeight: 1 }}
              >
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={transition}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="pb-4 text-[color:var(--color-muted,#767b86)]">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
