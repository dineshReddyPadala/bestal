import { DashboardLayout } from '@bestal/ui';
import { Outlet, useLocation } from 'react-router-dom';
import { recruiterNavItems, resolveActiveNavPath } from '../lib/nav';

const recruiterUser = {
  name: 'Rachel Kim',
  email: 'rachel.kim@bestal.com',
  role: 'Senior Recruiter',
};

export function RecruiterShell() {
  const { pathname } = useLocation();
  const currentPath = pathname.startsWith('/recruiter/candidates')
    ? '/recruiter/candidates'
    : resolveActiveNavPath(pathname, '/recruiter');

  return (
    <DashboardLayout
      navItems={recruiterNavItems}
      portalName="Recruiter Portal"
      user={recruiterUser}
      currentPath={currentPath}
    >
      <Outlet />
    </DashboardLayout>
  );
}
