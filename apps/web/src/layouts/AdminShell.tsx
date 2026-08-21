import { useMemo } from 'react';
import { DashboardLayout } from '@bestal/ui';
import { Outlet, useLocation } from 'react-router-dom';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { useDashboardUser } from '../hooks/useDashboardUser';
import { usePermissions } from '../hooks/usePermissions';
import { BESTAL_LOGO_SRC } from '../lib/brand';
import { adminNavItems, filterNavItemsByPermissions } from '../lib/nav';

export function AdminShell() {
  const { pathname } = useLocation();
  const { user, handleLogout } = useDashboardUser();
  const { has } = usePermissions();
  const navItems = useMemo(() => filterNavItemsByPermissions(adminNavItems, has), [has]);
  const currentPath = pathname.startsWith('/admin/client-enquiries')
    ? '/admin/client-enquiries'
    : pathname.startsWith('/admin/candidate-approvals')
    ? '/admin/candidate-approvals'
    : pathname.startsWith('/admin/candidates')
      ? '/admin/candidates'
      : pathname.startsWith('/admin/clients')
        ? '/admin/clients'
        : pathname;

  return (
    <DashboardLayout
      navItems={navItems}
      portalName="Admin Portal"
      user={user}
      currentPath={currentPath}
      onLogout={handleLogout}
      headerActions={<NotificationBell />}
      brandLogoSrc={BESTAL_LOGO_SRC}
    >
      <Outlet />
    </DashboardLayout>
  );
}
