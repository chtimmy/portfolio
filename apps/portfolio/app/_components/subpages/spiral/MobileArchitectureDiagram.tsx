'use client';

import { Clock } from 'lucide-react';
import { systemCategoryColors, systemPalette } from '../../../_data/systems';
import type { Architecture, ArchNode, ArchRole } from '../../../_data/systems';
import { ArchitectureDiagram } from './ArchitectureDiagram';

// Mobile-only reflow of the desktop ArchitectureDiagram. It consumes the SAME `Architecture` data
// (single source of truth) but lays it out vertically so it fits a phone without the desktop
// diagram's horizontal overflow/overlap. Static markup → reduced-motion safe by construction.
//
// `linear`/`converge`/`branch` → a top-to-bottom VerticalFlow spine. `hub` → AnchoredHub (Phase 2;
// currently falls back to the desktop diagram). The schedule/`builtWith` footer mirrors the desktop
// component's footer. The desktop ArchitectureDiagram is never modified.

const NEUTRAL = systemPalette.muted;

/** Role → accent: ai = teal, core = indigo, everything else neutral. Mirrors the desktop diagram. */
function roleColor(role: ArchRole): string {
  if (role === 'ai') return systemCategoryColors['ai-system'].base;
  if (role === 'core') return systemCategoryColors.automation.base;
  return NEUTRAL;
}

/** Find the edge connecting two node ids (either direction). */
function edgeBetween(arch: Architecture, a: string, b: string) {
  return arch.edges.find((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a));
}

/** Full-width node chip — the vertical-flow equivalent of the desktop NodeChip. */
function MobileNodeChip({ node }: { node: ArchNode }) {
  const color = roleColor(node.role);
  return (
    <div
      className="w-full rounded-lg px-3 py-2 text-center text-[13px] font-medium leading-tight"
      style={{
        color: systemPalette.text,
        background: `color-mix(in srgb, ${color} 13%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 48%, transparent)`,
      }}
    >
      {node.label}
      {node.host && (
        <span
          className="u-mono mt-0.5 block text-[10px] font-normal tracking-wide"
          style={{ color: systemPalette.muted }}
        >
          on {node.host}
        </span>
      )}
    </div>
  );
}

