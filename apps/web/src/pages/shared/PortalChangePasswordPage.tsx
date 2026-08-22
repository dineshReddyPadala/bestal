import { ChangePasswordForm } from '../../components/auth/ChangePasswordForm';
import { StaffAuthPageShell } from '../../components/auth/AdminAuthPageShell';
import { PageMeta } from '../../components/PageMeta';
import {
  getPortalAuthPageMeta,
  PORTAL_AUTH_CONFIG,
  type SelfServicePortal,
} from '../../lib/auth-portal-config';

type PortalChangePasswordPageProps = {
  portal: SelfServicePortal;
};

export function PortalChangePasswordPage({ portal }: PortalChangePasswordPageProps) {
  const config = PORTAL_AUTH_CONFIG[portal];
  const meta = getPortalAuthPageMeta(config, `${config.basePath}/change-password`);

  const form = <ChangePasswordForm required />;

  if (portal === 'CLIENT') {
    return (
      <>
        <PageMeta
          title={`${config.title} Change Password | BesTal`}
          description={meta.subtitle ?? 'Choose a new password for your account.'}
          noIndex
        />
        {form}
      </>
    );
  }

  return (
    <>
      <PageMeta
        title={`${config.title} Change Password | BesTal`}
        description={meta.subtitle ?? 'Choose a new password for your account.'}
        noIndex
      />
      <StaffAuthPageShell title={config.title} subtitle={meta.subtitle}>
        {form}
      </StaffAuthPageShell>
    </>
  );
}
