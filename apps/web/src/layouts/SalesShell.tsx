import { DashboardLayout } from '@bestal/ui';
import { Outlet, useLocation } from 'react-router-dom';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { useDashboardUser } from '../hooks/useDashboardUser';
import { BESTAL_LOGO_SRC } from '../lib/brand';
import { salesNavItems } from '../lib/nav';

export function SalesShell() {
  const { pathname } = useLocation();
  const { user, handleLogout } = useDashboardUser();
  const currentPath = pathname.startsWith('/sales/clients')
    ? '/sales/clients'
    : pathname;

  return (
    <DashboardLayout
      navItems={salesNavItems}
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
