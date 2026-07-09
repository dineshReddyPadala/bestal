import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm';
import {
  PORTAL_AUTH_CONFIG,
  type SelfServicePortal,
} from '../../lib/auth-portal-config';

type PortalResetPasswordPageProps = {
  portal: SelfServicePortal;
};

export function PortalResetPasswordPage({ portal }: PortalResetPasswordPageProps) {
  const config = PORTAL_AUTH_CONFIG[portal];

  return (
    <ResetPasswordForm
      loginPath={`${config.basePath}/login`}
      forgotPasswordPath={`${config.basePath}/forgot-password`}
    />
  );
}
