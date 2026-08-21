import { PortalLoginForm } from '../../components/auth/PortalLoginForm';
import { LOGIN_PORTAL_CHOOSER_PATH } from '../../lib/login-portals';

export function LoginPage() {
  return (
    <PortalLoginForm
      portal="CLIENT"
      defaultEmail="client@bestal.com"
      footerLink={{ label: 'Back to sign in', href: LOGIN_PORTAL_CHOOSER_PATH }}
    />
  );
}
