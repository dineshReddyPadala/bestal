import { PortalLoginForm } from '../../components/auth/PortalLoginForm';

export function LoginPage() {
  return (
    <PortalLoginForm
      portal="SALES"
      defaultEmail="sales@bestal.com"
      demoHint="sales@bestal.com / Password123!"
      footerLink={{ label: 'Back to portal selector', href: '/login' }}
    />
  );
}
