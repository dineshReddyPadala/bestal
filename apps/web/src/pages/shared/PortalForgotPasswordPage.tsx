import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm';
import {
  PORTAL_AUTH_CONFIG,
  type SelfServicePortal,
} from '../../lib/auth-portal-config';

type PortalForgotPasswordPageProps = {
  portal: SelfServicePortal;
};

export function PortalForgotPasswordPage({ portal }: PortalForgotPasswordPageProps) {
  const config = PORTAL_AUTH_CONFIG[portal];

  return (
    <ForgotPasswordForm
      portal={config.portal}
      loginPath={`${config.basePath}/login`}
      defaultEmail={config.defaultEmail}
    />
  );
}
