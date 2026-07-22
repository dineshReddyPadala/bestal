import { PortalLoginForm } from '../../components/auth/PortalLoginForm';

export function LoginPage() {
  return (
    <PortalLoginForm
      portal="SALES"
      defaultEmail="sales@bestal.com"
      footerLink={{ label: 'Back to portal selector', href: '/login' }}
    />
  );
}
