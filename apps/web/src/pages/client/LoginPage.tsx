import { PortalLoginForm } from '../../components/auth/PortalLoginForm';

export function LoginPage() {
  return (
    <PortalLoginForm
      portal="CLIENT"
      defaultEmail="client@bestal.com"
      demoHint="client@bestal.com / Password123!"
      footerLink={{ label: 'Back to portal selector', href: '/login' }}
    />
  );
}
