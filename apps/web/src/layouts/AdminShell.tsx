import { DashboardLayout } from '@bestal/ui';
import { Outlet, useLocation } from 'react-router-dom';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { useDashboardUser } from '../hooks/useDashboardUser';
import { BESTAL_LOGO_SRC } from '../lib/brand';
import { adminNavItems } from '../lib/nav';

export function AdminShell() {
  const { pathname } = useLocation();
  const { user, handleLogout } = useDashboardUser();
  const currentPath = pathname.startsWith('/admin/candidate-approvals')
    ? '/admin/candidate-approvals'
    : pathname.startsWith('/admin/candidates')
      ? '/admin/candidates'
      : pathname.startsWith('/admin/clients')
        ? '/admin/clients'
        : pathname.startsWith('/admin/job-requests')
          ? '/admin/job-requests'
          : pathname;

  return (
    <DashboardLayout
      navItems={adminNavItems}
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
