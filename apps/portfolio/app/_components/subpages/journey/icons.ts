// Explicit lucide icon registry (keeps the bundle lean vs. a namespace import). Add the name here
// when a case-study card or feature row references a new icon.
import {
  BellRing,
  Boxes,
  CircleAlert,
  Compass,
  Database,
  Eye,
  GitFork,
  HelpCircle,
  LayoutDashboard,
  NotebookText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

export const ICONS: Record<string, LucideIcon> = {
  BellRing,
  Boxes,
  CircleAlert,
  Compass,
  Database,
  Eye,
  GitFork,
  HelpCircle,
  LayoutDashboard,
  NotebookText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  Workflow,
};

export function getIcon(name?: string): LucideIcon | null {
  if (!name) return null;
  return ICONS[name] ?? null;
}
