import type { Project } from './projects';

/** The body of a project subpage — rendered inside a Lightbox panel. */
export function ProjectContent({ project }: { project: Project }) {
  const { detail } = project;
  return (
    <div className="relative mx-auto max-w-2xl px-6 py-20 md:px-8">
      {/* accent glow at the top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72"
        style={{ background: 'radial-gradient(60% 100% at 50% 0%, color-mix(in srgb, var(--accent) 22%, transparent), transparent)' }}
      />

      <div className="relative">
        <div className="u-mono text-[11px] tracking-[0.2em] text-[color:var(--accent)]">{project.kind}</div>
        <h2 className="u-display mt-3 text-4xl font-semibold tracking-tight text-[color:var(--ice)] md:text-5xl">
          {project.name}
        </h2>
        <p className="mt-3 text-lg text-[color:var(--muted)]">{detail.tagline}</p>

        <div className="mt-8 flex flex-col gap-4 text-[15px] leading-relaxed text-[color:var(--ice)]/90">
          {detail.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {detail.highlights && detail.highlights.length > 0 && (
          <ul className="mt-8 flex flex-col gap-2">
            {detail.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-[15px] text-[color:var(--ice)]/90">
                <span aria-hidden className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: 'var(--accent)' }} />
                {h}
              </li>
            ))}
          </ul>
        )}

        {detail.tools && detail.tools.length > 0 && (
          <div className="mt-8">
            <div className="u-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted)]">tools</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {detail.tools.map((tool) => (
                <span
                  key={tool}
                  className="u-mono rounded-full border px-3 py-1 text-[11px] text-[color:var(--muted)]"
                  style={{ borderColor: 'var(--line)' }}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {detail.links && detail.links.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-3">
            {detail.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-full px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{ background: 'var(--accent)', color: 'var(--void)' }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
