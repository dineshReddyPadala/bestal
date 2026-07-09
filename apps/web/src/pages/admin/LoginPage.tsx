import { PortalLoginForm } from '../../components/auth/PortalLoginForm';

export function LoginPage() {
  return (
    <PortalLoginForm
      portal="ADMIN"
      defaultEmail="admin@bestal.com"
      demoHint="admin@bestal.com / Password123!"
      footerLink={{ label: 'Back to portal selector', href: '/login' }}
    />
  );
}
