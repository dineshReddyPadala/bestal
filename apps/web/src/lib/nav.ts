import { adminNav, clientNav, recruiterNav, salesNav } from '@bestal/mock-data';
import type { DashboardNavItem } from '@bestal/ui';

function toNavItems(
  nav: readonly { label: string; href: string; icon?: string; badge?: number }[],
): DashboardNavItem[] {
  return nav.map((item) => ({
    label: item.label,
    href: item.href,
    icon: item.icon,
    badge: 'badge' in item ? item.badge : undefined,
  }));
}

export const adminNavItems = toNavItems(adminNav);
export const recruiterNavItems = toNavItems(recruiterNav);
export const clientNavItems = toNavItems(clientNav);
export const salesNavItems = toNavItems(salesNav);

export function resolveActiveNavPath(pathname: string, basePath: string): string {
  if (pathname.startsWith(`${basePath}/`)) {
    const segment = pathname.slice(basePath.length + 1).split('/')[0];
    return `${basePath}/${segment}`;
  }

  return pathname;
}
