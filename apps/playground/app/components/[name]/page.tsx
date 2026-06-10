import { notFound } from 'next/navigation';
import { catalog } from '@umbra/motion';
import { registry } from '../_registry';
import { ComponentDetail } from '../_detail/ComponentDetail';

export function generateStaticParams() {
  return catalog.flatMap((c) => c.components).map((c) => ({ name: c.name }));
}

export const dynamicParams = false;

export default async function Page({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!registry[name]) notFound();
  return <ComponentDetail name={name} />;
}
