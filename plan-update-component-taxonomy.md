# Plan Update — Component Taxonomy (Phase 2)

> **For Claude Code:** Apply this as an edit to `motion-toolkit-build-plan.md`. Do NOT rewrite the plan. Replace the "Batch 1 / Batch 2" component lists inside Phase 2 with the categorized catalog below. The component creation workflow section stays exactly as is. Also update Open Decision #3 to read: "Component shortlist for v1 — pick 8–10 from the catalog, covering at least 5 categories, max 2 per category."

---

## Component catalog by category

v1 ships 8–10 components total. The categories exist so the library covers the anatomy of a real website (things appear → text speaks → scroll moves → pointer plays → background breathes), not so every category gets built. Asterisks (*) mark the recommended v1 pick(s) per category.

### 1. Entrance & reveal — *how elements appear*
The workhorses. Used dozens of times per page; they make a site feel alive at all.
- `Reveal`* — scroll-triggered fade/slide/scale entrance (THE foundational component, build first)
- `ImageReveal`* — clip-path/mask wipe for images and media
- `BlurReveal` — content sharpens into focus

### 2. Text animation — *how words speak*
Highest visual impact per effort. Headlines are where motion personality shows most.
- `TextReveal`* — split by character/word/line, staggered entrance
- `RotatingText` — a word in a sentence cycles ("I build websites / systems / tools")
- `TextScramble` — characters decode into place (techy feel)
- `GradientText` / shimmer — animated color sweep across text

### 3. Scroll-driven — *animation tied to scroll position*
Different from category 1: these track scroll continuously rather than triggering once. This is what makes a site feel "expensive."
- `Parallax`* — layers move at different speeds for depth
- `ScrollProgress` — reading-progress indicator
- `StickyScene` — element pins while content scrolls past (Apple-style)
- `ScrollVelocity` — elements skew/react to scroll speed

### 4. Hover & cursor — *how the site responds to the pointer*
Desktop-only delight (must degrade gracefully on touch). Small components, big perceived craft.
- `Magnetic`* or `TiltCard`* (pick one for v1) — elements attracted to cursor / 3D pointer-tracked tilt
- `Spotlight` — glow that follows the cursor across cards
- `CursorFollower` — custom cursor element
- `HoverImageTrail` — images trail behind cursor over a link list

### 5. Background & ambient — *how the page breathes*
One good ambient background does enormous aesthetic lifting for a hero section.
- `AnimatedGradient`* — slowly shifting mesh/aurora gradient
- `Particles` / `DotGrid` — interactive dot field
- `GrainOverlay` — animated noise texture (subtle, filmic)
- `BeamGrid` — lines/beams tracing a grid

### 6. Data & numbers — *how stats land*
Small category, but portfolio/business sites always need it.
- `AnimatedNumber`* — count-up/odometer triggered on view
- `StatBar` — animated progress/percentage bars

### 7. Continuous & layout motion — *elements that move on their own or reflow*
- `Marquee`* — infinite scrolling strip (logos, tech-stack lists)
- `Accordion` — spring-physics expand/collapse
- `AnimatedTabs` — sliding active-indicator tabs
- `InfiniteCarousel` — auto-advancing card loop

### 8. Navigation & transitions — *moving between states and pages*
Most complex category; fine to defer to v1.1 except where marked.
- `PageTransition` — route-change choreography (consider for v1 — the portfolio site will want it)
- `AnimatedMenu` — staggered mobile/overlay nav reveal
- `SmoothScroll` — eased anchor scrolling wrapper

### Orchestration utilities (not visual components — part of the toolkit core)
- `Stagger`* — wrapper that cascades any children (powers half the categories above)
- `MotionProvider` — token/preset context (already specified in Phase 1)

---

## Recommended v1 cut (9 components, 7 categories)

`Reveal`, `ImageReveal`, `TextReveal`, `Parallax`, `Magnetic` OR `TiltCard`, `AnimatedGradient`, `AnimatedNumber`, `Marquee`, `PageTransition` — plus the `Stagger` utility.

Everything else goes to `BACKLOG.md` with its category label so v1.1 batches stay coherent.
