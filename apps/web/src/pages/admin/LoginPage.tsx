import { PortalLoginForm } from '../../components/auth/PortalLoginForm';

export function LoginPage() {
  return (
    <PortalLoginForm
      portal="ADMIN"
      defaultEmail="admin@bestal.com"
      footerLink={{ label: 'Back to sign in', href: '/login' }}
    />
  );
}
