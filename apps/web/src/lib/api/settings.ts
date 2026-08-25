import { apiGet, apiRequest } from './client';
import type { ApiDataResponse } from './types';
import { normalizeFreeTrialHours, type TrialPolicy } from '../trial-policy';

export type OrgDisplaySettings = {
  currency: string;
  locale: string;
  dateFormat: 'MMM d, yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd';
  supportedCurrencies: string[];
};

export const settingsApi = {
  getOrgDisplay: () => apiGet<OrgDisplaySettings>('/settings/org-display'),
};

export async function fetchPublicTrialPolicy(): Promise<TrialPolicy> {
  const json = await apiRequest<ApiDataResponse<TrialPolicy>>('/public/settings/trial-policy', {
    auth: false,
  });
  return {
    freeTrialHours: normalizeFreeTrialHours(json.data.freeTrialHours),
  };
}

export async function fetchTrialPolicy(): Promise<TrialPolicy> {
  const json = await apiRequest<ApiDataResponse<TrialPolicy>>('/settings/trial-policy');
  return {
    freeTrialHours: normalizeFreeTrialHours(json.data.freeTrialHours),
  };
}
