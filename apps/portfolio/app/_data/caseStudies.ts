// Case-study data — one entry per case study, keyed by node id (umbra, meeting-os). Rendered as a
// stacking-cards scroll (briefing → one card per step). Placeholder content seeded from Timmy's real
// work; real copy/links drop in later.

/** Drives the card's eyebrow color (KIND_COLOR in CaseStudyJourney). Free-form string. */
export type StepKind = string;

/** A scrubbed/inView "motion beat" rendered above a card's copy (see journey/beats). */
export type BeatKey =
  | 'orbit-intro'
  | 'preset-toggle'
  | 'orbit-assemble'
  | 'collapse'
  | 'fly-through'
  | 'reference-strip'
  | 'helix-resolve'
  | 'settle';

/**
 * Ordered, mixed per-card content. A step renders `blocks` when present; otherwise it falls back to
 * the legacy `body` string (the Umbra study still uses `body`).
 */
export type Block =
  | { type: 'paragraph'; text: string; emphasis?: boolean }
  | { type: 'lead'; text: string }
  | { type: 'spec'; label?: string; vague?: string; precise: string }
  | { type: 'pullquote'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'features'; items: { icon: string; text: string }[] }
  | { type: 'divider' }
  | { type: 'diagram'; id: 'coda-flow' }
  | {
      type: 'images';
      /** When true (and there are ≥2 items), render one click-to-flip image instead of a grid. */
      toggle?: boolean;
      items: { src?: string; alt: string; caption?: string }[];
    }
  | { type: 'qa'; items: { question: string; answer: string }[] };

export interface CaseStudyStep {
  kind: StepKind;
  /** Step name, e.g. "The Signal". */
  label: string;
  heading: string;
  /** lucide-react icon name rendered in the card header. */
  icon?: string;
  /** 'split' = text blocks left column, diagram/images block right column. */
  layout?: 'default' | 'split';
  /** Preferred mixed content; renderers fall back to `body` when absent. */
  blocks?: Block[];
  /** Legacy single-paragraph fallback (used by the Umbra study). */
  body?: string;
  /** Optional signature motion rendered above the copy. */
  beat?: BeatKey;
  /** Renders a BeforeAfterToggle craft-flip; 'required' is the prominent one. */
  toggle?: 'required' | 'optional';
  metrics?: { value: string; label: string }[];
  /** `soon` renders a non-interactive "coming soon" chip instead of a live link. */
  links?: { label: string; href: string; soon?: boolean }[];
}

export interface CaseStudy {
  slug: string;
  title: string;
  /** The briefing payoff, shown up front. */
  outcomeHeadline: string;
  context: string;
  steps: CaseStudyStep[];
}