/** A vertical connector between two stacked chips: a glyph (↓ / ↕) with an optional label beneath. */
function DownConnector({ glyph, label }: { glyph: string; label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-1">
      <span aria-hidden className="text-base leading-none" style={{ color: systemPalette.muted }}>
        {glyph}
      </span>
      {label && (
        <span
          className="u-mono mt-0.5 text-center text-[9.5px] tracking-wide"
          style={{ color: systemPalette.muted }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

/** A small label caption shown beside a node in a fan-in / fan-out group. */
function Caption({ label }: { label: string }) {
  return (
    <span className="u-mono text-center text-[9.5px] tracking-wide" style={{ color: systemPalette.muted }}>
      {label}
    </span>
  );
}

/** Converge → vertical: sources (fan-in) stack on top and merge into the spine, which fans out to
 *  sinks at the bottom. Spine derivation matches the desktop ConvergeFlow. */
function VerticalConverge({ arch }: { arch: Architecture }) {
  const nodeMap = new Map(arch.nodes.map((n) => [n.id, n] as const));
  const hasIncoming = new Set(arch.edges.map((e) => e.to));
  const hasOutgoing = new Set(arch.edges.map((e) => e.from));
  const sources = arch.nodes.filter((n) => !hasIncoming.has(n.id));
  const sinks = arch.nodes.filter((n) => !hasOutgoing.has(n.id));
  const middleIds = new Set(
    arch.nodes.filter((n) => hasIncoming.has(n.id) && hasOutgoing.has(n.id)).map((n) => n.id),
  );

  const start = arch.edges.find((e) => middleIds.has(e.to))?.to;
  const spine: string[] = [];
  let cur = start;
  while (cur && middleIds.has(cur) && !spine.includes(cur)) {
    spine.push(cur);
    cur = arch.edges.find((e) => e.from === cur && middleIds.has(e.to))?.to;
  }

  return (
    <div className="flex flex-col">
      {/* sources fan in */}
      <div className="flex flex-col gap-2">
        {sources.map((s) => {
          const edge = arch.edges.find((e) => e.from === s.id);
          return (
            <div key={s.id} className="flex flex-col items-center gap-0.5">
              <MobileNodeChip node={s} />
              {edge?.label && <Caption label={edge.label} />}
            </div>
          );
        })}
      </div>
      {sources.length > 0 && spine.length > 0 && <DownConnector glyph="↓" />}

      {/* spine */}
      {spine.map((id, i) => {
        const node = nodeMap.get(id);
        if (!node) return null;
        const next = spine[i + 1];
        const edge = next ? edgeBetween(arch, id, next) : undefined;
        return (
          <div key={id} className="flex flex-col">
            <MobileNodeChip node={node} />
            {next && <DownConnector glyph={edge?.bidirectional ? '↕' : '↓'} label={edge?.label} />}
          </div>
        );
      })}

      {/* sinks fan out */}
      {sinks.length > 0 && <DownConnector glyph="↓" />}
      <div className="flex flex-col gap-2">
        {sinks.map((s) => {
          const edge = arch.edges.find((e) => e.to === s.id);
          return (
            <div key={s.id} className="flex flex-col items-center gap-0.5">
              {edge?.label && <Caption label={edge.label} />}
              <MobileNodeChip node={s} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Linear / branch → vertical: walk the node order top-to-bottom with a labelled connector between
 *  each pair (↕ for a bidirectional edge). */
function VerticalLinear({ arch }: { arch: Architecture }) {
  return (
    <div className="flex flex-col">
      {arch.nodes.map((node, i) => {
        const next = arch.nodes[i + 1];
        const edge = next ? edgeBetween(arch, node.id, next.id) : undefined;
        return (
          <div key={node.id} className="flex flex-col">
            <MobileNodeChip node={node} />
            {next && <DownConnector glyph={edge?.bidirectional ? '↕' : '↓'} label={edge?.label} />}
          </div>
        );
      })}
    </div>
  );
}

/** Schedule + builtWith footer — mirrors the desktop ArchitectureDiagram's footer (stacked here). */
function DiagramFooter({ arch }: { arch: Architecture }) {
  const { schedule, builtWith } = arch;
  if (!schedule && !builtWith) return null;
  return (
    <div className="mt-3 flex flex-col gap-2">
      {schedule && (
        <div
          className="flex items-center gap-2.5 rounded-lg px-3 py-2"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)' }}
        >
          <Clock
            size={18}
            strokeWidth={1.75}
            aria-hidden
            className="shrink-0"
            style={{ color: systemCategoryColors.automation.tint }}
          />
          <span
            className="text-[12.5px] leading-snug"
            style={{ color: `color-mix(in srgb, ${systemPalette.text} 82%, transparent)` }}
          >
            {schedule}
          </span>
        </div>
      )}
      {builtWith && (
        <span
          className="u-mono self-end shrink-0 rounded-full px-2.5 py-1 text-[9.5px] tracking-wide"
          style={{ color: systemPalette.muted, border: '1px solid rgba(255,255,255,0.1)' }}
        >
          built with {builtWith}
        </span>
      )}
    </div>
  );
}

export function MobileArchitectureDiagram({ architecture }: { architecture: Architecture }) {
  // Phase 2 replaces this hub branch with a dedicated AnchoredHub renderer. Until then hub diagrams
  // fall back to the desktop component so those cards keep working (just cramped) during Phase 1.
  if (architecture.layout === 'hub') {
    return <ArchitectureDiagram architecture={architecture} />;
  }

  return (
    <div
      className="rounded-xl px-4 py-4"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {architecture.layout === 'converge' ? (
        <VerticalConverge arch={architecture} />
      ) : (
        <VerticalLinear arch={architecture} />
      )}
      <DiagramFooter arch={architecture} />
    </div>
  );
}
