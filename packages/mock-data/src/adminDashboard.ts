import type { AdminKpi, ChartDataPoint } from './types.js';

export type DashboardActivity = {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly timestamp: string;
  readonly status: string;
  readonly actor?: string;
};

export const adminDashboardStats = [
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
    id: 'ai-screened',
    label: 'AI Screened',
    value: 9_642,
    change: 11.2,
    changeLabel: 'screening complete',
    format: 'number',
  },
  {
    id: 'evaluation-pending',
    label: 'Evaluation Pending',
    value: 186,
    change: -12.5,
    changeLabel: 'awaiting review',
    format: 'number',
  },
  {
    id: 'bgv-pending',
    label: 'BGV Pending',
    value: 94,
    change: 8.2,
    changeLabel: 'in progress',
    format: 'number',
  },
  {
    id: 'active-clients',
    label: 'Active Clients',
    value: 248,
    change: 4.8,
    changeLabel: 'enterprise accounts',
    format: 'number',
  },
  {
    id: 'trial-requests',
    label: 'Trial Requests',
    value: 47,
    change: 15.3,
    changeLabel: 'open requests',
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
    id: 'monthly-revenue',
    label: 'Monthly Revenue',
    value: 1_420_000,
    change: 12.8,
    changeLabel: 'June GMV',
    format: 'currency',
  },
  {
    id: 'monthly-margin',
    label: 'Monthly Margin',
    value: 356_000,
    change: 14.2,
    changeLabel: 'June net',
    format: 'currency',
  },
  {
    id: 'avg-bestal-score',
    label: 'Average BesTal Score',
    value: 88.4,
    change: 2.1,
    changeLabel: 'platform avg',
    format: 'number',
  },
] as const satisfies readonly AdminKpi[];

/** @deprecated use adminDashboardStats */
export const adminKpis = adminDashboardStats;

export const candidatesByCommunity = [
  { label: 'Full-Stack', value: 2840 },
  { label: 'DevOps & Cloud', value: 1920 },
  { label: 'Data Engineering', value: 1650 },
  { label: 'Machine Learning', value: 1480 },
  { label: 'Cybersecurity', value: 980 },
  { label: 'UX Design', value: 720 },
  { label: 'Mobile', value: 640 },
  { label: 'Product', value: 520 },
] as const satisfies readonly ChartDataPoint[];

export const candidatesByAvailability = [
  { label: 'Immediate', value: 1842 },
  { label: 'Within 2 weeks', value: 3210 },
  { label: 'Within 30 days', value: 4105 },
  { label: 'Within 60 days', value: 2480 },
  { label: 'Not available', value: 1210 },
] as const satisfies readonly ChartDataPoint[];

export const candidatesByStatus = [
  { label: 'Active', value: 8420 },
  { label: 'New', value: 2180 },
  { label: 'Placed', value: 1540 },
  { label: 'Inactive', value: 520 },
  { label: 'Do Not Contact', value: 187 },
] as const satisfies readonly ChartDataPoint[];

export const monthlyDeployments: readonly ChartDataPoint[] = [
  { label: 'Jan', value: 38, value2: 1840 },
  { label: 'Feb', value: 42, value2: 1910 },
  { label: 'Mar', value: 51, value2: 1980 },
  { label: 'Apr', value: 47, value2: 2050 },
  { label: 'May', value: 55, value2: 2120 },
  { label: 'Jun', value: 48, value2: 2180 },
];

export const revenueByMonth = [
  { label: 'Jan', value: 980_000, value2: 245_000 },
  { label: 'Feb', value: 1_020_000, value2: 255_000 },
  { label: 'Mar', value: 1_140_000, value2: 285_000 },
  { label: 'Apr', value: 1_090_000, value2: 272_000 },
  { label: 'May', value: 1_260_000, value2: 315_000 },
  { label: 'Jun', value: 1_420_000, value2: 356_000 },
] as const satisfies readonly ChartDataPoint[];

export const deploymentTrend: readonly ChartDataPoint[] = monthlyDeployments.map((d) => ({
  label: d.label,
  value: d.value2 ?? d.value,
  value2: d.value,
}));

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

