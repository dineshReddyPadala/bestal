import { TIMEZONE_OPTIONS } from '@bestal/shared-utils';

export type MarketingTimezoneRegion = 'Eastern' | 'Central' | 'Mountain' | 'Pacific' | 'Other';

export type MarketingTimezoneMeta = {
  iana: string;
  label: string;
  zoneLabel: string;
  zoneHours: string;
  region: MarketingTimezoneRegion;
};

const MARKETING_TIMEZONE_META: Record<
  (typeof TIMEZONE_OPTIONS)[number]['value'],
  Omit<MarketingTimezoneMeta, 'iana' | 'label'>
> = {
  'Asia/Kolkata': {
    zoneLabel: 'Works US Eastern hours',
    zoneHours: '9:00am – 6:00pm EST · full business day',
    region: 'Other',
  },
  'America/New_York': {
    zoneLabel: 'Works US Eastern hours',
    zoneHours: '9:00am – 6:00pm EST · full business day',
    region: 'Eastern',
  },
  'America/Chicago': {
    zoneLabel: 'Works US Central hours',
    zoneHours: '9:00am – 6:00pm CST · full business day',
    region: 'Central',
  },
  'America/Los_Angeles': {
    zoneLabel: 'Works US Pacific hours',
    zoneHours: '9:00am – 6:00pm PST · full business day',
    region: 'Pacific',
  },
  'America/ANY': {
    zoneLabel: 'Works US hours · flexible overlap',
    zoneHours: 'Full US business day overlap',
    region: 'Other',
  },
  'Europe/London': {
    zoneLabel: 'Works US Eastern hours',
    zoneHours: '9:00am – 6:00pm EST · full business day',
    region: 'Other',
  },
  'Europe/Berlin': {
    zoneLabel: 'Works US Central hours',
    zoneHours: '9:00am – 6:00pm CST · full business day',
    region: 'Other',
  },
  'Asia/Singapore': {
    zoneLabel: 'Works US Pacific hours',
    zoneHours: '9:00am – 6:00pm PST · full business day',
    region: 'Other',
  },
  'Australia/Sydney': {
    zoneLabel: 'Works US Pacific hours',
    zoneHours: '9:00am – 6:00pm PST · full business day',
    region: 'Other',
  },
  UTC: {
    zoneLabel: 'Works US Mountain hours',
    zoneHours: '9:00am – 6:00pm MST · full business day',
    region: 'Mountain',
  },
};

const TIMEZONE_LABEL_BY_IANA = Object.fromEntries(
  TIMEZONE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<string, string>;

const LEGACY_TIMEZONE_ALIASES: Record<string, string> = {
  Eastern: 'America/New_York',
  Central: 'America/Chicago',
  Pacific: 'America/Los_Angeles',
  Mountain: 'UTC',
};

export function resolveMarketingTimezone(iana: string): MarketingTimezoneMeta {
  const normalized = iana.trim();
  const canonical = LEGACY_TIMEZONE_ALIASES[normalized] ?? normalized;
  const preset =
    MARKETING_TIMEZONE_META[canonical as keyof typeof MARKETING_TIMEZONE_META];

  if (preset) {
    return {
      iana: canonical,
      label: TIMEZONE_LABEL_BY_IANA[canonical] ?? canonical,
      ...preset,
    };
  }

  return {
    iana: normalized,
    label: normalized,
    zoneLabel: normalized.includes('overlap') ? normalized : `${normalized} overlap`,
    zoneHours: 'Full business day overlap',
    region: 'Other',
  };
}

export function formatUsTimezoneShortLabel(iana: string): string {
  const { region, zoneLabel } = resolveMarketingTimezone(iana);
  if (region !== 'Other') {
    return `US ${region}`;
  }

  const match = zoneLabel.match(/US (Pacific|Eastern|Central|Mountain)/i);
  if (match) {
    return `US ${match[1]}`;
  }

  return zoneLabel.replace(/^Works /, '').replace(/ hours$/, '').trim();
}

export function engineerTimezoneRegion(iana: string): MarketingTimezoneRegion {
  return resolveMarketingTimezone(iana).region;
}

export function isKnownMarketingTimezone(value: string): boolean {
  const normalized = value.trim();
  if (normalized in LEGACY_TIMEZONE_ALIASES) return true;
  return normalized in MARKETING_TIMEZONE_META;
}
