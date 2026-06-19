# Decisions Log

Running record of resolved decisions during the Umbra build. Newest first. See
`motion-toolkit-build-plan.md` for the phased plan this implements.

## 2026-06-16 — Coda 1-on-1 case study: block content model

Built out the `meeting-os` case study (now "Coda 1-on-1 Meeting System") into a full 7-card study.
The v1 `CaseStudyStep` only had `body: string`, which couldn't express ordered mixed content
(intro → divider → bullets, intro → divider → Q&A). Resolved decisions:

- **Block content model** (`apps/portfolio/app/_data/caseStudies.ts`). Added a `Block` union
  (`paragraph`/`bullets`/`features`/`divider`/`diagram`/`images`/`qa`) plus `icon?`, `layout?`, and
  `blocks?` on `CaseStudyStep`. Backward compatible: renderers prefer `blocks`, fall back to legacy
  `body` (the Umbra study still uses `body`). `StepKind` widened to `string`.
- **No new route.** The build plan assumed `/work/coda-1on1-system`; the real system renders
  `caseStudies['meeting-os']` inside the orbital modal via `CaseStudyJourney`/`StepCard`. Kept the
  `meeting-os` slug/id; rewrote content + `StepCard` in place.
- **Renderers** in `subpages/journey/`: `StepBlocks.tsx` (block dispatch + `splitBlocks` for the
  `layout:'split'` text-left/visual-right rule), `CodaFlowDiagram.tsx` (single-viewBox SVG,
  Calendly+Drive → Zapier → Coda → Slack+Gmail, edge-draw on view, reduced→fully drawn),
  `brand-icons.tsx` (Simple Icons paths; Slack inlined — removed from that set), `icons.ts` (explicit
  lucide registry). All motion gated behind `useReducedMotion`.
- **Caution color** `--accent-caution: #e0a458` (amber) for Card 6 precaution Q&A — question text +
  leading icon only, not fills/borders.
- **Hero subtitle** = the tool stack (`Coda · Zapier · …`), styled as a mono eyebrow row.
- **Open (owner: Timmy):** real Card 5 dashboard screenshots (sanitized), Card 7 demo/Loom links
  (currently `#`), CEO sign-off before public.

## 2026-06-13 — Agent Dossier redesign + 3 block-reveal components

Reworked the Resume "Agent Dossier" to a single "information resolving from cover into clarity"
language and surfaced the buried work history, per `agent-dossier-build-plan-v2.md`. Library-first as
always — the reusable reveal pieces ship in the toolkit; the dossier is a portfolio composition.

- **3 new toolkit components (Text category) — block-level reveals** (wrap arbitrary `children`, unlike
  the string-only `TextReveal`/`DecodeText`). All token-driven, reduced-motion-first, exported +
  cataloged + playground-demoed. Toolkit now **27 components**.
  - **`LineStagger`** — fast cascade of direct children as whole units (the fix for the sluggish
    word-by-word feel). Mirrors `Stagger` + `delayChildren` and a `from: 'up'|'down'|'none'`.
  - **`RedactionWipe`** — censor bars wipe off each child (`scaleX→0`, anchored right, accent leading
    edge); the "declassify" beat. Reduced motion → bars never rendered.
  - **`ScanlineReveal`** — a scan line sweeps top→bottom while children develop dim→full trailing it.
    Used as the dossier's body treatment.
  - **Deviation from the handoff doc:** the doc typed `stagger?: number` (seconds); shipped
    `stagger?: StaggerToken` instead to obey the no-raw-values rule + match `TextReveal`/`Stagger`.
    Colors (`lineColor`/`barColor`/`edgeColor`) stay free-form string props defaulting to CSS vars.
- **DossierCard reworked** (`apps/portfolio/.../dossier/DossierCard.tsx`):
  - Body copy (front "about", back mission-log bullets) now develops via `ScanlineReveal`; back
    role/org/section-labels scramble via `DecodeText` (were plain text); chips/badges/tools cascade via
    `LineStagger`; stats keep `AnimatedNumber`; radar pulled **out** of the `Reveal` fade so its draw-on
    is visible (the fade was masking it).
  - **Back re-mounts on every open** (`key={openCount}` gated on `flipped`) so the decrypt re-runs each
    flip; back content isn't mounted until flipped (no reveals firing behind the hidden face).
  - **Front DECRYPT FILE CTA band** replaces the quiet bottom flip-cue: a data-derived one-line career
    summary + a pulsing `DecryptButton` (app-local, not in the library) that runs scramble
    (`DECRYPTING…`) → lock-open → `ACCESS GRANTED` → flip. Reduced motion → no pulse/scramble, immediate
    flip.
  - **One-time load peek** (`rotateY: [0,16,0]` after 1.2s) hints at the verso; never repeats, skipped
    if already flipped or under reduced motion.
