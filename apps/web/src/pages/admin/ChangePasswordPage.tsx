import { StaffAuthPageShell } from '../../components/auth/AdminAuthPageShell';
import { ChangePasswordForm } from '../../components/auth/ChangePasswordForm';
import { PageMeta } from '../../components/PageMeta';

export function AdminChangePasswordPage() {
  return (
    <>
      <PageMeta title="Change Password | BesTal Admin" description="Change your admin password." noIndex />
      <StaffAuthPageShell
        title="Admin Portal"
        subtitle="Set a new password to continue"
      >
        <ChangePasswordForm required />
      </StaffAuthPageShell>
    </>
  );
}
