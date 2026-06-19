export interface ProjectLink {
  label: string;
  href: string;
}

export interface ProjectDetail {
  /** One-line framing shown under the title in the panel. */
  tagline: string;
  /** Body paragraphs. */
  body: string[];
  /** Short highlight bullets. */
  highlights?: string[];
  /** Tools / stack chips. */
  tools?: string[];
  /** Calls to action / external links. */
  links?: ProjectLink[];
}

export interface Project {
  id: string;
  /** Node name (display). */
  name: string;
  /** Mono telemetry line — the "what kind of thing" label. */
  kind: string;
  /** One line shown when the node is selected in the orbit. */
  blurb: string;
  /** How its subpage opens/closes (two cinematic scene transitions, split 2/2). */
  openAnim: 'expand' | 'flythrough' | 'collapse';
  /** Subpage content. */
  detail: ProjectDetail;
}

// Four featured projects orbiting the core. Two fly the camera in (`flythrough`), two collapse the
// orbit into the panel (`collapse`) — split 2/2 so the two cinematic feels can be compared.
export const projects: Project[] = [
  {
    id: 'resume',
    name: 'Resume',
    kind: 'Profile · who I am',
    blurb: 'An overview of my background, experience, and what I do',
    openAnim: 'collapse',
    detail: {
      tagline: 'Operations & automation for business — and the systems behind them.',
      body: [
        'I help businesses run efficiently: I find the manual, repetitive work and turn it into systems that run on their own.',
        'Right now I’m at an early-stage music startup handling artist acquisition, business development, and the internal systems that let a small team scale.',
        'Before that I was an executive assistant at a nonprofit, where I ran internal communications and built the automations that took busywork off the CEO’s plate.',
      ],
      highlights: [
        'Music startup — artist acquisition, BD, and scaling systems',
        'Nonprofit EA — internal comms + automations for the CEO',
        'Earlier: sales and live-music events',
      ],
      tools: ['Coda', 'Make', 'Zapier', 'n8n', 'Notion', 'Google Workspace'],
      links: [
        { label: 'Email me', href: 'mailto:chtimmy02@gmail.com' },
        { label: 'Resume (PDF)', href: '#' },
      ],
    },
  },
  {
    id: 'umbra',
    name: 'This Portfolio',
    kind: 'Case Study · motion design',
    blurb: 'A dive into how this stunning masterpiece was created',
    openAnim: 'collapse',
    detail: {
      tagline: 'A token-driven motion design system for React — and the engine behind this site.',
      body: [
        'Umbra is a toolkit of animated React components that all read from one set of motion tokens, so switching a single “preset” re-feels the entire interface at once.',
        'It’s the engineering half of this portfolio: the orbit you just clicked, the constellation field — all Umbra components.',
        'Built with React 19, Next 16, Motion, and Tailwind v4, and designed to ship as a shadcn-style component registry.',
      ],
      highlights: [
        '21 components across 9 categories',
        'Two motion presets (calm / expressive) + reduced-motion built in',
        'A “looks” variant layer for personal styling',
      ],
      tools: ['React', 'Next.js', 'Motion', 'TypeScript', 'Tailwind'],
      links: [{ label: 'Explore the components', href: '#' }],
    },
  },
  {
    id: 'meeting-os',
    name: '1on1 Meeting Tracker',
    kind: 'Case Study · Coda System',
    blurb: 'A deep dive on a system that tracks 80+ volunteers’ performance over time',
    openAnim: 'collapse',
    detail: {
      tagline: 'A Coda system that turns employee 1:1s into a live read on the whole team.',
      body: [
        'At the nonprofit, the CEO needed to know where every employee stood without sitting in every meeting.',
        'I built a Coda system that records and summarizes each 1:1’s transcript into a short status the CEO can scan — and automatically schedules the next round so meetings never slip.',
        'It turned a recurring manual chore into a self-running loop.',
      ],
      highlights: [
        'Auto-summarized meeting transcripts → a CEO-readable status',
        'Automated scheduling + reminders',
        'One source of truth for team progress',
      ],
      tools: ['Coda', 'Make', 'AI summarization'],
      links: [{ label: 'Ask me how it works', href: 'mailto:chtimmy02@gmail.com' }],
    },
  },
  {
    id: 'automations',
    name: 'Automations & AI Systems',
    kind: 'Library of Flows',
    blurb: 'No-code automations and AI systems that capture data, route it, and act on it',
    openAnim: 'collapse',
    detail: {
      tagline: 'No-code automations and AI-powered systems that capture data, route it, and act on it — so the busywork runs itself.',
      body: [
        'I build no-code automations and AI-powered systems that capture data, route it between tools, and act on it — so the busywork runs itself.',
        'Each one is a few minutes saved per day that compounds across a whole team.',
      ],
      highlights: [
        'Cross-tool data sync (Sheets ↔ CRM ↔ docs)',
        'Automated notifications & reminders',
        'Lightweight internal dashboards',
      ],
      tools: ['Make', 'Zapier', 'Claude Code', 'Python'],
      links: [{ label: 'Email me', href: 'mailto:chtimmy02@gmail.com' }],
    },
  },
];
