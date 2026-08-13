import { apiGet } from './client';

export type OrgDisplaySettings = {
  currency: string;
  locale: string;
  dateFormat: 'MMM d, yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd';
  supportedCurrencies: string[];
};

export const settingsApi = {
  getOrgDisplay: () => apiGet<OrgDisplaySettings>('/settings/org-display'),
};