export const latestCandidateUploads: readonly DashboardActivity[] = [
  {
    id: 'upload-1',
    title: 'Michael Brooks',
    subtitle: 'michael-brooks-resume.docx uploaded',
    timestamp: '2026-06-30T09:40:00Z',
    status: 'PROCESSING',
    actor: 'Rachel Kim',
  },
  {
    id: 'upload-2',
    title: 'Lucas Fernandez',
    subtitle: 'lucas-fernandez-cv.pdf uploaded',
    timestamp: '2026-06-29T14:22:00Z',
    status: 'VERIFIED',
    actor: 'Tom Bradley',
  },
  {
    id: 'upload-3',
    title: 'Amara Okafor',
    subtitle: 'amara-okafor-resume.pdf uploaded',
    timestamp: '2026-06-28T11:15:00Z',
    status: 'VERIFIED',
    actor: 'Angela Torres',
  },
  {
    id: 'upload-4',
    title: 'Daniel Kowalski',
    subtitle: 'daniel-kowalski-resume.pdf uploaded',
    timestamp: '2026-06-27T16:00:00Z',
    status: 'VERIFIED',
    actor: 'Rachel Kim',
  },
];

export const latestAiScreenings: readonly DashboardActivity[] = [
  {
    id: 'screen-1',
    title: 'Priya Sharma',
    subtitle: 'Score 96 · STRONG_PASS · ML Senior',
    timestamp: '2026-06-02T09:15:00Z',
    status: 'STRONG_PASS',
    actor: 'bestal-screen-v2.4',
  },
  {
    id: 'screen-2',
    title: 'Michael Brooks',
    subtitle: 'Score 72 · REVIEW · flags: employment gap',
    timestamp: '2026-06-16T08:20:00Z',
    status: 'REVIEW',
    actor: 'bestal-screen-v2.4',
  },
  {
    id: 'screen-3',
    title: 'Sofia Martinez',
    subtitle: 'Score 87 · PASS · UX Designer',
    timestamp: '2026-06-08T11:45:00Z',
    status: 'PASS',
    actor: 'bestal-screen-v2.4',
  },
  {
    id: 'screen-4',
    title: 'James Okoro',
    subtitle: 'Score 89 · PASS · DevOps Principal',
    timestamp: '2026-04-30T14:00:00Z',
    status: 'PASS',
    actor: 'bestal-screen-v2.4',
  },
];

export const latestEvaluations: readonly DashboardActivity[] = [
  {
    id: 'eval-1',
    title: 'Alexandra Petrov',
    subtitle: 'Full-Stack · STRONG_HIRE · 94/100',
    timestamp: '2026-05-20T16:45:00Z',
    status: 'COMPLETED',
    actor: 'Rachel Kim',
  },
  {
    id: 'eval-2',
    title: 'James Okoro',
    subtitle: 'DevOps & Cloud · STRONG_HIRE · 91/100',
    timestamp: '2026-06-08T16:35:00Z',
    status: 'COMPLETED',
    actor: 'Sarah Mitchell',
  },
  {
    id: 'eval-3',
    title: 'Priya Sharma',
    subtitle: 'Machine Learning · In progress',
    timestamp: '2026-06-03T10:30:00Z',
    status: 'IN_PROGRESS',
    actor: 'Tom Bradley',
  },
  {
    id: 'eval-4',
    title: 'Michael Brooks',
    subtitle: 'Backend · Draft pending submission',
    timestamp: '2026-06-18T09:00:00Z',
    status: 'DRAFT',
    actor: 'Angela Torres',
  },
];

export const latestBgvUpdates: readonly DashboardActivity[] = [
  {
    id: 'bgv-1',
    title: 'Alexandra Petrov',
    subtitle: 'Comprehensive · CLEAR via Checkr',
    timestamp: '2026-06-18T14:30:00Z',
    status: 'CLEAR',
    actor: 'Checkr',
  },
  {
    id: 'bgv-2',
    title: 'Sofia Martinez',
    subtitle: 'Employment · IN_PROGRESS via Sterling',
    timestamp: '2026-06-10T13:15:00Z',
    status: 'IN_PROGRESS',
    actor: 'Sterling',
  },
  {
    id: 'bgv-3',
    title: 'James Okoro',
    subtitle: 'Criminal · CLEAR via Checkr',
    timestamp: '2026-05-28T08:00:00Z',
    status: 'CLEAR',
    actor: 'Checkr',
  },
  {
    id: 'bgv-4',
    title: 'Daniel Kowalski',
    subtitle: 'Education · PENDING consent form',
    timestamp: '2026-06-25T11:00:00Z',
    status: 'PENDING',
    actor: 'Checkr',
  },
];

