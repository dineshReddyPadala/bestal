import {
  Briefcase,
  Building2,
  Calendar,
  CheckSquare,
  ChevronRight,
  Circle,
  ClipboardCheck,
  FileText,
  FlaskConical,
  Home,
  Layers,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Rocket,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  home: Home,
  'layout-dashboard': LayoutDashboard,
  'building-2': Building2,
  users: Users,
  briefcase: Briefcase,
  'user-check': UserCheck,
  layers: Layers,
  rocket: Rocket,
  'scroll-text': ScrollText,
  settings: Settings,
  'clipboard-check': ClipboardCheck,
  'list-checks': ListChecks,
  calendar: Calendar,
  'shield-check': ShieldCheck,
  'check-square': CheckSquare,
  'file-text': FileText,
  'flask-conical': FlaskConical,
  search: Search,
  menu: Menu,
  x: X,
  'log-out': LogOut,
  'chevron-right': ChevronRight,
};

export function resolveIcon(name?: string): LucideIcon {
  if (!name) return Circle;
  return ICON_MAP[name] ?? Circle;
}

export type { LucideIcon };
