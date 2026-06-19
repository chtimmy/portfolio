'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Reveal } from '@umbra/motion';
import type { Block } from '../../../_data/caseStudies';
import { getIcon } from './icons';
import { CodaFlowDiagram } from './CodaFlowDiagram';

type Root = React.RefObject<HTMLElement> | undefined;

/** Reveal-on-scroll wrapper that no-ops under reduced motion (mirrors CaseStudyJourney's helper). */
function RevealMaybe({
  reduced,
  root,
  delay,
  children,
}: {
  reduced: boolean;
  root: Root;
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

function AnimatedDivider({ reduced }: { reduced: boolean }) {
  const line = (
    <span
      className="block h-px w-full"
      style={{
        background:
          'linear-gradient(90deg, color-mix(in srgb, var(--accent) 55%, transparent), transparent)',
      }}
    />
  );
  if (reduced) return <div className="my-6">{line}</div>;
  return (
    <motion.div
      className="my-6 origin-left"
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: false, amount: 0.6 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {line}
    </motion.div>
  );
}

/** The card's one-sentence thesis — large display, sits directly under the heading. */
function Lead({ text }: { text: string }) {
  return (
    <p className="u-display text-[20px] font-medium leading-snug text-[color:var(--ice)]">{text}</p>
  );
}

/**
 * The vague-vs-precise pairing — a mono block where a loose description (muted) is shown against the
 * exact spec that actually lands the feel (green = "the correct one"). The workhorse of Card 3.
 */
function Spec({ label, vague, precise }: { label?: string; vague?: string; precise: string }) {
  return (
    <div
      className="overflow-hidden rounded-lg"
      style={{
        background: 'color-mix(in srgb, var(--void) 70%, transparent)',
        border: '1px solid color-mix(in srgb, var(--accent) 16%, transparent)',
      }}
    >
      {label && (
        <div
          className="u-mono px-4 pt-3 text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted)]"
        >
          {label}
        </div>
      )}
      <div className="space-y-2 p-4">
        {vague && (
          <p className="u-mono text-[13px] leading-relaxed text-[color:var(--muted)]">
            <span className="mr-2 select-none opacity-60">›</span>
            {vague}
          </p>
        )}
        <p
          className="u-mono text-[13px] leading-relaxed"
          style={{ color: 'var(--active)' }}
        >
          <span className="mr-2 select-none opacity-70">›</span>
          {precise}
        </p>
      </div>
    </div>
  );
}

/** The memorable takeaway — serif, larger, left-border accent rule. */
function Pullquote({ text }: { text: string }) {
  return (
    <div className="flex gap-4">
      <span
        aria-hidden
        className="w-[3px] shrink-0 self-stretch rounded-full"
        style={{ background: 'var(--accent)' }}
      />
      <p
        className="u-serif text-[22px] leading-snug text-[color:var(--ice)] md:text-[26px]"
        style={{ fontStyle: 'italic' }}
      >
        {text}
      </p>
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-[color:var(--ice)]/80">
          <span
            aria-hidden
            className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: 'var(--accent)' }}
          />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function FeatureList({ items }: { items: { icon: string; text: string }[] }) {
  return (
    <div className="space-y-3.5">
      {items.map((f, i) => {
        const Icon = getIcon(f.icon);
        return (
          <div key={i} className="flex items-start gap-3.5">
            <span
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{
                background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
                color: 'var(--accent)',
              }}
            >
              {Icon ? <Icon size={17} strokeWidth={1.75} /> : null}
            </span>
            <span className="pt-1 text-[15px] leading-snug text-[color:var(--ice)]/85">{f.text}</span>
          </div>
        );
      })}
    </div>
  );
}

function QABlock({ items }: { items: { question: string; answer: string }[] }) {
  const HelpCircle = getIcon('HelpCircle');
  return (
    <div className="space-y-5">
      {items.map((qa, i) => (
        <div key={i}>
          <div
            className="flex items-start gap-2 text-[15px] font-medium leading-snug"
            style={{ color: 'var(--accent-caution)' }}
          >
            {HelpCircle ? <HelpCircle size={16} strokeWidth={2} className="mt-0.5 shrink-0" /> : null}
            <span>{qa.question}</span>
          </div>
          <p className="mt-1.5 pl-6 text-[15px] leading-relaxed text-[color:var(--ice)]/80">
            {qa.answer}
          </p>
        </div>
      ))}
    </div>
  );
}

function ImageGrid({ items }: { items: { src?: string; alt: string; caption?: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((img, i) => (
        <figure key={i} className="m-0">
          <div
            className="flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl"
            style={{
              border: img.src
                ? '1px solid color-mix(in srgb, var(--accent) 24%, transparent)'
                : '1px dashed color-mix(in srgb, var(--accent) 40%, transparent)',
              background: 'color-mix(in srgb, var(--deep) 70%, transparent)',
            }}
          >
            {img.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
            ) : (
              <span className="u-mono px-3 text-center text-[10px] uppercase tracking-[0.15em] text-[color:var(--muted)]">
                {img.alt}
              </span>
            )}
          </div>
          {img.caption && (
            <figcaption className="u-mono mt-2 text-[10px] uppercase tracking-[0.15em] text-[color:var(--muted)]">
              {img.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

/**
 * One screenshot that flips between two views on click (used for the day-of / overview dashboards) —
 * far more legible than two tiny tiles. Hovering blurs the current image and prompts the other view;
 * clicking rotates the card 180° (instant under reduced motion). Two backface-hidden faces are stacked
 * so each side keeps its own hover prompt.
 */
function ImageFlip({
  items,
  reduced,
}: {
  items: { src?: string; alt: string; caption?: string }[];
  reduced: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const front = items[0];
  const back = items[1];
  if (!front || !back) return <ImageGrid items={items} />;

  return (
    <figure className="m-0 mx-auto w-1/2">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={`Dashboard screenshot — showing ${flipped ? back.caption : front.caption}. Click to view the other.`}
        className="group block w-full cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
        style={{ perspective: 1600 }}
      >
        <motion.div
          className="relative aspect-[16/10] w-full"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <FlipFace img={front} otherCaption={back.caption} />
          <FlipFace img={back} otherCaption={front.caption} back />
        </motion.div>
      </button>
      <figcaption className="u-mono mt-2 text-center text-[10px] uppercase tracking-[0.15em] text-[color:var(--muted)]">
        {flipped ? back.caption : front.caption}
      </figcaption>
    </figure>
  );
}

function FlipFace({
  img,
  otherCaption,
  back,
}: {
  img: { src?: string; alt: string; caption?: string };
  otherCaption?: string;
  back?: boolean;
}) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-xl"
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: back ? 'rotateY(180deg)' : undefined,
        border: '1px solid color-mix(in srgb, var(--accent) 24%, transparent)',
        background: 'color-mix(in srgb, var(--void) 80%, transparent)',
      }}
    >
      {img.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img.src}
          alt={img.alt}
          className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.02] group-hover:blur-[3px] group-hover:brightness-[0.45]"
        />
      ) : (
        <span className="grid h-full w-full place-items-center px-3 text-center text-[color:var(--muted)]">
          {img.alt}
        </span>
      )}
      {otherCaption && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="u-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--ice)]">
            click to view {otherCaption.toLowerCase()}
          </span>
        </div>
      )}
    </div>
  );
}

function BlockView({ block, reduced }: { block: Block; reduced: boolean }) {
  switch (block.type) {
    case 'paragraph':
      if (block.emphasis) {
        return (
          <div className="flex gap-4">
            <span
              aria-hidden
              className="mt-1 w-1 shrink-0 self-stretch rounded-full"
              style={{ background: 'var(--accent)' }}
            />
            <p className="text-[16px] font-medium leading-relaxed text-[color:var(--ice)]/95">
              {block.text}
            </p>
          </div>
        );
      }
      return (
        <p className="text-[16px] leading-[1.7] text-[color:var(--ice)]/85">{block.text}</p>
      );
    case 'lead':
      return <Lead text={block.text} />;
    case 'spec':
      return <Spec label={block.label} vague={block.vague} precise={block.precise} />;
    case 'pullquote':
      return <Pullquote text={block.text} />;
    case 'bullets':
      return <Bullets items={block.items} />;
    case 'features':
      return <FeatureList items={block.items} />;
    case 'divider':
      return <AnimatedDivider reduced={reduced} />;
    case 'diagram':
      return <CodaFlowDiagram reduced={reduced} />;
    case 'images':
      return block.toggle && block.items.length >= 2 ? (
        <ImageFlip items={block.items} reduced={reduced} />
      ) : (
        <ImageGrid items={block.items} />
      );
    case 'qa':
      return <QABlock items={block.items} />;
    default:
      return null;
  }
}

/** Renders a list of content blocks, each revealing on scroll (no-op under reduced motion). */
export function StepBlocks({
  blocks,
  reduced,
  root,
  baseDelay = 0.1,
}: {
  blocks: Block[];
  reduced: boolean;
  root: Root;
  baseDelay?: number;
}) {
  return (
    <div className="mt-4 space-y-3.5">
      {blocks.map((block, i) => (
        <RevealMaybe
          key={i}
          reduced={reduced}
          root={root}
          delay={Math.min(baseDelay + i * 0.06, 0.4)}
        >
          <BlockView block={block} reduced={reduced} />
        </RevealMaybe>
      ))}
    </div>
  );
}

/** Split a step's blocks into the split-layout columns: visuals (diagram/images) right, text left. */
export function splitBlocks(blocks: Block[]): { text: Block[]; visual: Block[] } {
  const text: Block[] = [];
  const visual: Block[] = [];
  for (const b of blocks) {
    if (b.type === 'diagram' || b.type === 'images') visual.push(b);
    else text.push(b);
  }
  return { text, visual };
}
