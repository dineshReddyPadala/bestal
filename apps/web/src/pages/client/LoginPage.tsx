import { PortalLoginForm } from '../../components/auth/PortalLoginForm';

export function LoginPage() {
  return (
    <PortalLoginForm
      portal="CLIENT"
      defaultEmail="client@bestal.com"
      footerLink={{ label: 'Back to sign in', href: '/login' }}
    />
  );
}
