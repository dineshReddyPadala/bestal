import { clients } from './clients.js';
import { deployments } from './deployments.js';
import { shortlists } from './shortlists.js';
import type { MockClient } from './types.js';

export type ClientManagementStatus = MockClient['status'];

export type PaymentTerms = 'NET_15' | 'NET_30' | 'NET_45' | 'NET_60' | 'PREPAID';

export type ClientManagementRecord = {
  readonly id: number;
  readonly company: string;
  readonly industry: string;
  readonly primaryContact: string;
  readonly email: string;
  readonly phone: string;
  readonly paymentTerms: PaymentTerms;
  readonly status: ClientManagementStatus;
  readonly accountManager: string;
  readonly candidateCount: number;
  readonly deploymentCount: number;
  readonly revenue: number;
  readonly currency: string;
  readonly logoUrl: string;
};

const PRIMARY_CONTACTS: Record<number, string> = {
  1: 'Sarah Chen',
  2: 'Marcus Dubois',
  3: 'Patricia Walsh',
  4: 'Erik Lindstrom',
  5: 'Jessica Park',
  6: 'Robert Hayes',
  7: 'Amanda Foster',
};

const PAYMENT_TERMS: Record<number, PaymentTerms> = {
  1: 'NET_30',
  2: 'NET_45',
  3: 'NET_60',
  4: 'NET_30',
  5: 'NET_45',
  6: 'PREPAID',
  7: 'NET_30',
};

const ACCOUNT_MANAGERS = ['Rachel Kim', 'Tom Bradley', 'Angela Torres'] as const;

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function countCandidates(clientId: number): number {
  const ids = new Set<number>();
  for (const list of shortlists) {
    if (list.clientId !== clientId) continue;
    for (const entry of list.entries) {
      ids.add(entry.candidateId);
    }
  }
  for (const d of deployments) {
    if (d.clientId === clientId) {
      ids.add(d.candidateId);
    }
  }
  return ids.size;
}

function countDeployments(clientId: number): number {
  const fromData = deployments.filter((d) => d.clientId === clientId).length;
  const client = clients.find((c) => c.id === clientId);
  return Math.max(fromData, client?.activeDeployments ?? 0);
}

function fromClient(client: MockClient): ClientManagementRecord {
  const slug = slugify(client.name);
  return {
    id: client.id,
    company: client.name,
    industry: client.industry,
    primaryContact: PRIMARY_CONTACTS[client.id] ?? 'Primary Contact',
    email: `talent@${slug}.com`,
    phone: `+1 (212) 555-${String(2000 + client.id).slice(-4)}`,
    paymentTerms: PAYMENT_TERMS[client.id] ?? 'NET_30',
    status: client.status,
    accountManager: client.accountManager,
    candidateCount: countCandidates(client.id),
    deploymentCount: countDeployments(client.id),
    revenue: client.totalSpend,
    currency: client.currency,
    logoUrl: client.logoUrl,
  };
}

export const clientManagementRecords: readonly ClientManagementRecord[] =
  clients.map(fromClient);

export const clientIndustries = [
  ...new Set(clientManagementRecords.map((r) => r.industry)),
].sort();

export const clientManagers = [...ACCOUNT_MANAGERS];

export const clientStatuses: readonly ClientManagementStatus[] = [
  'PROSPECT',
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
];

export function getClientManagementById(id: number): ClientManagementRecord | undefined {
  return clientManagementRecords.find((r) => r.id === id);
}

export function formatPaymentTerms(terms: PaymentTerms): string {
  if (terms === 'PREPAID') return 'Prepaid';
  return terms.replace('NET_', 'Net ');
}
