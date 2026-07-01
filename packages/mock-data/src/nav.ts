import type { NavItem } from './types.js';

export const adminNav = [
  { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: 'layout-dashboard' },
  { id: 'candidates', label: 'Candidates', href: '/admin/candidates', icon: 'user-check' },
  { id: 'clients', label: 'Clients', href: '/admin/clients', icon: 'briefcase' },
  { id: 'deployments', label: 'Deployments', href: '/admin/deployments', icon: 'rocket' },
  { id: 'trials', label: 'Trials', href: '/admin/trials', icon: 'flask-conical', badge: 4 },
  { id: 'evaluations', label: 'Evaluations', href: '/admin/evaluations', icon: 'clipboard-check', badge: 2 },
  { id: 'background-checks', label: 'Background Checks', href: '/admin/background-checks', icon: 'shield-check', badge: 3 },
  { id: 'settings', label: 'Settings', href: '/admin/settings', icon: 'settings' },
] as const satisfies readonly NavItem[];

export const recruiterNav = [
  { id: 'dashboard', label: 'Dashboard', href: '/recruiter', icon: 'layout-dashboard' },
  { id: 'candidates', label: 'Candidates', href: '/recruiter/candidates', icon: 'user-check', badge: 3 },
  { id: 'evaluations', label: 'Evaluations', href: '/recruiter/evaluations', icon: 'clipboard-check', badge: 2 },
  { id: 'shortlists', label: 'Shortlists', href: '/recruiter/shortlists', icon: 'list-checks' },
  { id: 'interviews', label: 'Interviews', href: '/recruiter/interviews', icon: 'calendar', badge: 4 },
  { id: 'background-checks', label: 'Background Checks', href: '/recruiter/background-checks', icon: 'shield-check' },
  { id: 'clients', label: 'Clients', href: '/recruiter/clients', icon: 'briefcase' },
  { id: 'deployments', label: 'Deployments', href: '/recruiter/deployments', icon: 'rocket' },
] as const satisfies readonly NavItem[];

export const clientNav = [
  { id: 'dashboard', label: 'Dashboard', href: '/client', icon: 'layout-dashboard' },
  { id: 'search', label: 'Candidate Search', href: '/client/search', icon: 'search' },
  { id: 'shortlisted', label: 'Shortlisted', href: '/client/shortlisted', icon: 'list-checks', badge: 2 },
  { id: 'interviews', label: 'Interview Requests', href: '/client/interviews', icon: 'calendar', badge: 2 },
  { id: 'trials', label: 'Trial Requests', href: '/client/trials', icon: 'flask-conical', badge: 1 },
] as const satisfies readonly NavItem[];

export const publicNav = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'how-it-works', label: 'How It Works', href: '/how-it-works' },
  { id: 'talent', label: 'Find Talent', href: '/talent' },
  { id: 'jobs', label: 'Open Roles', href: '/jobs' },
  { id: 'skill-communities', label: 'Skill Communities', href: '/communities' },
  { id: 'enterprise', label: 'Enterprise', href: '/enterprise' },
  { id: 'about', label: 'About', href: '/about' },
  { id: 'login', label: 'Sign In', href: '/login' },
] as const satisfies readonly NavItem[];

export type AdminNav = typeof adminNav;
export type RecruiterNav = typeof recruiterNav;
export type ClientNav = typeof clientNav;
export type PublicNav = typeof publicNav;
