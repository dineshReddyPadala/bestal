import { DashboardLayout } from '@bestal/ui';
import { Outlet, useLocation } from 'react-router-dom';
import { adminNavItems } from '../lib/nav';

const adminUser = {
  name: 'Jordan Hayes',
  email: 'admin@bestal.com',
  role: 'Platform Admin',
};

export function AdminShell() {
  const { pathname } = useLocation();
  const currentPath = pathname.startsWith('/admin/candidates')
    ? '/admin/candidates'
    : pathname;

  return (
    <DashboardLayout
      navItems={adminNavItems}
      portalName="Admin Portal"
      user={adminUser}
      currentPath={currentPath}
    >
      <Outlet />
    </DashboardLayout>
  );
}
