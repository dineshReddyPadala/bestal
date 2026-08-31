import { DashboardLayout } from '@bestal/ui';
import { Outlet, useLocation } from 'react-router-dom';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardUser } from '../hooks/useDashboardUser';
import { BESTAL_LOGO_SRC } from '../lib/brand';
import { clientNavItems } from '../lib/nav';

export function ClientShell() {
  const { pathname } = useLocation();
  const { user, handleLogout } = useDashboardUser();
  const { user: authUser } = useAuth();
  const currentPath = pathname.startsWith('/client/candidates')
    ? '/client/search'
    : pathname;
  const missingClientLink =
    authUser?.role === 'CLIENT' &&
    (authUser.clientId == null || authUser.clientId === undefined);

  return (
    <DashboardLayout
      navItems={clientNavItems}
      portalName="Amnet Digital"
      user={user}
      currentPath={currentPath}
      onLogout={handleLogout}
      headerActions={<NotificationBell />}
      collapsible
      collapseStorageKey="bestal.client.nav.collapsed"
      brandLogoSrc={BESTAL_LOGO_SRC}
      brandLogoClassName="h-[3.25rem] w-auto max-w-[13.5rem]"
    >
      {missingClientLink ? (
        <div className="border-b border-amber-300/60 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          Your login is not linked to a client account — contact your administrator.
          Trial requests are disabled until this is fixed.
        </div>
      ) : null}
      <Outlet />
    </DashboardLayout>
  );
}
