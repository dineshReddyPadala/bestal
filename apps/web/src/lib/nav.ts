import { adminNav, clientNav, recruiterNav, salesNav, superAdminNav } from '@bestal/mock-data';
import type { DashboardNavItem } from '@bestal/ui';

type NavSourceItem = {
  label: string;
  href: string;
  icon?: string;
  badge?: number;
};

export type PermissionNavItem = DashboardNavItem & {
  permission?: string;
};

const NAV_ITEM_PERMISSIONS: Record<string, string> = {
  '/super-admin/client-enquiries': 'job-requests:read',
  '/admin/client-enquiries': 'job-requests:read',
  '/sales/client-enquiries': 'job-requests:read',
};

function toNavItems(nav: readonly NavSourceItem[]): PermissionNavItem[] {
  return nav.map((item) => ({
    label: item.label,
    href: item.href,
    icon: item.icon,
    badge: item.badge,
    permission: NAV_ITEM_PERMISSIONS[item.href],
  }));
}

export const adminNavItems = toNavItems(adminNav);
export const recruiterNavItems = toNavItems(recruiterNav);
export const clientNavItems = toNavItems(clientNav);
export const salesNavItems = toNavItems(salesNav);
export const superAdminNavItems = toNavItems(superAdminNav);

export function filterNavItemsByPermissions(
  items: PermissionNavItem[],
  hasPermission: (permission: string) => boolean,
): DashboardNavItem[] {
  return items
    .filter((item) => !item.permission || hasPermission(item.permission))
    .map(({ label, href, icon, badge }) => ({ label, href, icon, badge }));
}

export function resolveActiveNavPath(pathname: string, basePath: string): string {
  if (pathname.startsWith(`${basePath}/`)) {
    const segment = pathname.slice(basePath.length + 1).split('/')[0];
    return `${basePath}/${segment}`;
  }

  return pathname;
}
