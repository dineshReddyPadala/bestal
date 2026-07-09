import { DashboardLayout } from '@bestal/ui';
import { Outlet, useLocation } from 'react-router-dom';
import { clientNavItems } from '../lib/nav';
import { useDashboardUser } from '../hooks/useDashboardUser';

export function ClientShell() {
  const { pathname } = useLocation();
  const { user, handleLogout } = useDashboardUser();
  const currentPath = pathname.startsWith('/client/candidates')
    ? '/client/search'
    : pathname;

  return (
    <DashboardLayout
      navItems={clientNavItems}
      portalName="Client Portal"
      user={user}
      currentPath={currentPath}
      onLogout={handleLogout}
    >
      <Outlet />
    </DashboardLayout>
  );
}
