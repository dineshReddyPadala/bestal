import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm';
import { StaffAuthPageShell } from '../../components/auth/AdminAuthPageShell';
import { PageMeta } from '../../components/PageMeta';
import {
  getPortalAuthPageMeta,
  PORTAL_AUTH_CONFIG,
  type SelfServicePortal,
} from '../../lib/auth-portal-config';

type PortalResetPasswordPageProps = {
  portal: SelfServicePortal;
};

export function PortalResetPasswordPage({ portal }: PortalResetPasswordPageProps) {
  const config = PORTAL_AUTH_CONFIG[portal];
  const meta = getPortalAuthPageMeta(config, `${config.basePath}/reset-password`);
  const form = (
    <ResetPasswordForm
      loginPath={`${config.basePath}/login`}
      forgotPasswordPath={`${config.basePath}/forgot-password`}
    />
  );

  if (portal === 'CLIENT') {
    return form;
  }

  return (
    <>
      <PageMeta
        title={`${config.title} Reset Password | BesTal`}
        description={meta.subtitle ?? 'Choose a new password for your account.'}
        noIndex
      />
      <StaffAuthPageShell title={config.title} subtitle={meta.subtitle}>
        {form}
      </StaffAuthPageShell>
    </>
  );
}
