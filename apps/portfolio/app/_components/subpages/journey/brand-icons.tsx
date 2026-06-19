// Brand glyph paths for the Coda flow diagram, normalized to a 0 0 24 24 viewBox so each can be
// dropped into the diagram's SVG with a uniform transform/scale. Most come from `simple-icons`;
// Slack was removed from that set at the brand's request, so its mark is inlined.
import { siCoda, siZapier, siCalendly, siGoogledrive, siGmail } from 'simple-icons';

export type BrandKey = 'coda' | 'zapier' | 'calendly' | 'drive' | 'slack' | 'gmail';

// Official Slack mark (single-color, 24×24).
const SLACK_PATH =
  'M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.685 8.834a2.528 2.528 0 0 1-2.521 2.521 2.527 2.527 0 0 1-2.521-2.521V2.522A2.527 2.527 0 0 1 15.164 0a2.528 2.528 0 0 1 2.521 2.522v6.312zM15.164 18.956a2.528 2.528 0 0 1 2.521 2.522A2.528 2.528 0 0 1 15.164 24a2.527 2.527 0 0 1-2.521-2.522v-2.522h2.521zM15.164 17.685a2.527 2.527 0 0 1-2.521-2.52 2.526 2.526 0 0 1 2.521-2.521h6.314A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.52h-6.314z';

export const BRAND: Record<BrandKey, { title: string; path: string }> = {
  coda: { title: siCoda.title, path: siCoda.path },
  zapier: { title: siZapier.title, path: siZapier.path },
  calendly: { title: siCalendly.title, path: siCalendly.path },
  drive: { title: siGoogledrive.title, path: siGoogledrive.path },
  slack: { title: 'Slack', path: SLACK_PATH },
  gmail: { title: siGmail.title, path: siGmail.path },
};
