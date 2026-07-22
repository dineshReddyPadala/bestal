import type { Portal } from './api/types';

export type SelfServicePortal = Extract<Portal, 'RECRUITER' | 'SALES' | 'CLIENT'>;

export type PortalAuthConfig = {
  portal: SelfServicePortal;
  title: string;
  basePath: string;
  defaultEmail: string;
};

export const PORTAL_AUTH_CONFIG: Record<SelfServicePortal, PortalAuthConfig> = {
  RECRUITER: {
    portal: 'RECRUITER',
    title: 'Recruiter Portal',
    basePath: '/recruiter',
    defaultEmail: 'recruiter@bestal.com',
  },
  SALES: {
    portal: 'SALES',
    title: 'Sales Portal',
    basePath: '/sales',
    defaultEmail: 'sales@bestal.com',
  },
  CLIENT: {
    portal: 'CLIENT',
    title: 'Client Portal',
    basePath: '/client',
    defaultEmail: 'client@bestal.com',
  },
};

export function getPortalAuthPageMeta(
  config: PortalAuthConfig,
  pathname: string,
): { title: string; subtitle?: string } {
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
  };
}

export function isSelfServicePortal(portal: Portal): portal is SelfServicePortal {
  return portal === 'RECRUITER' || portal === 'SALES' || portal === 'CLIENT';
}