export const caseStudies: Record<string, CaseStudy> = {
  umbra: {
    slug: 'umbra',
    title: 'Umbra',
    outcomeHeadline: 'Motion design that feels right, not just code that runs',
    context:
      'How I learned to direct an AI coding agent toward creative, high-craft output, and shipped a motion portfolio in the process',
    steps: [
      {
        kind: 'problem',
        label: 'The Gap',
        heading: 'A different kind of direction',
        icon: 'Compass',
        beat: 'orbit-intro',
        blocks: [
          {
            type: 'lead',
            text: 'Directing an agent toward creative visuals and motions that feel right is completely different from prompting logic-based systems.',
          },
          {
            type: 'paragraph',
            text: 'My automation and systems work proves I can wire systems together and streamline workflows, but it doesn’t prove I can design.',
          },
          {
            type: 'paragraph',
            text: 'I needed a place to showcase all of the systems I’ve built, which became the perfect opportunity to design my own motion portfolio with the assistance of Claude Code.',
          },
          {
            type: 'paragraph',
            text: 'I went in assuming I’d tell Claude “I want X, Y, and Z,” give it a few details about how I wanted it, and it would set it all up. It couldn’t, at least not the way I pictured it.',
          },
        ],
      },
      {
        kind: 'approach',
        label: 'The Core',
        heading: 'A motion system, not a pile of animations',
        icon: 'Boxes',
        beat: 'preset-toggle',
        blocks: [
          { type: 'lead', text: 'Every component is built on a token system.' },
          {
            type: 'paragraph',
            text: 'Each component reads from that token system, then gets stored in a design library I can pull from later.',
          },
          {
            type: 'paragraph',
            text: 'The token system controls things like how long a motion lasts, how far elements move, and how it speeds up and slows down, so anyone can take a component and adjust it until it matches what they want.',
          },
          {
            type: 'paragraph',
            text: 'The library includes a live playground where you can preview and adjust components before deciding what to use. Each one has a copy-paste section with its token adjustments, so it drops straight into your own code.',
          },
        ],
      },
      {
        kind: 'build',
        label: 'Precision',
        heading: 'What the agent can’t see',
        icon: 'Eye',
        blocks: [
          { type: 'lead', text: 'The agent can’t see what we see. All it sees is code.' },
          {
            type: 'paragraph',
            text: 'A lot of the work was watching the rendered motion, figuring out in words why it felt wrong, and pointing the agent at the cause. It can’t experience the motion the way someone watching it does.',
          },
          {
            type: 'paragraph',
            text: 'Describing a motion with adjectives isn’t enough to land the feel you want. The designs that move run on variables, numbers, and equations.',
          },
          {
            type: 'paragraph',
            text: 'When you click a project node on the launch page of this portfolio, it spins faster, collapses, and expands. This animation runs on real values: speed, angle, and orbit radius.',
          },
          {
            type: 'spec',
            label: 'same node, two prompts',
            vague: 'make it spin faster and collapse',
            precise:
              'on click, increase speed by 2×/s while decreasing orbit radius by 1/s until it reaches 0, then expand',
          },
        ],
      },
      {
        kind: 'approach',
        label: 'The Cut',
        heading: 'Knowing when to pivot',
        icon: 'GitFork',
        blocks: [
          { type: 'lead', text: 'Think like a project manager: keep digging, or pivot.' },
          {
            type: 'paragraph',
            text: 'It’s also hard to take an idea and build it from scratch with words alone. One of the best ways to get traction is to find a similar idea online, use it as a reference to share with Claude, then refine from there.',
          },
          {
            type: 'paragraph',
            text: 'Even after going back and forth narrowing down what’s visually off, you still might not land it, especially on more complex designs.',
          },
          {
            type: 'paragraph',
            text: 'That’s where you decide whether to keep burning time digging into the design and code, or pivot to a different design you can execute to a high standard.',
          },
          {
            type: 'pullquote',
            text: 'Recognizing the ceiling and shipping something strong anyway was the call that kept the project moving.',
          },
        ],
      },
      {
        kind: 'result',
        label: 'The Outcome',
        heading: 'What it proves',
        icon: 'Trophy',
        beat: 'orbit-assemble',
        blocks: [
          {
            type: 'lead',
            text: 'The real takeaway is the skill: directing an AI agent toward subjective, high-craft output.',
          },
          {
            type: 'paragraph',
            text: 'The finished product presents my work, builds, and experience in one place, and does it in a way that’s genuinely nice to look at.',
          },
          {
            type: 'paragraph',
            text: 'Alongside the finished site, I walked away with the ability to direct an agent toward that output through close observation, precise specs, references, and the judgment to cut what’s out of scope.',
          },
          {
            type: 'paragraph',
            text: 'Currently, I’m polishing and refining the motion design library so others will be able to customize and use the same components on their sites as well.',
          },
        ],
        links: [{ label: 'Design Playground', href: '#', soon: true }],
      },
    ],
  },
  'meeting-os': {
    slug: 'meeting-os',
    title: '1on1 Meeting Tracker',
    outcomeHeadline: 'Turned recurring 1:1s into a live, self-updating read on the whole team.',
    context: 'Coda · Zapier · Calendly · Gemini · Google Workspace · Slack',
    steps: [
      {
        kind: 'problem',
        label: '01',
        heading: 'The Problem',
        icon: 'CircleAlert',
        blocks: [
          {
            type: 'paragraph',
            text: 'The nonprofit has 80+ volunteers working remote from different locations across the US. To stay connected and keep track of how the volunteers are doing, the CEO runs monthly 1-on-1 meetings with the whole team.',
          },
          { type: 'divider' },
          {
            type: 'paragraph',
            text: 'The entire process was done manually with very little tech assistance.',
          },
          {
            type: 'bullets',
            items: [
              'Assistants had to send messages to the 80+ volunteers reminding them to schedule their meetings',
              'There was no system to track who did not schedule their meetings',
              'Meeting transcripts were recorded in a Google Drive, hundreds of files that no one would touch again',
              'Leadership went into meetings without context about the volunteer',
              'No record about what was discussed in the previous meeting and what action items were assigned',
              'No record about how volunteers were progressing over time',
            ],
          },
        ],
      },
      {
        kind: 'approach',
        label: '02',
        heading: 'The Approach & System Architecture',
        icon: 'Boxes',
        blocks: [
          {
            type: 'paragraph',
            text: 'I built a Coda workspace to centralize every volunteer’s 1-on-1 meetings, using automation and systems to handle most of the busywork.',
          },
          {
            type: 'paragraph',
            text: 'Coda holds the data and utilizes APIs and connections to Zapier, Slack, Calendly, and Google Workspace to automate reminders and sync meeting data.',
          },
          { type: 'paragraph', text: 'The design goal:' },
          {
            type: 'features',
            items: [
              { icon: 'BellRing', text: 'Reminders are sent to volunteers automatically' },
              { icon: 'Database', text: 'A centralized database for the CEO to view information on all volunteers' },
              { icon: 'NotebookText', text: 'Meeting transcripts are summarized and compiled into the database' },
              { icon: 'TrendingUp', text: 'Information on volunteers develops over time' },
            ],
          },
        ],
      },
      {
        kind: 'workflows',
        label: '03',
        heading: 'Automating Workflows',
        icon: 'Workflow',
        layout: 'split',
        blocks: [
          {
            type: 'paragraph',
            text: 'I set up a Zapier automation that detects new Calendly meetings and logs them into the Coda database.',
          },
          {
            type: 'paragraph',
            text: 'The database has a checkbox column where it is checked if the volunteer has a meeting logged for the current month.',
          },
          {
            type: 'paragraph',
            text: 'If the checkbox is unchecked, the Coda system automates reminders to the volunteers on Slack and Gmail.',
          },
          {
            type: 'paragraph',
            text: 'When meetings occur, Gemini logs the transcripts into a Google Drive. I have another Zapier automation that detects that, summarizes it, and adds it to the Coda system.',
          },
          { type: 'diagram', id: 'coda-flow' },
        ],
      },
      {
        kind: 'insight',
        label: '04',
        heading: 'Turning Conversations into Structured Insight',
        icon: 'Sparkles',
        blocks: [
          { type: 'paragraph', text: 'When new transcripts are summarized, the prompt highlights:' },
          {
            type: 'bullets',
            items: [
              'Key points',
              'Things the volunteer is doing well',
              'Any challenges or concerns',
              'Any completed action items from previous meetings',
              'New action items for volunteer',
            ],
          },
          {
            type: 'paragraph',
            text: 'The Coda system has 3 separate columns for the transcript summaries: the most recent meeting, a compilation of all past meetings, and a master overview.',
          },
          {
            type: 'paragraph',
            emphasis: true,
            text: 'The master overview is the most important part. It uses Coda’s AI to summarize the compilation of all meetings and is prompted to report how the volunteer has been performing over time and whether they have been completing their action items across meetings. This is why every summary logs completed action items, so the overview can detect if a volunteer is actually following through or if items keep slipping. The CEO can walk into any 1-on-1 already knowing how the volunteer has progressed, not just what happened last meeting.',
          },
        ],
      },
      {
        kind: 'practice',
        label: '05',
        heading: 'In Practice',
        icon: 'LayoutDashboard',
        blocks: [
          {
            type: 'images',
            toggle: true,
            items: [
              {
                src: '/meeting-dayof-dashboard.png',
                alt: 'Day-of meeting dashboard',
                caption: 'Day-of dashboard',
              },
              {
                src: '/meeting-overview-dashboard.png',
                alt: 'Overview dashboard',
                caption: 'Overview dashboard',
              },
            ],
          },
          {
            type: 'paragraph',
            text: 'The database is synced into two different views, a day-of meeting dashboard and an overview dashboard.',
          },
          {
            type: 'paragraph',
            text: 'Day-of meeting dashboard only shows volunteers who have a meeting scheduled for that day. It provides the CEO context about the volunteer before attending the meeting, as well as buttons if the CEO can’t attend or if the volunteer doesn’t show up.',
          },
          {
            type: 'paragraph',
            text: 'The no-show button records a concern for the volunteer in a feedback database and sends the volunteer a message. The other button alerts the volunteer if the CEO can’t attend.',
          },
          {
            type: 'paragraph',
            text: 'The overview dashboard is used if the CEO wants a detailed look at specific volunteers. The major difference between the two dashboards is that the day-of dashboard shows most recent meeting and action items while the overview dashboard shows how the volunteers performed over time.',
          },
        ],
      },
      {
        kind: 'precautions',
        label: '06',
        heading: 'Precautions',
        icon: 'ShieldCheck',
        blocks: [
          {
            type: 'paragraph',
            text: 'Many things can go wrong or slip through the cracks when building systems. The most important thing is to patch them before they happen.',
          },
          { type: 'divider' },
          {
            type: 'qa',
            items: [
              {
                question: 'If a volunteer cancels a meeting, wouldn’t it have been logged already?',
                answer: 'I created a Zapier automation that detects cancelled meetings and logs them. The Coda system unchecks the box if a volunteer’s created meetings equal their cancelled meetings.',
              },
              {
                question: 'How do you know volunteers are getting the automated messages?',
                answer: 'I include myself in the database with an unchecked box. If I don’t get an automated message, I know to check and fix it.',
              },
              {
                question: 'What if volunteers ignore the automated messages?',
                answer: 'A list of volunteers who haven’t scheduled by the 15th is sent to an assistant to reach out to personally.',
              },
            ],
          },
        ],
      },
      {
        kind: 'result',
        label: '07',
        heading: 'Impact & Results',
        icon: 'Trophy',
        blocks: [
          {
            type: 'paragraph',
            text: 'Beyond the time it saves, the system created something that didn’t exist before: a continuously updated overview on every team member that no one had the time to maintain manually.',
          },
          {
            type: 'paragraph',
            text: 'This system saves a conservative estimate of roughly 30 hours/month by reducing manual labor in sending reminders, summarizing transcripts, and pre-meeting prep. And because transcripts are summarized in a fixed structure, nothing falls through and every action item is tracked.',
          },
        ],
        links: [
          {
            label: 'Watch the walkthrough',
            href: 'https://www.loom.com/share/f51a44c384af48fa88fc26ef8bde7097',
          },
        ],
      },
    ],
  },
};
