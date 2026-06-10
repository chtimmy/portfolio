# Backlog

Parked ideas — kept out of v1 to keep the system small and coherent (a tight 9-component set beats
a sprawling one). Pull from here in a later pass when something earns its place.

## Components not shipped in v1
- **PageTransition** — route-change choreography. High payoff but fiddly in the Next App Router;
  add deliberately, not as filler.
- **Spotlight** — cursor-follow glow/light. Risks reading as a generic, overused AI-default effect;
  only add if a specific layout calls for it.
- **Accordion** — spring-physics expand/collapse. Useful UI primitive; add when a real surface
  (FAQ, project details) needs it.

## Fast-follows on shipped components
- `Reveal`: optional blur-in and clip variants.
- `TextReveal`: gradient/word-highlight option; per-line masking.
- `Marquee`: vertical direction; gradient edge-fade mask.
- `TiltCard`: optional glare/sheen layer.
- Component-level unit tests with a jsdom + Testing Library setup (currently pure-logic only).
