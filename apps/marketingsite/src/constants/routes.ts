import type { PageId } from '@/types';

export const ROUTES: Record<PageId, string> = {
  home: '/',
  consulting: '/technology-consulting',
  delivery: '/managed-services',
  talent: '/talent-solutions',
  communities: '/technology-communities',
  trust: '/trust-and-governance',
  about: '/about',
  help: '/how-we-can-help',
  candidate: '/join-our-community',
  contact: '/contact',
  workspace: '/client-workspace',
  privacy: '/privacy',
  terms: '/terms',
  cookies: '/cookies',
};

export const NAV_LINKS: { id: PageId; label: string; to: string }[] = [
  { id: 'consulting', label: 'Technology Consulting', to: ROUTES.consulting },
  { id: 'delivery', label: 'Managed Services', to: ROUTES.delivery },
  { id: 'talent', label: 'Talent Solutions', to: ROUTES.talent },
  { id: 'communities', label: 'Technology Communities', to: ROUTES.communities },
  { id: 'trust', label: 'Trust & Governance', to: ROUTES.trust },
  { id: 'about', label: 'About', to: ROUTES.about },
];

export const SITE_NAME = 'BesTal Solutions';
