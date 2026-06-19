// The "Systems Library" data for the Automations & AI Systems node — the small AI systems +
// automation builds, shown as a bento grid of cards that flip + expand to a detailed "back".
//
// SINGLE SOURCE OF TRUTH: no card content is hardcoded in components. Architecture is structured
// data (nodes + edges) rendered by the shared ArchitectureDiagram — `builtWith` is a build-time
// footnote, never a runtime node in the flow (exception: Sheet Cleaner *runs on* Claude Code, so it
// appears as a node, not a footnote). Daytrading is the `extended`-back card; the 1-on-1 Meeting
// Tracker links to its full case study.

export type SystemCategory = 'ai-system' | 'automation' | 'case-study';

/** Bento shape: `wide` = horizontal (2×1), `tall` = vertical (1×2), `sm` = standard (1×1). */
export type SystemSize = 'wide' | 'tall' | 'sm';

/** Architecture node role → drives the diagram's color (ai=teal, core=indigo, rest=neutral). */
export type ArchRole = 'trigger' | 'interface' | 'core' | 'ai' | 'store';

export interface ArchNode {
  id: string;
  label: string;
  role: ArchRole;
  /** Optional platform sublabel shown under the node (e.g. "on Railway"). */
  host?: string;
}

export interface ArchEdge {
  from: string;
  to: string;
  /** Arrowheads on both ends when true. */
  bidirectional?: boolean;
  /** Optional label on the connector. */
  label?: string;
}

export interface Architecture {
  /**
   * `linear` = left-to-right chain (default); `hub` = one central node with spokes around it;
   * `branch` = left-to-right tree that forks (follows `edges` from the root); `converge` = fan-in →
   * spine → fan-out hourglass (sources merge into a spine that fans back out to sinks).
   */
  layout?: 'linear' | 'hub' | 'branch' | 'converge';
  /** Runtime nodes. Never include the build tool here (that's `builtWith`). */
  nodes: ArchNode[];
  edges: ArchEdge[];
  /** Optional automated trigger / cadence — rendered as a prominent timer block. */
  schedule?: string;
  /** Build-time footnote/badge shown bottom-right, outside the flow (e.g. "Claude Code"). */
  builtWith?: string;
}

/** The back's flexible visual slot — an architecture diagram or a screenshot. */
export type CardVisual =
  | { type: 'diagram'; data: Architecture }
  /** `width` = optional CSS width (e.g. '50%') to shrink + center the image; defaults to full width. */
  | { type: 'image'; src: string; alt: string; width?: string };

export interface SystemCard {
  id: string;
  title: string;
  /** lucide-react icon name (resolved to a component in the bento via an icon map). */
  icon: string;
  category: SystemCategory;
  /** Bento shape — drives the grid hierarchy. */
  size: SystemSize;
  /** Tools the build runs on — front chips (keep to 2–3). */
  tools: string[];
  /** Highlighted with a ★ + subtle glow. */
  featured?: boolean;
  /**
   * If set, this is a case-study card: it shows a "Featured case study" tag and its back CTA opens
   * the named node's subpage (e.g. 'meeting-os') instead of linking out.
   */
  caseStudyNodeId?: string;

  // ── FRONT ──────────────────────────────────────────────────────────────────
  /** Outcome-focused one-liner (what it does for you, not how). */
  oneLiner: string;

  // ── BACK (the "trailer" — skimmable in ~10s) ─────────────────────────────────
  /** Runtime flow, rendered by ArchitectureDiagram (the diagram fallback when `visual` is absent). */
  architecture?: Architecture;
  /** Flexible visual slot (diagram or screenshot). Falls back to `architecture` as a diagram. */
  visual?: CardVisual;
  /** When true, the back lays the text on the left and the (tall) visual on the right, vs. stacked. */
  sideVisual?: boolean;
  /** How it works: 1–2 sentences. */
  description: string;
  /** "In practice:" line — a vivid case that shows the value. */
  example?: string;
  /** "Nice Touch": a clever feature or a problem solved (optional). */
  highlight?: string;
  /** Skills demonstrated (tag row). */
  skills?: string[];
  /** Tools used as `tool · role` pairs. */
  stack?: { tool: string; role: string }[];
  /** External "View full case study" link — used when there's no `caseStudyNodeId`. */
  caseStudyUrl?: string;

