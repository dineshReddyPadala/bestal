import { LayoutDashboard, TrendingUp, Users, type LucideIcon } from 'lucide-react';
import type { MarketingPortalOption } from '../components/marketing/MarketingPortalOptionList';

export const LOGIN_PORTAL_CHOOSER_PATH = '/login/portal';
export const STAFF_PORTAL_LOGIN_PATH = '/login/portal';
export const CLIENT_LOGIN_PATH = '/login/client';

export type LoginHeroVariant = 'staff' | 'client';

export function getLoginHeroVariant(pathname: string): LoginHeroVariant {
  if (pathname === STAFF_PORTAL_LOGIN_PATH || isStaffAuthPath(pathname)) return 'staff';
  if (pathname.startsWith('/login/client')) return 'client';
  return 'client';
}

export function isStaffAuthPath(pathname: string): boolean {
  return /^\/(admin|sales|recruiter)\/(login|forgot-password|reset-password)/.test(pathname);
}

export function isStaffSplitLoginPath(pathname: string): boolean {
  return pathname === STAFF_PORTAL_LOGIN_PATH || isStaffAuthPath(pathname);
}

export function isPortalLoginPath(pathname: string): boolean {
  return pathname === STAFF_PORTAL_LOGIN_PATH || pathname.startsWith('/login/client');
}

export function isClientSignupPath(pathname: string): boolean {
  return pathname.startsWith(`${CLIENT_LOGIN_PATH}/signup`);
}

export type PortalLink = {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  colorClass: string;
};

/** Staff portal picker at /login/portal — Admin, Sales, Recruiter. */
export function getStaffTeamPortals(options: { adminHref: string }): MarketingPortalOption[] {
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
  ];
}
