import type { AdminKpi, ChartDataPoint } from './types.js';

export const adminKpis = [
  {
    id: 'total-candidates',
    label: 'Total Candidates',
    value: 12_847,
    change: 6.4,
    changeLabel: 'vs last month',
    format: 'number',
  },
  {
    id: 'client-visible',
    label: 'Client Visible Candidates',
    value: 4_218,
    change: 3.1,
    changeLabel: 'published & approved',
    format: 'number',
  },
  {
    id: 'pending-evaluation',
    label: 'Pending Evaluation',
    value: 186,
    change: -12.5,
    changeLabel: 'vs last week',
    format: 'number',
  },
  {
    id: 'pending-bgv',
    label: 'Pending BGV',
    value: 94,
    change: 8.2,
    changeLabel: 'awaiting clearance',
    format: 'number',
  },
  {
    id: 'trials',
    label: 'Trials',
    value: 47,
    change: 15.3,
    changeLabel: 'active & scheduled',
    format: 'number',
  },
  {
    id: 'deployments',
    label: 'Deployments',
    value: 2_180,
    change: 5.6,
    changeLabel: 'active placements',
    format: 'number',
  },
  {
    id: 'revenue',
    label: 'Revenue',
    value: 14_200_000,
    change: 22.4,
    changeLabel: 'YTD GMV',
    format: 'currency',
  },
  {
    id: 'margin',
    label: 'Margin',
    value: 28.6,
    change: 1.8,
    changeLabel: 'platform take rate',
    format: 'percent',
  },
] as const satisfies readonly AdminKpi[];

export const revenueByMonth = [
  { label: 'Jan', value: 9_800_000, value2: 2_450_000 },
  { label: 'Feb', value: 10_200_000, value2: 2_550_000 },
  { label: 'Mar', value: 11_400_000, value2: 2_850_000 },
  { label: 'Apr', value: 10_900_000, value2: 2_720_000 },
  { label: 'May', value: 12_600_000, value2: 3_150_000 },
  { label: 'Jun', value: 14_200_000, value2: 3_560_000 },
] as const satisfies readonly ChartDataPoint[];

export const deploymentTrend = [
  { label: 'Jan', value: 1840, value2: 42 },
  { label: 'Feb', value: 1910, value2: 38 },
  { label: 'Mar', value: 1980, value2: 51 },
  { label: 'Apr', value: 2050, value2: 47 },
  { label: 'May', value: 2120, value2: 55 },
  { label: 'Jun', value: 2180, value2: 48 },
] as const satisfies readonly ChartDataPoint[];

export const pipelineByStage = [
  { label: 'Sourced', value: 12847 },
  { label: 'Evaluated', value: 6200 },
  { label: 'BGV Cleared', value: 4100 },
  { label: 'Client Visible', value: 4218 },
  { label: 'Trials', value: 312 },
  { label: 'Deployed', value: 2180 },
] as const satisfies readonly ChartDataPoint[];

export const evaluationsByStatus = [
  { label: 'Completed', value: 1420 },
  { label: 'In Progress', value: 86 },
  { label: 'Draft', value: 100 },
  { label: 'Archived', value: 240 },
] as const satisfies readonly ChartDataPoint[];

export type AdminKpis = typeof adminKpis;