  /**
   * Extended back: a depth tier between a normal back and a case study. When true, the back renders
   * its normal sections plus `extendedSections` below — kept skimmable with small subsections.
   */
  extended?: boolean;
  /** Extra back subsections (title + a short paragraph), shown only when `extended` is true. */
  extendedSections?: { title: string; body: string }[];
}

/** Per-category accent: thin border/glow `base` (brightening to `hover`) + a `tint` for text/icons. */
export interface CategoryPalette {
  base: string;
  hover: string;
  tint: string;
}

/** Pastel yellow — the ★ that marks a featured build (legend + featured cards) and the case-study accent. */
export const featuredStarColor = '#E8DCA6';

// Color encodes category: indigo = automation, muted teal = AI system, pastel yellow = featured case
// study. Each stays a thin border / low-opacity glow (never a bright fill) so it reads subtle on navy.
export const systemCategoryColors: Record<SystemCategory, CategoryPalette> = {
  'ai-system': { base: '#43A88A', hover: '#5BC9A3', tint: '#7BCBA8' },
  automation: { base: '#6366F1', hover: '#818CF8', tint: '#A5B4FC' },
  'case-study': { base: featuredStarColor, hover: '#F2E9C2', tint: '#EFE4B0' },
};

export const systemCategoryLabels: Record<SystemCategory, string> = {
  'ai-system': 'AI Systems',
  automation: 'Automations',
  'case-study': 'Featured Case Study',
};

/** Scene palette, scoped to the Systems Library (does not touch the global theme tokens). */
export const systemPalette = {
  panel: '#121829',
  text: '#E6EAF2',
  muted: '#8A93A8',
} as const;

