import type { CompanyLogo } from './types.js';

export const companies = [
  { id: 1, name: 'Microsoft', logoUrl: 'https://logo.clearbit.com/microsoft.com', industry: 'Technology', featured: true },
  { id: 2, name: 'Google', logoUrl: 'https://logo.clearbit.com/google.com', industry: 'Technology', featured: true },
  { id: 3, name: 'Amazon', logoUrl: 'https://logo.clearbit.com/amazon.com', industry: 'E-commerce & Cloud', featured: true },
  { id: 4, name: 'Meta', logoUrl: 'https://logo.clearbit.com/meta.com', industry: 'Social Media', featured: true },
  { id: 5, name: 'Netflix', logoUrl: 'https://logo.clearbit.com/netflix.com', industry: 'Entertainment', featured: true },
  { id: 6, name: 'Salesforce', logoUrl: 'https://logo.clearbit.com/salesforce.com', industry: 'Enterprise SaaS', featured: true },
  { id: 7, name: 'Adobe', logoUrl: 'https://logo.clearbit.com/adobe.com', industry: 'Creative Software', featured: false },
  { id: 8, name: 'IBM', logoUrl: 'https://logo.clearbit.com/ibm.com', industry: 'Enterprise IT', featured: false },
  { id: 9, name: 'Oracle', logoUrl: 'https://logo.clearbit.com/oracle.com', industry: 'Database & Cloud', featured: false },
  { id: 10, name: 'SAP', logoUrl: 'https://logo.clearbit.com/sap.com', industry: 'Enterprise ERP', featured: false },
  { id: 11, name: 'Deloitte', logoUrl: 'https://logo.clearbit.com/deloitte.com', industry: 'Consulting', featured: false },
  { id: 12, name: 'McKinsey', logoUrl: 'https://logo.clearbit.com/mckinsey.com', industry: 'Management Consulting', featured: false },
] as const satisfies readonly CompanyLogo[];

export type Companies = typeof companies;
