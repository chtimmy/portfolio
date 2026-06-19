'use client';

import { Clock } from 'lucide-react';
import { systemCategoryColors, systemPalette } from '../../../_data/systems';
import type { Architecture, ArchNode, ArchRole } from '../../../_data/systems';

// A static, data-driven runtime-flow diagram (no animated draw → reduced-motion safe). `linear`
// renders nodes left-to-right; `hub` centers one node with spokes around it; `branch` renders a
// left-to-right tree that forks (follows `edges` from the root); `converge` renders a fan-in → spine
// → fan-out hourglass (sources merge into a spine that fans back out to sinks). The connector is
// looked up from `edges` (either direction) for arrowheads + label. `schedule` renders as a
// prominent timer block; `builtWith` is a build-time footnote anchored bottom-right — never a node
// in the flow.

const NEUTRAL = systemPalette.muted;

/** Role → accent: ai = teal, core = indigo, everything else neutral (two accents + neutral only). */
function roleColor(role: ArchRole): string {
  if (role === 'ai') return systemCategoryColors['ai-system'].base;
  if (role === 'core') return systemCategoryColors.automation.base;
  return NEUTRAL;
}

function NodeChip({ node }: { node: ArchNode }) {
  const color = roleColor(node.role);
  return (
    <div className="flex shrink-0 flex-col items-center gap-0.5 text-center">
      <div
        className="rounded-lg px-3 py-2 text-[13px] font-medium leading-tight"
        style={{
          color: systemPalette.text,
          background: `color-mix(in srgb, ${color} 13%, transparent)`,
          border: `1px solid color-mix(in srgb, ${color} 48%, transparent)`,
        }}
      >
        {node.label}
      </div>
      {node.host && (
        <span className="u-mono text-[10px] tracking-wide" style={{ color: systemPalette.muted }}>
          on {node.host}
        </span>
      )}
    </div>
  );
}

/** Small labelled arrow used between nodes. `axis` controls glyph orientation. */
function Connector({ glyph, label }: { glyph: string; label?: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center">
      {label && (
        <span className="u-mono mb-0.5 whitespace-nowrap text-[9.5px] tracking-wide" style={{ color: systemPalette.muted }}>
          {label}
        </span>
      )}
      <span aria-hidden className="text-base leading-none" style={{ color: systemPalette.muted }}>
        {glyph}
      </span>
    </div>
  );
}

/** Find the edge connecting two node ids (either direction). */
function edgeBetween(arch: Architecture, a: string, b: string) {
  return arch.edges.find((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a));
}

