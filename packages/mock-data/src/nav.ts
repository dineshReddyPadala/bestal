import type { NavItem } from './types.js';

export const salesNav = [
  { id: 'dashboard', label: 'Dashboard', href: '/sales', icon: 'layout-dashboard' },
  { id: 'clients', label: 'Client Accounts', href: '/sales/clients', icon: 'briefcase' },
  { id: 'trials', label: 'Trial Requests', href: '/sales/trials', icon: 'flask-conical', badge: 3 },
  { id: 'deployments', label: 'Deployments', href: '/sales/deployments', icon: 'rocket' },
  { id: 'margin', label: 'Margin Report', href: '/sales/margin', icon: 'trending-up' },
] as const satisfies readonly NavItem[];

export const adminNav = [
  { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: 'layout-dashboard' },
  { id: 'candidates', label: 'Candidates', href: '/admin/candidates', icon: 'user-check' },
  { id: 'clients', label: 'Clients', href: '/admin/clients', icon: 'briefcase' },
  { id: 'deployments', label: 'Deployments', href: '/admin/deployments', icon: 'rocket' },
  { id: 'trials', label: 'Trial Requests', href: '/admin/trials', icon: 'flask-conical', badge: 4 },
  { id: 'margin', label: 'Margin Report', href: '/admin/margin', icon: 'trending-up' },
  { id: 'users', label: 'Users', href: '/admin/users', icon: 'users' },
  { id: 'organizations', label: 'Organizations', href: '/admin/organizations', icon: 'building-2' },
  { id: 'skill-communities', label: 'Skill Communities', href: '/admin/skill-communities', icon: 'layers' },
  { id: 'audit-logs', label: 'Audit Logs', href: '/admin/audit-logs', icon: 'scroll-text' },
  { id: 'evaluations', label: 'Evaluations', href: '/admin/evaluations', icon: 'clipboard-check', badge: 2 },
  { id: 'approvals', label: 'Approvals', href: '/admin/approvals', icon: 'check-circle', badge: 2 },
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

export type SalesNav = typeof salesNav;
export type AdminNav = typeof adminNav;
export type RecruiterNav = typeof recruiterNav;
export type ClientNav = typeof clientNav;
export type PublicNav = typeof publicNav;
