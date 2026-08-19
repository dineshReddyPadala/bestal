import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm';
import { AdminAuthPageShell } from '../../components/auth/AdminAuthPageShell';
import { PageMeta } from '../../components/PageMeta';

export function ForgotPasswordPage() {
  return (
    <>
      <PageMeta
        title="Admin Forgot Password | BesTal"
        description="Reset your admin portal password."
        noIndex
      />
      <AdminAuthPageShell
        title="Admin Portal"
        subtitle="Enter your email and we will send you a password reset link"
      >
        <ForgotPasswordForm
          portal="ADMIN"
          loginPath="/admin/login"
          defaultEmail="admin@bestal.com"
        />
      </AdminAuthPageShell>
    </>
  );
}
