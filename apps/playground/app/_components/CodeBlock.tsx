'use client';

import { useState } from 'react';

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg border border-[color:var(--color-line)] bg-[#0e1118] p-4 text-[13px] leading-relaxed text-neutral-100">
        <code className="font-mono">{code}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        className="absolute right-2 top-2 rounded-md border border-white/15 bg-white/10 px-2 py-1 font-mono text-[11px] text-white transition-colors hover:bg-white/20"
      >
        {copied ? 'copied' : 'copy'}
      </button>
    </div>
  );
}
