# Decisions Log

Running record of resolved decisions during the Umbra build. Newest first. See
`motion-toolkit-build-plan.md` for the phased plan this implements.

## 2026-06-10 — Phase 0 (Foundations)

- **Monorepo, pnpm workspaces.** Single repo: `packages/toolkit` + `apps/playground` +
  `apps/portfolio`. One share link, cross-workspace hot reload, easy dogfooding.
- **Build toolkit and portfolio in parallel.** Portfolio app is scaffolded now (not deferred to
  Phase 5), so design and engineering grow together. Monetization (Phase 6) stays deferred until
  after the portfolio ships.
- **3 motion presets: `calm` / `snappy` / `expressive`.** The token-system core idea — switching
  the active preset changes the feel of every component. (Phase 0 ships the *types*; real values
  land in Phase 1.)
- **Package name `@umbra/motion`** for the toolkit. "Umbra" is the working brand; final public
  product name is still open (see below).
- **Toolkit consumed from source internally.** The package `exports` points at `src/index.ts` and
  the Next apps set `transpilePackages: ['@umbra/motion']`. This is what gives cross-boundary hot
  reload. The Vite library build (`dist/`) is only for external distribution (npm / Phase 3
  registry). Verified 2026-06-10: editing `Fade.tsx` surfaced in the running playground in ~1s.
- **Stack versions pinned at scaffold:** React 19.2 · Next.js 16.2 · Motion 12.40 · Vite 8 ·
  Tailwind CSS v4.3 · Vitest 4.1 · TypeScript 5.9 · pnpm 11.5 · Node 24.
- **Tailwind dts build:** dropped `vite-plugin-dts`'s `rollupTypes` (needs api-extractor + a
  pre-emitted `index.d.ts`); per-file `.d.ts` is sufficient for now.

### Deferred / still open
- **v1 component shortlist** — Batch 1 fixed (`Reveal`, `TextReveal`, `Stagger`, `AnimatedNumber`)
  + 4–6 showpieces. Chosen in Phase 2 with playground context, not now.
- **Public product/brand name** — `@umbra/motion` is the package; the marketed name can change.
- **Local PATH for pnpm** — the installer couldn't write `~/.zshrc`; pnpm lives at
  `~/Library/pnpm/bin`. Add that to PATH manually (see CLAUDE.md).
