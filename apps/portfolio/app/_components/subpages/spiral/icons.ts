import { Bot, CalendarX, ClipboardList, Send, Sparkles, Users, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Resolve the lucide icon names stored in `systems.ts` to components (static map, not dynamic
// import, so the bundle only pulls the icons actually used). Add an entry when a new card's icon
// name is introduced in the data.
export const SYSTEM_ICONS: Record<string, LucideIcon> = {
  Bot,
  Send,
  CalendarX,
  ClipboardList,
  Wallet,
  Users,
  Sparkles,
};

/** Fallback to Sparkles if a data icon name has no mapping yet. */
export function resolveIcon(name: string): LucideIcon {
  return SYSTEM_ICONS[name] ?? Sparkles;
}