function LinearFlow({ arch }: { arch: Architecture }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {arch.nodes.map((node, i) => {
        const next = arch.nodes[i + 1];
        const edge = next ? edgeBetween(arch, node.id, next.id) : undefined;
        const glyph = !next ? '' : edge?.bidirectional ? '↔' : edge && edge.from !== node.id ? '←' : '→';
        return (
          <div key={node.id} className="flex items-center gap-2">
            <NodeChip node={node} />
            {next && <Connector glyph={glyph} label={edge?.label} />}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Branch layout: a left-to-right tree rooted at the node with no incoming edge. A node with one
 * child continues the chain rightward; a node with several children forks into stacked rows, each
 * continuing rightward. Assumes a tree (each node reached once) — the case it exists for is a chain
 * that splits.
 */
function BranchFlow({ arch }: { arch: Architecture }) {
  const nodeMap = new Map(arch.nodes.map((n) => [n.id, n] as const));
  const hasIncoming = new Set(arch.edges.map((e) => e.to));
  const root = arch.nodes.find((n) => !hasIncoming.has(n.id)) ?? arch.nodes[0];
  if (!root) return null;

  const renderNode = (id: string) => {
    const node = nodeMap.get(id);
    if (!node) return null;
    const children = arch.edges.filter((e) => e.from === id);
    return (
      <div className="flex items-center gap-2">
        <NodeChip node={node} />
        {children.length === 1 ? (
          <>
            <Connector glyph="→" label={children[0]?.label} />
            {renderNode(children[0]!.to)}
          </>
        ) : children.length > 1 ? (
          <div className="flex flex-col justify-center gap-3">
            {children.map((c) => (
              <div key={c.to} className="flex items-center gap-2">
                <Connector glyph="→" label={c.label} />
                {renderNode(c.to)}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  return <div className="flex justify-center overflow-x-auto py-1">{renderNode(root.id)}</div>;
}

/**
 * Converge layout: a fan-in → spine → fan-out "hourglass". Sources (in-degree 0) stack on the left
 * and arrow into the spine; the spine (nodes with both in and out edges) is a horizontal chain in the
 * middle; sinks (out-degree 0) stack on the right, arrowed in from the spine end. Assumes the shape
 * "all sources → spine-start, spine chain, spine-end → all sinks".
 */
function ConvergeFlow({ arch }: { arch: Architecture }) {
  const nodeMap = new Map(arch.nodes.map((n) => [n.id, n] as const));
  const hasIncoming = new Set(arch.edges.map((e) => e.to));
  const hasOutgoing = new Set(arch.edges.map((e) => e.from));
  const sources = arch.nodes.filter((n) => !hasIncoming.has(n.id));
  const sinks = arch.nodes.filter((n) => !hasOutgoing.has(n.id));
  const middleIds = new Set(
    arch.nodes.filter((n) => hasIncoming.has(n.id) && hasOutgoing.has(n.id)).map((n) => n.id),
  );

  // Order the spine: start at the (middle) node the sources point to, then follow middle→middle edges.
  const start = arch.edges.find((e) => middleIds.has(e.to))?.to;
  const spine: string[] = [];
  let cur = start;
  while (cur && middleIds.has(cur) && !spine.includes(cur)) {
    spine.push(cur);
    cur = arch.edges.find((e) => e.from === cur && middleIds.has(e.to))?.to;
  }

  return (
    <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
      {/* sources → */}
      <div className="flex flex-col items-end gap-3">
        {sources.map((s) => {
          const edge = arch.edges.find((e) => e.from === s.id);
          return (
            <div key={s.id} className="flex items-center gap-2">
              <NodeChip node={s} />
              <Connector glyph="→" label={edge?.label} />
            </div>
          );
        })}
      </div>

      {/* spine */}
      <div className="flex items-center gap-2">
        {spine.map((id, i) => {
          const node = nodeMap.get(id);
          if (!node) return null;
          const next = spine[i + 1];
          const edge = next ? edgeBetween(arch, id, next) : undefined;
          return (
            <div key={id} className="flex items-center gap-2">
              <NodeChip node={node} />
              {next && <Connector glyph="→" label={edge?.label} />}
            </div>
          );
        })}
      </div>

      {/* → sinks */}
      <div className="flex flex-col items-start gap-3">
        {sinks.map((s) => {
          const edge = arch.edges.find((e) => e.to === s.id);
          return (
            <div key={s.id} className="flex items-center gap-2">
              <Connector glyph="→" label={edge?.label} />
              <NodeChip node={s} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Hub layout: the node common to every edge is centered; spokes go top / left / right / bottom. */
function HubFlow({ arch }: { arch: Architecture }) {
  const hub = arch.nodes.find((n) => arch.edges.every((e) => e.from === n.id || e.to === n.id)) ?? arch.nodes[0];
  if (!hub) return null;
  const spokes = arch.nodes.filter((n) => n.id !== hub.id);
  const [top, left, right, bottom] = spokes;

  const labelFor = (spokeId: string) => edgeBetween(arch, hub.id, spokeId)?.label;

  return (
    <div
      className="grid items-center justify-items-center gap-x-3 gap-y-1 py-1"
      style={{ gridTemplateColumns: '1fr auto 1fr' }}
    >
      {/* row 1 */}
      <span />
      {top ? (
        <div className="flex flex-col items-center">
          <NodeChip node={top} />
          {labelFor(top.id) && <span className="u-mono text-[9.5px]" style={{ color: systemPalette.muted }}>{labelFor(top.id)}</span>}
          <span aria-hidden className="text-base leading-none" style={{ color: systemPalette.muted }}>↕</span>
        </div>
      ) : (
        <span />
      )}
      <span />

      {/* row 2 */}
      {left ? (
        <div className="flex items-center gap-1.5 justify-self-end">
          <NodeChip node={left} />
          <Connector glyph="↔" label={labelFor(left.id)} />
        </div>
      ) : (
        <span />
      )}
      <NodeChip node={hub} />
      {right ? (
        <div className="flex items-center gap-1.5 justify-self-start">
          <Connector glyph="↔" label={labelFor(right.id)} />
          <NodeChip node={right} />
        </div>
      ) : (
        <span />
      )}

      {/* row 3 */}
      <span />
      {bottom ? (
        <div className="flex flex-col items-center">
          <span aria-hidden className="text-base leading-none" style={{ color: systemPalette.muted }}>↕</span>
          {labelFor(bottom.id) && <span className="u-mono text-[9.5px]" style={{ color: systemPalette.muted }}>{labelFor(bottom.id)}</span>}
          <NodeChip node={bottom} />
        </div>
      ) : (
        <span />
      )}
      <span />
    </div>
  );
}

export function ArchitectureDiagram({ architecture }: { architecture: Architecture }) {
  const { schedule, builtWith, layout } = architecture;

  return (
    <div
      className="rounded-xl px-4 py-4"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {layout === 'hub' ? (
        <HubFlow arch={architecture} />
      ) : layout === 'branch' ? (
        <BranchFlow arch={architecture} />
      ) : layout === 'converge' ? (
        <ConvergeFlow arch={architecture} />
      ) : (
        <LinearFlow arch={architecture} />
      )}

      {(schedule || builtWith) && (
        <div className="mt-3 flex items-center gap-3">
          {schedule && (
            <div
              className="flex flex-1 items-center gap-2.5 rounded-lg px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <Clock size={18} strokeWidth={1.75} aria-hidden style={{ color: systemCategoryColors.automation.tint }} />
              <span className="text-[12.5px] leading-snug" style={{ color: `color-mix(in srgb, ${systemPalette.text} 82%, transparent)` }}>
                {schedule}
              </span>
            </div>
          )}
          {builtWith && (
            <span
              className="u-mono ml-auto shrink-0 rounded-full px-2.5 py-1 text-[9.5px] tracking-wide"
              style={{ color: systemPalette.muted, border: '1px solid rgba(255,255,255,0.1)' }}
            >
              built with {builtWith}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
