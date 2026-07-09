import { DashboardLayout } from '@bestal/ui';
import { Outlet, useLocation } from 'react-router-dom';
import { adminNavItems } from '../lib/nav';
import { useDashboardUser } from '../hooks/useDashboardUser';

export function AdminShell() {
  const { pathname } = useLocation();
  const { user, handleLogout } = useDashboardUser();
  const currentPath = pathname.startsWith('/admin/candidate-approvals')
    ? '/admin/candidate-approvals'
    : pathname.startsWith('/admin/candidates')
      ? '/admin/candidates'
      : pathname.startsWith('/admin/clients')
        ? '/admin/clients'
        : pathname;

  return (
    <DashboardLayout
      navItems={adminNavItems}
      portalName="Admin Portal"
      user={user}
      currentPath={currentPath}
      onLogout={handleLogout}
    >
      <Outlet />
    </DashboardLayout>
  );
}
