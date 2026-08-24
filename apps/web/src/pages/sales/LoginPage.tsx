import { StaffAuthPageShell } from '../../components/auth/AdminAuthPageShell';
import { StaffPortalLoginForm } from '../../components/auth/StaffPortalLoginForm';
import { PageMeta } from '../../components/PageMeta';
import { STAFF_PORTAL_LOGIN_PATH } from '../../lib/login-portals';

export function LoginPage() {
  return (
    <>
      <PageMeta title="Sales Sign In | BesTal" description="Sales portal sign in." noIndex />
      <StaffAuthPageShell
        title="Sales Portal"
        backLink={{ href: STAFF_PORTAL_LOGIN_PATH }}
      >
        <StaffPortalLoginForm
          portal="SALES"
          defaultEmail=""
          forgotPasswordPath="/sales/forgot-password"
        />
      </StaffAuthPageShell>
    </>
  );
}
