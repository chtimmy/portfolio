'use client';

import { motion } from 'motion/react';
import { BRAND, type BrandKey } from './brand-icons';

// Vertical (top→bottom) flow diagram so it stays narrow in the split layout's right column:
//   Calendly + Drive → Zapier → Coda → Slack + Gmail.
// Nodes are theme-tinted chips with a brand glyph; edges draw top-to-bottom in sequence on view.
// Reduced motion → fully drawn, no animation.

const VB = { w: 260, h: 380 };
const CHIP = { w: 112, h: 40 };

type NodeDef = { key: BrandKey; label: string; x: number; y: number };

const NODES: NodeDef[] = [
  { key: 'calendly', label: 'Calendly', x: 6, y: 8 },
  { key: 'drive', label: 'Drive', x: 142, y: 8 },
  { key: 'zapier', label: 'Zapier', x: 74, y: 110 },
  { key: 'coda', label: 'Coda', x: 74, y: 212 },
  { key: 'slack', label: 'Slack', x: 6, y: 320 },
  { key: 'gmail', label: 'Gmail', x: 142, y: 320 },
];

// Edges, in draw order: sources → Zapier, Zapier → Coda, then the fan-out.
const EDGES: { d: string; delay: number }[] = [
  { d: 'M62 48 C62 80 130 80 130 110', delay: 0 }, // Calendly → Zapier
  { d: 'M198 48 C198 80 130 80 130 110', delay: 0.15 }, // Drive → Zapier
  { d: 'M130 150 L130 212', delay: 0.4 }, // Zapier → Coda
  { d: 'M130 252 C130 288 62 288 62 320', delay: 0.65 }, // Coda → Slack
  { d: 'M130 252 C130 288 198 288 198 320', delay: 0.8 }, // Coda → Gmail
];

const ICON_SCALE = 20 / 24;

function Node({ node }: { node: NodeDef }) {
  const brand = BRAND[node.key];
  return (
    <g>
      <rect
        x={node.x}
        y={node.y}
        width={CHIP.w}
        height={CHIP.h}
        rx={11}
        fill="var(--deep)"
        stroke="color-mix(in srgb, var(--accent) 36%, transparent)"
        strokeWidth={1}
      />
      <g transform={`translate(${node.x + 10} ${node.y + 10}) scale(${ICON_SCALE})`}>
        <path d={brand.path} fill="var(--accent)" />
      </g>
      <text
        x={node.x + 34}
        y={node.y + CHIP.h / 2}
        dominantBaseline="central"
        fill="var(--ice)"
        fontSize={11.5}
        fontWeight={500}
      >
        {node.label}
      </text>
    </g>
  );
}

export function CodaFlowDiagram({ reduced = false }: { reduced?: boolean }) {
  const stroke = 'color-mix(in srgb, var(--accent) 70%, transparent)';
  return (
    <svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      width="100%"
      role="img"
      aria-label="Data flow: Calendly and Google Drive feed Zapier, which syncs Coda, which sends reminders to Slack and Gmail."
      style={{ maxWidth: 240, height: 'auto', display: 'block', margin: '0 auto' }}
    >
      <defs>
        <marker
          id="coda-flow-arrow"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" fill={stroke} />
        </marker>
      </defs>

      {EDGES.map((e, i) =>
        reduced ? (
          <path
            key={i}
            d={e.d}
            fill="none"
            stroke={stroke}
            strokeWidth={1.5}
            markerEnd="url(#coda-flow-arrow)"
          />
        ) : (
          <motion.path
            key={i}
            d={e.d}
            fill="none"
            stroke={stroke}
            strokeWidth={1.5}
            markerEnd="url(#coda-flow-arrow)"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.5, delay: e.delay, ease: 'easeInOut' }}
          />
        ),
      )}

      {NODES.map((n) => (
        <Node key={n.key} node={n} />
      ))}
    </svg>
  );
}
