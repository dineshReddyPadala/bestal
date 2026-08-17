import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm';

export function ResetPasswordPage() {
  return (
    <ResetPasswordForm
      loginPath="/admin/login"
      forgotPasswordPath="/admin/forgot-password"
    />
  );
}
