import { Fade } from '@umbra/motion';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 text-neutral-50">
      <Fade duration="slow">
        <h1 className="text-5xl font-semibold tracking-tight">Umbra Playground</h1>
      </Fade>
      <Fade duration="cinematic">
        <p className="text-neutral-400">
          Phase 0 — toolkit wired across the workspace boundary.
        </p>
      </Fade>
    </main>
  );
}
