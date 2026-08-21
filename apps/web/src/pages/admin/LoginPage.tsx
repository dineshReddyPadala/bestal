import { StaffAuthPageShell } from '../../components/auth/AdminAuthPageShell';
import { StaffPortalLoginForm } from '../../components/auth/StaffPortalLoginForm';
import { PageMeta } from '../../components/PageMeta';
import { STAFF_PORTAL_LOGIN_PATH } from '../../lib/login-portals';

export function LoginPage() {
  return (
    <>
      <PageMeta title="Admin Sign In | BesTal" description="Admin portal sign in." noIndex />
      <StaffAuthPageShell
        title="Admin Portal"
        backLink={{ href: STAFF_PORTAL_LOGIN_PATH }}
      >
        <StaffPortalLoginForm
          portal="ADMIN"
          defaultEmail="admin@bestal.com"
          forgotPasswordPath="/admin/forgot-password"
        />
      </StaffAuthPageShell>
    </>
  );
}
