'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'motion/react';
import type { MotionValue } from 'motion/react';
import {
  LineStagger,
  MotionProvider,
  OutlineTrace,
  ScanlineReveal,
  SkillRadar,
  useMotionTokens,
  useReducedMotion,
  useSceneTransition,
} from '@umbra/motion';
import { dossier } from '../../../_data/dossier';
import type { DossierContact, DossierData } from '../../../_data/dossier';
import { useIsMobile } from '../../useIsMobile';

export interface DossierCardProps {
  data?: DossierData;
  /** Controlled flip state. Omit to let the card manage its own. */
  flipped?: boolean;
  /** Notified on every flip change (so a host can track `hasDecrypted` / drive the flip). */
  onFlippedChange?: (flipped: boolean) => void;
}

/**
 * The Resume "Agent Dossier" — a flip card that decrypts on open. Front: identity, soft-skills radar,
 * a career-summary band, and a prominent DECRYPT FILE button. Back: Mission Log + Credentials & Loadout.
 * The reveal language is one idea — information resolving from cover into clarity — expressed as
 * ScanlineReveal (develop), AnimatedNumber (count-up), LineStagger (cascade) and
 * the radar's draw-on. Back content re-mounts on every flip so it re-develops; a persistent band cue
 * points at the verso. Flip is optionally controllable for a page-level exit-intent prompt.
 */
export function DossierCard({ data = dossier, flipped: flippedProp, onFlippedChange }: DossierCardProps) {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  // Inside a SceneLightbox the panel mounts at the *start* of the open transition (while still
  // invisible), so front `trigger="mount"` reveals would fire and finish before the card is seen.
  // Latch a `ready` flag on the scene reaching `open` (or immediately when there's no scene, e.g. the
  // playground) and mount the front only then — so its reveals play while visible, like the back does.
  const scene = useSceneTransition();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!scene || scene.state === 'open') setReady(true);
  }, [scene]);
  const [internalFlipped, setInternalFlipped] = useState(false);
  const flipped = flippedProp ?? internalFlipped;
  const setFlipped = (v: boolean) => {
    onFlippedChange?.(v);
    if (flippedProp === undefined) setInternalFlipped(v);
  };

  // Re-mount the back each time it opens so its scramble/scanline re-runs.
  const [openCount, setOpenCount] = useState(0);
  const wasFlipped = useRef(false);
  useEffect(() => {
    if (flipped && !wasFlipped.current) setOpenCount((n) => n + 1);
    wasFlipped.current = flipped;
  }, [flipped]);

  // The back's reveals must start only once the flip *finishes* (the back is facing the viewer), not at
  // the start of the ~1s rotation — otherwise the scan is half-done before you can see it. Set on the
  // flip container's onAnimationComplete from the side it settled on.
  const [backReady, setBackReady] = useState(false);
  const decrypted = openCount > 0;

  // Drive the flip from an explicit motion value (instead of the `animate` prop) so each face's
  // opacity can track the live rotation. On mobile `backface-visibility: hidden` doesn't reliably
  // hide the rotated-away front (the rounded/overflow-hidden face composites into its own layer), so
  // we paint exactly one face at a time: the away side switches to opacity 0 at 90° — where the card
  // is edge-on and the switch is invisible. Desktop keeps full-opacity faces and is unaffected.
  const rotateY = useMotionValue(0);
  useEffect(() => {
    const controls = animate(rotateY, flipped ? 180 : 0, reduced ? { duration: 0 } : { type: 'spring', stiffness: 60, damping: 15 });
    controls.then(() => setBackReady(flipped)); // flip settled: true on the back, false on the front
    return () => controls.stop();
  }, [flipped, reduced, rotateY]);

  const norm = (v: number) => ((v % 360) + 360) % 360;
  const frontOpacity = useTransform(rotateY, (v): number => (norm(v) < 90 || norm(v) > 270 ? 1 : 0));
  const backOpacity = useTransform(rotateY, (v): number => (norm(v) >= 90 && norm(v) <= 270 ? 1 : 0));

  // Mobile only: slow the scan-line reveal for a more cinematic develop (the dossier's ScanlineReveals
  // read the `epic` duration token). Override just that token for this subtree; desktop is untouched.
  const baseTokens = useMotionTokens();
  const slowTokens = { ...baseTokens, duration: { ...baseTokens.duration, epic: 4200 } };

  const card = (
    <div className="mx-auto flex min-h-full w-full max-w-5xl items-center justify-center px-4 py-4 sm:py-12">
      <div style={{ perspective: 2000, width: 'min(96vw, 960px)' }}>
        <motion.div
          style={{
            rotateY,
            transformStyle: 'preserve-3d',
            position: 'relative',
            height: isMobile ? 'min(88dvh, 760px)' : 'min(86vh, 760px)',
          }}
        >
          <Face solid={isMobile} opacity={isMobile ? frontOpacity : undefined}>
            {/* Gated so the front's reveals fire only once the scene is open + visible (see `ready`). */}
            {ready ? (
              <CardFront data={data} onFlip={() => setFlipped(true)} decrypted={decrypted} />
            ) : (
              <FrontPlaceholder />
            )}
          </Face>
          <Face back solid={isMobile} opacity={isMobile ? backOpacity : undefined}>
            {/* Gated on the flip finishing (`backReady`) + keyed so the scan starts fresh, facing the viewer. */}
            {flipped && backReady ? (
              <CardBack key={openCount} data={data} onFlip={() => setFlipped(false)} />
            ) : (
              <BackPlaceholder />
            )}
          </Face>
        </motion.div>
      </div>
    </div>
  );

  // Wrap in a token override (no DOM node) only on mobile, so the slower scan applies there alone.
  return isMobile ? (
    // Preserve the hero's forced-motion setting (`reduced` is read from the parent provider) so the
    // override only changes timing, not whether the scan plays.
    <MotionProvider tokens={slowTokens} reducedMotion={reduced} as={false}>
      {card}
    </MotionProvider>
  ) : (
    card
  );
}

