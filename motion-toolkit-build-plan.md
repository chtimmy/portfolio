# Motion Toolkit — Build Plan

> **For Claude Code:** Work one phase at a time. Do not start a phase until the previous phase's "Definition of Done" is fully met. Ask before making architectural changes that deviate from this plan. Keep a running `DECISIONS.md` log of anything resolved during the build.

---

## What this is

A **motion component toolkit**: a set of design tokens that define an animation language (durations, easings, springs, stagger rhythms) plus a library of React components driven by those tokens — distributed shadcn-style (copy the code into your project) with a live playground site.

The toolkit is then used **by hand** to build the personal portfolio website. The two deliverables prove two different things:

| Deliverable | Proves |
|---|---|
| The toolkit (tokens + components + playground) | Front-end **engineering**: component architecture, animation systems, design-system thinking, DX |
| The portfolio site built with it | Design **craft**: "this person made something genuinely beautiful" |

**Success condition (from prior strategy work):** the toolkit is the engineering flex, but the portfolio site is the design flex. If the site looks merely fine, the design dimension is still empty no matter how clever the tool is. The site is the deliverable; the tool is the story behind it.

---

## Locked decisions

- **Stack:** React 19 + TypeScript + Vite (toolkit), Next.js (playground + portfolio site)
- **Animation engine:** Motion (motion.dev, the library formerly known as Framer Motion). React-first, declarative, springs built in, huge ecosystem recognition. GSAP is ruled out for v1 — licensing nuance and imperative API don't fit a token-driven React library.
- **Styling:** Tailwind CSS v4 (tokens exposed as CSS variables so they work with or without Tailwind)
- **Distribution:** shadcn-style registry (copy-paste into the consumer's codebase), NOT an npm package for v1. Reasons: it's the modern standard recruiters/engineers recognize, components stay editable by the consumer, and it avoids semver/publishing overhead. An npm wrapper can come later if there's demand.
- **Docs:** custom Next.js playground, not Storybook. The playground itself is built with the toolkit, so it doubles as a design proof and dogfooding exercise.
- **Accessibility is a feature, not a checkbox:** every component respects `prefers-reduced-motion` via a single shared hook. This is a differentiator — most motion libraries punt on it.

## Open decisions (resolve in Phase 0)

1. **Token preset names and count** — e.g. three personalities like `calm`, `snappy`, `expressive`. Pick names that read well in code.
2. **Monorepo vs. single repo** — pnpm workspace with `packages/toolkit`, `apps/playground`, `apps/portfolio`, vs. separate repos. Default recommendation: one pnpm monorepo (single GitHub link to share, easier dogfooding).
3. **Component shortlist for v1** — pick 8–10 from the menu in Phase 2; cut anything that doesn't earn its place.

---

## Phase 0 — Foundations (≈ a weekend)

- Scaffold the monorepo: pnpm workspaces, TypeScript strict, ESLint/Prettier, Vitest.
- `packages/toolkit` with Motion + Tailwind v4 wired up.
- `apps/playground` Next.js app rendering one dummy component from the toolkit.
- Write `tokens.schema.ts`: the TypeScript shape of the motion token system (no values yet, just the contract).
- Resolve the three open decisions above; log them in `DECISIONS.md`.

**Definition of Done:** repo builds clean, playground renders a toolkit component with hot reload across the workspace boundary, token schema is typed and reviewed.

---

## Phase 1 — The motion token system (the core idea)

This is what makes it a *system* rather than a folder of components.

- **Token categories:**
  - `duration` scale (e.g. instant / fast / base / slow / cinematic)
  - `easing` set (named cubic-beziers with personality, not just "ease-in-out")
  - `spring` configs (stiffness/damping/mass presets)
  - `stagger` rhythms (per-child delay scales)
  - `distance` scale (how far things travel: subtle / base / dramatic)
- **Presets:** 2–3 complete personalities (the open decision from Phase 0). Switching preset changes the feel of every component at once.
- **`MotionProvider`:** React context that injects the active preset; also exposes tokens as CSS variables for non-Motion use.
- **`useReducedMotion` integration:** one hook, consumed by everything; reduced mode collapses transforms to opacity-only fades.
- Unit tests on token resolution and preset switching.

**Definition of Done:** a demo page where toggling the preset visibly changes the personality of 2–3 test animations, with zero component-level code changes. Reduced-motion mode verified in-browser.

---

## Phase 2 — Component primitives

Build in two batches. Every component: token-driven (no hardcoded durations/easings), typed props, reduced-motion behavior, and a usage example.

**Batch 1 — the workhorses (build all):**
- `Reveal` — scroll-triggered entrance (fade/slide/scale variants)
- `TextReveal` — split text animating by character/word/line with stagger
- `Stagger` — orchestration wrapper that cascades children
- `AnimatedNumber` — counting/odometer effect

**Batch 2 — the showpieces (pick 4–6):**
- `Marquee` — infinite scroll strip
- `Parallax` — scroll-linked depth
- `Magnetic` — cursor-attracted buttons/elements
- `TiltCard` — pointer-tracked 3D tilt
- `PageTransition` — route-change choreography
- `Spotlight` / cursor-follow effect
- `Accordion` — spring-physics expand/collapse
- `ImageReveal` — clip-path/mask entrance for media

**Definition of Done:** 8–10 components, each demoed on a playground page, each behaving correctly with reduced motion on, each working under every preset. No component contains a raw duration or easing value.

---

## Phase 3 — Playground & distribution (what makes it a "tool")

- **Playground site:** one page per component with a live demo, a **token control panel** (switch preset, tweak individual tokens, watch everything respond live), and a copy-code block.
- **Registry:** shadcn-style `registry.json` + component source endpoints so anyone can run `npx shadcn add <url>` to pull a component into their project. Test the install flow in a fresh throwaway app.
- **Docs content:** short "philosophy" page (why motion tokens), install instructions, per-component API tables.

**Definition of Done:** a stranger with a Next.js app can install and use a component in under 5 minutes following only the docs. Token panel works on every component page.

---

## Phase 4 — Ship & package the story

- Polish the GitHub repo: README with GIFs, architecture overview, the token-system rationale.
- Record a **Loom walkthrough**: the playground, a preset switch, and a live registry install into a blank project.
- Write the **case study** (same packaging pattern as the lead-capture build): problem → system design → decisions → result. Frame: "I designed an animation language, then engineered the system that enforces it."
- Deploy playground to Vercel with a real domain or clean subdomain.

**Definition of Done:** public repo, live playground URL, Loom recorded, case study drafted. The toolkit is now a complete portfolio piece on its own — *before* the portfolio site exists.

---

## Phase 5 — The portfolio site (the design flex)

Hand-built with the toolkit. This phase is a **design project first, coding project second** — budget real time for art direction before writing code.

- **Design direction pass (do this before any code):** collect 5–10 reference sites (Awwwards, godly.website, minimal.gallery), define palette, type pairing, and the one signature motion moment the site will be remembered by. Spend boldness in one place; keep everything else disciplined.
- **Content:** case studies for the Coda volunteer system, the lead-capture automation, the GitHub→YouTube system (whatever state it's in), and the motion toolkit itself — the meta-story of "this site was built with a tool I built" goes on the homepage.
- **Quality floor:** responsive to mobile, keyboard focus visible, reduced motion respected, Lighthouse performance ≥ 90 (motion sites die on jank — animate transforms/opacity only).
- Deploy to Vercel on a personal domain.

**Definition of Done:** site is live, every case study reads outcome-first with technical depth underneath, and the honest gut-check passes: would someone landing on it think "this looks great" within 5 seconds?

---

## Phase 6 — Monetization layer (the lead-to-cash system)

Only begins after Phase 5 ships. This phase doubles as the **production full-stack portfolio piece** (auth + database + payments), so it replaces the need for a separate "business tool with Stripe" build.

- **Model:** free open-source core (everything from Phases 1–3 stays free forever — it's the portfolio piece and the distribution engine) + paid **Pro tier**, cheap one-time purchase (~$29–79): premium showpiece components, full page sections/templates, and optionally the portfolio-site template itself.
- **Market comps:** Aceternity UI, Magic UI — same free-core/paid-pro structure, validation that this market pays.
- **Build scope:**
  - Auth (GitHub OAuth or magic link)
  - Stripe Checkout + webhooks (purchase event → access provisioning, refund event → revocation)
  - Database (Supabase or Postgres on Vercel) for customers, purchases, license/access state
  - Gated delivery: authenticated registry URL (shadcn supports tokenized private registries) or gated repo/download access
  - Minimal customer dashboard: purchase status, access token, receipt
- **Decision point:** Stripe direct vs. merchant of record (Lemon Squeezy / Polar / Paddle). MoR handles global VAT for you; Stripe direct is more work but a far stronger engineering artifact. Default: **Stripe direct**, since proving the payments build is half the point.
- **Distribution reality check:** sales require audience. Plan a lightweight motion: post components/demos publicly (X, r/webdev, etc.) as they ship from Phase 2 onward, so launch isn't to an empty room. Revenue is a bonus; the payments system and "I have paying customers" are the guaranteed returns.

**Definition of Done:** a stranger can pay and receive Pro access end-to-end with zero manual steps; webhook handles purchase and refund correctly in live mode; the flow is documented as a case study ("lead-to-cash system I built and operate").

---

## Sequencing & guardrails

- **Job applications do not wait for this.** The Coda system + lead-capture case study + a simple interim page (even a Notion page) carry applications starting now. The toolkit and site upgrade the story; they don't gate it.
- Realistic part-time pace: Phases 0–2 ≈ 2–3 weeks, Phase 3 ≈ 1 week, Phase 4 ≈ a few days, Phase 5 ≈ 1–2 weeks (design time included). Roughly 5–7 weeks total alongside work.
- **Scope discipline:** v1 ships with 8–10 components, not 25. A small system that feels coherent beats a big one that feels assorted. Park extra component ideas in a `BACKLOG.md`.
- **No payments before product.** Phase 6 doesn't start until the free toolkit and the portfolio site are live. The paygate monetizes something real; building it first inverts the order.
- **Portfolio slot accounting:** with Phase 6, this project covers both the design/front-end dimension AND the full-stack/payments dimension. The previously planned standalone "business tool" is no longer required — it can stay parked as an optional application-specific build later.
- If Phase 5's design isn't landing, that's a signal to iterate on references and direction — not to add more animation. Restraint reads as craft.
