import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm';
import { StaffAuthPageShell } from '../../components/auth/AdminAuthPageShell';
import { PageMeta } from '../../components/PageMeta';
import {
  getPortalAuthPageMeta,
  PORTAL_AUTH_CONFIG,
  type SelfServicePortal,
} from '../../lib/auth-portal-config';

type PortalForgotPasswordPageProps = {
  portal: SelfServicePortal;
};

export function PortalForgotPasswordPage({ portal }: PortalForgotPasswordPageProps) {
  const config = PORTAL_AUTH_CONFIG[portal];
  const meta = getPortalAuthPageMeta(config, `${config.basePath}/forgot-password`);
  const form = (
    <ForgotPasswordForm
      portal={config.portal}
      loginPath={`${config.basePath}/login`}
      defaultEmail={config.defaultEmail}
    />
  );

  if (portal === 'CLIENT') {
    return form;
  }

  return (
    <>
      <PageMeta
        title={`${config.title} Forgot Password | BesTal`}
        description={meta.subtitle ?? 'Reset your portal password.'}
        noIndex
      />
      <StaffAuthPageShell title={config.title} subtitle={meta.subtitle}>
        {form}
      </StaffAuthPageShell>
    </>
  );
}
