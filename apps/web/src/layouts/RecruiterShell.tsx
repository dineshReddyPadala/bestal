import { DashboardLayout } from '@bestal/ui';
import { Outlet, useLocation } from 'react-router-dom';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { useDashboardUser } from '../hooks/useDashboardUser';
import { recruiterNavItems, resolveActiveNavPath } from '../lib/nav';

export function RecruiterShell() {
  const { pathname } = useLocation();
  const { user, handleLogout } = useDashboardUser();
  const currentPath = pathname.startsWith('/recruiter/candidates')
    ? '/recruiter/candidates'
    : resolveActiveNavPath(pathname, '/recruiter');

  return (
    <DashboardLayout
      navItems={recruiterNavItems}
      portalName="Recruiter Portal"
      user={user}
      currentPath={currentPath}
      onLogout={handleLogout}
      headerActions={<NotificationBell />}
    >
      <Outlet />
    </DashboardLayout>
  );
}
