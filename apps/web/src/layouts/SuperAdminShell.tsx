import { DashboardLayout } from '@bestal/ui';
import { Outlet, useLocation } from 'react-router-dom';
import { useDashboardUser } from '../hooks/useDashboardUser';
import { resolveActiveNavPath, superAdminNavItems } from '../lib/nav';

export function SuperAdminShell() {
  const { pathname } = useLocation();
  const { user, handleLogout } = useDashboardUser();
  const currentPath = resolveActiveNavPath(pathname, '/super-admin');

  return (
    <DashboardLayout
      navItems={superAdminNavItems}
      portalName="Super Admin"
      user={user}
      currentPath={
        pathname.startsWith('/super-admin/candidates/pending')
          ? '/super-admin/candidates/pending'
          : pathname.startsWith('/super-admin/candidates')
            ? '/super-admin/candidates'
            : pathname.startsWith('/super-admin/users')
              ? '/super-admin/users'
              : pathname.startsWith('/super-admin/clients')
                ? '/super-admin/clients'
                : pathname.startsWith('/super-admin/data-import') ||
                    pathname.startsWith('/super-admin/oorwin-sync')
                  ? '/super-admin/data-import'
                  : pathname.startsWith('/super-admin/platform-settings') ||
                      pathname.startsWith('/super-admin/settings')
                    ? '/super-admin/platform-settings'
                    : pathname.startsWith('/super-admin/reports') ||
                        pathname.startsWith('/super-admin/margin')
                      ? '/super-admin/reports'
                      : currentPath
      }
      onLogout={handleLogout}
    >
      <Outlet />
    </DashboardLayout>
  );
}
