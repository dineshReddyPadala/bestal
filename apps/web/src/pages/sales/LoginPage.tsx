import { PortalLoginForm } from '../../components/auth/PortalLoginForm';

export function LoginPage() {
  return (
    <PortalLoginForm
      portal="SALES"
      defaultEmail="sales@bestal.com"
      footerLink={{ label: 'Back to sign in', href: '/login' }}
    />
  );
}
