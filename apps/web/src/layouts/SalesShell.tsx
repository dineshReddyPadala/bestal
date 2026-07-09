import { DashboardLayout } from '@bestal/ui';
import { Outlet, useLocation } from 'react-router-dom';
import { salesNavItems } from '../lib/nav';
import { useDashboardUser } from '../hooks/useDashboardUser';

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
    >
      <Outlet />
    </DashboardLayout>
  );
}
