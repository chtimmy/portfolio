// The Resume "Agent Dossier" data — single source of truth (content separate from layout).
// Placeholder values seeded from Timmy's real background; real copy/photo/PDF drop in here later.

export interface DossierContact {
  label: string;
  href: string;
  /** Short glyph/label shown in the chip (kept text so no icon dependency). */
  icon: string;
}

export interface DossierExperience {
  role: string;
  org: string;
  orgType: string;   // company descriptor, e.g. "early-stage music startup"
  period: string;
  points: string[];
}

export interface DossierEducation {
  degree: string;        // headline line
  institution: string;   // full university name
  period: string;        // e.g. "2021 – 2025"
  minors?: string[];     // rendered as small pills
}

export interface DossierCertification {
  name: string;
  issuer: string;
  completed?: string;    // e.g. "Nov 2025"
}

export interface DossierData {
  codename: string;
  name: string;
  status: string;
  photoUrl: string;
  resumePdfUrl: string;
  contacts: DossierContact[];
  about: string;
  /** 5 entries → pentagon. Stylized, not literal metrics. */
  softSkills: { label: string; value: number }[];
  experience: DossierExperience[];
  education: DossierEducation;
  certifications: DossierCertification[];
  tools: string[];
}

export const dossier: DossierData = {
  codename: 'SUBJECT',
  name: 'Timmy Lei',
  status: 'ACTIVE',
  photoUrl: '/dossier-photo.jpg',
  resumePdfUrl: '/Lei%20Jin%20(Timmy)%20Resume.docx.pdf',
  contacts: [
    { label: 'chtimmy02@gmail.com', href: 'mailto:chtimmy02@gmail.com', icon: '✉' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/timmy-lei/', icon: 'in' },
  ],
  about:
    'I design and implement business systems that replace manual operations with automation and AI, built on experience acquiring and engaging customers directly and supporting how a growing organization runs day to day. I focus on understanding how work actually flows through the business, then design systems that solve problems and remove friction for teams. My work blends business analysis, system design, automation logic, and AI collaboration to help organizations operate more efficiently and effectively.',
  softSkills: [
    { label: 'System Design', value: 95 },
    { label: 'Operations Optimization', value: 91 },
    { label: 'Customer & Stakeholder Relationships', value: 97 },
    { label: 'AI Collaboration', value: 88 },
    { label: 'Problem Decomposition', value: 100 },
  ],
  experience: [
    {
      role: 'Business Development',
      org: 'REVO Music',
      orgType: 'early-stage music startup',
      period: 'February 2026 — Current',
      points: [
        'Led artist acquisition end to end, owning outreach, relationship-building, and qualifying new artists for the platform',
        'Built Instantly and Make outreach automations that improved workflow, increased daily outreach by 6.5x and cut manual work by 20hrs/week, scaling acquisition without scaling manual work',
        'Designed and implemented an AI-assisted artist tracking system, centralizing artist status across the team and saving the team 20 hours/month',
      ],
    },
    {
      role: 'Executive Assistant to CEO',
      org: 'Digital Aid Seattle',
      orgType: 'nonprofit',
      period: 'September 2025 — Current',
      points: [
        'Developed a Coda-based system to centralize volunteer 1:1s, syncing volunteer information, meeting summaries, and recording performance over time',
        'Streamlined internal tools and documentation (Coda, GitBook, Google Sheets, Jira) to maintain accurate records, clean outdated data, and support reliable team coordination',
        'Built and maintained Zapier automations to automate meeting workflows, reduce scheduling errors, and eliminate manual follow-ups',
      ],
    },
    {
      role: 'Event Marketing & Sales',
      org: 'Hyatt Vacation Club',
      orgType: 'hospitality / vacation ownership',
      period: 'June 2025 — December 2025',
      points: [
        'Engaged diverse audiences at large-scale events, building customer rapport and recording qualified leads to support Salesforce follow-up workflows',
      ],
    },
    {
      role: 'Marketing & Event Operations',
      org: 'HB Entertainment',
      orgType: 'live events & entertainment',
      period: 'April 2023 — February 2025',
      points: [
        'Coordinated logistics, timelines, and stakeholder communication across DJs, artists, and student organizations to execute live events, supporting smooth operations and increased attendance',
      ],
    },
  ],
  education: {
    degree: 'B.S. Business Economics',
    institution: 'University of California, San Diego',
    period: '2021 – 2025',
    minors: ['Entrepreneurship & Innovation', 'Supply Chain & Innovation'],
  },
  certifications: [
    { name: 'Google Project Management Certificate', issuer: 'Google', completed: 'Nov 2025' },
    { name: 'Claude 101 Certificate', issuer: 'Anthropic', completed: 'Jun 2026' },
    { name: 'AI Fluency Certificate', issuer: 'Anthropic', completed: 'Jun 2026' },
  ],
  tools: ['Coda', 'Make', 'Zapier', 'Instantly', 'Airtable', 'HubSpot',
    'Vercel', 'Jira', 'SQL', 'Tableau'],
};
