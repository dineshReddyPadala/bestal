import { AuthLayout } from '@bestal/ui';
import { Outlet, useLocation } from 'react-router-dom';
import {
  getPortalAuthPageMeta,
  type PortalAuthConfig,
} from '../../lib/auth-portal-config';
import { BESTAL_LOGO_SRC } from '../../lib/brand';

type PortalAuthShellProps = {
  config: PortalAuthConfig;
};

export function PortalAuthShell({ config }: PortalAuthShellProps) {
  const { pathname } = useLocation();
  const meta = getPortalAuthPageMeta(config, pathname);

  return (
    <AuthLayout title={meta.title} subtitle={meta.subtitle} brandLogoSrc={BESTAL_LOGO_SRC}>
      <Outlet />
    </AuthLayout>
  );
}
