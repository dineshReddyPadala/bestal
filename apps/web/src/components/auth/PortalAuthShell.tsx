import { AuthLayout } from '@bestal/ui';
import { Outlet, useLocation } from 'react-router-dom';
import {
  getPortalAuthPageMeta,
  type PortalAuthConfig,
} from '../../lib/auth-portal-config';

type PortalAuthShellProps = {
  config: PortalAuthConfig;
};

export function PortalAuthShell({ config }: PortalAuthShellProps) {
  const { pathname } = useLocation();
  const meta = getPortalAuthPageMeta(config, pathname);

  return (
    <AuthLayout title={meta.title} subtitle={meta.subtitle}>
      <Outlet />
    </AuthLayout>
  );
}
