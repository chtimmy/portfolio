import { Fade } from '@umbra/motion';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white text-neutral-900">
      <Fade duration="slow">
        <h1 className="text-6xl font-semibold tracking-tight">Timmy</h1>
      </Fade>
      <Fade duration="cinematic">
        <p className="text-neutral-500">Portfolio — built with a tool I built.</p>
      </Fade>
    </main>
  );
}
