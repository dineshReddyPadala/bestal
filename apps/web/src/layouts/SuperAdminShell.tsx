import { useMemo } from 'react';
import { DashboardLayout } from '@bestal/ui';
import { Outlet, useLocation } from 'react-router-dom';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { useDashboardUser } from '../hooks/useDashboardUser';
import { usePermissions } from '../hooks/usePermissions';
import { BESTAL_LOGO_SRC } from '../lib/brand';
import { filterNavItemsByPermissions, resolveActiveNavPath, superAdminNavItems } from '../lib/nav';

export function SuperAdminShell() {
  const { pathname } = useLocation();
  const { user, handleLogout } = useDashboardUser();
  const { has } = usePermissions();
  const navItems = useMemo(
    () => filterNavItemsByPermissions(superAdminNavItems, has),
    [has],
  );

  const currentPath = resolveActiveNavPath(pathname, '/super-admin');

  return (
    <DashboardLayout
      navItems={navItems}
      portalName="Super Admin"
      user={user}
      currentPath={
        pathname.startsWith('/super-admin/candidates/pending')
          ? '/super-admin/candidates/pending'
          : pathname.startsWith('/super-admin/candidates')
            ? '/super-admin/candidates'
            : pathname.startsWith('/super-admin/users')
              ? '/super-admin/users'
              : pathname.startsWith('/super-admin/roles')
                ? '/super-admin/roles'
              : pathname.startsWith('/super-admin/clients')
                ? '/super-admin/clients'
                : pathname.startsWith('/super-admin/client-enquiries') ||
                    pathname.startsWith('/super-admin/contact-messages')
                  ? '/super-admin/client-enquiries'
                : pathname.startsWith('/super-admin/platform-settings') ||
                    pathname.startsWith('/super-admin/settings')
                  ? '/super-admin/platform-settings'
                  : pathname.startsWith('/super-admin/icons')
                    ? '/super-admin/icons'
                  : pathname.startsWith('/super-admin/reports') ||
                      pathname.startsWith('/super-admin/margin')
                    ? '/super-admin/reports'
                    : currentPath
      }
      onLogout={handleLogout}
      headerActions={<NotificationBell />}
      brandLogoSrc={BESTAL_LOGO_SRC}
    >
      <Outlet />
    </DashboardLayout>
  );
}
