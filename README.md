# innerloop.work

Personal portfolio site for Timmy Lei — GTM Engineer, automation builder, and AI systems tinkerer.

**Live site:** [innerloop.work](https://innerloop.work)

---

## What's here

A portfolio built to show work, not describe it. The site has three main sections:

**Systems Library** — a bento grid of projects spanning AI agents, no-code automations, and production tools. Each card flips to reveal how the system works, what it's built on, and what problem it solves.

**Case Studies** — deeper writeups on select projects, including a Coda-based volunteer tracking system built for a nonprofit and a motion design component library.

**Dossier** — a resume subpage with a spy-agent aesthetic. Front shows summary and contact info; back has full work history and credentials.

---

## Stack

- **Next.js** (App Router) — framework
- **React + TypeScript** — components
- **Motion (motion.dev)** — animations and transitions
- **Umbra** — custom token-driven animation component library built alongside this site
- **Tailwind CSS** — utility styling
- **Vercel** — deployment, connected to this repo on `main`
- **Porkbun** — domain registrar for innerloop.work

---

## Structure

- app/ — Next.js App Router pages and layouts
- components/ — page-specific and shared React components
- public/ — static assets
- styles/ — global CSS and Tailwind config

---

## Deploy

Auto-deploys to Vercel on every push to `main`. No manual deploy step needed.

To run locally:

1. Clone the repo
2. Install deps: `pnpm install`
3. Run: `pnpm dev`

---
