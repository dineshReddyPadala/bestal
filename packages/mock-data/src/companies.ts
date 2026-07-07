import type { CompanyLogo } from './types.js';
import { companyLogoUrl } from './company-logos.js';

export const companies = [
  { id: 1, name: 'Microsoft', logoUrl: companyLogoUrl('Microsoft'), industry: 'Technology', featured: true },
  { id: 2, name: 'Google', logoUrl: companyLogoUrl('Google'), industry: 'Technology', featured: true },
  { id: 3, name: 'Amazon', logoUrl: companyLogoUrl('Amazon'), industry: 'E-commerce & Cloud', featured: true },
  { id: 4, name: 'Meta', logoUrl: companyLogoUrl('Meta'), industry: 'Social Media', featured: true },
  { id: 5, name: 'Netflix', logoUrl: companyLogoUrl('Netflix'), industry: 'Entertainment', featured: true },
  { id: 6, name: 'Salesforce', logoUrl: companyLogoUrl('Salesforce'), industry: 'Enterprise SaaS', featured: true },
  { id: 7, name: 'Adobe', logoUrl: companyLogoUrl('Adobe'), industry: 'Creative Software', featured: false },
  { id: 8, name: 'IBM', logoUrl: companyLogoUrl('IBM'), industry: 'Enterprise IT', featured: false },
  { id: 9, name: 'Oracle', logoUrl: companyLogoUrl('Oracle'), industry: 'Database & Cloud', featured: false },
  { id: 10, name: 'SAP', logoUrl: companyLogoUrl('SAP'), industry: 'Enterprise ERP', featured: false },
  { id: 11, name: 'Deloitte', logoUrl: companyLogoUrl('Deloitte'), industry: 'Consulting', featured: false },
  { id: 12, name: 'McKinsey', logoUrl: companyLogoUrl('McKinsey'), industry: 'Management Consulting', featured: false },
] as const satisfies readonly CompanyLogo[];

export type Companies = typeof companies;
