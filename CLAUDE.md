# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Umbra** is a motion component toolkit (token-driven React components powered by [Motion](https://motion.dev)) **and** the personal portfolio site built with it. The two prove different things: the toolkit is the front-end *engineering* flex (animation system, DX, component architecture); the portfolio is the *design* flex. The portfolio is the deliverable; the toolkit is the story behind it.

The full phased plan is in `motion-toolkit-build-plan.md`; resolved decisions are in `DECISIONS.md`. **Work one phase at a time — don't start a phase until the previous one's Definition of Done is met, and ask before architectural changes that deviate from the plan.** Current phase: **Phase 0 complete** (monorepo scaffold) → next is Phase 1 (the motion token system).

## Layout (pnpm monorepo)

```
packages/toolkit   @umbra/motion — the library: token system + components (Vite build)
apps/playground    Next.js — live component playground / dogfooding surface (port 3000)
apps/portfolio     Next.js — the portfolio site, built in parallel (port 3001)
```

The apps consume the toolkit **from source**: `@umbra/motion`'s `exports` point at `src/index.ts`, and each app sets `transpilePackages: ['@umbra/motion']` in `next.config.ts`. That's what gives cross-workspace hot reload — edit `packages/toolkit/src` and both apps update live. The Vite `dist/` build exists only for external distribution (npm / the Phase 3 shadcn-style registry).

**Components (9, in `packages/toolkit/src/components`):** `Reveal`, `TextReveal`, `Stagger`, `AnimatedNumber` (workhorses) + `Marquee`, `Parallax`, `ImageReveal`, `TiltCard`, `Magnetic` (showpieces). Entrance components default to `trigger="inView"`; pass `trigger="mount"` to animate immediately. All are demoed at the `/components` route in the playground. Parked component ideas live in `BACKLOG.md`.

## Commands

pnpm is installed user-local at `~/Library/pnpm/bin` (the installer couldn't write `~/.zshrc`). If `pnpm` isn't on your PATH, add `export PATH="$HOME/Library/pnpm/bin:$PATH"` to your shell profile.

```bash
pnpm install                      # install all workspaces
pnpm dev                          # run playground + portfolio together
pnpm dev:playground               # playground only (:3000)
pnpm dev:portfolio                # portfolio only (:3001)
pnpm -r build                     # build toolkit lib + both apps
pnpm -r typecheck                 # tsc --noEmit across workspaces
pnpm --filter @umbra/motion test  # toolkit unit tests (Vitest)
pnpm --filter @umbra/motion test -- <pattern>   # a single test file/name
pnpm lint                         # eslint
pnpm format                       # prettier --write
```

## The one rule that defines the system

**Components never hardcode a raw duration, easing, distance, spring, or stagger value.** They read a *token key* from the contract in `packages/toolkit/src/tokens/tokens.schema.ts` (e.g. `duration.base`, `easing.standard`), and the active preset (`calm` / `expressive`) supplies the value. This is what makes Umbra a *system* rather than a folder of animations — switching the preset re-feels every component at once. A component with a literal `0.3` in a transition is a bug.

Every component also: has typed props, respects `prefers-reduced-motion` (via the shared `useReducedMotion` — reduced mode collapses transforms to opacity-only fades), and ships a usage example.

Token consumption is centralized: read tokens through `useMotionTokens()` / the `useEntrance` helper (and its pure `resolveEntrance`), wrapped by a `MotionProvider`. Preset values live in `packages/toolkit/src/tokens/presets.ts`.

## Stack

React 19 · Next.js 16 · Motion 12 · Vite 8 · Tailwind CSS v4 (CSS-first `@theme`; tokens will be exposed as CSS variables so they work with or without Tailwind) · Vitest · TypeScript strict. Distribution target (Phase 3) is a shadcn-style registry, not an npm package, for v1.

## Context Store (Obsidian vault)

Durable, user-facing project knowledge lives in Timmy's Obsidian vault, not in this repo:

- **Vault:** `/Users/timmylei/Documents/Obsidian Vault`
- **Claude context folder:** `Umbra/` inside that vault (plain markdown — access it directly with file tools; no plugin or server needed)
- **This project's note:** `Umbra/Projects/Umbra Design.md`

**At the start of a session**, read `Umbra/_Context.md` (the short, canonical index), `Umbra/About Me.md` (who Timmy is and how he likes to work), and this project's note for current goal, status, and recent decisions.

**As you learn something durable** (a decision, a constraint, a status change, a learning), update the relevant note under `Umbra/Projects/` **and** refresh the one-line snapshot for it in `Umbra/_Context.md`. Keep `_Context.md` short — it costs tokens every session; detail belongs in the linked notes. Notes use `[[wikilinks]]` and the structure in `Umbra/Projects/_Template.md`. Don't create or overwrite vault notes wholesale without asking; append and refine. Mirror resolved technical decisions into `DECISIONS.md` here.

## Skills

Lean on the **frontend-design** skill for design-craft work — Phase 1 (defining the *feel* of the two presets) and especially Phase 5 (portfolio art direction: palette, type, the one signature motion moment). It's not needed for scaffolding or wiring.
