import { DashboardLayout } from '@bestal/ui';
import { Outlet, useLocation } from 'react-router-dom';
import { salesNavItems } from '../lib/nav';

const salesUser = {
  name: 'Sarah Chen',
  email: 'sales@bestal.com',
  role: 'Account Executive',
};

export function SalesShell() {
  const { pathname } = useLocation();
  const currentPath = pathname.startsWith('/sales/clients')
    ? '/sales/clients'
    : pathname;

  return (
    <DashboardLayout
      navItems={salesNavItems}
      portalName="Sales Portal"
      user={salesUser}
      currentPath={currentPath}
    >
      <Outlet />
    </DashboardLayout>
  );
}
