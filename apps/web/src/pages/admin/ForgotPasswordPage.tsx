import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm';

export function ForgotPasswordPage() {
  return (
    <ForgotPasswordForm
      portal="ADMIN"
      loginPath="/admin/login"
      defaultEmail="admin@bestal.com"
    />
  );
}
