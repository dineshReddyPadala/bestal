import { DashboardLayout } from '@bestal/ui';
import { Outlet, useLocation } from 'react-router-dom';
import { clientNavItems } from '../lib/nav';
import { DEMO_USER } from '../lib/demo-client';

export function ClientShell() {
  const { pathname } = useLocation();
  const currentPath = pathname.startsWith('/client/candidates')
    ? '/client/search'
    : pathname;

  return (
    <DashboardLayout
      navItems={clientNavItems}
      portalName="Client Portal"
      user={DEMO_USER}
      currentPath={currentPath}
    >
      <Outlet />
    </DashboardLayout>
  );
}
