import type { PlatformStat } from './types.js';

export const stats = [
  {
    id: 'vetted-talent',
    label: 'Vetted professionals',
    value: 12400,
    change: 8.2,
    changeLabel: 'vs last quarter',
    format: 'number',
  },
  {
    id: 'placement-rate',
    label: 'Placement success rate',
    value: 94,
    change: 2.1,
    changeLabel: 'vs last quarter',
    format: 'percent',
  },
  {
    id: 'avg-time-to-hire',
    label: 'Avg. time to hire',
    value: '12 days',
    change: -18,
    changeLabel: 'faster than industry avg',
    format: 'duration',
  },
  {
    id: 'enterprise-clients',
    label: 'Enterprise clients',
    value: 340,
    change: 14,
    changeLabel: 'new this year',
    format: 'number',
  },
  {
    id: 'active-deployments',
    label: 'Active deployments',
    value: 2180,
    change: 5.6,
    changeLabel: 'MoM growth',
    format: 'number',
  },
  {
    id: 'platform-revenue',
    label: 'Platform GMV (YTD)',
    value: 142_000_000,
    change: 22.4,
    changeLabel: 'YoY',
    format: 'currency',
  },
] as const satisfies readonly PlatformStat[];

export type Stats = typeof stats;
