import { PortalLoginForm } from '../../components/auth/PortalLoginForm';

export function LoginPage() {
  return (
    <PortalLoginForm
      portal="RECRUITER"
      defaultEmail="recruiter@bestal.com"
      demoHint="recruiter@bestal.com / Password123!"
      footerLink={{ label: 'Back to portal selector', href: '/login' }}
    />
  );
}
