import { getAvailabilityForCandidate } from './availability.js';
import { clients } from './clients.js';
import { deployments } from './deployments.js';
import { computeMarginPercent } from './pricing.js';
import type { MockDeployment } from './types.js';

export type DeploymentStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'TERMINATED'
  | 'ON_HOLD';

export type DeploymentManagementRecord = {
  readonly id: number;
  readonly clientId: number;
  readonly clientName: string;
  readonly candidateId: number;
  readonly candidateName: string;
  readonly roleTitle: string;
  readonly startDate: string;
  readonly endDate: string | null;
  readonly billRate: number;
  readonly payRate: number;
  readonly marginPercent: number;
  readonly currency: string;
  readonly hoursPerWeek: number;
  readonly timezone: string;
  readonly manager: string;
  readonly status: DeploymentStatus;
};

function clientManager(clientId: number): string {
  return clients.find((c) => c.id === clientId)?.accountManager ?? 'Unassigned';
}

function candidateTimezone(candidateId: number): string {
  return getAvailabilityForCandidate(candidateId)?.timezone ?? 'America/New_York';
}

function fromDeployment(d: MockDeployment): DeploymentManagementRecord {
  return {
    id: d.id,
    clientId: d.clientId,
    clientName: d.clientName,
    candidateId: d.candidateId,
    candidateName: d.candidateName,
    roleTitle: d.title,
    startDate: d.startDate,
    endDate: d.endDate,
    billRate: d.billRate,
    payRate: d.payRate,
    marginPercent: computeMarginPercent(d.payRate, d.billRate),
    currency: d.currency,
    hoursPerWeek: d.hoursPerWeek,
    timezone: candidateTimezone(d.candidateId),
    manager: clientManager(d.clientId),
    status: d.status,
  };
}

const supplementalDeployments: DeploymentManagementRecord[] = [
  {
    id: 7,
    clientId: 1,
    clientName: 'Stripe',
    candidateId: 8,
    candidateName: 'Daniel Kowalski',
    roleTitle: 'Backend Engineer — Recommendations API',
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    billRate: 140,
    payRate: 100,
    marginPercent: computeMarginPercent(100, 140),
    currency: 'USD',
    hoursPerWeek: 40,
    timezone: candidateTimezone(8),
    manager: clientManager(1),
    status: 'TERMINATED',
  },
  {
    id: 8,
    clientId: 3,
    clientName: 'JPMorgan Chase',
    candidateId: 6,
    candidateName: 'Michael Brooks',
    roleTitle: 'Security Architect — FedRAMP',
    startDate: '2026-07-01',
    endDate: '2027-01-01',
    billRate: 190,
    payRate: 140,
    marginPercent: computeMarginPercent(140, 190),
    currency: 'USD',
    hoursPerWeek: 40,
    timezone: candidateTimezone(6),
    manager: clientManager(3),
    status: 'ACTIVE',
  },
  {
    id: 9,
    clientId: 7,
    clientName: 'Coinbase',
    candidateId: 12,
    candidateName: 'Lucas Fernandez',
    roleTitle: 'Data Engineer — Fraud Detection',
    startDate: '2026-08-01',
    endDate: '2027-02-01',
    billRate: 150,
    payRate: 110,
    marginPercent: computeMarginPercent(110, 150),
    currency: 'USD',
    hoursPerWeek: 40,
    timezone: candidateTimezone(12),
    manager: clientManager(7),
    status: 'PENDING',
  },
];

export const deploymentManagementRecords: readonly DeploymentManagementRecord[] = [
  ...deployments.map(fromDeployment),
  ...supplementalDeployments,
];

export const deploymentClients = [
  ...new Set(deploymentManagementRecords.map((r) => r.clientName)),
].sort();

export const deploymentCandidates = [
  ...new Set(deploymentManagementRecords.map((r) => r.candidateName)),
].sort();

export const deploymentStatuses: readonly DeploymentStatus[] = [
  'PENDING',
  'ACTIVE',
  'ON_HOLD',
  'COMPLETED',
  'TERMINATED',
];

export function getDeploymentManagementById(
  id: number,
): DeploymentManagementRecord | undefined {
  return deploymentManagementRecords.find((r) => r.id === id);
}

export function formatDeploymentTimezone(tz: string): string {
  const labels: Record<string, string> = {
    'America/New_York': 'ET',
    'America/Chicago': 'CT',
    'America/Los_Angeles': 'PT',
    'America/San_Francisco': 'PT',
    'Europe/London': 'GMT',
    'Europe/Berlin': 'CET',
    'Asia/Dubai': 'GST',
    'Asia/Kolkata': 'IST',
    'America/Mexico_City': 'CST',
  };
  const short = labels[tz];
  return short ? `${short} · ${tz}` : tz;
}
