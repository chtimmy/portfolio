import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Sora, Hanken_Grotesk, JetBrains_Mono, Newsreader } from 'next/font/google';
import './globals.css';

// Display — used with restraint for the hero + node names.
const sora = Sora({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display' });
// Body — quiet, neutral.
const hanken = Hanken_Grotesk({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-body' });
// Utility/data — the telemetry voice (eyebrow, node coordinates, toggle).
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' });
// Editorial serif — reserved for case-study pull-quotes (the memorable takeaway line).
const serif = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['italic', 'normal'],
  variable: '--font-serif',
});

// Prefer an explicit URL; otherwise use Vercel's stable production domain (injected at build),
// falling back to localhost for `next dev`.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3001');
const title = 'Timmy — Systems & Automation';
const description =
  'I build the systems and automations that keep businesses running. Portfolio built with Umbra, a motion toolkit I made.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: title,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

// Match the browser chrome / overscroll gutter to the deep-space void (#05060a = --void) so the
// page reads edge-to-edge dark instead of falling back to the browser's theme color on first paint.
export const viewport: Viewport = {
  themeColor: '#05060a',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${hanken.variable} ${mono.variable} ${serif.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
