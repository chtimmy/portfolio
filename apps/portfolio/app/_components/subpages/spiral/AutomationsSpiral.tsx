'use client';

import { SystemsBento } from './SystemsBento';

/**
 * The Automations & AI Systems node subpage: a "Systems Library" of small AI systems + automation
 * builds, shown as a static bento grid of cards that flip + expand to reveal a detailed back. The
 * header (rotating eyebrow + title + toggle) and reduced-motion handling live inside the bento.
 */
export function AutomationsSpiral() {
  return (
    <div className="relative min-h-full" style={{ minHeight: '100vh' }}>
      <SystemsBento />
    </div>
  );
}
