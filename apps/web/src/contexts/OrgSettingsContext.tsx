import {
  DEFAULT_ORG_FORMAT,
  formatCurrency,
  formatOrgDate,
  type OrgDateFormat,
  type OrgFormatSettings,
} from '@bestal/shared-utils';
import { useQuery } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { settingsApi, type OrgDisplaySettings } from '../lib/api/settings';

type OrgSettingsContextValue = {
  settings: OrgDisplaySettings;
  isLoading: boolean;
  formatDate: (iso: string) => string;
  formatMoney: (amount: number, currency?: string) => string;
  formatSettings: OrgFormatSettings;
};

const FALLBACK: OrgDisplaySettings = {
  currency: 'USD',
  locale: 'en-US',
  dateFormat: 'MMM d, yyyy',
  supportedCurrencies: ['USD', 'EUR', 'GBP', 'INR'],
};

const OrgSettingsContext = createContext<OrgSettingsContextValue>({
  settings: FALLBACK,
  isLoading: false,
  formatDate: (iso) => formatOrgDate(iso, DEFAULT_ORG_FORMAT),
  formatMoney: (amount, currency = 'USD') => formatCurrency(amount, currency),
  formatSettings: DEFAULT_ORG_FORMAT,
});

export function OrgSettingsProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ['org-display-settings'],
    queryFn: () => settingsApi.getOrgDisplay(),
    staleTime: 5 * 60_000,
  });

  const settings = data ?? FALLBACK;
  const formatSettings = useMemo<OrgFormatSettings>(
    () => ({
      dateFormat: settings.dateFormat as OrgDateFormat,
      locale: settings.locale,
    }),
    [settings.dateFormat, settings.locale],
  );

  const formatDate = useCallback(
    (iso: string) => formatOrgDate(iso, formatSettings),
    [formatSettings],
  );

  const formatMoney = useCallback(
    (amount: number, currency?: string) =>
      formatCurrency(amount, currency ?? settings.currency, settings.locale),
    [settings.currency, settings.locale],
  );

  const value = useMemo(
    () => ({ settings, isLoading, formatDate, formatMoney, formatSettings }),
    [settings, isLoading, formatDate, formatMoney, formatSettings],
  );

  return <OrgSettingsContext.Provider value={value}>{children}</OrgSettingsContext.Provider>;
}

export function useOrgSettings() {
  return useContext(OrgSettingsContext);
}

export function useOrgFormatDate() {
  return useOrgSettings().formatDate;
}
