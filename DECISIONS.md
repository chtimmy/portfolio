# Decisions Log

Running record of resolved decisions during the Umbra build. Newest first. See
`motion-toolkit-build-plan.md` for the phased plan this implements.

## 2026-06-10 — Phase 1 (Motion token system)

- **Real preset values, distinct on every axis.** `calm` (slow, pure decelerate, no overshoot),
  `snappy` (fast, stiff near-critical springs, tight rhythm), `expressive` (back-out overshoot +
  anticipation via bezier points outside [0,1], bouncy low-damping springs, bigger travel). Values
  live in `tokens/presets.ts`; rationale in code comments.
- **`MotionProvider` is the single injection point.** Provides resolved tokens via React context
  *and* mirrors them as CSS variables (`--umbra-duration-*`, `--umbra-ease-*`, `--umbra-stagger-*`,
  `--umbra-distance-*`) on a wrapping element, so the language works with or without Motion. Springs
  are deliberately not emitted as CSS vars (not a CSS concept).
- **Reduced motion: one source, with an override.** `useReducedMotion()` reads context, which is
  the provider's `reducedMotion` prop when set, else the OS `prefers-reduced-motion`. The override
  exists so the demo/tests can exercise reduced mode without OS settings. Reduced mode collapses
  entrances to opacity-only fades (no transforms).
- **Token consumption is centralized in `resolveEntrance` (pure) + `useEntrance` (hook).** The "no
  raw values" rule and the reduced-motion fallback live in one place; `Fade` is now a thin consumer.
  `resolveEntrance` is side-effect-free so the fallback logic is unit-tested without a DOM.
- **Switching preset replays via remount.** The playground keys `MotionProvider` on
  `preset-reduced-replay`, so changing any of them re-triggers the entrance animations — the
  "toggle re-feels everything" proof.
- **Playground design (frontend-design skill):** cool paper/ink palette (not the cream-serif or
  near-black-acid defaults); Space Grotesk display + JetBrains Mono for token data ("the tokens are
  data"); **per-preset accent color** so the personality shows in color too; signature element is a
  live **easing-curve SVG** that bends/overshoots as you switch. Fonts via `next/font` in the app,
  not the toolkit.
- **Apps that use Motion directly declare it.** Added `motion` to the playground's deps (the Stage
  uses raw `motion.*` for the stagger/spring demos); the toolkit keeps `motion` as a dependency and
  `react`/`react-dom` as peers.

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
