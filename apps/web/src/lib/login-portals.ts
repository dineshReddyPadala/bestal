import { Briefcase, LayoutDashboard, TrendingUp, User, Users, type LucideIcon } from 'lucide-react';
import type { MarketingPortalOption } from '../components/marketing/MarketingPortalOptionList';

export const LOGIN_PORTAL_PICKER_PATH = '/login/portals';

export function isLoginPortalPickerPath(pathname: string): boolean {
  return pathname === LOGIN_PORTAL_PICKER_PATH;
}

export type PortalLink = {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  colorClass: string;
};

/** Top-level portal picker (Portal Login + Customer Login). */
export const TOP_LEVEL_PORTALS: PortalLink[] = [
  {
    id: 'login',
    name: 'Client Login',
    description: 'Browse vetted engineers, review test results, and request trials.',
    href: '/login/engineers',
    icon: User,
    colorClass: 'is-green',
  },
  {
    id: 'admin',
    name: 'Portal Login',
    description: 'Daily platform operations: candidates, evaluations, BGV, clients, and trials.',
    href: '/login/portals/admin',
    icon: LayoutDashboard,
    colorClass: 'is-violet',
  },

];

export function getTeamPortals(options: {
  adminHref: string;
  clientHref: string;
}): MarketingPortalOption[] {
  return [
    {
      id: 'admin',
      name: 'Admin Portal',
      description: 'Daily platform operations: candidates, evaluations, BGV, clients, and trials.',
      href: options.adminHref,
      icon: LayoutDashboard,
      colorClass: 'is-violet',
    },
    {
      id: 'sales',
      name: 'Sales Portal',
      description: 'Client accounts, trial requests, deployments, and margin tracking.',
      href: '/sales/login',
      icon: TrendingUp,
      colorClass: 'is-amber',
    },
    {
      id: 'recruiter',
      name: 'Recruiter Portal',
      description: 'Candidate pipeline, evaluations, and BGV.',
      href: '/recruiter/login',
      icon: Users,
      colorClass: 'is-teal',
    },
    {
      id: 'client',
      name: 'Client Portal',
      description: 'Browse vetted engineers, review test results, and request trials.',
      href: options.clientHref,
      icon: Briefcase,
      colorClass: 'is-green',
    },
  ];
}
