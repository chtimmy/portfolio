# Backlog

Catalog items not yet built, kept by category so v1.x batches stay coherent. v1 ships **19
components across 8 categories** (see `catalog.ts` / the `/components` gallery). Pull from here when
something earns its place.

## Unbuilt catalog components, by category
- **Entrance & reveal:** `BlurReveal` (content sharpens into focus)
- **Text:** `TextScramble` (decode into place), `GradientText` (animated color sweep)
- **Scroll-driven:** `ScrollVelocity` (skew/react to scroll speed)
- **Hover & cursor:** `Spotlight` (cursor glow across cards), `CursorFollower` (custom cursor),
  `HoverImageTrail` (images trail the cursor over a link list)
- **Background & ambient:** `Particles` (physics dot field — `DotGrid` is the simpler interactive one)
- **Data & numbers:** _category complete for v1 (`AnimatedNumber`, `StatBar`)_
- **Continuous & layout:** `AnimatedTabs` (sliding indicator), `InfiniteCarousel` (auto-advancing loop)
- **Navigation & transitions:** `PageTransition` (route choreography — the portfolio will want it),
  `AnimatedMenu` (staggered overlay nav)

## Fast-follows on shipped components
- `Reveal`: blur-in and clip variants.
- `TextReveal`: gradient/word-highlight option; per-line masking.
- `Marquee`: vertical direction; gradient edge-fade mask.
- `TiltCard`: optional glare/sheen layer.
- `SmoothScroll`: a true momentum/inertia engine (Lenis-style) behind the same component; current
  version eases in-page anchors only.
- Component-level tests with a jsdom + Testing Library setup (currently pure-logic tests only).