- **Exit-intent prompt (page-level).** `DossierCard` made **controllable** (`flipped` +
  `onFlippedChange`, internal fallback kept). State lifted to `Landing` (`dossierFlipped` /
  `hasDecrypted`, threaded via `NodeSubpage`). New `ExitIntentPrompt` (dialog, focus-trapped, Esc /
  backdrop close) fires **at most once per session, only for the résumé scene, only when not yet
  decrypted, fine-pointer only**, on **two triggers** (Timmy's call): window `mouseleave` at the top
  edge AND intercepting the `SceneLightbox` `onClose` (since the dossier lives in a scene panel, not a
  page, closing the scene is the common "leave"). `DECRYPT NOW` flips + closes the prompt; `Leave
  anyway` closes the scene; `Esc`/backdrop cancels.

## 2026-06-13 — Hydration fix, reduced-motion showcase, stacking-cards case study

- **SceneLightbox hydration mismatch (root cause + fix).** The camera layers (`far`/`near`) fed
  MotionValue-driven transforms (`scale`/`opacity`/`filter`) into `style`. Motion serializes those as
  `transform:none` on the server but re-serializes them differently on the first client render → a
  hydration warning on the layers' `style`. Fix: a client-mount gate (`hydrated`) — the MotionValue
  styles attach only after mount; SSR + first render emit just the static layout. Kept the elements as
  `motion.div` (swapping to a plain `<div>` would remount `near`/`far` and reset the orbit). Verified:
  `transform:none` no longer appears in the SSR HTML; both camera layers still render.
- **SSR-unsafe output → gate behind `useMounted` (now a convention + shared hook).** A second
  hydration warning traced to `OrbitSystem`: its starfield/halo/path `<span>`s and cards write
  full-precision floats (size- and animation-clock-derived) into inline `style` during SSR; the
  server serializes them lossily (`2.16077px`) vs the client's raw float → a per-span mismatch. Not
  `Math.random()` — the field is deterministic trig. Root cause is structural: the orbit's geometry
  comes from a guessed stage size that `ResizeObserver` only corrects post-mount, so the SSR'd orbit
  is always throwaway markup. Fix: gate the three animated layers on a `mounted` flag (static title
  still SSR'd); server + first client render emit an identical title-only tree → hydration matches,
  orbit mounts in one frame later (same timing the animation already had). **Generalized the pattern
  the provider already inlined into a shared `useMounted()` hook** (`hooks/use-mounted.ts`, exported;
  `provider.tsx` refactored to use it) with a docstring naming the failure modes. **Rule going
  forward:** any output derived from measurement (element size), time (rAF/`Date.now()`), or
  `Math.random()` must be gated behind `useMounted` so SSR + first render stay deterministic. Verified:
  SSR HTML has zero float-positioned spans; title still renders; typecheck + compile clean.
- **Portfolio plays full motion by design.** The "Resume isn't scrambling / no image-wipe" report was
  system-wide `prefers-reduced-motion`, not a bug — every component took its reduced fallback. The
  portfolio `MotionProvider` already sets `reducedMotion={false}` ([Landing.tsx:46]) so the showcase
  plays its full motion regardless; the symptom was a stale dev bundle (needs clean `.next` + hard
  refresh). `DecodeText`/`ImageReveal` code was correct.
- **Case study redesign → stacking cards (replaces the "space journey").** The scroll journey
  (starfield + flight-path) was too heavy. New mechanic: each step is a card that pins (`position:
  sticky`) while the next scrolls up and overlaps it, scaling the covered card down. Per the
  library-first rule this shipped as a new toolkit component:
  - **`ScrollStack`** (Scroll-driven) — generic sticky stacking-cards scroller; props `root`,
    `topOffset`, `gap`, `scaleStep`. Last card stays full size; reverses on scroll-up. Reduced motion →
    plain vertical stack. Exported + cataloged + playground demo. Toolkit now **24 components**.
  - **`CaseStudyJourney`** rewritten (same filename/export) to compose `ScrollStack`: briefing hero
    (outcome up front) + one `StepCard` per step, with `TextReveal`/`Reveal` scroll reveals and count-up
    on numeric-leading metrics. Quiet gradient backdrop only (starfield/flight-path removed).
  - Data renamed in `caseStudies.ts`: `stops → steps`, `CaseStudyStop → CaseStudyStep`, `StopKind →
    StepKind` (both instances). Content still placeholder.

## 2026-06-12 — Node subpages + three new library components

Each orbiting node now opens into a distinct, real subpage (rendered as `SceneLightbox` panel content,
switched per node by `NodeSubpage` — no routing; the fly/collapse still opens into it). Built one pass.

- **Library-first rule (Timmy):** every new reusable component/variant built for the portfolio ships in
  the toolkit (export + `catalog.ts` + a playground demo), and the portfolio imports it from
  `@umbra/motion`. Three new toolkit components from this work:
  - **`DecodeText`** (Text) — resolves text out of flickering glyphs (a "decrypt" effect); token-driven,
    reduced-motion → plain text. (Timmy's "AnimatedNumber reveal for words" → reinterpreted as decode.)
  - **`SkillRadar`** (Data) — hand-built SVG polygon radar; reveal = grid/axes **draw-on** → shape
    **springs** from center → **sweep** line passes once. Deliberately stylized, not a literal metric.
  - **`SpiralGallery`** (Continuous & layout) — generic orbiting-spiral index: cards orbit + recycle,
    wheel boosts the orbit, hover eases it to a stop (catchability), + a list fallback, legend, featured
    markers. Reduced motion / mobile → list.
- **Subpages (portfolio compositions over the library pieces):** Resume → **Agent Dossier** flip card
  (ImageReveal photo, DecodeText codename/name/status, AnimatedNumber stats, SkillRadar; back = Mission
  Log + Credentials/Loadout tabs). Automations → **AutomationsSpiral** (wraps `SpiralGallery`). Umbra +
  Meeting OS → **CaseStudyJourney** (one scroll template, two data instances): briefing outcome up front,
  per-stop reveals over a sticky parallax starfield + a flight-path marker that tracks scroll; reduced
  motion → a plain readable document.
- **`SceneLightbox` plumbing:** added `onClosed` (fires when the close finishes) and a `useScenePanelRef()`
  hook exposing the panel's scroll container, so subpages scope Motion `useScroll`/`SmoothScroll`/inView
  `root` to the panel. Content wrapper now `minHeight:100%` (was `height:100%`) so tall journeys scroll.
- **Deselect-on-exit fix:** the close focus-restore re-fired the orbit card's `onFocus → setHover`,
  re-pausing the orbit. Fixed with a ~350ms suppress-hover window after close (+ `onClosed` clears the
  active node). Orbit now resumes after exiting.
- Content is placeholder (in `app/_data/{dossier,systems,caseStudies}.ts`); real copy/photo/PDF + a
  `public/` photo/PDF drop in later. Toolkit now 23 components.

## 2026-06-12 — Cinematic node-open transitions: a `SceneLightbox` component

The portfolio nodes' open animation reads as a flat popup (only the panel moves). Replaced it with two
scene-coupled transitions that move the *whole scene*, shipped as a new toolkit component.

- **`SceneLightbox`, a new component — not an extension of `Lightbox`.** `flythrough` (the camera flies
  into the node with `near`/`far` parallax) and `collapse` (the orbit spins up, contracts to center,
  beats, then the node blooms out as the others scatter) can't be done by a generic overlay. So
  `SceneLightbox` owns one eased `progress` MotionValue that drives the panel FLIP, the camera layers,
  and — via a `useSceneTransition()` context — the host scene. Close always plays the open in reverse.
- **Token rule preserved.** All timing (duration/easing/spring) comes from the active preset; only
  spatial/choreography constants (scale targets, phase fractions, blur) are literals, kept in one config
  object per variant. Reduced motion → a soft `duration.fast` crossfade, no camera/orbit motion.
- **`Lightbox` (expand/zoom) stays** for simple card→panel uses. Portfolio nodes now use `flythrough`×2
  + `collapse`×2 — `zoom` is superseded by `flythrough`; `expand` is kept in the library but unused on
  nodes (per Timmy: "flythrough is what I wanted zoom to do").
- **Required root-cause fixes** (else the transition fights the orbit): the orbit's rAF loop is parked
  while a node is opening/open (re-renders off `progress` instead) and resumes with `elapsed` intact;
  the panel FLIPs off the clicked card's captured rect, never the React-rewritten orbit element.
- **Testable in the design tool:** the playground `SceneLightbox` demo ships a self-contained mini-orbit
  scene (starfield `far` + 4 cards `near` that read `useSceneTransition`) so flythrough/collapse show.
- **Minor orbit fix:** dotted node-orbit path dots now sit in a z-band below the cards and fade out near
  each node (smoothstep on angular distance), so they only show along the arcs between nodes.

## 2026-06-12 — Edit pass round 1, variant system, and the portfolio MVP

A large session across three tracks. Highlights:

- **Duration scale → 4 tokens, slower.** Dropped `instant`; `DurationToken = fast|base|slow|cinematic`.
  calm `220/520/1000/1700`, expressive `180/440/850/1450` (was 5 tokens, too tight + not slow enough).
  System-wide; tests + playground `DURATIONS` updated. StatBar now defaults to `cinematic`.
- **Two diagnosed bugs fixed.** (1) `Reveal` slide offset persisted when switching variant without a
  remount → every variant's `animate` now returns the full neutral target `{opacity,x:0,y:0,scale:1}`.
  (2) Scroll demos were flaky inside the playground's `overflow-auto` box (window-viewport
  `whileInView`) → added an optional scroll **`root`** to Reveal/ImageReveal/TextReveal/Stagger/
  AnimatedNumber/StatBar (and StickyScene/SmoothScroll got `root`/`container`), threaded the box ref
  through the registry. Fires + resets reliably now.
- **Backgrounds reworked.** New **`Aurora`** component (northern-lights vertical light curtains,
  `screen` blend, `interaction: auto|cursor|scroll`). `AnimatedGradient` rebuilt with the same
  interaction modes + livelier default drift. `GrainOverlay` flicker made perceptible (noise as a CSS
  mask over a `color` tint; stepped mask-position keyframe). **`DotGrid` → constellation by default**
  (drifting particles linking to neighbours + the cursor) with a `variant: 'constellation' | 'dots'`
  fallback + editable color/gap/linkDistance. `BeamGrid` got more, glowing, varied beams. Background
  category is now **5** (Aurora added), just over the soft 2–4 cap — accepted.
- **Playground legibility.** Per-component `note`s; contained StickyScene + SmoothScroll demos;
  Magnetic hit-area made visible; Marquee width contained; easing-editor handles clipped to the box;
  button hover-glow; MotionProvider demo now a looping cluster that visibly re-feels on preset flip.
- **Variant system (infrastructure).** New third layer: **looks** (`look` prop) + **signatures**
  (compositions). Rule that keeps "no raw values": a look's **motion = token keys** (still
  preset-driven); its **visuals = concrete curated values** (looks are the sanctioned home for literal
  design values; primitives stay neutral). Framework-agnostic visuals (inline style/CSS vars, never
  Tailwind). Shipped the schema (`looks/looks.schema.ts` + `applyLook`), one reference look
  (`Reveal.looks.ts` → `editorial`) wired into `Reveal`'s new `look` prop, a worked signature
  (`signatures/HeroTitle.tsx`), and catalog support (`looks?` field + a **Signatures** category). The
  concrete look library is deferred — Timmy is designing it.
- **Portfolio MVP (parallel track, the dogfooding surface).** Landing page only: a deep-space hero
  where four project **notecards** (Résumé · Umbra · Meeting OS [Coda ops] · Automations) orbit a
  central **"Timmy's Portfolio"** title on a diagonal ring, passing in front of and behind it (depth
  via scale/opacity/z-order); hover selects + freezes. Built from real Umbra backgrounds (Aurora +
  constellation DotGrid + GrainOverlay) — proving the toolkit. **Deep-space-minimal** default with a
  bottom **Minimal ⇄ Aurora** toggle (also flips the motion preset calm↔expressive). Brief: Timmy is
  job-hunting in **business tech / systems / automation** (Make, Zapier, Coda, n8n). Fonts: Sora /
  Hanken Grotesk / JetBrains Mono. Placeholders remain (surname, final project names, node links).

## 2026-06-10 — Duration scale re-spaced + resettable scroll demos

- **Wider duration steps.** The old scale was too tight to tell `fast`/`base`/`slow` apart and `slow`
  didn't read as slow. Re-tuned to ~2× steps: **calm** `0/160/400/850/1400`, **expressive**
  `0/140/340/700/1200`. Affects the whole product feel (intended — the scale is core). The css-vars
  test's expected `--umbra-duration-base` moved 440→400ms.
- **Scroll demos reset.** In Scroll mode the registry passes `once={false}`, so inView components
  re-hide on scroll-up and re-reveal on scroll-down (scroll back and forth to judge them).
  `AnimatedNumber` (imperative) now resets `count` to `from` when out of view so it re-counts.
- `LoopDemo` interval 2000→2500ms to fit the longer `cinematic`.

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
