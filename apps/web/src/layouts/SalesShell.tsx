import { useMemo } from 'react';
import { DashboardLayout } from '@bestal/ui';
import { Outlet, useLocation } from 'react-router-dom';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { useDashboardUser } from '../hooks/useDashboardUser';
import { usePermissions } from '../hooks/usePermissions';
import { BESTAL_LOGO_SRC } from '../lib/brand';
import { filterNavItemsByPermissions, salesNavItems } from '../lib/nav';

export function SalesShell() {
  const { pathname } = useLocation();
  const { user, handleLogout } = useDashboardUser();
  const { has } = usePermissions();
  const navItems = useMemo(() => filterNavItemsByPermissions(salesNavItems, has), [has]);
  const currentPath = pathname.startsWith('/sales/client-enquiries')
    ? '/sales/client-enquiries'
    : pathname.startsWith('/sales/clients')
    ? '/sales/clients'
    : pathname;

  return (
    <DashboardLayout
      navItems={navItems}
      portalName="Sales Portal"
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
