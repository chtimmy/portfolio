'use client';

import { createContext, useContext } from 'react';

/**
 * Open another orbit node's subpage by id (cross-node navigation from inside a panel). An optional
 * source rect (e.g. the clicked button) lets the target fly in from that point.
 */
export type NodeNav = (id: string, rect?: DOMRect) => void;

export const NodeNavContext = createContext<NodeNav | null>(null);

/** Read the node-navigation callback (null outside the SceneLightbox panel tree). */
export function useNodeNav(): NodeNav | null {
  return useContext(NodeNavContext);
}
