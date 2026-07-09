import type { Portal } from './api/types';

export type SelfServicePortal = Extract<Portal, 'RECRUITER' | 'SALES' | 'CLIENT'>;

export type PortalAuthConfig = {
  portal: SelfServicePortal;
  title: string;
  basePath: string;
  loginSubtitle: string;
  defaultEmail: string;
  demoHint: string;
};

export const PORTAL_AUTH_CONFIG: Record<SelfServicePortal, PortalAuthConfig> = {
  RECRUITER: {
    portal: 'RECRUITER',
    title: 'Recruiter Portal',
    basePath: '/recruiter',
    loginSubtitle: 'Sign in to manage your talent pipeline',
    defaultEmail: 'recruiter@bestal.com',
    demoHint: 'recruiter@bestal.com / Password123!',
  },
  SALES: {
    portal: 'SALES',
    title: 'Sales Portal',
    basePath: '/sales',
    loginSubtitle: 'Sign in to manage client accounts and revenue',
    defaultEmail: 'sales@bestal.com',
    demoHint: 'sales@bestal.com / Password123!',
  },
  CLIENT: {
    portal: 'CLIENT',
    title: 'Client Portal',
    basePath: '/client',
    loginSubtitle: 'Sign in to review talent and manage your hiring pipeline',
    defaultEmail: 'client@bestal.com',
    demoHint: 'client@bestal.com / Password123!',
  },
};

export function getPortalAuthPageMeta(
  config: PortalAuthConfig,
  pathname: string,
): { title: string; subtitle: string } {
  if (pathname.endsWith('/forgot-password')) {
    return {
      title: config.title,
      subtitle: 'Enter your email and we will send you a password reset link',
    };
  }

  if (pathname.endsWith('/reset-password')) {
    return {
      title: config.title,
      subtitle: 'Choose a new password for your account',
    };
  }

  return {
    title: config.title,
    subtitle: config.loginSubtitle,
  };
}

export function isSelfServicePortal(portal: Portal): portal is SelfServicePortal {
  return portal === 'RECRUITER' || portal === 'SALES' || portal === 'CLIENT';
}