function Face({
  children,
  back,
  solid,
  opacity,
}: {
  children: React.ReactNode;
  back?: boolean;
  /** Mobile hardening against front-face bleed-through: opaque face + its own backface guard. */
  solid?: boolean;
  /** Mobile only: opacity tracking the flip so only the facing side paints (undefined → always 1). */
  opacity?: MotionValue<number>;
}) {
  return (
    <motion.div
      style={{
        position: back ? 'absolute' : 'relative',
        inset: back ? 0 : undefined,
        height: '100%',
        opacity,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: back ? 'rotateY(180deg)' : undefined,
      }}
    >
      <div
        className="flex h-full flex-col overflow-hidden rounded-2xl"
        style={{
          // The inner content needs its own backface guard so a browser that renders it in 3D can't
          // show the (mirrored) front through the back; on mobile an opaque face removes any residual
          // see-through, and translateZ(0) gives each face its own compositing layer.
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: solid ? 'translateZ(0)' : undefined,
          background: solid ? 'var(--deep)' : 'color-mix(in srgb, var(--deep) 92%, transparent)',
          border: '1px solid color-mix(in srgb, var(--accent) 40%, transparent)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

/** Classification-stamp header strip shared by both faces. */
function StampBar({ right }: { right: string }) {
  return (
    <div
      className="u-mono flex items-center justify-between px-6 py-2 text-[10px] tracking-[0.25em] text-[color:var(--muted)]"
      style={{ borderBottom: '1px solid var(--line)', background: 'rgba(255,255,255,0.02)' }}
    >
      <span>PROFILE // CONFIDENTIAL</span>
      <span style={{ color: 'var(--accent)' }}>{right}</span>
    </div>
  );
}

function CardFront({
  data,
  onFlip,
  decrypted,
}: {
  data: DossierData;
  onFlip: () => void;
  decrypted: boolean;
}) {
  return (
    <>
      <StampBar right="FILE 001" />
      {/* Scroll container is a plain div (the ScanlineReveal sits inside it) — the same pattern the
          back uses, so the front scrolls reliably and its scan develops the full content like the back. */}
      <div className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
        {/* One slow scan develops the whole front. */}
        <ScanlineReveal trigger="mount" duration="epic" stagger="loose" glow className="flex flex-col gap-6">
          {/* identity */}
        <div className="flex flex-col gap-5 sm:flex-row">
          <img
            src={data.photoUrl}
            alt={`${data.name} dossier photo`}
            className="h-[140px] w-[112px] shrink-0 rounded-lg object-cover sm:h-[200px] sm:w-[160px]"
          />
          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="u-mono text-[12px] tracking-[0.35em]" style={{ color: 'var(--accent)' }}>
                {data.codename}
              </span>
              <span className="u-mono text-[12px] tracking-[0.2em] text-[color:var(--muted)]">· {data.status}</span>
            </div>
            <h2 className="u-display mt-1 text-4xl font-semibold tracking-tight text-[color:var(--ice)] md:text-5xl">
              {data.name}
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {data.contacts.map((c) => (
                <ContactChip key={c.label} contact={c} />
              ))}
              <OutlineTrace className="order-first ml-0 sm:order-none sm:ml-auto" glow>
                <a
                  href={data.resumePdfUrl}
                  download="Timmy Lei Resume.pdf"
                  className="u-mono block rounded-full px-4 py-1.5 text-[11px] font-medium tracking-wide"
                  style={{ background: 'var(--accent)', color: 'var(--void)' }}
                >
                  ↓ DOWNLOAD RESUME
                </a>
              </OutlineTrace>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--line)' }} />

        {/* about + radar */}
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col">
            <div className="u-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted)]">about</div>
            <div className="mt-2 flex flex-col gap-1.5 text-[15px] leading-relaxed text-[color:var(--ice)]/90">
              {splitSentences(data.about).map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
          <div className="hidden items-center justify-center md:flex" style={{ color: 'var(--accent)' }}>
            <SkillRadar data={data.softSkills} trigger="mount" size={260} />
          </div>
        </div>
        </ScanlineReveal>
      </div>

      <DecryptBand onFlip={onFlip} decrypted={decrypted} />
    </>
  );
}

const CHIP_CLASS =
  'u-mono inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] text-[color:var(--muted)] transition-colors hover:text-[color:var(--ice)]';
const CHIP_STYLE = { border: '1px solid var(--line)' } as const;

/**
 * A contact chip. `mailto:` copies the address to the clipboard and shows a 2s "Copied" toast;
 * external (`http`) links open in a new tab; anything else is a plain in-page link.
 */
function ContactChip({ contact }: { contact: DossierContact }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const inner = (
    <>
      <span aria-hidden style={{ color: 'var(--accent)' }}>{contact.icon}</span>
      {contact.label}
    </>
  );

  if (contact.href.startsWith('mailto:')) {
    const email = contact.href.replace(/^mailto:/, '');
    const copy = async () => {
      try {
        await navigator.clipboard.writeText(email);
      } catch {
        return; // clipboard blocked (e.g. insecure context) — skip the toast rather than lie
      }
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    };
    return (
      <span className="relative inline-flex">
        <button
          type="button"
          onClick={copy}
          className={CHIP_CLASS}
          style={CHIP_STYLE}
          aria-label={`Copy email ${email} to clipboard`}
        >
          {inner}
        </button>
        <AnimatePresence>
          {copied && (
            <motion.span
              role="status"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18 }}
              className="u-mono pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md px-2.5 py-1 text-[10px] tracking-wide"
              style={{ background: 'var(--accent)', color: 'var(--void)', boxShadow: '0 4px 14px rgba(0,0,0,0.4)' }}
            >
              Copied to clipboard
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    );
  }

  const external = /^https?:/.test(contact.href);
  return (
    <a
      href={contact.href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={CHIP_CLASS}
      style={CHIP_STYLE}
    >
      {inner}
    </a>
  );
}

/** Front CTA band: a persistent cue to view the verso, beside the DECRYPT FILE button. */
function DecryptBand({
  onFlip,
  decrypted,
}: {
  onFlip: () => void;
  decrypted: boolean;
}) {
  return (
    <div
      className="flex flex-col items-start gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
      style={{ borderTop: '1px solid var(--line)', background: 'rgba(255,255,255,0.02)' }}
    >
      <div className="u-mono text-[11px] leading-relaxed tracking-wide text-[color:var(--muted)]">
        <span>
          Click to view background <span className="inline-block rotate-90 text-[color:var(--accent)] sm:rotate-0" aria-hidden>→</span>
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {!decrypted && <GuideArrow />}
        <OutlineTrace glow>
          <DecryptButton onFlip={onFlip} decrypted={decrypted} />
        </OutlineTrace>
      </div>
    </div>
  );
}

/** A glowing arrow nudging viewers from the summary toward the DECRYPT button. */
function GuideArrow() {
  const reduced = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className="text-xl leading-none"
      style={{ color: 'var(--accent)', filter: 'drop-shadow(0 0 6px var(--accent))' }}
      animate={reduced ? undefined : { x: [0, 5, 0] }}
      transition={reduced ? undefined : { duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
    >
      →
    </motion.span>
  );
}

type DecryptPhase = 'idle' | 'decrypting' | 'granted';

/**
 * The primary front action. First time: scramble → unlock → flip. Once the file's been decrypted, it
 * settles back to a plain `VIEW DECRYPTION` button that re-opens the back on click (repeatable) — so the
 * sequence never dead-ends on "ACCESS GRANTED".
 */
function DecryptButton({ onFlip, decrypted }: { onFlip: () => void; decrypted: boolean }) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<DecryptPhase>('idle');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const run = () => {
    if (phase !== 'idle') return;
    // Already opened once (or reduced motion): skip the theatrics and just re-open the back.
    if (reduced || decrypted) {
      onFlip();
      return;
    }
    setPhase('decrypting');
    timers.current.push(setTimeout(() => setPhase('granted'), 750));
    timers.current.push(setTimeout(onFlip, 1150)); // flip while ACCESS GRANTED reads — covers the rotation
    timers.current.push(setTimeout(() => setPhase('idle'), 1700)); // reset while on the back → returns as VIEW DECRYPTION
  };

  const label =
    phase === 'decrypting'
      ? 'DECRYPTING…'
      : phase === 'granted'
        ? 'ACCESS GRANTED'
        : decrypted
          ? 'VIEW DECRYPTION'
          : 'DECRYPT FILE';

  return (
    <motion.button
      type="button"
      onClick={run}
      aria-label={decrypted ? 'View decryption — flip to the full dossier' : 'Decrypt file — view full dossier'}
      className="u-mono inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2 text-[12px] font-medium tracking-[0.15em]"
      style={{ background: 'var(--accent)', color: 'var(--void)' }}
      animate={
        reduced || phase !== 'idle'
          ? { boxShadow: '0 0 0px 0px color-mix(in srgb, var(--accent) 60%, transparent)' }
          : {
              boxShadow: [
                '0 0 0px 0px color-mix(in srgb, var(--accent) 60%, transparent)',
                '0 0 18px 3px color-mix(in srgb, var(--accent) 55%, transparent)',
                '0 0 0px 0px color-mix(in srgb, var(--accent) 60%, transparent)',
              ],
            }
      }
      transition={reduced ? { duration: 0 } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <LockGlyph open={phase !== 'idle' || decrypted} />
      <span>{label}</span>
    </motion.button>
  );
}

/** Inline padlock whose shackle lifts open when decrypting. */
function LockGlyph({ open }: { open: boolean }) {
  return (
    <svg width="13" height="15" viewBox="0 0 13 15" fill="none" aria-hidden>
      <motion.path
        d="M3 6V4.2a3.5 3.5 0 0 1 7 0V6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        style={{ transformOrigin: '3px 6px' }}
        animate={open ? { rotate: -28, y: -1 } : { rotate: 0, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 18 }}
      />
      <rect x="1" y="6" width="11" height="8" rx="1.4" fill="currentColor" />
    </svg>
  );
}

/** Quiet placeholder behind the (rotated-away) back face before the card is ever flipped. */
function BackPlaceholder() {
  return <StampBar right="FILE 001 — VERSO" />;
}

/** Header-only front shown while the scene is still opening — front content mounts once `ready`. */
function FrontPlaceholder() {
  return <StampBar right="FILE 001" />;
}

function CardBack({ data, onFlip }: { data: DossierData; onFlip: () => void }) {
  const [tab, setTab] = useState<'log' | 'loadout'>('log');
  return (
    <>
      <StampBar right="FILE 001 — VERSO" />
      <div className="flex items-center gap-2 px-6 pt-4">
        <TabButton active={tab === 'log'} onClick={() => setTab('log')}>
          MISSION LOG
        </TabButton>
        <TabButton active={tab === 'loadout'} onClick={() => setTab('loadout')}>
          CREDENTIALS & LOADOUT
        </TabButton>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8" role="tabpanel">
        {tab === 'log' ? (
          // One slow scan line traverses the whole log; each experience entry develops as it passes.
          <ScanlineReveal trigger="mount" duration="epic" stagger="loose" glow className="flex flex-col gap-6">
            {data.experience.map((e) => (
              <div key={`${e.org}-${e.period}`} className="relative pl-5">
                <span className="absolute left-0 top-[0.875rem] h-2 w-2 -translate-y-1/2 rounded-full" style={{ background: 'var(--accent)' }} />
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="u-display text-lg font-semibold text-[color:var(--ice)]">{e.role}</h3>
                  <div className="u-mono text-[11px] tracking-wider text-[color:var(--muted)]">{e.period}</div>
                </div>
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="u-mono text-[12px] tracking-wide" style={{ color: 'var(--accent)' }}>{e.org}</span>
                  <span className="u-mono text-[11px] tracking-wide text-[color:var(--muted)]">· {e.orgType}</span>
                </div>
                <div className="mt-2 flex flex-col gap-1.5">
                  {e.points.map((p) => (
                    <div key={p} className="flex gap-2 text-[14px] leading-relaxed text-[color:var(--ice)]/85">
                      <span aria-hidden style={{ color: 'var(--muted)' }}>›</span>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </ScanlineReveal>
        ) : (
          <div className="flex flex-col gap-8">
            <Section title="education">
              <div className="flex flex-col gap-2">
                <div className="text-[16px] font-medium text-[color:var(--ice)]">{data.education.degree}</div>
                <div className="text-[13px] leading-relaxed text-[color:var(--muted)]">
                  {data.education.institution} · {data.education.period}
                </div>
                {data.education.minors && data.education.minors.length > 0 && (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="u-mono text-[11px] tracking-wide text-[color:var(--muted)]">Minors:</span>
                    <LineStagger trigger="mount" stagger="tight" from="none" className="flex flex-wrap gap-2">
                      {data.education.minors.map((m) => (
                        <span key={m} className={PILL_CLASS} style={PILL_STYLE}>{m}</span>
                      ))}
                    </LineStagger>
                  </div>
                )}
              </div>
            </Section>
            <Section title="certifications">
              <LineStagger trigger="mount" className="flex flex-wrap gap-3">
                {data.certifications.map((c) => (
                  <Badge key={c.name} title={c.name} sub={`${c.issuer}${c.completed ? ` · ${c.completed}` : ''}`} />
                ))}
              </LineStagger>
            </Section>
            <Section title="tools & tech">
              <LineStagger trigger="mount" stagger="tight" from="none" className="flex flex-wrap gap-2">
                {data.tools.map((t) => (
                  <span key={t} className={PILL_CLASS} style={PILL_STYLE}>
                    {t}
                  </span>
                ))}
              </LineStagger>
            </Section>
          </div>
        )}
      </div>

      <FlipCue label="← BACK TO FRONT" onClick={onFlip} />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="u-mono mb-3 block text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted)]">
        {title}
      </span>
      {children}
    </div>
  );
}

const PILL_CLASS = 'u-mono rounded-full px-3 py-1 text-[12px] text-[color:var(--ice)]/85';
const PILL_STYLE = {
  border: '1px solid color-mix(in srgb, var(--accent) 35%, transparent)',
  background: 'rgba(255,255,255,0.02)',
} as const;

function Badge({ title, sub }: { title: string; sub: string }) {
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{ border: '1px solid var(--line)', background: 'rgba(255,255,255,0.02)', minWidth: 150 }}
    >
      <div className="text-[14px] font-medium text-[color:var(--ice)]">{title}</div>
      <div className="u-mono mt-0.5 text-[10px] tracking-wide text-[color:var(--muted)]">{sub}</div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="u-mono rounded-t-lg px-3 py-2 text-[11px] tracking-[0.15em] transition-colors"
      style={{
        color: active ? 'var(--ice)' : 'var(--muted)',
        borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
      }}
    >
      {children}
    </button>
  );
}

function FlipCue({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="u-mono py-3 text-center text-[11px] tracking-[0.2em] transition-colors hover:text-[color:var(--ice)]"
      style={{ borderTop: '1px solid var(--line)', color: 'var(--muted)', background: 'rgba(255,255,255,0.02)' }}
    >
      {label}
    </button>
  );
}

/** Split a paragraph into sentence lines so the scanline develops them one trailing the next. */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.?!—])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
