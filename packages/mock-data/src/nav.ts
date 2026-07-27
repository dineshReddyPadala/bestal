import type { NavItem } from './types.js';

export const salesNav = [
  { id: 'dashboard', label: 'Dashboard', href: '/sales', icon: 'layout-dashboard' },
  { id: 'clients', label: 'Client Accounts', href: '/sales/clients', icon: 'briefcase' },
  { id: 'candidates', label: 'Candidate Search', href: '/sales/candidates', icon: 'search' },
  { id: 'trials', label: 'Trial Requests', href: '/sales/trials', icon: 'flask-conical', badge: 3 },
  { id: 'deployments', label: 'Deployments', href: '/sales/deployments', icon: 'rocket' },
  { id: 'margin', label: 'Margin Report', href: '/sales/margin', icon: 'trending-up' },
] as const satisfies readonly NavItem[];

/** Daily platform ops for Admin (client admin). Platform extras live on Super Admin. */
export const adminNav = [
  { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: 'layout-dashboard' },
  { id: 'candidates', label: 'Candidates', href: '/admin/candidates', icon: 'user-check' },
  { id: 'candidate-approvals', label: 'Approvals & Publish', href: '/admin/candidate-approvals', icon: 'check-square' },
  { id: 'evaluations', label: 'Evaluations', href: '/admin/evaluations', icon: 'clipboard-check', badge: 2 },
  { id: 'background-checks', label: 'Background Checks', href: '/admin/background-checks', icon: 'shield-check', badge: 3 },
  { id: 'clients', label: 'Clients', href: '/admin/clients', icon: 'briefcase' },
  { id: 'trials', label: 'Trial Requests', href: '/admin/trials', icon: 'flask-conical', badge: 4 },
  { id: 'deployments', label: 'Deployments', href: '/admin/deployments', icon: 'rocket' },
] as const satisfies readonly NavItem[];

export const recruiterNav = [
  { id: 'dashboard', label: 'Dashboard', href: '/recruiter', icon: 'layout-dashboard' },
  { id: 'candidates', label: 'Candidates', href: '/recruiter/candidates', icon: 'user-check', badge: 3 },
  { id: 'evaluations', label: 'Evaluations', href: '/recruiter/evaluations', icon: 'clipboard-check', badge: 2 },
  { id: 'shortlists', label: 'Shortlists', href: '/recruiter/shortlists', icon: 'list-checks' },
  { id: 'background-checks', label: 'Background Checks', href: '/recruiter/background-checks', icon: 'shield-check' },
  { id: 'clients', label: 'Clients', href: '/recruiter/clients', icon: 'briefcase' },
  { id: 'trials', label: 'Trials', href: '/recruiter/trials', icon: 'flask-conical' },
  { id: 'deployments', label: 'Deployments', href: '/recruiter/deployments', icon: 'rocket' },
] as const satisfies readonly NavItem[];

export const clientNav = [
  { id: 'dashboard', label: 'Dashboard', href: '/client', icon: 'layout-dashboard' },
  { id: 'search', label: 'Candidate Search', href: '/client/search', icon: 'search' },
  { id: 'shortlisted', label: 'Shortlisted', href: '/client/shortlisted', icon: 'list-checks', badge: 2 },
  { id: 'trials', label: 'Trial Requests', href: '/client/trials', icon: 'flask-conical', badge: 1 },
  { id: 'deployments', label: 'Deployments', href: '/client/deployments', icon: 'rocket' },
] as const satisfies readonly NavItem[];

/** Platform / Super Admin — includes daily ops (same as Admin) plus platform controls */
export const superAdminNav = [
  { id: 'dashboard', label: 'Dashboard', href: '/super-admin/dashboard', icon: 'layout-dashboard' },
  { id: 'users', label: 'User Management', href: '/super-admin/users', icon: 'users' },
  { id: 'roles', label: 'Role Management', href: '/super-admin/roles', icon: 'shield' },
  { id: 'clients', label: 'Clients', href: '/super-admin/clients', icon: 'briefcase' },
  { id: 'candidates', label: 'Candidates', href: '/super-admin/candidates', icon: 'user-check' },
  { id: 'pending', label: 'Pending Approvals', href: '/super-admin/candidates/pending', icon: 'check-square' },
  { id: 'evaluations', label: 'Evaluations', href: '/super-admin/evaluations', icon: 'clipboard-check' },
  { id: 'background-checks', label: 'Background Checks', href: '/super-admin/background-checks', icon: 'shield-check' },
  { id: 'trials', label: 'Trials', href: '/super-admin/trials', icon: 'flask-conical' },
  { id: 'deployments', label: 'Deployments', href: '/super-admin/deployments', icon: 'rocket' },
  { id: 'data-import', label: 'Data import (Oorwin)', href: '/super-admin/data-import', icon: 'file-up' },
  { id: 'reports', label: 'Reports', href: '/super-admin/reports', icon: 'trending-up' },
  { id: 'audit-logs', label: 'Audit Logs', href: '/super-admin/audit-logs', icon: 'scroll-text' },
  { id: 'platform-settings', label: 'Platform Settings', href: '/super-admin/platform-settings', icon: 'settings' },
] as const satisfies readonly NavItem[];

export const publicNav = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'how-it-works', label: 'How It Works', href: '/how-it-works' },
  { id: 'talent', label: 'Find Talent', href: '/talent' },
  { id: 'jobs', label: 'Open Roles', href: '/jobs' },
  { id: 'skill-communities', label: 'Skill Communities', href: '/communities' },
  { id: 'enterprise', label: 'Enterprise', href: '/enterprise' },
  { id: 'about', label: 'About', href: '/about' },
] as const satisfies readonly NavItem[];

export type SalesNav = typeof salesNav;
export type AdminNav = typeof adminNav;
export type RecruiterNav = typeof recruiterNav;
export type ClientNav = typeof clientNav;
export type SuperAdminNav = typeof superAdminNav;
export type PublicNav = typeof publicNav;