export const latestClientRequests: readonly DashboardActivity[] = [
  {
    id: 'client-1',
    title: 'JPMorgan Chase',
    subtitle: 'Interview request · Michael Brooks · Security Architect',
    timestamp: '2026-06-28T16:45:00Z',
    status: 'REQUESTED',
    actor: 'Client Portal',
  },
  {
    id: 'client-2',
    title: 'Stripe',
    subtitle: 'Shortlist review · Staff Full-Stack Engineers',
    timestamp: '2026-06-27T10:30:00Z',
    status: 'PENDING',
    actor: 'Client Portal',
  },
  {
    id: 'client-3',
    title: 'Shopify',
    subtitle: 'Candidate approval · Sofia Martinez',
    timestamp: '2026-06-26T14:00:00Z',
    status: 'APPROVED',
    actor: 'Client Portal',
  },
  {
    id: 'client-4',
    title: 'Airbnb',
    subtitle: 'New search filters saved · Senior Data Engineers',
    timestamp: '2026-06-25T09:15:00Z',
    status: 'ACTIVE',
    actor: 'Client Portal',
  },
];

export const latestTrialRequests: readonly DashboardActivity[] = [
  {
    id: 'trial-1',
    title: 'Michael Brooks → JPMorgan',
    subtitle: '20-hour pilot · Security Architect FedRAMP',
    timestamp: '2026-06-29T08:00:00Z',
    status: 'REQUESTED',
    actor: 'Angela Torres',
  },
  {
    id: 'trial-2',
    title: 'Lucas Fernandez → Stripe',
    subtitle: '20-hour pilot · Data Engineer Fraud Detection',
    timestamp: '2026-06-28T11:00:00Z',
    status: 'SCHEDULED',
    actor: 'Rachel Kim',
  },
  {
    id: 'trial-3',
    title: 'James Okoro → JPMorgan',
    subtitle: 'Staff DevOps · Cloud Migration trial',
    timestamp: '2026-06-20T09:00:00Z',
    status: 'IN_PROGRESS',
    actor: 'Angela Torres',
  },
  {
    id: 'trial-4',
    title: 'Alexandra Petrov → Stripe',
    subtitle: 'Staff Full-Stack · Payments trial',
    timestamp: '2026-06-16T08:00:00Z',
    status: 'IN_PROGRESS',
    actor: 'Rachel Kim',
  },
];

export const latestDeployments: readonly DashboardActivity[] = [
  {
    id: 'dep-1',
    title: 'Priya Sharma → Spotify',
    subtitle: 'Senior ML Engineer · $165/hr bill · ACTIVE',
    timestamp: '2026-06-01T08:00:00Z',
    status: 'ACTIVE',
    actor: 'Rachel Kim',
  },
  {
    id: 'dep-2',
    title: 'Emily Nakamura → Airbnb',
    subtitle: 'Staff Data Engineer · $170/hr bill · ACTIVE',
    timestamp: '2026-04-15T08:00:00Z',
    status: 'ACTIVE',
    actor: 'Tom Bradley',
  },
  {
    id: 'dep-3',
    title: 'Alexandra Petrov → Stripe',
    subtitle: 'Staff Full-Stack · $155/hr bill · PENDING start Jul 15',
    timestamp: '2026-06-25T14:00:00Z',
    status: 'PENDING',
    actor: 'Rachel Kim',
  },
  {
    id: 'dep-4',
    title: 'James Okoro → Coinbase',
    subtitle: 'Principal DevOps · Completed May 31',
    timestamp: '2026-05-31T17:00:00Z',
    status: 'COMPLETED',
    actor: 'Angela Torres',
  },
];

export const dashboardNotifications = [
  {
    id: 1,
    type: 'DOCUMENT',
    title: 'Resume uploaded',
    message: 'Michael Brooks uploaded a new resume. Pending recruiter review.',
    status: 'PENDING',
    createdAt: '2026-06-30T12:00:00Z',
  },
  {
    id: 2,
    type: 'TRIAL',
    title: 'Trial request received',
    message: 'JPMorgan Chase requested a 20-hour pilot for Michael Brooks.',
    status: 'SENT',
    createdAt: '2026-06-29T08:00:00Z',
  },
  {
    id: 3,
    type: 'BACKGROUND_CHECK',
    title: 'BGV cleared',
    message: 'Alexandra Petrov comprehensive check returned CLEAR.',
    status: 'READ',
    createdAt: '2026-06-18T14:30:00Z',
  },
  {
    id: 4,
    type: 'DEPLOYMENT',
    title: 'Deployment started',
    message: 'Priya Sharma is now ACTIVE at Spotify.',
    status: 'READ',
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 5,
    type: 'EVALUATION',
    title: 'Evaluation completed',
    message: 'James Okoro received STRONG_HIRE from Sarah Mitchell.',
    status: 'SENT',
    createdAt: '2026-06-08T16:35:00Z',
  },
  {
    id: 6,
    type: 'GENERAL',
    title: 'Approval required',
    message: 'Michael Brooks shortlist awaits client approval.',
    status: 'SENT',
    createdAt: '2026-06-28T16:45:00Z',
  },
] as const;

export type AdminKpis = typeof adminDashboardStats;
