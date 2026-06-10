import { MotionProvider, Reveal } from '@umbra/motion';

export default function Home() {
  return (
    <MotionProvider
      preset="calm"
      as="main"
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white text-neutral-900"
    >
      <Reveal trigger="mount" duration="slow">
        <h1 className="text-6xl font-semibold tracking-tight">Timmy</h1>
      </Reveal>
      <Reveal trigger="mount" duration="cinematic" delay={0.1}>
        <p className="text-neutral-500">Portfolio — built with a tool I built.</p>
      </Reveal>
    </MotionProvider>
  );
}
