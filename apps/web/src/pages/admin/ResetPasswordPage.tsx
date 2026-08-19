import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm';
import { AdminAuthPageShell } from '../../components/auth/AdminAuthPageShell';
import { PageMeta } from '../../components/PageMeta';

export function ResetPasswordPage() {
  return (
    <>
      <PageMeta
        title="Admin Reset Password | BesTal"
        description="Choose a new password for your admin account."
        noIndex
      />
      <AdminAuthPageShell title="Admin Portal" subtitle="Choose a new password for your account">
        <ResetPasswordForm
          loginPath="/admin/login"
          forgotPasswordPath="/admin/forgot-password"
        />
      </AdminAuthPageShell>
    </>
  );
}
