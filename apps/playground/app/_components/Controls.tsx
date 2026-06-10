'use client';

import { presetNames } from '@umbra/motion';
import type { PresetName } from '@umbra/motion';
import { META } from './preset-meta';

interface ControlsProps {
  preset: PresetName;
  onPreset: (p: PresetName) => void;
  reduced: boolean;
  onToggleReduced: () => void;
  onReplay: () => void;
}

/** Shared control bar: preset segmented control + replay + reduced-motion switch. */
export function Controls({ preset, onPreset, reduced, onToggleReduced, onReplay }: ControlsProps) {
  const accent = META[preset].accent;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        role="group"
        aria-label="Motion preset"
        className="inline-flex rounded-full border border-[color:var(--color-line)] bg-white/60 p-1"
      >
        {presetNames.map((name) => {
          const active = name === preset;
          return (
            <button
              key={name}
              type="button"
              aria-pressed={active}
              onClick={() => onPreset(name)}
              className="rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: active ? META[name].accent : 'transparent',
                color: active ? '#fff' : 'var(--color-muted)',
                outlineColor: META[name].accent,
              }}
            >
              {name}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onReplay}
        className="rounded-full border border-[color:var(--color-line)] px-3 py-1.5 text-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ outlineColor: accent }}
      >
        ↻ Replay
      </button>

      <button
        type="button"
        aria-pressed={reduced}
        onClick={onToggleReduced}
        className="flex items-center gap-2 rounded-full border border-[color:var(--color-line)] px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ outlineColor: accent, color: reduced ? accent : 'var(--color-muted)' }}
      >
        <span
          className="inline-block h-3.5 w-3.5 rounded-full border"
          style={{
            borderColor: reduced ? accent : 'var(--color-line)',
            background: reduced ? accent : 'transparent',
          }}
        />
        Reduced motion
      </button>
    </div>
  );
}