// Order = mobile reading order. Exact desktop placement is in `LG_PLACEMENT` (BentoCard.tsx).
export const systems: SystemCard[] = [
  {
    id: 'daytrading-agent',
    title: 'Daytrading Agent',
    icon: 'Bot',
    category: 'ai-system',
    size: 'wide', // 2×2 featured tile (placement in LG_PLACEMENT)
    featured: true,
    extended: true,
    tools: ['Claude', 'Alpaca', 'Telegram', 'DigitalOcean VPS'],
    oneLiner:
      'An autonomous day-trading agent that scans the market, decides with Claude, and trades on Alpaca within hard risk limits while reporting every move to Telegram.',
    description:
      'The autonomous trading agent is instilled with trading knowledge from Linda Raschke’s “Street Smarts” and Toby Crabel’s day trading book to create a database of principles and 26 skills.\n\nThe agent scans the market every 60s, looking for stocks with a sharp move in its price or trading volume. From there, the agent finds information about the stock, current news, overall market, and its own knowledge to decide if a stock is worth buying. Before buying, it has to go through strict guardrails to mitigate risks.\n\nEach trade is executed with an exit plan, a price to cut losses and a price to take profit, and then alerts me on Telegram about the trade.',
    example:
      'A stock’s volume spikes → Claude weighs the set of info against its skill library and decides to buy with a conviction score, stop, and target → guardrail checks reward:risk, exposure caps, and daily-loss limit → if passes, a bracketed order goes in and I get a Telegram alert',
    architecture: {
      nodes: [
        { id: 'scanner', label: 'Scanner', role: 'trigger', host: 'Python · 60s loop' },
        { id: 'advisor', label: 'Trade advisor', role: 'ai', host: 'Claude' },
        { id: 'guard', label: 'Guardrail stack', role: 'core' },
        { id: 'exec', label: 'Executor', role: 'interface', host: 'Alpaca' },
        { id: 'tg', label: 'Telegram', role: 'interface' },
      ],
      edges: [
        { from: 'scanner', to: 'advisor', label: 'on event' },
        { from: 'advisor', to: 'guard', label: 'sized rec' },
        { from: 'guard', to: 'exec', label: 'bracket order' },
        { from: 'exec', to: 'tg', bidirectional: true, label: 'alerts + control' },
      ],
      schedule: '8am prep + discovery · intraday scan · 3:55pm flatten · EOD reflection',
      builtWith: 'Claude Code',
    },
    skills: [
      'Autonomous agents',
      'Event-driven LLM orchestration',
      'Risk-management systems',
      'Knowledge/skill engineering',
      'Cost optimization',
    ],
    stack: [
      { tool: 'Claude', role: 'Built with, LLM integration' },
      { tool: 'Alpaca', role: 'market data + execution' },
      { tool: 'Python', role: 'scanner, guardrails, executor' },
      { tool: 'Telegram', role: 'alerts + two-way control' },
      { tool: 'DigitalOcean VPS', role: 'always-on host' },
    ],
    highlight:
      'At the end of the day, the agent reflects on its reasoning and execution quality and then adds lessons to its database to refer to in future decisions.',
    extendedSections: [
      {
        title: 'Trading Knowledge & Skills',
        body: 'The agent doesn’t trade on guesses, it follows strategies pulled from two professional trading books (Linda Raschke’s “Street Smarts” and Toby Crabel’s book on day trading). I worked with Claude to go through both books, break them into sections, group overlapping ideas, and turned them into 26 skills. One skill separates real breakouts in stocks from a fake-out that’s about to reverse, another buys a dip in a strong uptrend instead of chasing the top, and the other skills are similarly tailored to specific market conditions. Each is only used in the specific situations it’s catered to based on examples and knowledge from the day trading books.\n\nI effectively taught it to trade like the authors from those books, even though I’m not a professional trader myself.',
      },
      {
        title: 'Risk Framework',
        body: 'Before the agent is allowed to make any trades, the trade has to pass a list of safety guardrails:\n- It only takes a trade if the potential reward is worth the risk\n- It puts more money behind confident trades and less in shakier ones\n- It caps how many trades it makes a day, how many stocks it holds, and how much money it can use at a time\n- If losses pass a set amount in a day it stops trading until next day\n- It avoids stocks that swing wildly\n\nMost of the guardrails follow strict equations from its knowledge base that calculates reward:risk ratio, confidence scores, caps, etc.',
      },
      {
        title: 'The Learning Loop',
        body: 'At the end of the day, the agent looks at every trade it made and uses its knowledge to grade itself on whether its reasoning made sense and if the entries/exits were timed well.\n\nIt studies its losses and wins, the confident decisions are saved in its database, the losses are reflected and corrected so it can improve over time instead of repeating same mistakes.',
      },
    ],
  },
  {
    id: 'meeting-intelligence',
    title: '1-on-1 Meeting Tracker',
    icon: 'ClipboardList',
    category: 'case-study',
    size: 'wide',
    caseStudyNodeId: 'meeting-os',
    tools: ['Zapier', 'Google Workspace', 'Coda', 'Slack'],
    oneLiner:
      'Turns 1-on-1 check-in meetings into structured summaries about the volunteers and then tracks how each volunteer develops over time.',
    description:
      'Monthly check-in meetings are scheduled through Calendly, a Zapier flow detects that and logs it on a Coda database. When meetings occur, Gemini records the transcripts into a Google Drive, then another Zapier flow picks up the transcripts, creates structured summaries and adds them to the Coda database. Everything that is logged is synced with volunteer names, any volunteers that don’t have meetings scheduled gets automated reminders to schedule their meetings.',
    example:
      'Meeting occurs → structured summary gets added to Coda → next month new meeting is scheduled → CEO views previous meeting record and checks on volunteer’s progress in the meeting → repeat',
    architecture: {
      layout: 'converge',
      nodes: [
        { id: 'calendly', label: 'Calendly', role: 'trigger' },
        { id: 'gworkspace', label: 'Google Workspace', role: 'trigger' },
        { id: 'zap', label: 'Zapier', role: 'core' },
        { id: 'coda', label: 'Coda', role: 'store' },
        { id: 'slack', label: 'Slack', role: 'interface' },
        { id: 'gmail', label: 'Gmail', role: 'interface' },
      ],
      edges: [
        { from: 'calendly', to: 'zap', label: 'scheduled meetings' },
        { from: 'gworkspace', to: 'zap', label: 'transcripts' },
        { from: 'zap', to: 'coda', label: 'logs + summaries' },
        { from: 'coda', to: 'slack', label: 'reminders' },
        { from: 'coda', to: 'gmail', label: 'reminders' },
      ],
    },
    skills: [
      'LLM integration',
      'No-code orchestration',
      'Structured data modeling',
      'Prompt engeneering',
    ],
    stack: [
      { tool: 'Zapier', role: 'orchestration + filtering' },
      { tool: 'Google Workspace', role: 'records transcripts (Gemini + Google Drive)' },
      { tool: 'Coda', role: 'structured database + longitudinal tracking' },
      { tool: 'Slack', role: 'reminders' }
      ,
    ],
    highlight:
      'New meeting summaries check if previous meetings’ action items were done so progress (or stalling) is visible in new meetings. A section in the database uses AI to read all monthly transcripts per volunteer and generates an overview of how the they perform over time, including flags for undelivered action items',
  },
  {
    id: 'finance-tracker',
    title: 'Finance Tracker',
    icon: 'Wallet',
    category: 'ai-system',
    size: 'sm',
    tools: ['Claude', 'Telegram', 'Sheets', 'Oracle Cloud'],
    oneLiner:
      'Text your spending and it logs, categorizes, and reports back.',
    description:
      'A Telegram bot running on a cloud host that logs my spending to a Google Sheet by text, using Claude to categorize each entry. It opens a fresh tab each month and texts me a category breakdown at end of month.',
    example:
      "I text 'bought pokemon cards' and it files it under Hobby on its own, no categories to predefine or maintain.",
    architecture: {
      layout: 'hub',
      nodes: [
        { id: 'tg', label: 'Telegram', role: 'interface' },
        { id: 'bot', label: 'Bot logic', role: 'core', host: 'Oracle Cloud' },
        { id: 'ai', label: 'Claude API', role: 'ai' },
        { id: 'sheet', label: 'Google Sheet', role: 'store' },
      ],
      edges: [
        { from: 'bot', to: 'tg', bidirectional: true, label: 'log + report' },
        { from: 'bot', to: 'ai', bidirectional: true, label: 'categorize' },
        { from: 'bot', to: 'sheet', bidirectional: true, label: 'log + query' },
      ],
      schedule: 'Monthly: new tab + breakdown report',
      builtWith: 'Claude Code',
    },
    skills: ['LLM integration', 'API integration', 'Deployment', 'Data pipeline'],
    stack: [
      { tool: 'Telegram', role: 'interface' },
      { tool: 'Oracle Cloud', role: 'always-on runtime' },
      { tool: 'Claude API', role: 'categorization' },
      { tool: 'Google Sheet', role: 'data + reporting' },
      { tool: 'Claude Code', role: 'built with' },
    ],
    highlight:
      'Each tab pre-calculates its category totals in dedicated cells. When I ask the bot for a total it just reads the answer instead of computing on the fly so that replies come back instantly.',
  },
  {
    id: 'client-tracker',
    title: 'Client Tracker',
    icon: 'Users',
    category: 'ai-system',
    size: 'sm',
    tools: ['Slack', 'Claude', 'Sheets', 'Railway'],
    oneLiner:
      'A shared Slack bot that keeps every team on the same page about each client.',
    description:
      'A Slack bot backed by a Google Sheet that centralizes client info across the acquisition, activation, and marketing teams. Each team logs what they discussed or shipped, and anyone can ask about a client. The bot uses Claude to compile every past conversation and update into a single overview, including promises made to the client that haven’t been delivered yet.',
    example:
      'Before an activation call, the team asks the bot about a client and gets the full history plus any undelivered promises without needing to tracking down whoever last spoke to them.',
    architecture: {
      layout: 'hub',
      nodes: [
        { id: 'slack', label: 'Slack', role: 'interface' },
        { id: 'bot', label: 'Bot logic', role: 'core', host: 'Railway' },
        { id: 'ai', label: 'Claude API', role: 'ai' },
        { id: 'sheet', label: 'Google Sheet', role: 'store' },
      ],
      edges: [
        { from: 'bot', to: 'slack', bidirectional: true },
        { from: 'bot', to: 'ai', bidirectional: true, label: 'compile + flag' },
        { from: 'bot', to: 'sheet', bidirectional: true, label: 'records' },
      ],
      builtWith: 'Claude Code',
    },
    skills: [
      'LLM integration',
      'Multi-user systems',
      'API integration',
      'Data modeling',
      'Deployment',
    ],
    stack: [
      { tool: 'Slack', role: 'interface' },
      { tool: 'Railway', role: 'always-on runtime' },
      { tool: 'Claude API', role: 'compile overviews + flag promises' },
      { tool: 'Google Sheet', role: 'client records' },
    ],
    highlight:
      'Can log and grab files from Google Drives per client as well.',
  },
  {
    id: 'sheet-cleaner',
    title: 'Sheet Cleaner',
    icon: 'Sparkles',
    category: 'ai-system',
    size: 'sm',
    tools: ['Claude', 'Sheets'],
    oneLiner:
      'Hand it a messy lead sheet and it returns clean, professional names, ready to email.',
    description:
      'A Claude Code workflow I run locally: give it a Google Sheet of scraped, messy lead names and it returns a clean one. It strips @-signs and junk from Instagram-scraped handles, infers the real name using the email and username as context.',
    example:
      'A row like `@jdoe_designs ⚡` with email `john.doe@…` comes out as “John Doe.”',
    architecture: {
      // Claude Code is the runtime here (not just the build tool), so it's a node, not a footnote.
      layout: 'hub',
      nodes: [
        { id: 'cc', label: 'Claude Code', role: 'ai', host: 'local' },
        { id: 'sheet', label: 'Google Sheet', role: 'store' },
        { id: 'ig', label: 'Instagram', role: 'interface', host: 'burner' },
      ],
      edges: [
        { from: 'cc', to: 'sheet', bidirectional: true, label: 'clean' },
        { from: 'cc', to: 'ig', label: 'context lookup' },
      ],
    },
    skills: ['Agentic workflows', 'LLM reasoning', 'Tool use / browsing', 'Data cleaning'],
    stack: [
      { tool: 'Claude Code', role: 'runs the workflow' },
      { tool: 'Google Sheet', role: 'input + output' },
      { tool: 'Instagram (burner)', role: 'context lookup' },
    ],
    highlight:
      'When a name isn’t obvious from the data, instead of guessing, it opens the lead’s Instagram through a burner account to find real context the way a person would, then cleans accordingly.',
  },
  {
    id: 'lead-to-outreach',
    title: 'Lead to Outreach',
    icon: 'Send',
    category: 'automation',
    size: 'tall',
    tools: ['Make', 'Instantly', 'Slack'],
    oneLiner:
      'Turns a Meta ad lead into a logged, alerted, and contacted prospect automatically.',
    description:
      'A Make scenario that fires on a new Meta ad lead: Meta logs the lead to a Google Sheet, from there, the scenario alerts the team in Slack and drops the lead into an Instantly campaign that handles the outreach email and follow-up sequence on its own.',
    example:
      'A lead fills out the Meta form → lead gets logged to the sheet, the team gets a Slack ping about the lead, the lead is added to the Instantly campaign, and Instantly already has the follow-up sequence running. No one touches it.',
    visual: {
      type: 'image',
      src: '/make-automation.png',
      alt: 'Make scenario — Facebook Lead Ads → Google Sheets → Router → Slack and Instantly',
      width: '50%',
    },
    skills: [
      'No-code orchestration',
      'API/webhook integration',
      'CRM + email automation',
      'Data pipeline',
    ],
    stack: [
      { tool: 'Meta Lead Ads', role: 'source' },
      { tool: 'Make', role: 'orchestration' },
      { tool: 'Google Sheet', role: 'record' },
      { tool: 'Slack', role: 'alert' },
      { tool: 'Instantly', role: 'campaign + follow-ups + analytics' },
    ],
    highlight:
      'Handing outreach to an Instantly campaign means every lead gets a multi-step follow-up sequence automatically, with open/reply analytics per campaign',
  },
  {
    id: 'meeting-error-detection',
    title: 'Meeting Error Detection',
    icon: 'CalendarX',
    category: 'automation',
    size: 'sm',
    tools: ['Zapier', 'Calendly', 'Slack'],
    oneLiner:
      'Catches meetings booked for the wrong dates, cancels them, and tells the person to rebook automatically.',
    description:
      'A Zapier automation that watches for new Calendly bookings, and flags any meeting scheduled past the 21st of the month. If it’s past the 21st, it cancels the booking, finds the person’s Slack ID from their email, and messages them on both Slack and email to reschedule.',
    example:
      'Someone books for the 28th → it’s auto-cancelled within moments and they get a Slack and email message to pick an earlier date, with no admin involved.',
    visual: {
      type: 'image',
      src: '/zapier-automation.png',
      alt: 'Zapier Zap — Calendly booking checked, cancelled if past the 21st, then Slack and Gmail nudges',
    },
    sideVisual: true,
    skills: ['No-code orchestration', 'Conditional logic', 'API integration', 'Date handling'],
    stack: [
      { tool: 'Calendly', role: 'trigger' },
      { tool: 'Zapier', role: 'orchestration + logic' },
      { tool: 'Slack', role: 'lookup + notify' },
      { tool: 'Email', role: 'notify' },
    ],
  },
];
