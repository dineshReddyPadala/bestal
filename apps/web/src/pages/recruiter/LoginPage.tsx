import { StaffAuthPageShell } from '../../components/auth/AdminAuthPageShell';
import { StaffPortalLoginForm } from '../../components/auth/StaffPortalLoginForm';
import { PageMeta } from '../../components/PageMeta';
import { STAFF_PORTAL_LOGIN_PATH } from '../../lib/login-portals';

export function LoginPage() {
  return (
    <>
      <PageMeta title="Recruiter Sign In | BesTal" description="Recruiter portal sign in." noIndex />
      <StaffAuthPageShell
        title="Recruiter Portal"
        backLink={{ href: STAFF_PORTAL_LOGIN_PATH }}
      >
        <StaffPortalLoginForm
          portal="RECRUITER"
          defaultEmail=""
          forgotPasswordPath="/recruiter/forgot-password"
        />
      </StaffAuthPageShell>
    </>
  );
}
