'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MotionProvider, SceneLightbox } from '@umbra/motion';
import { SpaceBackdrop } from './SpaceBackdrop';
import { OrbitSystem } from './OrbitSystem';
import { NodeSubpage } from './subpages/NodeSubpage';
import { ExitIntentPrompt } from './subpages/dossier/ExitIntentPrompt';
import { MobileNotice } from './MobileNotice';
import { PortalReveal } from './PortalReveal';
import { projects } from './projects';
import { NodeNavContext } from './node-nav';

const EMAIL = 'chtimmy02@gmail.com';

/**
 * The hero. Holds the open-node state and composes the backdrop + orbital system inside a single
 * `SceneLightbox`. Clicking a node reports its rect up here; the SceneLightbox then flies the
 * camera in (`flythrough`) or collapses the orbit (`collapse`) into the project panel — and reverses
 * the same motion on close.
 *
 * Entrances use deterministic CSS (`.boot*` in globals.css), not Framer `motion` — so the hero is
 * SSR-safe (no hydration mismatch). The scene-transition Motion only activates on click.
 */
export function Landing() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  // `current` persists through the close animation so the panel content stays mounted while it reverses.
  const [current, setCurrent] = useState<(typeof projects)[number] | null>(null);
  const preset = 'calm';

  // Email: copy to clipboard and flash a brief "copied" confirmation for 2s.
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      // clipboard may be unavailable (insecure context / permissions) — fail quietly
    }
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  }, []);
  useEffect(() => () => void (copyTimer.current && clearTimeout(copyTimer.current)), []);

  // Dossier exit-intent: track whether the résumé file has been decrypted (flipped) and prompt a viewer
  // who tries to leave the scene — or the window — without opening it. Fires at most once per session.
  const [dossierFlipped, setDossierFlipped] = useState(false);
  const [hasDecrypted, setHasDecrypted] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const promptShown = useRef(false);
  const isResumeOpen = openId === 'resume';

  const handleDossierFlip = (flipped: boolean) => {
    setDossierFlipped(flipped);
    if (flipped) setHasDecrypted(true);
  };

  const openNode = (id: string, rect: DOMRect) => {
    const project = projects.find((p) => p.id === id) ?? null;
    setCurrent(project);
    setOriginRect(rect);
    setOpenId(id);
  };

  // Cross-node navigation (e.g. a case-study card → its case-study subpage). The scene stays open, so
  // swapping `current` swaps the panel content in place (every node shares `openAnim: 'collapse'`, so
  // the SceneLightbox transition doesn't re-run). When a source rect is given (the clicked CTA), a
  // portal grows out of that point and *only then* do we commit the swap underneath it — the current
  // view holds until the portal covers the screen, so there's no black-screen flash.
  const [portal, setPortal] = useState<{ id: string; rect: DOMRect } | null>(null);
  const swapToNode = (id: string) => {
    const project = projects.find((p) => p.id === id) ?? null;
    if (project) {
      setCurrent(project);
      setOpenId(id);
    }
  };
  const navigateToNode = useCallback((id: string, rect?: DOMRect) => {
    if (!projects.some((p) => p.id === id)) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rect && !prefersReduced) {
      setPortal({ id, rect }); // grow the portal first; commit on its completion
    } else {
      swapToNode(id);
    }
  }, []);

  // Should the prompt intercept this exit? Resume scene open, never decrypted, not yet shown this session.
  const shouldPrompt = useCallback(
    () => isResumeOpen && !hasDecrypted && !promptShown.current,
    [isResumeOpen, hasDecrypted],
  );

  // SceneLightbox requested close (✕ / Esc / backdrop / Back) — intercept for an undecrypted dossier.
  // Returning `false` vetoes the close, so SceneLightbox keeps the scene open behind the prompt.
  const requestClose = () => {
    if (shouldPrompt()) {
      promptShown.current = true;
      setPromptOpen(true);
      return false;
    }
    setOpenId(null);
    return true;
  };

  // Window exit-intent (desktop / fine pointer only): cursor leaving the top edge of the viewport.
  useEffect(() => {
    if (!isResumeOpen) return;
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) return;
    // Don't treat the cursor leaving the top edge as an exit attempt until the scene
    // has settled — an upward mouse sweep right after opening (toward the browser
    // chrome) shouldn't be mistaken for the viewer leaving.
    let armed = false;
    const armTimer = window.setTimeout(() => {
      armed = true;
    }, 1200);
    const onMouseLeave = (e: MouseEvent) => {
      if (armed && e.clientY <= 0 && shouldPrompt()) {
        promptShown.current = true;
        setPromptOpen(true);
      }
    };
    document.addEventListener('mouseleave', onMouseLeave);
    return () => {
      clearTimeout(armTimer);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isResumeOpen, shouldPrompt]);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      {/*
        This portfolio IS a motion showcase, so it deliberately plays its full motion rather than
        collapsing to the reduced-motion fallbacks — otherwise a viewer (or the author) who keeps
        prefers-reduced-motion on system-wide would never see the scramble / image-wipe / orbit at all.
        `reducedMotion={false}` forces the rich experience for every descendant component.
      */}
      <MotionProvider
        preset={preset}
        reducedMotion={false}
        as="main"
        className="relative flex min-h-[100dvh] flex-col"
      >
        <SceneLightbox
          open={openId != null}
          onClose={requestClose}
          onClosed={() => {
            setCurrent(null);
            setDossierFlipped(false); // reset the flip for next open; `hasDecrypted` persists the session
          }}
          originRect={originRect}
          transition={current?.openAnim ?? 'flythrough'}
          surface="var(--deep)"
          label={current ? `${current.name} — ${current.kind}` : undefined}
          far={<SpaceBackdrop />}
          near={
            <div className="boot-scale" style={{ animationDelay: '0.15s' }}>
              <OrbitSystem activeId={current?.id ?? null} onOpen={openNode} />
            </div>
          }
          panel={
            current ? (
              <NodeNavContext.Provider value={navigateToNode}>
                {/* Keyed by node id so an in-place node swap remounts and fades its content in (the
                    post-portal reveal for case-study nav, and a quick pop for normal opens). */}
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  <NodeSubpage
                    project={current}
                    dossierFlipped={dossierFlipped}
                    onDossierFlippedChange={handleDossierFlip}
                  />
                </motion.div>
              </NodeNavContext.Provider>
            ) : null
          }
        />

        {portal && (
          <PortalReveal
            rect={portal.rect}
            onDone={() => {
              swapToNode(portal.id); // commit the page change now that the portal covers the screen
              setPortal(null);
            }}
          />
        )}

        <ExitIntentPrompt
          open={promptOpen}
          onDecrypt={() => {
            handleDossierFlip(true);
            setPromptOpen(false);
          }}
          onLeave={() => {
            setPromptOpen(false);
            setOpenId(null);
          }}
          onDismiss={() => setPromptOpen(false)}
        />

        <MobileNotice />

        {/* eyebrow (outside the camera so it doesn't fly) */}
        <header className="u-mono pointer-events-none absolute inset-x-6 top-6 z-20 hidden text-[11px] tracking-[0.12em] text-[color:var(--muted)] sm:flex">
          <span className="boot flex items-center gap-2">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: 'var(--active)' }}
            />
            OPEN TO WORK
          </span>
        </header>

        {/* thesis (top) — sits between the eyebrow row and the original drop */}
        <div className="pointer-events-none absolute inset-x-0 top-10 z-20 px-6 text-center sm:top-12">
          <h1
            className="boot u-display text-base font-semibold tracking-tight text-[color:var(--ice)] sm:text-2xl"
            style={{ animationDelay: '0.1s' }}
          >
            Systems That Keep Businesses in Motion
          </h1>
          <p
            className="boot u-mono mt-2 text-[9px] tracking-[0.15em] text-[color:var(--muted)] sm:text-[11px]"
            style={{ animationDelay: '0.35s' }}
          >
            click a file to learn more
          </p>
        </div>

        {/* bottom bar: contact (centered) */}
        <div className="absolute inset-x-6 bottom-6 z-20 flex items-center justify-center">
          <div className="relative">
            <button
              type="button"
              onClick={copyEmail}
              className="u-mono cursor-pointer text-[9px] tracking-wider text-[color:var(--muted)] transition-colors hover:text-[color:var(--ice)] sm:text-[11px]"
            >
              Contact: {EMAIL}
            </button>
            <AnimatePresence>
              {copied && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.18 }}
                  className="u-mono pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] tracking-wider"
                  style={{
                    background: 'color-mix(in srgb, var(--deep) 85%, transparent)',
                    color: 'var(--active)',
                    border: '1px solid var(--line)',
                  }}
                >
                  Copied to clipboard
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </MotionProvider>
    </div>
  );
}
