# Decisions Log

Running record of resolved decisions during the Umbra build. Newest first. See
`motion-toolkit-build-plan.md` for the phased plan this implements.

## 2026-06-10 — Phase 3a refinement: legible playground

Round 2 on the playground after review (controls felt inert; tokens confusing; previews static):
- **One-shot demos loop.** `LoopDemo` remounts entrance demos on an interval (and on prop/token
  change), so duration/easing differences are actually visible — and the token edits below now show.
- **Token editing folded into props (no standalone panel).** Timmy's call: tokens are just the
  values behind prop selections, and a global panel overwhelmed. A token-select prop (duration,
  easing, distance, stagger) now carries a `token` tag; `PropControls` renders a **collapsed "value
  of …" expander** that edits the selected key's value in a token override fed to the demo's
  `MotionProvider tokens={…}`. Springs stay internal (no prop → not editable here). Deleted
  `TokenPanel.tsx`.
- **Demo modes + a per-component toggle.** Registry entries declare `modes: ('loop'|'scroll'|'live')`.
  Detail pages show a Loop/Scroll toggle for inView components; scroll-driven components demo inside
  a real **`ScrollBox`** you scroll.
- **Scroll-container props on the toolkit.** `Parallax` gained `root?` and `ScrollProgress` gained
  `container?` (renders `absolute` instead of `fixed` when set) so they can track a scrolling panel
  — genuinely useful API, and what makes the contained scroll demos work. `StickyScene` left as a
  page-scroll component (its `vh` height doesn't fit a container cleanly); demoed as a draggable row.
- **Interactive index previews.** Dropped the stretched-link/`pointer-events-none`; the component
  **name** is the link and previews are live (hover, scroll, loop). inView components rely on
  clip-aware IntersectionObserver to fire inside a scroll box (no viewport-root needed).

## 2026-06-10 — Phase 3a: per-component playground (evaluation surface)

- **Phase 3 split into 3a → edit pass → 3b.** 3a = playground polish (per-component pages so each
  component can be evaluated); then Timmy reviews and we edit component source; 3b (later) = the
  registry + docs + deploy ("pack & deliver"). Rationale: the registry packages final component
  source, so it must come *after* edits — build it first and you re-sync after every change.
- **Per-component pages at `/components/[name]`** (SSG via `generateStaticParams` over `catalog`;
  `dynamicParams = false` → unknown names 404). Each page: big isolated live demo + live **prop
  knobs** + **token control panel** + generated usage code (copy) + prop reference. The index
  `/components` is now a category-grouped overview that links to each page.
- **Demo registry (`app/components/_registry/`) is the single source of demos** — per component:
  `{ controls, render(values), code(values) }`. The index previews and the detail pages both render
  from it (no more duplicated `demoFor`).
- **`MotionProvider` gained an optional `tokens` override** (toolkit) so the token panel can feed
  edited tokens live; normal apps still just pass `preset`. Backward compatible.
- **Index cards use a stretched-link pattern** (the `<Link>` is an absolutely-positioned sibling of
  the preview, not its parent) — required because previews contain `<button>`/`<a>`, which are
  invalid nested inside an anchor and caused a hydration mismatch.

## 2026-06-10 — Component taxonomy + expansion to 19

- **Adopted the category taxonomy** (`plan-update-component-taxonomy.md`, applied to the build
  plan). The library is organized by the anatomy of a page: Entrance · Text · Scroll-driven · Hover
  & cursor · Background & ambient · Data · Continuous & layout · Navigation (+ Orchestration core).
  Open Decision #3 now reads **2–4 per category** (Timmy's call; the plan's "max 2" was too few).
- **`catalog.ts` is the source of truth** for which components exist, their category, and a
  one-line summary. The playground gallery renders from it (grouped by category); Phase 3 registry
  + docs will too.
- **+10 components → 19 total.** Added `RotatingText` (text), `ScrollProgress` + `StickyScene`
  (scroll), `AnimatedGradient` + `GrainOverlay` + `DotGrid` + `BeamGrid` (background — the
  previously-empty category, now at the cap of 4), `StatBar` (data), `Accordion` (continuous),
  `SmoothScroll` (navigation). Coverage: 8 categories, all within 2–4 except Navigation at 1
  (`PageTransition` deferred). Background was emptied of priority elsewhere into here at Timmy's
  request.
- **Implementation notes:** `DotGrid` is canvas + rAF (static, no loop, under reduced motion);
  `AnimatedGradient`/`BeamGrid` use Motion loops, `GrainOverlay` a stepped CSS keyframe (in
  `styles.css`); `SmoothScroll` eases in-page anchors (no momentum-scroll lib — that's a backlog
  idea); `StickyScene` pins + translates on scroll, degrading to a native scroll row when reduced.
- Remaining catalog items stay in `BACKLOG.md`, labeled by category.

## 2026-06-10 — Phase 2 (Component primitives)

- **9 components shipped.** Batch 1: `Reveal`, `TextReveal`, `Stagger`, `AnimatedNumber`. Batch 2
  (chosen from the menu): `Marquee`, `Parallax`, `ImageReveal`, `TiltCard`, `Magnetic`. Parked
  `PageTransition`, `Spotlight`, `Accordion` in `BACKLOG.md`.
- **`Fade` removed, folded into `Reveal`.** `Reveal` is the canonical entrance (variants
  `fade`/`slide`/`scale`, `trigger` `inView` default | `mount`). The old `use-entrance` helper is
  superseded by `use-reveal` (`resolveReveal` pure + `useReveal` hook); tests updated.
- **Two kinds of timing.** Discrete entrances/transitions read **duration/easing tokens** (the "no
  raw values" rule). Continuous/interactive showpieces take a dimensionless prop instead — `speed`
  (Marquee px/s, Parallax fraction) or `strength` (Magnetic) — because scroll/marquee speed isn't a
  duration. Spring-smoothed showpieces (`TiltCard`, `Magnetic`, `Parallax`) use **spring tokens**.
- **Reduced motion, per component:** entrances → opacity-only; `AnimatedNumber` → jumps to value;
  `Marquee` → static; `Parallax` → no transform; `TiltCard`/`Magnetic` → no listeners/transform.
  All read the shared `useReducedMotion`.
- **Marquee is CSS-keyframe driven** (two identical groups, seamless `translateX(-50%)`, width
  measured for constant `speed`, pause-on-hover). Keyframes live in the toolkit's `styles.css`.
- **Gallery at `/components`** demos all nine under shared preset/reduced/replay controls (extracted
  `Controls` + `preset-meta`, de-duplicated from the home page).

## 2026-06-10 — Dropped the `snappy` preset

- **Two presets, not three: `calm` + `expressive`.** Removed `snappy` (decision below superseded).
  Two well-differentiated temperaments beat three where one is redundant; the build plan allowed
  2–3. `PresetName` is now `'calm' | 'expressive'`. Kept the name `expressive` over `bouncy`
  (it covers more than bounce: overshoot, anticipation, bigger travel). Note: the **spring token**
  key `snappy` (`gentle`/`snappy`/`bouncy`) is unrelated and stays.

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
